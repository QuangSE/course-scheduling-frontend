import React, { Fragment, useState } from 'react';

function MajorForm({ permissionId, setFetchData, fetchData }) {
  const emptyFormData = {
    majorName: '',
    degree: '',
    examRegulationsYear: '',
    examRegulationsGroup: '',
  };
  const [majorFormData, setMajorFormData] = useState(emptyFormData);

  function rerenderPage() {
    setFetchData(!fetchData);
  }

  function handleFormChange(event) {
    event.preventDefault();

    setMajorFormData({
      ...majorFormData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleFormSubmit(event) {
    event.preventDefault();

    const finalFormData = {
      majorName: majorFormData.majorName.trim(),
      degree: majorFormData.degree.trim(),
      examRegulationsYear: parseInt(majorFormData.examRegulationsYear),
      examRegulationsGroup: majorFormData.examRegulationsGroup.trim(),
    };
    //TODO:
    const res = await createMajorIfNotExist(finalFormData);
    const majorId = res.data.major_id;
    await createExamRegulations(majorId);
    setMajorFormData(emptyFormData);
    rerenderPage();
  }

  async function createMajorIfNotExist(majorData) {
    //TODO: api call to create major if not exist
  }

  async function createExamRegulations(majorId) {
    //TODO: api call to create exam regulations
  }

  return (
    <Fragment>
      {permissionId == 1 ? (
        <Fragment>
          <h3>Studiengang hinzufügen</h3>
          <form onSubmit={handleFormSubmit}>
            <input
              style={{}}
              type="text"
              name="majorName"
              required="required"
              placeholder="Name des Studiengangs"
              onChange={handleFormChange}
              value={majorFormData.majorName}
            />
            <input
              style={{}}
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
              placeholder="Prüfungsordnungsgruppe z.B 'PO2019&PO2022'"
              onChange={handleFormChange}
              value={majorFormData.examRegulationsGroup}
            />
            <button type="submit">Hinzufügen</button>
            <pre>{JSON.stringify(majorFormData, null, 2)}</pre>
          </form>
        </Fragment>
      ) : null}
    </Fragment>
  );
}

export default MajorForm;
