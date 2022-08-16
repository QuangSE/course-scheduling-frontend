import React, { useState } from 'react';

import api from '../../apis/courseScheduling/CourseSchedulingApi';
import CourseForm from '../CourseForm/CourseForm';
import EditableCell from '../EditableCell/EditableCell';
import NestledRow from '../NestledTable/NestledRow';
import { v4 as uuidv4 } from 'uuid';

import './courseTable.css';

function HybridView({ apiData, rerenderPage, isAdmin }) {
  return (
    <div className="hybdrid-view-container">
      {apiData.tableData.map((element, index) => (
        <HybridTable
          examRegGroup={element}
          user={apiData.user}
          docentList={apiData.docentList}
          key={element.exam_regulations_id + 1}
          rerenderPage={rerenderPage}
          apiData={apiData}
          examRegIndex={index}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}

function HybridTable({ examRegGroup, user, rerenderPage, docentList, isAdmin }) {
  //use to track which row (docent cell) to edit
  const [editCell, setEditCell] = useState({ courseId: -1 });
  const [tableVisibility, setTableVisibility] = useState(false);

  const isCompulsoryModules = examRegGroup.isCompulsoryModules;
  const onlyOneGroup = examRegGroup.onlyOneGroup;
  const examRegulationsId = !isCompulsoryModules ? examRegGroup.exam_regulations_id : null;

  function getMajorHeading() {
    if (isCompulsoryModules) return 'Bachelor Allgemeine Wahlpflichtmodule PO2020';
    const degree = examRegGroup.major.degree;
    const majorName = examRegGroup.major.name;
    const examRegulations = examRegGroup.exam_regulations_group
      ? examRegGroup.exam_regulations_group
      : 'PO' + examRegGroup.year;
    return `${degree} ${majorName} ${examRegulations}`;
  }

  function isVisible(module, adminView = true) {
    const moduleVisibility = module.visibility;
    if (isAdmin() && adminView) {
      return true;
    }
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
    if (docentCourse.registered == 1) {
      return docentCourse.docent.last_name;
    }
    return null;
  }

  function getDocentCourseKey(course) {
    const docentCourse = getDocentCourse(course);
    if (!docentCourse) {
      return course.course_id + 1;
    }
    return docentCourse.docent_course_id;
  }

  async function moduleIsEmpty(moduleId) {
    const coursesRes = await api.getCoursesByModuleId(moduleId);
    return coursesRes.data.length === 0;
  }

  async function erGroupIsEmpty(erGroupId) {
    const res = await api.getModuleErGroupsByErGroupId(erGroupId);
    return res.data.length === 0 ? true : false;
  }

  async function examRegHasErGroups() {
    const res = await api.getErGroups(examRegulationsId);
    return res.data.erGroups.length > 0 ? true : false;
  }

  async function deleteEmptyMajor() {
    const majorId = examRegGroup.major.major_id;
    const res = await api.getExamRegulations(majorId);
    if (res.data.examRegulations.length === 0) {
      api.deleteMajor(majorId);
    }
  }

  async function deleteEmptyExamRegulations() {
    if (await examRegHasErGroups()) {
      return;
    }
    await api.deleteExamRegulations(examRegulationsId);
    deleteEmptyMajor();
  }

  async function handleDeleteClick(course, erGroupId) {
    console.info('delete course');
    const moduleId = course.module_id;
    const courseId = course.course_id;
    try {
      await api.deleteCourse(courseId);
      if (await moduleIsEmpty(moduleId)) {
        await api.deleteModule(moduleId);
        if (!isCompulsoryModules && (await erGroupIsEmpty(erGroupId))) {
          await api.deleteErGroup(erGroupId);
          await deleteEmptyExamRegulations();
        }
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
    const inputDocent = getRegisteredDocentName(course) ? getRegisteredDocentName(course) : '';

    setEditCell({
      courseId: course.course_id,
      moduleId: course.module_id,
      docentCourseId: docentCourseId,
      inputDocent: inputDocent,
    });
  }

  function handleCancelClick() {
    console.info('cancle click');
    cancelEdit();
  }

  function cancelEdit() {
    setEditCell({ courseId: -1, moduleId: -1, docentCourseId: -1, inputDocent: '' });
  }

  function handleEditInputChange(event) {
    event.preventDefault();
    setEditCell({ ...editCell, inputDocent: event.target.value });
  }

  async function handleSaveClick() {
    //FIXME:
    const courseId = editCell.courseId;
    const docentCourseId = editCell.docentCourseId;
    let inputDocentName = editCell.inputDocent;

    if (!inputDocentName || inputDocentName.trim() === '') {
      if (!docentCourseId) {
        cancelEdit();
        return;
      }
      await deleteEntryPermanent(docentCourseId);
    } else {
      inputDocentName = inputDocentName.trim();
      const docents = docentList.filter(
        (docent) => docent.last_name.toLowerCase() === inputDocentName.toLowerCase()
      );
      if (docents.length !== 0) {
        await registerCourse(docentCourseId, docents[0].docent_id, courseId);
      } else {
        const docentRes = await api.createDocent(inputDocentName);
        await registerCourse(docentCourseId, docentRes.data.docent_id, courseId);
      }
    }

    sendNotificationToAdmin();
    cancelEdit();
    console.log(inputDocentName ? inputDocentName + ' assigned' : null);
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
        docent_id: docentId,
        registered: 1,
        updated_by: user.docent_id,
      });
    } else {
      api.createDocentCourse(docentId, courseId, 1, user.docent_id);
    }
  }

  function deleteEntryPermanent(docentCourseId) {
    console.info('deleting docent course entry ' + docentCourseId);
    api.deleteDocentCourse(docentCourseId);
  }

  function sendNotificationToAdmin() {
    //TODO: send notification to admin
  }

  function editEnabled(courseId) {
    return editCell.courseId == courseId;
  }

  const erGroupName = (module) => {
    if (isCompulsoryModules || onlyOneGroup) {
      return null;
    }
    if (module.er_group_name === 'main') {
      return <td>{null}</td>;
    }
    return <td>{module.er_group_name}</td>;
  };

  const courses = (module) => {
    return module.courses.map((course, i) => (
      <NestledRow key={uuidv4()} index={i}>
        {course.name}
      </NestledRow>
    ));
  };
  const lsws = (module) => {
    return module.courses.map((course, i) => (
      <NestledRow key={uuidv4()} index={i}>
        {course.lsws}
      </NestledRow>
    ));
  };

  function getModuleKey(module) {
    if (isCompulsoryModules) {
      return module.module_id + ' ' + module.semester;
    } else {
      return module.module_id + ' ' + module.er_group_id + ' ' + module.semester;
    }
  }

  const registeredDocents = (module) => {
    return module.courses.map((course, i) => {
      return editEnabled(course.course_id) ? (
        <NestledRow key={getDocentCourseKey(course)} index={i}>
          <EditableCell
            name="docentLastName"
            value={editCell.inputDocent}
            handleEditInputChange={handleEditInputChange}
          />
        </NestledRow>
      ) : (
        <NestledRow key={uuidv4()} index={i}>
          {getRegisteredDocentName(course)}
        </NestledRow>
      );
    });
  };

  const buttons = (module) => {
    return module.courses.map((course, i) => {
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
          <button type="button" onClick={() => handleRegisterClick(course)}>
            Eintragen
          </button>
          <button type="button" onClick={(event) => handleEditClick(event, course)}>
            Bearbeiten
          </button>
          {isAdmin() ? (
            <button type="button" onClick={() => handleDeleteClick(course, module.er_group_id)}>
              Löschen
            </button>
          ) : null}
        </NestledRow>
      );
    });
  };

  const groupCol = () => {
    if (isCompulsoryModules || onlyOneGroup) {
      return null;
    } else {
      return <th>Gruppe</th>;
    }
  };

  const registeredCourseCounter = () => {
    let visibleCourses = examRegGroup.numberOfVisibleCourses;
    let registeredCourses = examRegGroup.numberOfRegisteredCourses;
    /*  if (isAdmin()) { */
    const color = registeredCourses === 0 ? 'grey' : 'black';
    if (visibleCourses > 0 && visibleCourses === registeredCourses) {
      return (
        <>
          <div style={{ color: 'green', paddingLeft: '30px' }}>
            {registeredCourses}/{visibleCourses}
            <div className="check-mark">L</div>
          </div>
        </>
      );
    } else {
      return (
        <div style={{ color: color, paddingLeft: '30px' }}>
          {registeredCourses}/{visibleCourses}
        </div>
      );
    }
    /*    } */

    /*     return (
      <>
        {isAdmin() ? (
          <div style={{ color: 'black', paddingLeft: '30px' }}>
            {registeredCourses}/{visibleCourses}
          </div>
        ) : null}
      </>
    ); */
  };

  return (
    <div className="hybdrid-table-container">
      <div className="first-item" onClick={() => setTableVisibility(!tableVisibility)}>
        <div className="heading-container">
          <div className={`tree-toggler ${tableVisibility ? 'active' : null}`}></div>
          <h2 className={`major-header ${tableVisibility ? 'active' : null}`}>
            {getMajorHeading()}
            {registeredCourseCounter()}
          </h2>
        </div>
      </div>

      {tableVisibility && (
        <div className="table-container">
          <table className="master-table">
            <thead>
              <tr>
                <th>Sem.</th>
                {groupCol()}
                <th>Modul</th>
                <th>Lehrveranstaltung</th>
                <th>LSWS</th>
                <th>Dozent</th>
              </tr>
            </thead>
            <tbody>
              {examRegGroup.modules != 0 &&
                examRegGroup.modules.map((module) => {
                  if (isVisible(module))
                    return (
                      //TODO:add visibility toggle for admin
                      <tr key={getModuleKey(module)}>
                        <td>{module.semester}</td>
                        {erGroupName(module)}
                        <td>{module.name}</td>
                        <td>{courses(module)}</td>
                        <td>{lsws(module)}</td>
                        <td>{registeredDocents(module)}</td>
                        <td className="td-button">{buttons(module)}</td>
                      </tr>
                    );
                })}
            </tbody>
          </table>
          <CourseForm
            examRegulationsId={examRegGroup.exam_regulations_id}
            permissionId={user.permission_id}
            rerenderPage={rerenderPage}
          />
        </div>
      )}
    </div>
  );
}

export default HybridView;
