import React, { Fragment, useState } from 'react';
import api from '../../apis/courseScheduling/CourseSchedulingApi';
import './majorForm.css';

function MajorForm({ permissionId, rerenderPage }) {
  const emptyFormData = {
    majorName: '',
    degree: '',
    examRegulationsYear: '',
    examRegulationsGroup: '',
  };
  const [majorFormData, setMajorFormData] = useState(emptyFormData);

  function handleFormChange(event) {
    event.preventDefault();

    setMajorFormData({
      ...majorFormData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleFormSubmit(event) {
    event.preventDefault();

    const majorName = majorFormData.majorName.trim();
    const degree = majorFormData.degree.trim();
    const examRegulationsYear = parseInt(majorFormData.examRegulationsYear);
    const examRegulationsGroup = majorFormData.examRegulationsGroup.trim();

    const res = await createMajorIfNotExist(majorName, degree);
    const majorId = res.data.major_id;
    await api.createExamRegulations(examRegulationsYear, examRegulationsGroup, majorId);
    setMajorFormData(emptyFormData);
    rerenderPage();
  }

  async function createMajorIfNotExist(name, degree) {
    let res = await api.getMajorByNameDegree(name, degree);
    if (!res.data) {
      res = await api.createMajor(name, degree);
    }
    return res;
  }

  return (
    <div className="major-form">
      {permissionId == 1 ? (
        <Fragment>
          <h3>Studiengang hinzufügen</h3>
          <form onSubmit={handleFormSubmit}>
            <input
              style={{ width: '200px' }}
              type="text"
              name="majorName"
              required="required"
              placeholder="Name des Studiengangs"
              onChange={handleFormChange}
              value={majorFormData.majorName}
            />
            <input
              style={{ width: '100px' }}
              type="text"
              name="degree"
              required="required"
              placeholder="Bachelor/Master"
              onChange={handleFormChange}
              value={majorFormData.degree}
            />
            <input
              style={{}}
              type="number"
              name="examRegulationsYear"
              required="required"
              min="2010"
              max="9999"
              placeholder="Prüfungsordnung z.B 2020"
              onChange={handleFormChange}
              value={majorFormData.examRegulationsYear}
            />
            <input
              style={{}}
              type="text"
              name="examRegulationsGroup"
              placeholder="PO-Gruppe z.B 'PO2019&PO2022'"
              onChange={handleFormChange}
              value={majorFormData.examRegulationsGroup}
            />
            <button type="submit">Hinzufügen</button>
          </form>
        </Fragment>
      ) : null}
    </div>
  );
}

export default MajorForm;
