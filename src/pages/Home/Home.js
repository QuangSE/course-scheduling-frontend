import React, { useState, useEffect, Fragment } from 'react';
import NavBar from '../../components/NavigationBar/NavigationBar';
import api from '../../apis/courseScheduling/CourseSchedulingApi';
import util from '../../util/utilFunctions';
import './home.css';
import MajorsOverview from '../../components/MajorsOverview/MajorsOverview.js';
import MajorForm from '../../components/MajorForm/MajorForm';
import CsvExportButton from '../../components/CsvExport/CsvExport';

export default function Home() {
  const [apiData, setApiData] = useState();
  const [fetchData, setFetchData] = useState(true);
  const [entriesAdopted, setEntriesAdopted] = useState();
  const [entriesReset, setEntriesReset] = useState();

  function rerenderPage() {
    setFetchData(!fetchData);
  }

  function isAdmin() {
    return apiData.user.permission_id === 1;
  }

  console.info('RENDERING PAGE');

  useEffect(() => {
    const fetchApiData = async () => {
      const sessionRes = await api.getSession();
      const user = sessionRes.data.user;
      const overviewRes = await api.getAllExamRegulationsOverview();
      const docentListRes = await api.getMinimalDocentList();
      const compulsoryModulesRes = await api.getCompulsoryModuleOverview();
      const tableData = await processData(
        overviewRes.data,
        compulsoryModulesRes.data,
        user.docent_id
      );
      const myTotalLswsRes = await api.getMyTotalLsws();

      setApiData({
        user,
        tableData,
        docentList: docentListRes.data,
        myTotalLsws: myTotalLswsRes.data.totalLsws,
      });
    };
    fetchApiData();
  }, [fetchData]);

  function setCompulsoryModules(compulsoryModules) {
    let data = {
      isCompulsoryModules: true,
      modules: compulsoryModules,
      numberOfVisibleCourses: 0,
      numberOfRegisteredCourses: 0,
      myRegisteredCourses: 0,
    };
    for (const module of data.modules) {
      setRegisteredCourseCounter(data, module);
    }
    return data;
  }

  function processData(data, compulsoryModules, docentId) {
    let processedData = [];

    for (const i in data) {
      if (!isSameExamRegulationsGroup(processedData, data[i])) {
        pushElement(processedData, data[i]);
        const index = processedData.length - 1;
        aggregateModulesOfErGroups(processedData, index, data[i], docentId);
      }
    }
    console.log('processed Data');
    sortByDegree(processedData);
    processedData.splice(0, 0, setCompulsoryModules(compulsoryModules));
    sortModulesBySemester(processedData);
    console.log(processedData);
    return processedData;
  }

  function sortByDegree(data) {
    data.sort((a, b) =>
      a.major.degree < b.major.degree ? -1 : a.major.degree > b.major.degree ? 1 : 0
    );
  }

  function aggregateModulesOfErGroups(processedData, index, examRegulations, docentId) {
    let onlyOneGroup = true;
    for (const erGroups of examRegulations.erGroups) {
      for (const module of erGroups.modules) {
        module.er_group_id = erGroups.er_group_id;
        module.er_group_name = erGroups.name;
        if (erGroups.name !== 'main') onlyOneGroup = false;

        setRegisteredCourseCounter(processedData[index], module, docentId);
        processedData[index].modules.push(module);
      }
    }
    processedData[index].onlyOneGroup = onlyOneGroup;
  }

  function setRegisteredCourseCounter(examRegGroup, module, docentId) {
    if (util.isVisible(module) && module.courses.length !== 0) {
      for (const course of module.courses) {
        deleteDeprecatedDocentCourseData(course);
        examRegGroup.numberOfVisibleCourses += 1;
        if (course.docentCourses.length !== 0 && course.docentCourses[0].registered === 1) {
          examRegGroup.numberOfRegisteredCourses += 1;
          if (course.docentCourses[0].updated_by === docentId) {
            examRegGroup.myRegisteredCourses += 1;
          }
        }
      }
    }
  }

  function deleteDeprecatedDocentCourseData(course) {
    //TODO: remove docentCourse if the value of  updated_at is older than one and a half year
  }

  function pushElement(processedData, examRegulations) {
    processedData.push({
      exam_regulations_id: examRegulations.exam_regulations_id,
      year: examRegulations.year,
      exam_regulations_group: examRegulations.exam_regulations_group,
      major: examRegulations.major,
      modules: [],
      numberOfVisibleCourses: 0,
      numberOfRegisteredCourses: 0,
      myRegisteredCourses: 0,
      isCompulsoryModules: false,
      onlyOneGroup: true,
    });
  }

  function isSameExamRegulationsGroup(processedData, examRegulations) {
    const examRegulationsGroup = examRegulations.exam_regulations_group;
    const majorId = examRegulations.major_id;

    if (processedData.length != 0 && examRegulationsGroup) {
      for (const i in processedData) {
        if (
          processedData[i]['exam_regulations_group'] === examRegulationsGroup &&
          processedData[i].major.major_id === majorId
        ) {
          return true;
        }
      }
    }
    return false;
  }

  function sortModulesBySemester(processedData) {
    for (const examRegGroup of processedData) {
      let modules = examRegGroup.modules;
      if (modules) {
        modules.sort((a, b) => a.semester - b.semester);
      }
    }
  }

  async function adaptEntries(event) {
    event.preventDefault();
    const res = await api.getMyVisibleCourses();
    const visibleCourses = res.data.visibleCourses;
    if (visibleCourses.length === 0) {
      setEntriesAdopted(0);
      return;
    }
    for (const docentCourse of visibleCourses) {
      if (docentCourse.registered === 0) {
        await api.updateDocentCourse(docentCourse.docent_course_id, {
          registered: 1,
          updated_by: apiData.user.docent_id,
        });
      }
    }
    setEntriesAdopted(visibleCourses.length);
    rerenderPage();
  }

  async function resetEntries(event) {
    event.preventDefault();
    const res = await api.getAllDocentCourseEntries();
    const entries = res.data;
    let resetCounter = 0;
    for (const docentCourse of entries) {
      if (docentCourse.registered === 1) {
        await api.updateDocentCourse(docentCourse.docent_course_id, {
          registered: 0,
        });
        ++resetCounter;
      }
    }
    setEntriesReset(resetCounter);
    rerenderPage();
  }

  const resetEntriesButton = () => {
    return (
      <button className="entry-button reset-entries" type="button" onClick={resetEntries}>
        Alle Dozenteneinträge zurücksetzen
      </button>
    );
  };

  const resetEntriesMsg = () => {
    if (entriesReset >= 0) {
      return <div className="msg red">{entriesReset} Einträge wurden zurückgesetzt</div>;
    } else return null;
  };

  const adaptEntriesButton = () => {
    return (
      <button className="entry-button" type="button" onClick={adaptEntries}>
        Einträge vom letzen Jahr übernehmen
      </button>
    );
  };

  const adaptEntriesMsg = () => {
    return entriesAdopted === 0 ? (
      <div className="msg red">Keine Einträge vorhanden</div>
    ) : entriesAdopted > 0 ? (
      <div className="msg">{entriesAdopted} Einträge wurden übernommen</div>
    ) : null;
  };

  return (
    <Fragment>
      {apiData ? (
        <Fragment>
          <NavBar permissionId={apiData.user.permission_id} />
          <h2 className="title">Ist-LSWS: {apiData.myTotalLsws}</h2>
          <div className="btn-group">
            <div className="admin-buttons">
              {isAdmin() ? (
                <Fragment>
                  <div>
                    {resetEntriesButton()}
                    {resetEntriesMsg()}
                  </div>
                  <CsvExportButton tableData={apiData.tableData} />
                </Fragment>
              ) : null}
            </div>
            {adaptEntriesButton()}
            {adaptEntriesMsg()}
          </div>
          <div className="content-center">
            <MajorsOverview apiData={apiData} rerenderPage={rerenderPage} isAdmin={isAdmin} />
          </div>
          <div className="content-center"></div>
          <MajorForm isAdmin={isAdmin} rerenderPage={rerenderPage} />
        </Fragment>
      ) : null}
    </Fragment>
  );
}
