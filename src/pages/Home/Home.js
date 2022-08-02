import React, { useMemo, useState, useEffect, Fragment } from 'react';
import Header from '../../components/Header/Header';
import api from '../../apis/courseScheduling/CourseSchedulingApi';
import util from '../../util/utilFunctions';
import './home.css';
import HybridView from '../../components/CourseTable/CourseTable.js';
import MajorForm from '../../components/MajorForm/MajorForm';

export default function Home() {
  const [apiData, setApiData] = useState();
  const [fetchData, setFetchData] = useState(true);

  useEffect(() => {
    const fetchApiData = async () => {
      const sessionRes = await api.getSession();
      const overviewRes = await api.getAllExamRegulationsOverview();
      const docentListRes = await api.getMinimalDocentList();
      const tableData = await processData(overviewRes.data);

      setApiData({
        user: sessionRes.data.user,
        tableData: tableData,
        docentList: docentListRes.data,
      });
    };
    fetchApiData();
  }, [fetchData]);

  function processData(data) {
    let processedData = [];

    for (const i in data) {
      let index = getIndexOfExistingExamRegulationsGroup(processedData, data[i]);
      if (!index) {
        pushElement(processedData, data[i]);
        index = processedData.length - 1;
      }
      aggregateModulesOfErGroups(processedData, index, data[i]);
    }
    console.log('processed Data');
    sortModulesBySemester(processedData);
    console.log(processedData);
    return processedData;
  }

  function aggregateModulesOfErGroups(processedData, index, examRegulations) {
    for (const erGroups of examRegulations.erGroups) {
      for (const module of erGroups.modules) {
        module.er_group_id = erGroups.er_group_id;
        module.er_group_name = erGroups.name;
        if (module.visibility == 1) {
          processedData[index].numberOfVisibleCourses += 1;
        }
        processedData[index].modules.push(module);
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
    });
  }

  function getIndexOfExistingExamRegulationsGroup(processedData, examRegulations) {
    const examRegulationsGroup = examRegulations.exam_regulations_group;
    if (processedData.length != 0 && examRegulationsGroup) {
      return util.getIndexOfPropertyMatch(
        processedData,
        'exam_regulations_group',
        examRegulationsGroup
      );
    }
    return null;
  }

  function sortModulesBySemester(processedData) {
    for (const examRegGroup of processedData) {
      let modules = examRegGroup.modules;
      if (modules) {
        modules.sort((a, b) => a.semester - b.semester);
      }
    }
  }

  //TODO:deleteDeprecatedRegisteredCourse
  async function deleteDeprecatedRegisteredCourse(module) {}

  return (
    <Fragment>
      <Header />
      <h2 className="title">TODO: total SWS</h2>
      <h2 className="title">TODO: Adopt Entries from last year</h2>
      <h2 className="title">TODO: Compulsory Modules</h2>
      <div className="content-center">
        {apiData ? (
          <HybridView apiData={apiData} fetchData={fetchData} setFetchData={setFetchData} />
        ) : null}
      </div>
      {apiData ? (
        <MajorForm
          permissionId={apiData.user.permission_id}
          fetchData={fetchData}
          setFetchData={setFetchData}
        />
      ) : null}
    </Fragment>
  );
}
