import React, { Fragment } from "react";

function EditableDocentCell({ value, handleEditInputChange }) {
  return (
    <Fragment>
      <td>
        <input
          style={{
            width: "100%",
          }}
          type="text"
          required="required"
          name="docentLastName"
          value={value}
          onChange={handleEditInputChange}
          autoFocus={true}	
        ></input>
      </td>
    </Fragment>
  );
}

export default EditableDocentCell;
