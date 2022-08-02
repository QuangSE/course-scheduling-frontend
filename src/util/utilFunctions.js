import api from '../apis/courseScheduling/CourseSchedulingApi';

function getIndexOfPropertyMatch(arr, property, value) {
    for (const i in arr) {
        if (arr[i][property] === value) {
            return i;
        }
        return null;
    }
}

function getLatestDocentCourseId(course) {
    const index = course.docentCourses.length;
    if (index) {
        return course.docentCourses[index - 1].docent_course_id;
    }
    return null;
}

async function distributeLsws(moduleId) {
    const coursesRes = await api.getCoursesByModuleId(moduleId);
    const moduleRes = await api.getModule(moduleId);
    let numberOfCourses = coursesRes.data.length;
    const moduleSws = moduleRes.data.sws;
    const lsws = numberOfCourses == 0 ? moduleSws : moduleSws / numberOfCourses;
    for (const course of coursesRes.data) {
        api.updateCourse(course.course_id, { lsws: lsws });
    }
}

export default {
    getIndexOfPropertyMatch,
    getLatestDocentCourseId,
    distributeLsws,
};
