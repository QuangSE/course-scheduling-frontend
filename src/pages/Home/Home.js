import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Tree from "../../components/Tree/Tree";
import CourseTable from "../../components/CourseTable/CourseTable";
import api from "../../apis/courseScheduling/courseSchedulingApi";
import "./home.css";

const mockData = [
  {
    module_id: 3,
    name: "Grundlagen der Allgemeinen Betriebswirtschaftslehre",
    semester: 1,
    sws: 6,
    visibility: 1,
    courses: [
      {
        course_id: 156,
        name: "Grundlagen der Allgemeinen Betriebswirtschaftslehre",
        lsws: 6,
        module_id: 3,
      },
    ],
  },
  {
    module_id: 4,
    name: "Kostenrechnung und Finanzierung",
    semester: 1,
    sws: 4,
    visibility: 1,
    courses: [
      {
        course_id: 158,
        name: "Kostenrechnung",
        lsws: 2,
        module_id: 4,
      },
      {
        course_id: 159,
        name: "Finanzierung",
        lsws: 2,
        module_id: 4,
      },
    ],
  },
];

export default function Home() {
  const [modules, setModules] = useState();

  useEffect(() => {
    api.getCourses(6).then((res) => {
      setModules(res.data.erGroups[0].modules);
      console.log(res.data.erGroups[0]);
    });
  }, []);

  return (
    <>
      <Header />

      <h2 className="title">Lehrveranstaltungen</h2>

      <div className="content-center">
       <CourseTable modules={modules} /> 
    {/*   {mockData.map((element) => (
            <h1>{element.name}</h1>
        ))}  */}
      </div>
    </>
  );
}
