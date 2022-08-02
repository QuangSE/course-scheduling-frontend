import api from '../../apis/courseScheduling/CourseSchedulingApi';
import util from '../../util/utilFunctions';

async function addCourse(semester, erGroupName, moduleName, sws, courseName, examRegulationsId) {
  const moduleRes = await createModuleIfNotExists(moduleName, semester, sws);
  const moduleId = moduleRes.data.module_id;
  const erGroupRes = await createErGroupIfNotExists(erGroupName, examRegulationsId);
  const erGroupId = erGroupRes.data.er_group_id;
  await createModuleErGroupIfNotExist(erGroupId, moduleId);
  const courseRes = await api.createCourse(courseName, sws, moduleId);
  await util.distributeLsws(moduleRes.data.module_id);
  return courseRes; //lsws of returned course might not be current due to distributeLsws() call
}

async function createModuleIfNotExists(moduleName, semester, sws) {
  let moduleRes = await api.getModuleByNameSemester(moduleName, semester);
  if (!moduleRes.data) {
    return api.createModule(moduleName, semester, sws);
  }
  return moduleRes;
}

async function createErGroupIfNotExists(erGroupName, examRegulationsId) {
  let erGroupRes = await api.getErGroupIdByNameAndErId(erGroupName, examRegulationsId);
  if (!erGroupRes.data) {
    return await api.createErGroup(erGroupName, examRegulationsId);
  }
  return erGroupRes;
}

async function createModuleErGroupIfNotExist(erGroupId, moduleId) {
  let moduleErGroupRes = await api.getModuleErGroupByErGroupIdModuleId(erGroupId, moduleId);
  if (!moduleErGroupRes.data) {
    return api.createModuleErGroup(erGroupId, moduleId);
  }
  return moduleErGroupRes;
}

export default {
  addCourse,
};
