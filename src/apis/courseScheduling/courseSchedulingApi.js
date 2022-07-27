import Axios from "axios";
const API_BASE_URL = require("../../util/constants").API_BASE_URL;

Axios.defaults.withCredentials = true;
const api = Axios.create({
  baseURL: API_BASE_URL,
});

async function createSession(username, password) {
  return api.post("auth/create-session", {
    username: username,
    password: password,
  });
}

async function getSession() {
  return api.get("auth/session");
}

async function deleteSession() {
  return api.post("/auth/delete-session", { logout: true });
}

async function getCourses(examRegulationsId) {
    return api.get(`exam-regulations/${examRegulationsId}/courses`)
}

async function getAllExamRegulationsOverview() {
  return api.get("exam-regulations/all/overview/courses")
}

export default { createSession, getSession, deleteSession, getCourses, getAllExamRegulationsOverview };
