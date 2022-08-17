import React from 'react';
import util from '../../util/utilFunctions';

function CsvExport({ tableData }) {
  function typeAbbreviation(type) {
    switch (type) {
      case 'Professor':
        return 'P';
        break;
      case 'Lehrkraft':
        return 'LK';
        break;
      case 'Lehrbeauftragter':
        return 'LB';
        break;
      case 'Vertretungsprofessor':
        return 'VP';
        break;
      default:
        return '';
    }
  }

  function convertToCsv(examReg) {
    let csv = '';
    if (examReg.isCompulsoryModules) {
    } else {
      csv = `${examReg.major.degree} ${examReg.major.name} ${
        examReg.exam_regulations_group ? examReg.exam_regulations_group : examReg.year
      };;;;;;;\n`;
      csv += 'Veranstaltungsmanagement;;;;;;;\n';
      csv += 'Sem.;Gruppe;Modul;Lehrveranstaltung;ModulSWS;Dozent;Art;LSWS' + '\n';
      for (const module of examReg.modules) {
        const groupName = module.er_group_name === 'main' ? '' : module.er_group_name;
        const courses = module.courses;
        if (courses.length !== 0) {
          for (let i = 0; i < courses.length; i++) {
            if (util.isVisible(module)) {
              let docent = '---';
              let docentName = '---';
              let type = '---';
              if (
                courses[i].docentCourses.length > 0 &&
                courses[i].docentCourses[0].registered === 1
              ) {
                docent = courses[i].docentCourses[0].docent;
                docentName = docent.last_name;
                type = typeAbbreviation(docent.job_type);
              }
              csv += `${module.semester};${groupName};${module.name};${courses[i].name};${module.sws};${docentName};${type};${courses[i].lsws}\n`;
            } else {
              csv += `${module.semester};${groupName};${module.name};${courses[i].name};---;---;---;---\n`;
            }
          }
        } else {
          csv += `${module.semester};${groupName};${module.name};---;---;---;---;---\n`;
        }
      }
    }
    return csv;
  }

  function majorAbbreviation(name) {
    switch (name) {
      case 'Finanzdienstleistungen':
        return 'Fidi';
        break;
      case 'Wirtschaftsinformatik':
        return 'Winfo';
        break;
      case 'Mittelstandsökonomie':
        return 'Mö';
        break;
      case 'Technische Betriebswirtschaftslehre':
        return 'TBW';
        break;
      case 'Industrial and Digital Management':
        return 'IDM';
        break;
      case 'International Business Administration':
        return 'IBA';
        break;
      case 'Wirtschaft und Recht':
        return 'WuR';
        break;
      case 'Information Management':
        return 'IM';
        break;
      case 'Mittelstandsmanagement':
        return 'MM';
        break;
      case 'Financial Services Management':
        return 'FSM';
        break;
      case 'International Management and Finance':
        return 'IMF';
        break;
      case 'Mittelstandsmanagement':
        return 'MM';
        break;
      case 'Wirtschaftsingenieurwesen - Logistik & Produktionsmanagement':
        return 'WLP';
        break;
      default:
        return name;
    }
  }

  function degreeAbbreviations(degree) {
    if (degree === 'Bachelor') {
      return 'BA';
    }
    if (degree === 'Master') {
      return 'MA';
    }
    return degree;
  }

  function getFileName(examReg) {
    if (examReg.isCompulsoryModules) {
      return `BA_allg_WahlPflichtM_2020`;
    }
    const major = examReg.major;
    const examRegulations = examReg.exam_regulations_group
      ? `PO${examReg.exam_regulations_group}`
      : `PO${examReg.year}`;
    return `${degreeAbbreviations(major.degree)}_${majorAbbreviation(
      major.name
    )}_${examRegulations}`;
  }

  async function exportToCsv(event) {
    const universalBOM = '\uFEFF';
    event.preventDefault();
    for (const examReg of tableData) {
      const csv = await convertToCsv(examReg);
      const element = document.createElement('a');
      element.href = 'data:text/csv;charset=utf-8,' + encodeURI(universalBOM + csv);
      element.download = `${getFileName(examReg)}.csv`;
      document.body.appendChild(element);
      element.click();
    }
  }

  return (
    <div>
      <button className="entry-button" type="button" onClick={exportToCsv}>
        Csv Export
      </button>
    </div>
  );
}

export default CsvExport;
