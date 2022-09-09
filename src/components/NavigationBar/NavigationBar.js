import React, { Fragment, useState } from 'react';
import Logout from '../Logout/Logout';
import { Link } from 'react-router-dom';
import './navigationBar.css';

function Header({ permissionId = -1, session = true }) {
  return (
    <nav>
      <div className="div-header">
        <img src={require('../../images/hskl_logo_small.png')} />
        {session ? (
          <Fragment>
            <ul>
              <li key={1}>
                <Link to="/">Startseite</Link>
              </li>
              {permissionId === 1 ? (
                <li key={2}>
                  <Link to="/docents-overview">Dozentenübersicht</Link>
                </li>
              ) : null}
            </ul>
            <div>
              <Logout />
            </div>
          </Fragment>
        ) : (
          <h2 style={{ margin: 'auto' }}>Veranstaltungsmanagement</h2>
        )}
      </div>
    </nav>
  );
}

export default Header;
