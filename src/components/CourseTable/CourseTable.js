import React, { useState } from "react";

function CourseTable(props) {
    let modules = props.modules;
    console.log("-------------CourseTable-----------")
   console.log(modules);

  return (
    

 <table>
      <thead>
        <tr>
          <th>Modul</th>
          <th>Lehrveranstaltung</th>
          <th>Dozent</th>
        </tr>
      </thead>
      <tbody>
        {modules.map((module) => (
          <tr>
            <td rowSpan={module.courses.length}>{module.name}</td>
            <td>{module.courses.map((course) => (
                <tr>
                    <td>
                        {course.name}
                    </td>
                </tr>
            ))}</td>
            <td></td>
          </tr>
        ))}
      </tbody>
    </table> 
  );
}

export default CourseTable;
