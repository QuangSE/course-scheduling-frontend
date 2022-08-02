import { useNavigate, Outlet } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import api from '../apis/courseScheduling/CourseSchedulingApi';

function ProtectedRoutes() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getSession()
            .then((res) => {
                console.log('session: ' + res.data.session);
                setIsLoading(false);
                if (!res.data.session) {
                    navigate('/login');
                }
            })
            .catch((err) => {
                console.warn(err.message);
            });
    }, [isLoading]);

    return isLoading ? null : <Outlet />;
}

export default ProtectedRoutes;
