import React, { useMemo, useState, useEffect, Fragment } from "react";
import Header from "../../components/Header/Header";
import api from "../../apis/courseScheduling/CourseSchedulingApi";
import util from "../../util/utilFunctions";
import "./home.css";
import HybridView from "../../components/CourseTable/CourseTable.js";

export default function Home() {
  const [apiData, setApiData] = useState();
  const [fetchData, setFetchData] = useState(true);

  useEffect(() => {
    const fetchApiData = async () => {
      const sessionRes = await api.getSession();
      const overviewRes = await api.getAllExamRegulationsOverview();
      const docentListRes = await api.getMinimalDocentList();

      setApiData({
        permissionId: sessionRes.data.user.permission_id,
        tableData: prepairData(overviewRes.data),
        docentList: docentListRes.data,
      });
    };
    fetchApiData();
  }, [fetchData]);

  function prepairData(data) {
    let prepairedData = [];
  
    for (const i in data) {
      let index = getIndexOfExistingExamRegulationsGroup(prepairedData, data[i]);
      if (!index) {
        pushData(prepairedData, data[i]);
        index = prepairedData.length - 1;
      }
     aggregateModulesOfErGroups(prepairedData, index, data[i]);
    }
    console.log("prepaired Data");
    sortModulesBySemester(prepairedData);
    console.log(prepairedData);
    return prepairedData;
  }
  
  function aggregateModulesOfErGroups(prepairedData, index, examRegulations) {
    for (const erGroups of examRegulations.erGroups) {
      for (const module of erGroups.modules) {
        module.er_group_id = erGroups.er_group_id;
        module.er_group_name = erGroups.name;
        if (module.visibility == 1) {
          prepairedData[index].numberOfVisibleCourses += 1;
        }
        prepairedData[index].modules.push(module);
      }
    }
  }
  
  function pushData(prepairedData, examRegulations) {
    prepairedData.push({
      exam_regulations_id: examRegulations.exam_regulations_id,
      year: examRegulations.year,
      exam_regulations_group: examRegulations.exam_regulations_group,
      major: examRegulations.major,
      modules: [],
      numberOfVisibleCourses: 0,
    });
  }
  
  function getIndexOfExistingExamRegulationsGroup(
    prepairedData,
    examRegulations
  ) {
    const examRegulationsGroup = examRegulations.exam_regulations_group;
    if (prepairedData.length != 0 && examRegulationsGroup) {
      return util.getIndexOfPropertyMatch(
        prepairedData,
        "exam_regulations_group",
        examRegulationsGroup
      );
    }
    return null;
  }
  
  function sortModulesBySemester(prepairedData) {
    for (const examRegGroup of prepairedData) {
      let modules = examRegGroup.modules;
      if (modules) {
        modules.sort((a, b) => a.semester - b.semester);
      }
    }
  }

  //TODO:deleteDeprecatedRegisteredCourse
  async function deleteDeprecatedRegisteredCourse(module){
    
  }

  return (
    <Fragment>
      <Header />
      <h2 className="title">TODO: total SWS</h2>
      <h2 className="title">TODO: Adopt Entries from last year</h2>
      <div className="content-center">
        {apiData ? (
          <HybridView
            apiData={apiData}
            fetchData={fetchData}
            setFetchData={setFetchData}
          />
        ) : null}
      </div>
    </Fragment>
  );
}
