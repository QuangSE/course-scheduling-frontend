import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apis/courseScheduling/CourseSchedulingApi';
import './logout.css';

function Logout() {
  const navigate = useNavigate();

  const onLogout = async function () {
    try {
      await api.deleteSession();
      return navigate('/login');
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
    }
  };

  //<a href="https://www.flaticon.com/free-icons/logout" title="logout icons">Logout icons created by Afian Rochmah Afif - Flaticon</a>
  return (
    <div className="img-hover-zoom">
      <img src={require('../../images/logout.png')} onClick={onLogout} />
    </div>
  );
  return <button onClick={onLogout}>Logout</button>;
}

export default Logout;
