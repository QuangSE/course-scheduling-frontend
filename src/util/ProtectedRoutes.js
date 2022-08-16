import { useNavigate, Outlet } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import api from '../apis/courseScheduling/CourseSchedulingApi';

function ProtectedRoutes() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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
      });
  }, [isLoading]);

  return isLoading ? null : <Outlet />;
}

export default ProtectedRoutes;
