import React, { Fragment, useEffect, useState } from 'react';
import NavBar from '../../components/NavigationBar/NavigationBar';
import api from '../../apis/courseScheduling/CourseSchedulingApi';
import './docentOverview.css';

function DocentsOverview() {
  const [docentsData, setDocentsData] = useState();
  const [session, setSession] = useState();

  console.info('hello world');
  useEffect(() => {
    const fetchDocentData = async () => {
      const res = await api.getDocentCourseOverview();
      const sessionRes = await api.getSession();
      const sortedData = sortDocentsByType(res.data);
      setDocentsData(sortedData);
      setSession(sessionRes.data.user);
    };
    fetchDocentData();
  }, []);

  function sortDocentsByType(data) {
    let sortedData = [];
    let c = { p: 0, vp: 0, lk: 0, lb: 0, empty: 0 };

    for (let i = 0; i < data.length; i++) {
      switch (data[i].jobType) {
        case 'Professor':
          sortedData.splice(c.p, 0, data[i]);
          ++c.p;
          break;
        case 'Vertretungsprofessor':
          sortedData.splice(c.p + c.vp, 0, data[i]);
          ++c.vp;
          break;
        case 'Lehrkraft':
          sortedData.splice(c.p + c.vp + c.lk, 0, data[i]);
          ++c.lk;
          break;
        case 'Lehrbeauftragter':
          sortedData.splice(c.p + c.vp + c.lk + c.lb, 0, data[i]);
          ++c.lb;
          break;
        default:
          sortedData.push(data[i]);
      }
    }
    return sortedData;
  }

  return (
    <Fragment>
      {docentsData ? (
        <Fragment>
          <NavBar permissionId={session.permission_id} />
          <h1 style={{ textAlign: 'center', marginTop: '100px' }}>Dozentenübersicht</h1>
          <div className="docents-overview-container">
            <table>
              <thead>
                <tr>
                  <th>Art</th>
                  <th>Vorname</th>
                  <th>Nachname</th>
                  <th>Eingetragene Kurse</th>
                  <th>Ist-LSWS</th>
                </tr>
              </thead>
              <tbody>
                {docentsData.map((docent) => {
                  return (
                    <tr key={docent.docentId}>
                      <td>{docent.jobType}</td>
                      <td>{docent.firstName}</td>
                      <td>{docent.lastName}</td>
                      <td>{docent.registeredCourses}</td>
                      <td>{docent.totalLsws}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Fragment>
      ) : null}
    </Fragment>
  );
}

export default DocentsOverview;
