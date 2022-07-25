import React from "react";
import { useState, useEffect } from "react";
import CSVReader from "react-csv-reader";
import Axios from "axios";

const API_BASE_URL = require("../../util/constants").API_BASE_URL;

function Import() {
  const [modul, setModul] = useState();

  Axios.defaults.withCredentials = true;
  const api = Axios.create({
    baseURL: API_BASE_URL,
  });

  const handleForce = (data, fileInfo) => {
    console.log("makroökonomie");
    console.log(data, fileInfo);
    importCsv(data);
  };

  /*  format of valid csv file
    Sem;Studienganggruppe;Modul;Lehrveranstaltung;ModulSWS;Dozent;Art;LSWS 

    for now only "Dozent" can be empty, everything else must have a value 
    examRegulationsId has to be set manually!
    */
  const importCsv = async function (csvData) {
    for (const line of csvData) {
      const examRegulationsId = 6;
      const modul = await importModule(
        examRegulationsId,
        line.studienganggruppe,
        line.modul,
        line.sem,
        line.modulsws
      );

      const moduleId = modul.module_id;

      let courseId = null;
      if (line.lehrveranstaltung) {
        console.log(
          "Lehrveranstaltung: " +
            line.lehrveranstaltung +
            "   lsws: " +
            line.lsws
        );
        const course = await importCourse(
          line.lehrveranstaltung,
          line.lsws,
          moduleId
        );
        courseId = course.course_id;
      }

      let registeredCourse = true;
      if (line.dozent) {
        const docent = await getDocentByLastName(line.dozent);
        const docentId = docent.docent_id;
        const res = await registerCourse(docentId, courseId, 0);
        registeredCourse = docentId && res ? true : false;
      }

      console.log(
        moduleId && courseId && registeredCourse
          ? "row imported successfully"
          : "import row failed (or failed paritially"
      );
    }
  };

  //TODO: modul name is unique?
  const importModule = async function (
    examRegulationsId,
    erGroup,
    moduleName,
    semester,
    sws,
    visibility
  ) {
    try {
      visibility = visibility ? visibility : semester % 2 == 0 ? 2 : 1;

      let modul = await getModuleByName(moduleName);

      if (!modul) {
        console.log("if                        If");
        const res = await api.post("module", {
          name: moduleName,
          semester: semester,
          sws: sws,
          visibility: visibility,
        });
        modul = res.data;
        console.log("module imported! module_id: " + module.module_id);
      }
      console.log("modul: " + JSON.stringify(modul));
      
      const moduleId = modul.module_id;
      console.log("moduleid:                     " + moduleId);
      const moduleErGroup = await createModuleErGroup(
        erGroup,
        moduleId,
        examRegulationsId
      );
      return modul;
    } catch (error) {
      console.log("error: " + error);
      console.log(JSON.stringify(error.response.data));
    }
    return null;
  };

  const getErGroupId = async function (erGroup, examRegulationsId) {
    try {
      const res = await api.post("erGroup/by-name/", {
        name: erGroup,
        exam_regulations_id: examRegulationsId,
      });
      const erGroupId = res.data.er_group_id;
      console.log("fetched erGroupId: " + erGroupId);
      return erGroupId;
    } catch (error) {
      console.log(JSON.stringify(error.response.data));
    }
    return null;
  };

  const createModuleErGroup = async function (
    erGroup,
    moduleId,
    examRegulationsId
  ) {
    try {
      let erGroupId = await getErGroupId(erGroup, examRegulationsId);
      console.log("fetched erGroupId: " + erGroupId);

      if (!erGroupId) {
        console.log("if !ergroupId: " + !erGroupId);
        const res = await api.post("erGroup", {
          name: erGroup,
          exam_regulations_id: examRegulationsId,
        });
        erGroupId = res.data.er_group_id;
        console.log("erGroup created");
      }
      //TODO: check if there is already a moduleErGoup
      const moduleErGoup = await api.post("moduleErGroup/exists", {
        er_group_id: erGroupId,
        module_id: moduleId,
      })
      let res
      console.log("moduleErGoup.data moduleErGoup.data   " + moduleErGoup.data)
      if (!moduleErGoup.data) {
        res = await api.post("moduleErGroup", {
          er_group_id: erGroupId,
          module_id: moduleId,
        });

        console.log("moduleErGroup created successfully");
        return res.data;
      }
  
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
    }
    return null;
  };

  const importCourse = async function (name, lsws, moduleId) {
    try {
      const course = await api.post("course", {
        name: name,
        lsws: lsws,
        module_id: moduleId,
      });
      return course.data;
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
    }
    return null;
  };

  const registerCourse = async function (docentId, courseId, registered = 1) {
    try {
      const registeredCourse = await api.post("docentCourse", {
        docent_id: docentId,
        course_id: courseId,
        registered: registered,
      });

      return registeredCourse.data;
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
    }
    return null;
  };

  const getDocentByLastName = async function (lastName) {
    try {
      const docent = await api.post("docent/by-last-name", {
        last_name: lastName,
      });
      return docent.data;
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
    }
    return null;
  };

  const getModuleByName = async function (name) {
    try {
      console.log("getting module by name " + name);
      const modul = await api.post("module/by-name", {
        name: name,
      });
      console.log(JSON.stringify(modul.data));
      return modul.data;
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
    }
    return null;
  };

  const importDocents = (data, fileInfo) => {
    console.log("importing docents");

    console.log(data, fileInfo);

    data.forEach((docent) => {
      /*   console.log("docent title: " + docent.title);
            console.log("docent title type: " + typeof docent.title); */
      importDocent(
        docent.title,
        docent.first_name,
        docent.last_name,
        docent.email,
        docent.job_type
      );
    });
  };

  function importDocent(title, first_name, last_name, email, job_type) {
    api
      .post("docent", {
        title: title,
        first_name: first_name,
        last_name: last_name,
        email: email,
        job_type: job_type,
      })
      .then((res) => {
        console.log(res.data);
        console.log(`docent ${title} ${first_name} ${last_name} created`);
        return res;
      })
      .catch((err) => {
        console.log("ERROR while importing docent: ");
        console.log(JSON.stringify(err.response.data));
        return null;
      });
  }

  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase(),
    transform: (value) => value.replace("---", ""),
  };

  return (
    <div>
      <div>
        <CSVReader
          label="Select CSV "
          onFileLoaded={handleForce}
          parserOptions={papaparseOptions}
        />
      </div>
      <div>
        <CSVReader
          label="Import Docent "
          onFileLoaded={importDocents}
          parserOptions={papaparseOptions}
        />
      </div>
    </div>
  );
}

export default Import;
