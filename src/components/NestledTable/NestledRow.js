import React, { Fragment } from 'react';
import './nestledRow.css';

function NestledRow({ children, index }) {
  return (
    <Fragment>
      <table
        style={{
          display: 'flex',
          border: 'none',
          /* width: '100%', */
          minHeight: '20px',
          borderTop: index > 0 ? '1px solid black' : 'none',
        }}
      >
        <tbody>
          <tr style={{ border: 'none' }}>
            <td>{children}</td>
          </tr>
        </tbody>
      </table>
    </Fragment>
  );
}

export default NestledRow;
