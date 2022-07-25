import React from "react";

export default function HelloWorld({moduleName, sws, course}) {
  return <div>
    <h1>Modul: {moduleName}</h1>
    <h1>SWS: {sws}</h1>
    <h1>Lehrveranstaltung: {course}</h1>
    <hr></hr>
    </div>;
}
