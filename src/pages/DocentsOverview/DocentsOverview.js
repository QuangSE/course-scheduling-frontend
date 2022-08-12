import React, { Fragment, useEffect, useState } from 'react';
import NavBar from '../../components/NavigationBar/NavigationBar';
import api from '../../apis/courseScheduling/CourseSchedulingApi';
import './docentOverview.css';

function DocentsOverview() {
  const [docentsData, setDocentsData] = useState();
  const [session, setSession] = useState();

  useEffect(() => {
    const fetchDocentData = async () => {
      const res = await api.getDocentCourseOverview();
      const sessionRes = await api.getSession();
      setDocentsData(res.data);
      setSession(sessionRes.data.user);
      console.info(docentsData);
    };
    fetchDocentData();
  }, []);

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
