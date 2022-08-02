import React from 'react';
import { useState, useEffect } from 'react';
import CSVReader from 'react-csv-reader';
import Axios from 'axios';
import api from '../../apis/courseScheduling/CourseSchedulingApi';

const API_BASE_URL = require('../../util/constants').API_BASE_URL;

function Import() {
  const handleForce = (data, fileInfo) => {
    console.log('makroökonomie');
    console.log(data, fileInfo);
    importCsv(data);
  };

  /*  format of valid csv file
    Sem;Studiengangstudienganggruppe;Modul;Lehrveranstaltung;ModulSWS;Dozent;Art;LSWS 

    for now only "Dozent" can be empty, everything else must have a value 
    examRegulationsId has to be set manually!
    */
  const importCsv = async function (csvData) {
    try {
      for (const line of csvData) {
        const examRegulationsId = 6;

        let moduleRes = await api.getModuleByNameSemester(line.modul, line.sem);
        if (!moduleRes.data) {
          moduleRes = await api.createModule(line.modul, line.sem, line.modulsws);
        }
        const moduleId = moduleRes.data.module_id;

        let erGroupIdRes = await api.getErGroupIdByNameAndErId(
          line.studienganggruppe,
          examRegulationsId
        );
        if (!erGroupIdRes.data) {
          erGroupIdRes = await api.createErGroup(line.studienganggruppe, examRegulationsId);
          console.log(erGroupIdRes.data);
        }
        const erGroupId = erGroupIdRes.data.er_group_id;

        let moduleErGroupRes = await api.getModuleErGroupByErGroupIdModuleId(erGroupId, moduleId);
        if (!moduleErGroupRes.data) {
          moduleErGroupRes = await api.createModuleErGroup(erGroupId, moduleId);
        }

        let courseId;
        if (line.lehrveranstaltung) {
          const courseRes = await api.createCourse(line.lehrveranstaltung, line.lsws, moduleId);
          courseId = courseRes.data.course_id;
        }

        let registeredCourse = true;
        if (courseId && line.dozent) {
          const docentRes = await api.getDocentByLastName(line.dozent);
          let docentCourseRes;
          if (docentRes.data) {
            const docentId = docentRes.data.docent_id;
            docentCourseRes = await api.getDocentCourseByDocentIdCourseId(docentId, courseId);
            if (!docentCourseRes.data) {
              docentCourseRes = await api.createDocentCourse(docentId, courseId, 0);
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
            : 'import row failed (or failed paritially'
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
    </div>
  );
}

export default Import;
