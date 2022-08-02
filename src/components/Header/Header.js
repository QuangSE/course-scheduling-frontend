import React from 'react';
import Logout from '../Logout/Logout';
import './header.css';

function Header() {
  return (
    <nav>
      <div className="div-header">
        <div>Logo</div>
        <div className="button">
          <Logout />
        </div>
      </div>
    </nav>
  );
}

export default Header;
