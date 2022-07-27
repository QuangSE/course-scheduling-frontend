import React from 'react'

function EditableCell({
    editFormData,
    handleEditFormChange,
    handleCancelClick,
    inputName
  }) {
  return (
    <td>
    <input
      type="text"
      required="required"
      placeholder="Enter a name..."
      name={inputName}
      value=""
      onChange={handleEditFormChange}
    ></input>
  </td>
  )
}

export default EditableCell