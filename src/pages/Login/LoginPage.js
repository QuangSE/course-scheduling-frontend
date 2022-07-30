import React, { useEffect, useState } from "react";
import LoginForm from "../../components/LoginForm/LoginForm";
import { useNavigate } from "react-router-dom";
import "./login.css";
import api from "../../apis/courseScheduling/CourseSchedulingApi";

function LoginPage() {
  const [error, setError] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);
  const navigate = useNavigate();

  /*   Axios.defaults.withCredentials = true;
  const api = Axios.create({
    baseURL: API_BASE_URL,
  }); */

  useEffect(() => {
    const checkAuthentication = async () => {
      const res = await api.getSession();
      console.log("session: " + res.data.session);
      if (res.data.session) {
        navigate("/");
      }
    };
    checkAuthentication();
  }, [loginStatus]);

  const onLogin = async function (username, password) {
    try {
      console.log("before login");

      const res = await api.createSession(username, password);
      console.log(res.data);
      setLoginStatus(true);
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
      setError(err.response.data);
    }
  };

  return (
    <div className="login">
      <LoginForm Login={onLogin} error={error} />
    </div>
  );
}

export default LoginPage;
