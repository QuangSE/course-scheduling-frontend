import React, { Fragment, useState } from "react";
import util from "../../util/utilFunctions";
import api from "../../apis/courseScheduling/courseSchedulingApi";

import "./courseTable.css";

function HybridView({ data }) {

  return (
    <div className="hybdrid-view-container">
      {data.map((element) => (
        <HybridTable examRegGroup={element} key={element.exam_regulations_id} />
      ))}
    </div>
  );
}

function HybridTable({ examRegGroup }) {
  const [tableVisibility, setTableVisibility] = useState(false);
  const [contacts, setContacts] = useState(data);
  const [addFormData, setAddFormData] = useState({
    semester: "",
    er_group: "",
    module: "",
    course: "",
  });

  const [editFormData, setEditFormData] = useState({
    semester: "",
    er_group: "",
    module: "",
    course: "",
    docent: "",
  });

  const [editExamRegulationsId, setEditExamRegultaionsId] = useState(null);

  const handleAddFormSubmit = (event) => {
    event.preventDefault();

    const course = {
      semester: addFormData.semester,
      er_group: addFormData.er_group,
      module: addFormData.module,
      course: addFormData.course,
    };

    //TODO: api req
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
          <h3>Lehrveranstaltungen hinzufügen</h3>
          <form onSubmit={handleAddFormSubmit}>
            <input
              type="hidden"
              name="exam_regulations_id"
              value={examRegGroup.exam_regulations_id}
            />
            <input
              type="hidden"
              name="exam_regulations_group"
              value={examRegGroup.exam_regulations_group}
            />
            <input
              type="hidden"
              name="major_id"
              value={examRegGroup.major.major_id}
            />
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
              name="er_group"
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
