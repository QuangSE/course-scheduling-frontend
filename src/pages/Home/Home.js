import React, { useState, useEffect, Fragment } from 'react';
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

  function isAdmin() {
    return apiData.user.permission_id === 1;
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
    let processedData = [
      {
        isCompulsoryModules: true,
        modules: compulsoryModules,
        numberOfVisibleCourses: 0,
        numberOfRegisteredCourses: 0,
      },
    ];

    for (const module of processedData[0].modules) {
      setRegisteredCourseCounter(processedData[0], module);
    }

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

        setRegisteredCourseCounter(processedData[index], module);
        processedData[index].modules.push(module);
      }
    }
    processedData[index].onlyOneGroup = onlyOneGroup;
  }

  function setRegisteredCourseCounter(examRegGroup, module) {
    console.info(examRegGroup);
    if (util.isVisible(module) && module.courses.length !== 0) {
      for (const course of module.courses) {
        examRegGroup.numberOfVisibleCourses += 1;
        if (course.docentCourses.length !== 0 && course.docentCourses[0].registered === 1) {
          examRegGroup.numberOfRegisteredCourses += 1;
        }
      }
    }
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

  function typeAbbreviation(type) {
    switch (type) {
      case 'Professor':
        return 'P';
        break;
      case 'Lehrkraft':
        return 'LK';
        break;
      case 'Lehrbeauftragter':
        return 'LB';
        break;
      case 'Vertretungsprofessor':
        return 'VP';
        break;
      default:
        return '';
    }
  }

  function convertToCsv(examReg) {
    let csv = '';
    if (examReg.isCompulsoryModules) {
    } else {
      csv = `${examReg.major.degree} ${examReg.major.name} ${
        examReg.exam_regulations_group ? examReg.exam_regulations_group : examReg.year
      };;;;;;;\n`;
      csv += 'Veranstaltungsmanagement;;;;;;;\n';
      csv += 'Sem.;Gruppe;Modul;Lehrveranstaltung;ModulSWS;Dozent;Art;LSWS' + '\n';
      for (const module of examReg.modules) {
        const groupName = module.er_group_name === 'main' ? '' : module.er_group_name;
        const courses = module.courses;
        if (courses.length !== 0) {
          for (let i = 0; i < courses.length; i++) {
            let docent = '---';
            let docentName = '---';
            let type = '---';
            if (courses[i].docentCourse && courses[i].docentCourse.registered === 1) {
              docent = courses[i].docentCourse.docent;
              docentName = docent.name;
              type = typeAbbreviation(docent.job_type);
            }
            csv += `${module.semester};${groupName};${module.name};${courses[i].name};${module.sws};${docentName};${type};${courses[i].lsws}\n`;
          }
        } else {
          csv += `${module.semester};${groupName};${module.name};---;---;---;---;---\n`;
        }
      }
    }
    return csv;
  }

  function majorAbbreviation(name) {
    switch (name) {
      case 'Finanzdienstleistungen':
        return 'Fidi';
        break;
      case 'Wirtschaftsinformatik':
        return 'Winfo';
        break;
      case 'Mittelstandsökonomie':
        return 'Mö';
        break;
      case 'Technische Betriebswirtschaftslehre':
        return 'TBW';
        break;
      case 'Industrial and Digital Management':
        return 'IDM';
        break;
      case 'International Business Administration':
        return 'IBA';
        break;
      case 'Wirtschaft und Recht':
        return 'WuR';
        break;
      case 'Information Management':
        return 'IM';
        break;
      case 'Mittelstandsmanagement':
        return 'MM';
        break;
      case 'Financial Services Management':
        return 'FSM';
        break;
      case 'International Management and Finance':
        return 'IMF';
        break;
      case 'Mittelstandsmanagement':
        return 'MM';
        break;
      case 'Wirtschaftsingenieurwesen - Logistik & Produktionsmanagement':
        return 'WLP';
        break;
      default:
        return name;
    }
  }

  function degreeAbbreviations(degree) {
    if (degree === 'Bachelor') {
      return 'BA';
    }
    if (degree === 'Master') {
      return 'MA';
    }
    return degree;
  }

  function getFileName(examReg) {
    if (examReg.isCompulsoryModules) {
      return `BA_allg_WahlPflichtM_2020`;
    }
    const major = examReg.major;
    const examRegulations = examReg.exam_regulations_group
      ? `PO${examReg.exam_regulations_group}`
      : `PO${examReg.year}`;
    return `${degreeAbbreviations(major.degree)}_${majorAbbreviation(
      major.name
    )}_${examRegulations}`;
  }

  async function exportToCsv(event) {
    const universalBOM = '\uFEFF';
    event.preventDefault();
    for (const examReg of apiData.tableData) {
      const csv = await convertToCsv(examReg);
      const element = document.createElement('a');
      element.href = 'data:text/csv;charset=utf-8,' + encodeURI(universalBOM + csv);
      element.download = `${getFileName(examReg)}.csv`;
      document.body.appendChild(element);
      element.click();
    }
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

  const csvExportButton = () => {
    return (
      <button className="entry-button" type="button" onClick={exportToCsv}>
        CSV-Export
      </button>
    );
  };

  return (
    <Fragment>
      {apiData ? (
        <Fragment>
          <NavBar permissionId={apiData.user.permission_id} />
          <h2 className="title">Ist-LSWS: {apiData.myTotalLsws}</h2>
          <div className="admin-buttons">
            {isAdmin() ? (
              <Fragment>
                <div>
                  {resetEntriesButton()}
                  {resetEntriesMsg()}
                </div>
                <div>{csvExportButton()}</div>
              </Fragment>
            ) : null}
          </div>
          {adaptEntriesButton()}
          {adaptEntriesMsg()}
          <div className="content-center">
            <HybridView apiData={apiData} rerenderPage={rerenderPage} isAdmin={isAdmin} />
          </div>
          <div className="content-center"></div>
          <MajorForm isAdmin={isAdmin} rerenderPage={rerenderPage} />
        </Fragment>
      ) : null}
    </Fragment>
  );
}
