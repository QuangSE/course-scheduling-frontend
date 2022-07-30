import React, { Fragment, useEffect, useState } from "react";
import util from "../../util/utilFunctions";
import api from "../../apis/courseScheduling/CourseSchedulingApi";
import CourseForm from "./CourseForm";
import EditableDocentCell from "./EditableDocentCell";
import NestledRow from "../NestledTable/NestledRow";
import { v4 as uuidv4 } from "uuid";

import "./courseTable.css";
import utilFunctions from "../../util/utilFunctions";

function HybridView({ apiData, fetchData, setFetchData }) {
  return (
    <div className="hybdrid-view-container">
      {apiData.tableData.map((element, index) => (
        <HybridTable
          examRegGroup={element}
          permissionId={apiData.permissionId}
          docentList={apiData.docentList}
          key={element.exam_regulations_id}
          setFetchData={setFetchData}
          fetchData={fetchData}
          apiData={apiData}
          examRegIndex={index}
        />
      ))}
    </div>
  );
}

function HybridTable({
  examRegGroup,
  permissionId,
  fetchData,
  setFetchData,
  docentList,
}) {
  const [inputData, setInputData] = useState();

  //use to track which row (docent cell) to edit
  const [editCourseData, setEditCourseData] = useState({ courseId: 0 });
  const [tableVisibility, setTableVisibility] = useState(false);

  function getMajorHeading(examRegGroup) {
    const degree = examRegGroup.major.degree;
    const majorName = examRegGroup.major.name;
    const examRegulations = examRegGroup.exam_regulations_group
      ? examRegGroup.exam_regulations_group
      : "PO" + examRegGroup.year;
    return `${degree} ${majorName} ${examRegulations}`;
  }

  function isVisible(module) {
    const moduleVisibility = module.visibility;
    if (moduleVisibility == 0) {
      return true;
    }
    //TODO: ask when to display the module
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 5 && currentMonth <= 11) {
      if (moduleVisibility == 1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (moduleVisibility == 1) {
        return false;
      } else {
        return true;
      }
    }
  }

  function getErGroupName(module) {
    return module.er_group_name === "main" ? null : module.er_group_name;
  }

  function getRegisteredDocentName(course) {
    const index = course.docentCourses.length;
    if (index && course.docentCourses[index - 1].registered.data[0] == 1) {
      console.info(
        "registered docent " + course.docentCourses[index - 1].docent.last_name
      );
      return course.docentCourses[index - 1].docent.last_name;
    }
    return "\u00A0";
  }

  async function handleDeleteClick(courseId, moduleId) {
    console.info("delete course");
    try {
      await api.deleteCourse(courseId);
      const coursesRes = await api.getCoursesByModuleId(moduleId);
      if (coursesRes.data.length == 0) {
        api.deleteModule(moduleId);
        //TODO: delete empty erGroups
      } else {
        util.distributeLsws(moduleId);
      }
    } catch (err) {
      //courses might have already been deleted by others admins
      console.error(err);
    }
    setFetchData(!fetchData);
  }

  function handleEditClick(event, courseId, moduleId, docentLastName) {
    event.preventDefault();
    console.info("change to edit view");
    setEditCourseData({ courseId: courseId, moduleId: moduleId });
    setInputData(docentLastName);
  }

  function handleCancelClick() {
    console.info("cancle click");
    setEditCourseData({ courseId: 0, moduleId: 0 });
  }

  function handleEditInputChange(event) {
    event.preventDefault();
    setInputData(event.target.value);
  }

  async function handleSaveClick() {
    const inputDoc = inputData.toLowerCase().trim();
    const docent = docentList.filter(
      (doc) => doc.last_name.toLowerCase() === inputDoc
    );

    if (docent.length !== 0) {
      console.info(docent);
      //TODO: registerCourse or updateDocentCourse
 
    } else {
      console.info(inputDoc + " doesn't exist");
    }

    sendNotificationToAdmin();
    setEditCourseData({ courseId: 0 });
    console.log(docent + " assigned");
  }

  async function registerCourse(courseId, docentId) {

  }

  //TODO:
  function sendNotificationToAdmin() {}

  return (
    <div className="hybdrid-table-container">
      <div
        className="first-item"
        onClick={(e) => setTableVisibility((v) => !v)}
      >
        <div
          className={`tree-toggler ${tableVisibility ? "active" : null}`}
        ></div>
        <h2 className={`major-header ${tableVisibility ? "active" : null}`}>
          {getMajorHeading(examRegGroup)}
        </h2>
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
                  if (isVisible(module))
                    return (
                      //TODO:add visibility toggle for admin
                      <tr key={module.module_id}>
                        <td>{module.semester}</td>
                        <td>{getErGroupName(module)}</td>
                        <td>{module.name}</td>
                        <td>
                          {module.courses.map((course, i) => (
                            <NestledRow key={uuidv4()} index={i}>
                              <td>{course.name}</td>
                            </NestledRow>
                          ))}
                        </td>
                        <td>
                          {module.courses.map((course, i) => {
                            return editCourseData.courseId ==
                              course.course_id ? (
                              <NestledRow key={course.course_id} index={i}>
                                <EditableDocentCell
                                  value={inputData}
                                  handleEditInputChange={handleEditInputChange}
                                />
                              </NestledRow>
                            ) : (
                              <NestledRow key={uuidv4()} index={i}>
                                <td>{getRegisteredDocentName(course)}</td>
                              </NestledRow>
                            );
                          })}
                        </td>
                        <td className="td-button">
                          {module.courses.map((course, i) => {
                            return editCourseData.courseId ==
                              course.course_id ? (
                              <NestledRow key={uuidv4()} index={i}>
                                <td>
                                  {" "}
                                  <button
                                    type="button"
                                    onClick={handleSaveClick}
                                  >
                                    Speichern
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelClick}
                                  >
                                    Abbrechen
                                  </button>
                                </td>
                              </NestledRow>
                            ) : (
                              <NestledRow key={uuidv4()} index={i}>
                                <td>
                                  <button
                                    type="button"
                                    onClick={(event) =>
                                      handleEditClick(
                                        event,
                                        course.course_id,
                                        course.module_id,
                                        util.getRegisteredDocentName(course)
                                      )
                                    }
                                  >
                                    Bearbeiten
                                  </button>
                                  <button type="button">test</button>
                                  {permissionId == 1 ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteClick(
                                          course.course_id,
                                          course.module_id,
                                          module.er_group_id
                                        )
                                      }
                                    >
                                      Löschen
                                    </button>
                                  ) : null}
                                </td>
                              </NestledRow>
                            );
                          })}
                        </td>
                      </tr>
                    );
                })}
            </tbody>
          </table>
          <CourseForm
            examRegulationsId={examRegGroup.exam_regulations_id}
            permissionId={permissionId}
            setFetchData={setFetchData}
            fetchData={fetchData}
          />
        </div>
      )}
    </div>
  );
}

export default HybridView;
