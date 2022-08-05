import React, { useState } from 'react';
import Logout from '../Logout/Logout';
import { Navigate } from 'react-router-dom';
import './navigationBar.css';

function Header({ permissionId }) {
  return (
    <nav>
      <div className="div-header">
        <div>Logo</div>
        <ul>
          <li key={1}>
            <a href="/">Startseite</a>
          </li>
          <li key={2}>
            {permissionId === 1 ? <a href="/docents-overview">Dozentenübersicht</a> : null}
          </li>
        </ul>
        <div className="button">
          <Logout />
        </div>
      </div>
    </nav>
  );
}

export default Header;
