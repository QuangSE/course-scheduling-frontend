import Axios from 'axios';
import {
  API_BASE_URL,
  HTTP_URL,
  AUTHENTICATION,
  EXAM_REGULATIONS,
  MAJOR,
  MODULE,
  DOCENT,
  ER_GROUP,
  MODULE_ER_GROUP,
  COURSE,
  DOCENT_COURSE,
  USER,
  COMPULSORY_MODULE,
  PERMISSION,
} from '../../util/constants';

class CourseSchedulingApi {
  constructor() {
    Axios.defaults.withCredentials = true;
    this.api = Axios.create({
      baseURL: API_BASE_URL,
    });
  }

  createSession(username, password) {
    return this.api.post(`${AUTHENTICATION}/create-session`, {
      username,
      password,
    });
  }

  getSession() {
    return this.api.get(`${AUTHENTICATION}/session`);
  }

  getExistingDocent(lastName, firstName) {
    return this.api.post(`${AUTHENTICATION}/existing-docent`, { lastName, firstName });
  }

  deleteSession() {
    return this.api.post(`${AUTHENTICATION}/delete-session`, { logout: true });
  }

  getRegCode() {
    return this.api.get(`${AUTHENTICATION}/registration-code`);
  }

  createMajor(name, degree) {
    return this.api.post(MAJOR, { name, degree });
  }

  deleteMajor(majorId) {
    return this.api.delete(`${MAJOR}/${majorId}`);
  }

  getMajorByNameDegree(name, degree) {
    return this.api.post(`${MAJOR}/by-name-degree`, { name, degree });
  }

  getExamRegulations(majorId) {
    return this.api.get(`${MAJOR}/${majorId}/exam-regulations`);
  }

  getErByMajorIdYear(majorId, year) {
    return this.api.post(`${EXAM_REGULATIONS}/by-major-id-year`, { majorId, year });
  }

  createExamRegulations(year, examRegulationsGroup, majorId) {
    return this.api.post(EXAM_REGULATIONS, {
      year: year,
      exam_regulations_group: examRegulationsGroup,
      major_id: majorId,
    });
  }

  getCourses(examRegulationsId) {
    return this.api.get(`${EXAM_REGULATIONS}/${examRegulationsId}/courses`);
  }

  getErGroups(examRegulationsId) {
    return this.api.get(`${EXAM_REGULATIONS}/${examRegulationsId}/er-groups`);
  }

  getAllExamRegulationsOverview() {
    return this.api.get(`${EXAM_REGULATIONS}/all/overview/courses`);
  }

  getExistingModuleId(examRegulationsId, moduleId) {
    return this.api.get(`${EXAM_REGULATIONS}/${examRegulationsId}/module/${moduleId}`);
  }

  deleteExamRegulations(examRegulationsId) {
    return this.api.delete(`${EXAM_REGULATIONS}/${examRegulationsId}`);
  }

  getModule(moduleId) {
    return this.api.get(`${MODULE}/${moduleId}`);
  }

  getModuleByNameSemester(name, semester) {
    return this.api.post(`${MODULE}/by-name-semester`, { name, semester });
  }

  deleteModule(moduleId) {
    return this.api.delete(`${MODULE}/${moduleId}`);
  }

  getDocentByLastName(lastName) {
    return this.api.post(`${DOCENT}/by-last-name`, {
      last_name: lastName,
    });
  }

  getDocentList() {
    return this.api.get(DOCENT);
  }

  getDocentCourseOverview() {
    return this.api.get(`${DOCENT}/docent-course/overview`);
  }

  getMinimalDocentList() {
    return this.api.get(`${DOCENT}/list/minimal`);
  }

  getErGroupIdByNameAndErId(erGroup, examRegulationsId) {
    return this.api.post(`${ER_GROUP}/by-name/`, {
      name: erGroup,
      exam_regulations_id: examRegulationsId,
    });
  }

  deleteErGroup(erGroupId) {
    return this.api.delete(`${ER_GROUP}/${erGroupId}`);
  }

  createModule(name, semester, sws, visibility) {
    if (!visibility) {
      visibility = semester % 2 === 0 ? 2 : 1;
    }

    return this.api.post(MODULE, { name, semester, sws, visibility });
  }

  createModuleErGroup(erGroupId, moduleId) {
    return this.api.post(MODULE_ER_GROUP, {
      er_group_id: erGroupId,
      module_id: moduleId,
    });
  }

  createErGroup(erGroupName, examRegulationsId) {
    return this.api.post(ER_GROUP, {
      name: erGroupName,
      exam_regulations_id: examRegulationsId,
    });
  }

  createCourse(courseName, lsws, moduleId) {
    return this.api.post(COURSE, {
      name: courseName,
      lsws: lsws,
      module_id: moduleId,
    });
  }

  createDocentCourse(docentId, courseId, registered = 1, updatedBy) {
    return this.api.post(DOCENT_COURSE, {
      docent_id: docentId,
      course_id: courseId,
      registered: registered,
      updated_by: updatedBy,
    });
  }

  createDocent(lastName, firstName = null, title = null, email = null, job_type = null) {
    return this.api.post(DOCENT, {
      title: title,
      first_name: firstName,
      last_name: lastName,
      email: email,
      job_type: job_type,
    });
  }

  createUser(username, password, docentId) {
    return this.api.post(USER, {
      username: username,
      password: password,
      docent_id: docentId,
    });
  }

  getModuleErGroupByErGroupIdModuleId(erGroupId, moduleId) {
    return this.api.post(`${MODULE_ER_GROUP}/by-ids`, {
      er_group_id: erGroupId,
      module_id: moduleId,
    });
  }

  getModuleErGroupsByErGroupId(erGroupId) {
    return this.api.post(`${MODULE_ER_GROUP}/by-er-group-id`, {
      er_group_id: erGroupId,
    });
  }

  getAllDocentCourseEntries() {
    return this.api.get(DOCENT_COURSE);
  }

  getDocentCourseByDocentIdCourseId(docentId, courseId) {
    return this.api.post(`${DOCENT_COURSE}/by-ids`, {
      docent_id: docentId,
      course_id: courseId,
    });
  }

  getDocentCourseByCourseId(courseId) {
    return this.api.post(`${DOCENT_COURSE}/by-course-id`, {
      course_id: courseId,
    });
  }

  updateDocentCourse(docentCourseId, docentCourseData) {
    return this.api.patch(`${DOCENT_COURSE}/${docentCourseId}`, docentCourseData);
  }

  deleteDocentCourse(docentCourseId) {
    return this.api.delete(`${DOCENT_COURSE}/${docentCourseId}`);
  }

  getCoursesByModuleId(moduleId) {
    return this.api.get(`${MODULE}/${moduleId}/courses`);
  }

  deleteCourse(courseId) {
    return this.api.delete(`${COURSE}/${courseId}`);
  }

  updateCourse(courseId, courseData) {
    return this.api.patch(`${COURSE}/${courseId}`, courseData);
  }

  createCompulsoryModule(moduleId, majorId) {
    return this.api.post(COMPULSORY_MODULE, {
      module_id: moduleId,
      major_id: majorId,
    });
  }

  getCompulsoryModuleByIds(moduleId, majorId) {
    return this.api.post(`${COMPULSORY_MODULE}/by-ids`, { moduleId, majorId });
  }

  getCompulsoryModuleOverview() {
    return this.api.get(`${COMPULSORY_MODULE}/all/overview`);
  }

  getMyTotalLsws() {
    return this.api.get(`${USER}/my-account/total-lsws`);
  }

  getMyVisibleCourses() {
    return this.api.get(`${USER}/my-account/visible-courses`);
  }

  createAccount(username, password, docentId, permissionId = 2) {
    return this.api.post(`${USER}/`, {
      username: username,
      password: password,
      docent_id: docentId,
      permission_id: permissionId,
    });
  }
}

const apiInstance = new CourseSchedulingApi();

export default apiInstance;
