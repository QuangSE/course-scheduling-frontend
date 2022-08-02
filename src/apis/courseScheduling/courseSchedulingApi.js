import Axios from 'axios';
import {
    API_BASE_URL,
    AUTHENTICATION,
    EXAM_REGULATIONS,
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

    deleteSession() {
        return this.api.post(`${AUTHENTICATION}/delete-session`, { logout: true });
    }

    getCourses(examRegulationsId) {
        return this.api.get(`${EXAM_REGULATIONS}/${examRegulationsId}/courses`);
    }

    getAllExamRegulationsOverview() {
        return this.api.get(`${EXAM_REGULATIONS}/all/overview/courses`);
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

    createDocentCourse(docentId, courseId, registered = 1) {
        return this.api.post(DOCENT_COURSE, {
            docent_id: docentId,
            course_id: courseId,
            registered: registered,
        });
    }

    createDocent(lastName, title = null, firstName = null, email = null, job_type = null) {
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
}

const apiInstance = new CourseSchedulingApi();

export default apiInstance;
