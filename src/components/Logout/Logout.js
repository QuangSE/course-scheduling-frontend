import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/courseScheduling/CourseSchedulingApi";

function Logout() {
  const navigate = useNavigate();

  const onLogout = async function () {
    try {
      await api.deleteSession();
      return navigate("/login");
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
    }
  };
  const logout = () => {
    try {
      api.deleteSession();
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
    }
    api
      .post("/auth/logout", { logout: true })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return <button onClick={onLogout}>Logout</button>;
}

export default Logout;
