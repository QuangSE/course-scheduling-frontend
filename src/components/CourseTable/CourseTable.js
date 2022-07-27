import React, { Fragment, useState } from "react";
import util from "../../util/utilFunctions";
import "./courseTable.css";

function HybridView({ data }) {
  console.log("HybridView ");
  console.log(data);
  return (
    <div className="hybdrid-view-container">
      {data.map((element) => (
        <HybridTable examRegGroup={element} key={element.exam_regulations_id} />
      ))}
    </div>
  );
}

const handleAddFormSubmit = (event) => {
  event.preventDefault();
};
const handleEditFormSubmit = (event) => {
  event.preventDefault();
};
const handleEditFormChange = (event) => {
  event.preventDefault();
};
const handleAddFormChange = (event) => {
  event.preventDefault();
};

function HybridTable({ examRegGroup }) {
  const [tableVisibility, setTableVisibility] = useState(false);
  return (
    <div>
      <div
        className="first-item"
        onClick={(e) => setTableVisibility((v) => !v)}
      >
        <h2
          className={`tree-toggler ${tableVisibility ? "active" : null}`}
        ></h2>
        <h2 className="major-header">{util.getMajorHeading(examRegGroup)}</h2>
      </div>

      {tableVisibility && (
        <div className="child">
          <table className="master-table">
            <thead>
              <tr>
                <th>Sem.</th>
                <th>Gruppe</th>
                <th>Modul</th>
                <th>Lehrveranstaltung</th>
                <th>Dozent</th>
              </tr>
            </thead>
            <tbody>
              {examRegGroup.modules != 0 &&
                examRegGroup.modules.map((module) => {
                  if (util.isVisible(module))
                    return (
                      //TODO:add visibility toggle for admin
                      <tr key={module.module_id}>
                        <td>{module.semester}</td>
                        <td>{examRegGroup.name}</td>
                        <td>{module.name}</td>
                        <td>
                            {module.courses.map((course, i) => (
                              <tr
                                style={{
                                  display: "flex",
                                  border: "none",
                                  width: "100%",
                                  borderTop: i > 0 ? "1px solid black" : "none",
                                }}
                                key={course.course_id}
                              >
                              {course.name}
                              </tr>
                            ))}
                        </td>
                        <td>
                            {module.courses.map((course, i) => (
                              <tr
                                style={{
                                  display: "flex",
                                  border: "none",
                                  width: "100%",
                                  borderTop: i > 0 ? "1px solid black" : "none",
                                }}
                                key={course.course_id}
                              >
                                {util.getRegisteredDocentName(course)}
                              </tr>
                            ))}
                     
                        </td>
                      </tr>
                    );
                })}
            </tbody>
          </table>
          <h3>Module erstellen</h3>
          <form onSubmit={handleAddFormSubmit}>
            <input
              type="text"
              name="semester"
              required="required"
              placeholder="Semester"
              onChange={handleAddFormChange}
              width="0px"
            />
            <input
              type="text"
              name="group"
              required="required"
              placeholder="Gruppe"
              onChange={handleAddFormChange}
            />
            <input
              type="text"
              name="module"
              required="required"
              placeholder="Modul"
              onChange={handleAddFormChange}
            />
            <input
              type="text"
              name="course"
              required="required"
              placeholder="Lehrveranstaltung"
              onChange={handleAddFormChange}
            />
          </form>
        </div>
      )}
    </div>
  );
}

export default HybridView;
