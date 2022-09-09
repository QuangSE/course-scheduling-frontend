import { useNavigate, Outlet } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import api from '../apis/courseScheduling/CourseSchedulingApi';

function ProtectedRoutes() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    api
      .getSession()
      .then((res) => {
        console.log('session: ' + res.data.session);
        if (!res.data.session) {
          navigate('/login');
        } else {
          setIsLoading(false);
          console.info('authorized');
        }
      })
      .catch((err) => {
        console.error(err.message);
        if (err.message && err.message === 'Network Error')
          setError(<p>Network Error: Cannot connect to Backend Server</p>);
      });
  }, [isLoading]);

  return error ? error : isLoading ? null : <Outlet />;
}

export default ProtectedRoutes;
