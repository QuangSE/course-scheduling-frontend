import React, { Fragment } from 'react';

function EditableDocentCell({ value, name, handleEditInputChange }) {
  return (
    <Fragment>
      <input
        type="text"
        required="required"
        name={name}
        value={value}
        onChange={handleEditInputChange}
        autoFocus={true}
      ></input>
    </Fragment>
  );
}

export default EditableDocentCell;
