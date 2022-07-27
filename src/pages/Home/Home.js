import React, { useMemo, useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Tree from "../../components/Tree/Tree";
import api from "../../apis/courseScheduling/courseSchedulingApi";
import  util  from "../../util/utilFunctions";
import "./home.css";
import HybridView from "../../components/CourseTable/CourseTable.js";



const data = [
  {
    er_group_id: 301,
    name: "main",
    exam_regulations_id: 6,
    modules: [
      {
        module_id: 417,
        name: "Personal - Sozialisation, Integration, Kontrolle",
        semester: 4,
        sws: 4,
        visibility: 2,
        courses: [
          {
            course_id: 474,
            name: "Personal - Sozialisation, Integration, Kontrolle",
            lsws: 4,
            module_id: 417,
          },
        ],
      },
      {
        module_id: 394,
        name: "Grundlagen der Allgemeinen Betriebswirtschaftslehre",
        semester: 1,
        sws: 6,
        visibility: 1,
        courses: [
          {
            course_id: 446,
            name: "Grundlagen der Allgemeinen Betriebswirtschaftslehre",
            lsws: 6,
            module_id: 394,
          },
        ],
      },
      {
        module_id: 395,
        name: "Mikroökonomie",
        semester: 1,
        sws: 4,
        visibility: 1,
        courses: [
          {
            course_id: 447,
            name: "Mikroökonomie",
            lsws: 4,
            module_id: 395,
          },
        ],
      },
    ],
  },
  {
    er_group_id: 24,
    name: "not main",
    exam_regulations_id: 6,
    modules: [
      {
        module_id: 415,
        name: "International Management",
        semester: 4,
        sws: 4,
        visibility: 2,
        courses: [
          {
            course_id: 470,
            name: "Internationales Marketing",
            lsws: 2,
            module_id: 415,
          },
          {
            course_id: 471,
            name: "Interkulturelles Management",
            lsws: 2,
            module_id: 415,
          },
        ],
      },
      {
        module_id: 416,
        name: "Grundlagen des Marketing",
        semester: 4,
        sws: 4,
        visibility: 2,
        courses: [
          {
            course_id: 472,
            name: "Marketingpolitik",
            lsws: 2,
            module_id: 416,
          },
          {
            course_id: 473,
            name: "Marktforschung",
            lsws: 2,
            module_id: 416,
          },
        ],
      },
    ],
  },
];

/* function prepDataOld(data) {
  console.log("data: " + JSON.stringify(data, undefined, 4));
  let prepairedData = { exam_regulations_id: data[0].exam_regulations_id };
  prepairedData.modules = [];

  for (const erGroups of data) {
    for (const modul of erGroups.modules) {
      modul.er_group_id = erGroups.er_group_id;
      modul.er_group_name = erGroups.name;
      prepairedData.modules.push(modul);
    }
  }
  console.log("prepaired Data");
  prepairedData.modules.sort(sortByProperty("semester"));
  console.log(prepairedData);
  return prepairedData;
}
 */


export default function Home() {
  const [tableData, setTableData] = useState();

  useEffect(() => {
    api.getAllExamRegulationsOverview().then((res) => {
      console.log(res.data);
      setTableData(util.prepData(res.data));
    });
  }, []);

  return (
    <>
      <Header />

      <h2 className="title">Lehrveranstaltungen</h2>

      <div className="content-center">
      {tableData ? <HybridView data={tableData}/> : ""}  
      </div>
    </>
  );
}
