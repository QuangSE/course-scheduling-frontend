import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavBar from '../../components/NavigationBar/NavigationBar';
import LoginForm from '../../components/LoginForm/LoginForm';
import RegistrationForm from '../../components/RegistrationForm/RegistrationForm';
import './login.css';
import api from '../../apis/courseScheduling/CourseSchedulingApi';

function LoginPage() {
  const [error, setError] = useState();
  const [loginStatus, setLoginStatus] = useState(false);
  const [register, setRegister] = useState(false);
  const navigate = useNavigate();

  /*   Axios.defaults.withCredentials = true;
  const api = Axios.create({
    baseURL: API_BASE_URL,
  }); */

  useEffect(() => {
    const checkAuthentication = async () => {
      const res = await api.getSession();
      console.log('session: ' + res.data.session);
      if (res.data.session) {
        navigate('/');
      }
    };
    checkAuthentication();
  }, [loginStatus]);

  const onLogin = async function (username, password) {
    try {
      console.log('before login');

      const res = await api.createSession(username, password);
      console.log(res.data);
      setLoginStatus(true);
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <Fragment>
      <NavBar session={false} />
      {register ? (
        <RegistrationForm login={onLogin} setRegister={setRegister} />
      ) : (
        <Fragment>
          <LoginForm login={onLogin} setRegister={setRegister} />
          <div style={{ color: 'red' }}>{error ? 'Anmeldedaten sind ungültig' : null}</div>
        </Fragment>
      )}
    </Fragment>
  );
}

export default LoginPage;
