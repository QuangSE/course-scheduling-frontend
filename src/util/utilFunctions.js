let test;

function prepData(data) {
  let prepairedData = [];

  for (const i in data) {
    /*
      merging same exam regulations groups
       if a exam regulations is unique the value of exam_regulations_group is null
  
      */
    const exam_regulations_group = data[i].exam_regulations_group;
    let index;
    if (prepairedData.length != 0 && exam_regulations_group) {
      index = getIndexOfPropertyMatch(
        prepairedData,
        "exam_regulations_group",
        exam_regulations_group
      );
    }
    if (!index) {
      prepairedData.push({
        exam_regulations_id: data[i].exam_regulations_id,
        year: data[i].year,
        exam_regulations_group: exam_regulations_group,
        major: data[i].major,
      });
      index = prepairedData.length - 1;
      prepairedData[index].modules = [];
      for (const erGroups of data[i].erGroups) {
        for (const modul of erGroups.modules) {
          modul.er_group_id = erGroups.er_group_id;
          modul.er_group_name = erGroups.name;
          prepairedData[index].modules.push(modul);
        }
      }
    }
  }
  console.log("prepaired Data");

  for (const examRegGroup in prepairedData) {
    const modules = examRegGroup.modules;
    if (modules) modules.sort(sortByProperty("semester"));
  }
  console.log(prepairedData);
  return prepairedData;
}

function sortByProperty(property) {
  return function (a, b) {
    if (a[property] > b[property]) return 1;
    else if (a[property] < b[property]) return -1;

    return 0;
  };
}

function getIndexOfPropertyMatch(arr, property, value) {
  for (const i in arr) {
    if (arr[i][property] === value) {
      return i;
    }
    return null;
  }
}

function getMajorHeading(examRegGroup) {
  const degree = examRegGroup.major.degree;
  const majorName = examRegGroup.major.name;
  const examRegulations = examRegGroup.exam_regulations_group
    ? examRegGroup.exam_regulations_group
    : "PO" + examRegGroup.year;
  return `${degree} ${majorName} ${examRegulations}`;
}

function isVisible(module) {
  return module.visibility == 1 || module.visibility == 0;
}

function getRegisteredDocentName(course) {
  const index = course.docentCourses.length;
  if (index && course.docentCourses[index - 1].registered.data[0] == 0) {
    return course.docentCourses[index - 1].docent.last_name;
  }
  return "\u00A0";
}

export default { sortByProperty, getIndexOfPropertyMatch, prepData, getMajorHeading, isVisible, getRegisteredDocentName };
