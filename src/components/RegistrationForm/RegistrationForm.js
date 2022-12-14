import React, { Fragment, useState } from 'react';
import api from '../../apis/courseScheduling/CourseSchedulingApi';
import './registrationForm.css';
/* const dotenv = require('dotenv').config(); */

function RegistrationForm({ login, setRegister }) {
  const emptyFormData = {
    username: '',
    password: '',
    confirmPassword: '',
    lastName: '',
    firstName: '',
    code: '',
  };
  const [registrationFormData, setRegistrationFormData] = useState(emptyFormData);
  const [error, setError] = useState(null);

  function handleFormChange(event) {
    event.preventDefault();

    setRegistrationFormData({
      ...registrationFormData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    const res = await api.getRegCode();
    const regCode = res.data.registrationCode;

    if (registrationFormData.code !== regCode) {
      setError('Der Registrierungscode ist ungültig');
      return;
    }

    const username = registrationFormData.username.trim();
    const password = registrationFormData.password;
    const confirmPassword = registrationFormData.confirmPassword;
    const lastName = registrationFormData.lastName.trim();
    const firstName = registrationFormData.firstName.trim();

    const bool = confirmPassword.length >= 6 && confirmPassword !== password;
    console.info(confirmPassword !== password);
    console.info(bool);

    if (confirmPassword.length >= 6 && confirmPassword !== password) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    const docentId = await createDocentIfNotExist(lastName, firstName);
    try {
      await api.createAccount(username, password, docentId);
      login(username, password);
      setRegister(false);
    } catch (err) {
      console.info(JSON.stringify(err, undefined, 2));
      if (err.response && err.response.data.name === 'UniqueViolationError') {
        setError(`Der Benutzername existiert bereits`);
      } else {
        setError('Unbekannter Fehler');
        console.error(err);
      }
    }
    console.info(docentId);
  }

  async function createDocentIfNotExist(lastName, firstName) {
    const res = await api.getExistingDocent(lastName, firstName);
    if (res.data) {
      return res.data.docentId;
    }
    const docentRes = await api.createDocent(lastName, firstName);
    return docentRes.data.docent_id;
  }

  const errMsg = () => {
    if (
      registrationFormData.confirmPassword >= 6 &&
      registrationFormData.confirmPassword !== registrationFormData.password
    ) {
      return 'Passwörter stimmen nicht überein';
    } else if (error) {
      return error;
    } else {
      return null;
    }
  };

  return (
    <Fragment>
      <div className="registration-form">
        <h3>Registrierung</h3>
        <form onSubmit={handleFormSubmit}>
          <input
            className="reg-input-container"
            autoFocus={true}
            type="text"
            name="username"
            required="required"
            placeholder="Benutzername"
            onChange={handleFormChange}
            value={registrationFormData.username}
          />
          <input
            className="reg-input-container"
            type="password"
            name="password"
            required="required"
            minLength="6"
            placeholder="Passwort"
            onChange={handleFormChange}
            value={registrationFormData.password}
          />
          <input
            className="reg-input-container"
            type="password"
            name="confirmPassword"
            required="required"
            minLength="6"
            placeholder="Passwort bestätigen"
            onChange={handleFormChange}
            value={registrationFormData.confirmPassword}
          />
          <input
            className="reg-input-container"
            type="text"
            name="lastName"
            required="required"
            placeholder="Nachname"
            onChange={handleFormChange}
            value={registrationFormData.lastName}
          />
          <input
            className="reg-input-container"
            style={{}}
            type="text"
            name="firstName"
            placeholder="Vorname"
            onChange={handleFormChange}
            value={registrationFormData.firstName}
          />
          <input
            style={{ marginTop: 20, marginBottom: 10 }}
            type="text"
            name="code"
            required="required"
            placeholder="Registrierungscode"
            onChange={handleFormChange}
            value={registrationFormData.code}
          />
          <button type="submit">Account erstellen</button>
        </form>
        <div style={{ color: 'red', paddingTop: '10px' }}>{error}</div>
      </div>
    </Fragment>
  );
}

export default RegistrationForm;
