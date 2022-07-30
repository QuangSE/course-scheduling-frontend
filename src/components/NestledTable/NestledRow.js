import React, { Fragment } from "react";
import "./nestledRow.css"

function NestledRow({ children, index }) {
  return (
    <Fragment>
      <table
        style={{
          display: "flex",
          border: "none",
          width: "100%",
          height: "auto",
          borderTop: index > 0 ? "1px solid black" : "none",
        }}
      >
        <tbody>
          <tr style={{ border: "none" }}>{children}</tr>
        </tbody>
      </table>
    </Fragment>
  );
}

export default NestledRow;
