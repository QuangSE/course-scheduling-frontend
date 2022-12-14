import React, { Fragment, useState } from 'react';
import addCourseHandler from './addCourseHandler';
import './courseForm.css';

function CourseForm({ examRegulationsId, permissionId, rerenderPage }) {
  const formRef = React.useRef(null);
  const emptyAddFormData = {
    semester: '',
    erGroupName: '',
    moduleName: '',
    sws: '',
    courseName: '',
    lsws: '',
    visibility: '',
  };
  const uncheckedVisibility = { ws: false, ss: false, ws_ss: false };

  const [checked, setChecked] = useState(uncheckedVisibility);
  const [addFormData, setAddFormData] = useState(emptyAddFormData);

  async function handleAddFormSubmit(event) {
    event.preventDefault();
    console.log('SubmitHandler');
    console.log('formref: ' + formRef.current);

    const finalAddFormData = {
      ...addFormData,
      erGroupName: addFormData.erGroupName ? addFormData.erGroupName.trim() : 'main',
      semester: parseInt(addFormData.semester, 10),
      moduleName: addFormData.moduleName.trim(),
      sws: parseInt(addFormData.sws, 10),
      courseName: addFormData.courseName.trim(),
      lsws: parseFloat(addFormData.lsws),
      examRegulationsId: parseInt(formRef.current.examRegulationsId.value, 10),
    };

    addCourseHandler
      .addCourse(
        finalAddFormData.semester,
        finalAddFormData.erGroupName,
        finalAddFormData.moduleName,
        finalAddFormData.sws,
        finalAddFormData.courseName,
        finalAddFormData.lsws,
        finalAddFormData.examRegulationsId
      )
      .then(() => {
        console.log(finalAddFormData);
        setAddFormData(emptyAddFormData);
        setChecked(uncheckedVisibility);
        rerenderPage();
      })
      .catch((err) => {
        console.info(err);
      });
  }

  function handleAddFormChange(event) {
    event.stopPropagation();
    const visibility = getCurrentVisibilityValue(addFormData.visibility, event.target);
    let value = event.target.value;
    /*     value = event.target.name === 'visibility' ? value : value; */ //TODO: wtf redundant
    setAddFormData({
      ...addFormData,
      [event.target.name]: value,
      visibility,
    });
  }

  function getCurrentVisibilityValue(previousVisibilityValue, eventTarget) {
    const value = parseInt(eventTarget.value);
    let visibility = previousVisibilityValue;
    if (eventTarget.name === 'visibility' || eventTarget.name === 'semester') {
      if (value === 0) {
        visibility = 0;
        setChecked({ ws: false, ss: false, ws_ss: true });
      } else {
        switch (value % 2) {
          case 1:
            visibility = 1;
            setChecked({ ws: true, ss: false, ws_ss: false });
            break;
          case 0:
            visibility = 2;
            setChecked({ ws: false, ss: true, ws_ss: false });
            break;
          default:
            console.log('Error: eventTarget.value (' + eventTarget.value + ') is not a number');
        }
      }
    }
    return visibility;
  }

  return (
    <>
      {permissionId == 1 ? (
        <div className="course-form">
          <h3>Modul/Lehrveranstaltung hinzuf??gen</h3>
          <form onSubmit={handleAddFormSubmit} ref={formRef} id="add-course-form">
            <input type="hidden" name="examRegulationsId" value={examRegulationsId} />
            <input
              style={{ width: '45px' }}
              type="number"
              min="1"
              max="127"
              name="semester"
              required="required"
              placeholder="Sem."
              onChange={handleAddFormChange}
              value={addFormData.semester}
            />
            <input
              style={{ width: '45px' }}
              type="text"
              name="erGroupName"
              placeholder="Gruppe"
              onChange={handleAddFormChange}
              value={addFormData.erGroupName}
            />
            <input
              type="text"
              name="moduleName"
              required="required"
              placeholder="Modul"
              onChange={handleAddFormChange}
              value={addFormData.moduleName}
            />
            <input
              style={{ width: '45px' }}
              type="number"
              min="1"
              max="127"
              name="sws"
              required="required"
              placeholder="SWS"
              onChange={handleAddFormChange}
              value={addFormData.sws}
            />
            <input
              type="text"
              name="courseName"
              required="required"
              placeholder="Lehrveranstaltung"
              onChange={handleAddFormChange}
              value={addFormData.courseName}
            />
            <input
              style={{ width: '50px' }}
              type="number"
              min="0"
              max="64"
              step="0.01"
              name="lsws"
              required="required"
              placeholder="LSWS"
              onChange={handleAddFormChange}
              value={addFormData.lsws}
            />
            <label style={{ paddingRight: '10px' }}>
              WS
              <input
                type="radio"
                name="visibility"
                value="1"
                checked={checked.ws}
                onChange={handleAddFormChange}
              />
            </label>
            <label style={{ paddingRight: '10px' }}>
              SS
              <input
                type="radio"
                name="visibility"
                value="2"
                checked={checked.ss}
                onChange={handleAddFormChange}
              />
            </label>
            <label style={{ paddingRight: '10px' }}>
              WS/SS
              <input
                type="radio"
                name="visibility"
                value="0"
                checked={checked.ws_ss}
                onChange={handleAddFormChange}
              />
            </label>
            <button type="submit">Hinzuf??gen</button>
          </form>
        </div>
      ) : null}
    </>
  );
}

export default CourseForm;
