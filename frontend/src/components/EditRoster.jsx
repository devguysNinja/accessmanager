import React, {useState} from 'react'
import '../EditRoster.css'

const EditRoster = ({rowData, onSubmit, onCancel}) => {
    const [editedData, setEditedData] = useState(rowData)

    const handleChange = (e) => {

        const {name, value} = e.target
        setEditedData({...editedData, [name]: value});
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(editedData)
    }
  return (
    <div className="edit-roster-container">
        <div className="edit-roster-form">
          <h2>Edit Roster</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Date:</label>
              <input
                type="text"
                name="shift_date"
                value={editedData.shift_date}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Day:</label>
              <input
                type="text"
                name="work_day"
                value={editedData.work_day}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Shift:</label>
              <input
                type="text"
                name="shift"
                value={editedData.shift}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Group:</label>
              <input
                type="text"
                name="batch"
                value={editedData.batch}
                onChange={handleChange}
              />
            </div>
            <div className="edit-roster-buttons">
              <button type="submit">Save</button>
              <button onClick={onCancel}>Cancel</button>
            </div>
          </form>
        </div>
    </div>
  )
}

export default EditRoster
