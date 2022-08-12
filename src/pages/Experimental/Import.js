import React from 'react';
import { useState, useEffect } from 'react';
import CSVReader from 'react-csv-reader';
import Axios from 'axios';
import api from '../../apis/courseScheduling/CourseSchedulingApi';
const {
  createModuleIfNotExists,
  createErGroupIfNotExists,
  createModuleErGroupIfNotExist,
} = require('../../components/CourseTable/addCourseHandler');

const API_BASE_URL = require('../../util/constants').API_BASE_URL;

/*
This file was only used at development stage for importing the excel file into the database
*/

function Import() {
  const handleForce = (data, fileInfo) => {
    console.log('makroökonomie');
    console.log(data, fileInfo);
    importCsv(data);
  };

  const importCM = (data, fileInfo) => {
    console.log(data, fileInfo);
    importCompulsoryModules(data);
  };

  async function createModuleIfNotExists(
    name,
    semester,
    sws,
    examRegulationsId,
    ofOtherMajor = false,
    visibility = null
  ) {
    let tmpRes = await api.getModuleByNameSemester(name, semester);
    let moduleRes = { data: null };
    if (tmpRes.data && examRegulationsId !== 0) {
      let erId = examRegulationsId;
      if (ofOtherMajor) erId = ofOtherMajor;
      for (const module of tmpRes.data) {
        const moduleId = module.module_id;
        moduleRes = await api.getExistingModuleId(erId, moduleId);
        if (moduleRes.data) {
          return moduleRes;
        }
      }
    }
    if (!ofOtherMajor && !moduleRes.data) {
      console.info('does not exist in this exam regulations');
      moduleRes = await api.createModule(name, semester, sws, visibility);
    }
    return moduleRes;
  }

  async function registerDocentCourse(courseId, docentName) {
    const docentRes = await api.getDocentByLastName(docentName);
    let docentCourseRes;
    if (docentRes.data) {
      const docentId = docentRes.data.docent_id;
      docentCourseRes = await api.getDocentCourseByDocentIdCourseId(docentId, courseId);
      if (!docentCourseRes.data) {
        docentCourseRes = await api.createDocentCourse(docentId, courseId, 0, docentId);
      } else {
        const docentCourseId = docentCourseRes.data.docent_course_id;
        docentCourseRes = await api.updateDocentCourse(docentCourseId, {
          registered: 1,
        });
      }
    }
  }

  async function createCompulsoryModuleIfNotExists(moduleId, majorId) {
    const res = await api.getCompulsoryModuleByIds(moduleId, majorId);
    const test = 0;
    if (!res.data) {
      await api.createCompulsoryModule(moduleId, majorId);
      console.info('compulsory module created');
    }
  }

  async function importCompulsoryModules(csvData) {
    const fidiId = 1;
    const winfoId = 4;
    const tbwId = 8;
    const möId = 5;
    const idmId = 9;

    for (const line of csvData) {
      console.info(line.modul);
      const moduleRes = await createModuleIfNotExists(line.modul, line.sem, line.msws, 0);
      const moduleId = moduleRes.data.module_id;

      if (line.fidi) {
        await createCompulsoryModuleIfNotExists(moduleId, fidiId);
      }
      if (line.idm) {
        await createCompulsoryModuleIfNotExists(moduleId, idmId);
      }
      if (line.mö) {
        await createCompulsoryModuleIfNotExists(moduleId, möId);
      }
      if (line.tbw) {
        await createCompulsoryModuleIfNotExists(moduleId, tbwId);
      }
      if (line.winfo) {
        await createCompulsoryModuleIfNotExists(moduleId, winfoId);
      }

      let courseId;
      if (line.lehrveranstaltung) {
        const courseRes = await api.createCourse(line.lehrveranstaltung, line.lsws, moduleId);
        courseId = courseRes.data.course_id;
      }

      if (courseId && line.dozent) {
        await registerDocentCourse(courseId, line.dozent);
      }
    }
  }

  /*  format of valid csv file
    examRegulationsId,Sem;gruppe;Modul;Lehrveranstaltung;ModulSWS;Dozent;Art;LSWS 

    for now only "Dozent" can be empty, everything else must have a value 
    examRegulationsId has to be specified in a column
    */
  const importCsv = async function (csvData) {
    try {
      for (const line of csvData) {
        const examRegulationsId = line.examregulationsid;

        console.info(line.modul);
        const moduleRes = await createModuleIfNotExists(
          line.modul.trim(),
          line.sem,
          line.modulsws,
          examRegulationsId,
          line.ofothermajor,
          line.visibility
        );
        const moduleId = moduleRes.data.module_id;
        console.info(JSON.stringify(moduleRes.data, undefined, 2));
        console.info('module id: ' + moduleId);
        const erGroupName = line.gruppe ? line.gruppe : 'main';
        let erGroupIdRes = await api.getErGroupIdByNameAndErId(erGroupName, examRegulationsId);
        if (!erGroupIdRes.data) {
          erGroupIdRes = await api.createErGroup(line.gruppe, examRegulationsId);
          console.log(erGroupIdRes.data);
        }
        const erGroupId = erGroupIdRes.data.er_group_id;

        let moduleErGroupRes = await api.getModuleErGroupByErGroupIdModuleId(erGroupId, moduleId);
        if (!moduleErGroupRes.data) {
          moduleErGroupRes = await api.createModuleErGroup(erGroupId, moduleId);
        }

        let courseId;
        if (!line.ofothermajor && line.lehrveranstaltung) {
          const courseRes = await api.createCourse(line.lehrveranstaltung, line.lsws, moduleId);
          courseId = courseRes.data.course_id;
        }

        let registeredCourse = true;
        if (!line.ofothermajor && courseId && line.dozent) {
          let docentRes = await api.getDocentByLastName(line.dozent);
          let docentCourseRes;
          if (!docentRes.data) {
            docentRes = await api.createDocent(line.dozent);
            console.info('new docent created: ' + docentRes.data.last_name);
          }
          if (docentRes.data) {
            const docentId = docentRes.data.docent_id;
            docentCourseRes = await api.getDocentCourseByDocentIdCourseId(docentId, courseId);
            if (!docentCourseRes.data) {
              docentCourseRes = await api.createDocentCourse(docentId, courseId, 0, docentId);
            } else {
              const docentCourseId = docentCourseRes.data.docent_course_id;
              console.log('docentCourseId: ' + docentCourseId);
              docentCourseRes = await api.updateDocentCourse(docentCourseId, {
                registered: 1,
              });
            }
          }
          registeredCourse = docentCourseRes ? true : false;
        }

        console.log(
          moduleId && courseId && registeredCourse
            ? 'row imported successfully'
            : 'import row failed (or failed paritially)'
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const importDocents = (data, fileInfo) => {
    console.log('importing docents');

    console.log(data, fileInfo);

    data.forEach((docent) => {
      /*   console.log("docent title: " + docent.title);
            console.log("docent title type: " + typeof docent.title); */
      api.createDocent(
        docent.title,
        docent.first_name,
        docent.last_name,
        docent.email,
        docent.job_type
      );
    });
  };

  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase(),
    transform: (value) => value.replace('---', ''),
  };

  return (
    <div>
      <div>
        <CSVReader
          label="Import CSV (examRegulationsId has to be set manually) "
          onFileLoaded={handleForce}
          parserOptions={papaparseOptions}
        />
      </div>
      <div>
        <CSVReader
          label="Import Docents "
          onFileLoaded={importDocents}
          parserOptions={papaparseOptions}
        />
      </div>
      <div>
        <CSVReader
          label="Import Compulsory Modules "
          onFileLoaded={importCM}
          parserOptions={papaparseOptions}
        />
      </div>
    </div>
  );
}

export default Import;
