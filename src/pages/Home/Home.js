import React, { useMemo, useState, useEffect, Fragment } from 'react';
import { Navigate } from 'react-router-dom';
import NavBar from '../../components/NavigationBar/NavigationBar';
import api from '../../apis/courseScheduling/CourseSchedulingApi';
import util from '../../util/utilFunctions';
import './home.css';
import HybridView from '../../components/CourseTable/CourseTable.js';
import MajorForm from '../../components/MajorForm/MajorForm';

export default function Home() {
  const [apiData, setApiData] = useState();
  const [fetchData, setFetchData] = useState(true);
  const [entriesAdopted, setEntriesAdopted] = useState();
  const [entriesReset, setEntriesReset] = useState();

  function rerenderPage() {
    setFetchData(!fetchData);
  }

  useEffect(() => {
    const fetchApiData = async () => {
      const sessionRes = await api.getSession();
      const overviewRes = await api.getAllExamRegulationsOverview();
      const docentListRes = await api.getMinimalDocentList();
      const compulsoryModulesRes = await api.getCompulsoryModuleOverview();
      const tableData = await processData(overviewRes.data, compulsoryModulesRes.data);
      const myTotalLswsRes = await api.getMyTotalLsws();

      setApiData({
        user: sessionRes.data.user,
        tableData: tableData,
        docentList: docentListRes.data,
        myTotalLsws: myTotalLswsRes.data.totalLsws,
      });
    };
    fetchApiData();
  }, [fetchData]);

  function processData(data, compulsoryModules) {
    let processedData = [{ isCompulsoryModules: true, modules: compulsoryModules }];

    for (const i in data) {
      if (!isSameExamRegulationsGroup(processedData, data[i])) {
        pushElement(processedData, data[i]);
        const index = processedData.length - 1;
        aggregateModulesOfErGroups(processedData, index, data[i]);
      }
    }
    console.log('processed Data');
    sortModulesBySemester(processedData);
    console.log(processedData);
    return processedData;
  }

  function aggregateModulesOfErGroups(processedData, index, examRegulations) {
    let onlyOneGroup = true;
    for (const erGroups of examRegulations.erGroups) {
      for (const module of erGroups.modules) {
        module.er_group_id = erGroups.er_group_id;
        module.er_group_name = erGroups.name;
        if (erGroups.name !== 'main') onlyOneGroup = false;
        if (module.visibility == 1) {
          processedData[index].numberOfVisibleCourses += 1;
        }
        processedData[index].modules.push(module);
      }
    }
    processedData[index].onlyOneGroup = onlyOneGroup;
  }

  function pushElement(processedData, examRegulations) {
    processedData.push({
      exam_regulations_id: examRegulations.exam_regulations_id,
      year: examRegulations.year,
      exam_regulations_group: examRegulations.exam_regulations_group,
      major: examRegulations.major,
      modules: [],
      numberOfVisibleCourses: 0,
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
          updated_by: docentCourse.updated_by,
        });
        ++resetCounter;
      }
    }
    setEntriesReset(resetCounter);
    rerenderPage();
  }

  const resetEntriesButton = () => {
    if (apiData.user.permission_id === 1) {
      return (
        <button className="entry-button reset-entries" type="button" onClick={resetEntries}>
          Alle Dozenteneinträge zurücksetzen
        </button>
      );
    } else {
      return null;
    }
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
        <div>
          <NavBar permissionId={apiData.user.permission_id} />
          <h2 className="title">Ist-LSWS (ungenau): {apiData.myTotalLsws}</h2>
          <div>
            {resetEntriesButton()}
            {resetEntriesMsg()}
            {adaptEntriesButton()}
            {adaptEntriesMsg()}
          </div>
          <div></div>
          <div className="content-center">
            <HybridView apiData={apiData} rerenderPage={rerenderPage} />
          </div>
          <div className="content-center"></div>
          <MajorForm permissionId={apiData.user.permission_id} rerenderPage={rerenderPage} />
        </div>
      ) : null}
    </Fragment>
  );
}
