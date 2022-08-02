import React, { Fragment, useEffect, useState } from 'react';
import util from '../../util/utilFunctions';
import api from '../../apis/courseScheduling/CourseSchedulingApi';
import CourseForm from './CourseForm';
import EditableDocentCell from './EditableDocentCell';
import NestledRow from '../NestledTable/NestledRow';
import { v4 as uuidv4 } from 'uuid';

import './courseTable.css';

function HybridView({ apiData, fetchData, setFetchData }) {
  return (
    <div className="hybdrid-view-container">
      {apiData.tableData.map((element, index) => (
        <HybridTable
          examRegGroup={element}
          user={apiData.user}
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

function HybridTable({ examRegGroup, user, fetchData, setFetchData, docentList }) {
  //use to track which row (docent cell) to edit
  const [editCourseData, setEditCourseData] = useState({ courseId: 0 });
  const [tableVisibility, setTableVisibility] = useState(false);

  function rerenderPage() {
    setFetchData(!fetchData);
  }

  function getMajorHeading(examRegGroup) {
    const degree = examRegGroup.major.degree;
    const majorName = examRegGroup.major.name;
    const examRegulations = examRegGroup.exam_regulations_group
      ? examRegGroup.exam_regulations_group
      : 'PO' + examRegGroup.year;
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
    return module.er_group_name === 'main' ? null : module.er_group_name;
  }

  function getDocentCourse(course) {
    const length = course.docentCourses.length;
    if (!length) {
      return null;
    }
    return course.docentCourses[length - 1];
  }

  function getDocentCourseId(course) {
    const docentCourse = getDocentCourse(course);
    return docentCourse ? docentCourse.docent_course_id : null;
  }

  function getRegisteredDocentName(course) {
    const docentCourse = getDocentCourse(course);
    if (!docentCourse) {
      return null;
    }
    if (docentCourse.registered.data[0] == 1) {
      console.info('registered docent ' + docentCourse.docent.last_name);
      return docentCourse.docent.last_name;
    }
    return null;
  }

  async function moduleIsEmpty(moduleId) {
    const coursesRes = await api.getCoursesByModuleId(moduleId);
    return coursesRes.data.length == 0;
  }

  async function deleteEmptyErGroup(erGroupId) {
    const res = await api.getModuleErGroupsByErGroupId(erGroupId);
    if (res.data.length == 0) {
      api.deleteErGroup(erGroupId);
    }
  }
  async function handleDeleteClick(course, erGroupId) {
    console.info('delete course');
    const moduleId = course.module_id;
    const courseId = course.course_id;
    try {
      await api.deleteCourse(courseId);
      if (await moduleIsEmpty(moduleId)) {
        await api.deleteModule(moduleId);
        await deleteEmptyErGroup(erGroupId);
      } else {
        await util.distributeLsws(moduleId);
      }
    } catch (err) {
      //courses might have already been deleted by others admins
      console.error(err);
    }
    rerenderPage();
  }

  function handleEditClick(event, course) {
    event.preventDefault();
    console.info('change to edit view');
    const docentCourseId = getDocentCourseId(course);

    setEditCourseData({
      courseId: course.course_id,
      moduleId: course.module_id,
      docentCourseId: docentCourseId,
      inputDocent: getRegisteredDocentName(course),
    });
  }

  function handleCancelClick() {
    console.info('cancle click');
    setEditCourseData({ courseId: 0 });
  }

  function handleEditInputChange(event) {
    event.preventDefault();
    setEditCourseData({ ...editCourseData, inputDocent: event.target.value });
  }

  async function handleSaveClick() {
    const courseId = editCourseData.courseId;
    const docentCourseId = editCourseData.docentCourseId;
    const inputDocentName = editCourseData.inputDocent.toLowerCase().trim();

    if (inputDocentName === '') {
      await deRegisterCourse(docentCourseId);
    } else {
      const docents = docentList.filter(
        (docent) => docent.last_name.toLowerCase() === inputDocentName
      );
      if (docentCourseId.length !== 0) {
        await registerCourse(docentCourseId, docents[0].docent_id, courseId);
      } else {
        const docentRes = await api.createDocent(inputDocentName);
        await registerCourse(docentCourseId, docentRes.docent_id, courseId);
      }
    }

    sendNotificationToAdmin();
    setEditCourseData({ courseId: 0 });
    console.log(inputDocentName + ' assigned');
    rerenderPage();
  }

  async function handleRegisterClick(course) {
    const docentCourseId = getDocentCourseId(course);
    await registerCourse(docentCourseId, user.docent_id, course.course_id);
    rerenderPage();
  }

  function registerCourse(docentCourseId, docentId, courseId) {
    if (docentCourseId) {
      api.updateDocentCourse(docentCourseId, {
        registered: 1,
      });
    } else {
      api.createDocentCourse(docentId, courseId);
    }
  }

  function deRegisterCourse(docentCourseId) {
    if (docentCourseId) {
      console.info('deregistering course ' + docentCourseId);
      api.updateDocentCourse(docentCourseId, {
        registered: 0,
      });
    }
  }

  function sendNotificationToAdmin() {
    //TODO: send notification to admin
  }

  function isAdmin() {
    return user.permission_id == 1;
  }

  function editEnabled(courseId) {
    return editCourseData.courseId == courseId;
  }

  return (
    <div className="hybdrid-table-container">
      <div className="first-item" onClick={(e) => setTableVisibility(!tableVisibility)}>
        <div className={`tree-toggler ${tableVisibility ? 'active' : null}`}></div>
        <h2 className={`major-header ${tableVisibility ? 'active' : null}`}>
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
                      <tr key={module.module_id + module.er_group_id}>
                        <td>{module.semester}</td>
                        <td>{getErGroupName(module)}</td>
                        <td>{module.name}</td>
                        <td>
                          {module.courses.map((course, i) => (
                            <NestledRow key={uuidv4()} index={i}>
                              {course.name}
                            </NestledRow>
                          ))}
                        </td>
                        <td>
                          {module.courses.map((course, i) => {
                            return editEnabled(course.course_id) ? (
                              <NestledRow key={course.course_id + module.er_group_id} index={i}>
                                <EditableDocentCell
                                  value={editCourseData.inputDocent}
                                  handleEditInputChange={handleEditInputChange}
                                />
                              </NestledRow>
                            ) : (
                              <NestledRow key={uuidv4()} index={i}>
                                {getRegisteredDocentName(course)}
                              </NestledRow>
                            );
                          })}
                        </td>
                        <td className="td-button">
                          {module.courses.map((course, i) => {
                            return editEnabled(course.course_id) ? (
                              <NestledRow key={uuidv4()} index={i}>
                                <button type="button" onClick={handleSaveClick}>
                                  Speichern
                                </button>
                                <button type="button" onClick={handleCancelClick}>
                                  Abbrechen
                                </button>
                              </NestledRow>
                            ) : (
                              <NestledRow key={uuidv4()} index={i}>
                                <button
                                  type="button"
                                  onClick={(event) => handleEditClick(event, course)}
                                >
                                  Bearbeiten
                                </button>
                                <button type="button" onClick={() => handleRegisterClick(course)}>
                                  Eintragen
                                </button>
                                {isAdmin() ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClick(course, module.er_group_id)}
                                  >
                                    Löschen
                                  </button>
                                ) : null}
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
            permissionId={user.permission_id}
            rerenderPage={rerenderPage}
            fetchData={fetchData}
          />
        </div>
      )}
    </div>
  );
}

export default HybridView;
