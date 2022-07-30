import React from "react";
import "./testTable.css";

function testTable() {
  return (
    <table>
      <tr>
        <th>Company</th>
        <th>Contact</th>
        <th>Country</th>
      </tr>
      <tbody>
        <tr>
          <td>Alfreds Futterkiste</td>
          <td>Maria Anders</td>
          <td>Germany</td>
          <td>NO BORDER PLS</td>
        </tr>
        <tr>
          <td>Centro comercial Moctezuma</td>
          <td>Francisco Chang</td>
          <td>Mexico</td>
          <td>NO BORDER PLS</td>
        </tr>
      </tbody>
    </table>
  );
}

export default testTable;
