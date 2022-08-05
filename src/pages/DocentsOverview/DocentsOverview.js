import React, { Fragment, useEffect, useState } from 'react';
import NavBar from '../../components/NavigationBar/NavigationBar';
import api from '../../apis/courseScheduling/CourseSchedulingApi';

function DocentsOverview() {
  const [docentsData, setDocentData] = useState();
  const [session, setSession] = useState();

  useEffect(() => {
    const fetchDocentData = async () => {
      const sessionRes = await api.getSession();

      setSession(sessionRes.data.user);
    };
    fetchDocentData();
  }, []);

  return (
    <Fragment>
      {session ? <NavBar permissionId={session.permission_id} /> : null}

      {/*  {docentsData ? (
        <div>
          <h1>Dozentenübersicht</h1>
          <table>
            <thead>
              <tr>
                <th>Typ</th>
                <th>Vorname</th>
                <th>Nachname</th>
                <th>Eingetragene Kurse</th>
                <th>Ist-LSWS</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      ) : null} */}
    </Fragment>
  );
}

export default DocentsOverview;
