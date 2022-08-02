import React, { Fragment } from 'react';

function EditableDocentCell({ value, handleEditInputChange }) {
    return (
        <Fragment>
            <input
                type="text"
                required="required"
                name="docentLastName"
                value={value}
                onChange={handleEditInputChange}
                autoFocus={true}
            ></input>
        </Fragment>
    );
}

export default EditableDocentCell;
