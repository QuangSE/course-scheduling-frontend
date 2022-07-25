import { useNavigate, Navigate, Outlet } from "react-router-dom";
import React, { useState, useEffect } from "react";
import api from "../apis/courseScheduling/courseSchedulingApi";

function ProtectedRoutes() {
  const navigate = useNavigate();

  //FIXME: multiple rerender calls
  useEffect(() => {
    api.getSession().then((res) => {
      console.log("session: " + res.data.session);
      if (!res.data.session) {
        navigate("/login");
      }
    });
  }, []);

  return <Outlet />;
}

export default ProtectedRoutes;
