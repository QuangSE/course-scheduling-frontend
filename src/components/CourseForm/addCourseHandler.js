import api from '../../apis/courseScheduling/CourseSchedulingApi';
import util from '../../util/utilFunctions';

async function addCourse(
  semester,
  erGroupName,
  moduleName,
  sws,
  courseName,
  lsws,
  examRegulationsId
) {
  const moduleRes = await createModuleIfNotExists(moduleName, semester, sws, examRegulationsId);
  const moduleId = moduleRes.data.module_id;
  const erGroupRes = await createErGroupIfNotExists(erGroupName, examRegulationsId);
  const erGroupId = erGroupRes.data.er_group_id;
  await createModuleErGroupIfNotExist(erGroupId, moduleId);
  const courseRes = await api.createCourse(courseName, lsws, moduleId);
  return courseRes;
}

async function createModuleIfNotExists(name, semester, sws, examRegulationsId) {
  let tmpRes = await api.getModuleByNameSemester(name, semester);
  let moduleRes = { data: null };
  if (tmpRes.data) {
    for (const module of tmpRes.data) {
      const moduleId = module.module_id;
      moduleRes = await api.getExistingModuleId(examRegulationsId, moduleId);
      if (moduleRes.data) {
        return moduleRes;
      }
    }
  }
  if (!moduleRes.data) {
    moduleRes = await api.createModule(name, semester, sws);
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
