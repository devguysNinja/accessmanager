import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../ScheduleLayout.css";

const ScheduleLayout = () => {
  const [startDate, setStartDate] = useState(null);
  const [dayArray] = useState([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);
  const [shiftArray] = useState([
    "off",
    "night",
    "morning",
    "afternoon",
    "mid-day",
  ]);
  const [groupArray, setGroupArray] = useState(["g1", "g2", "g3"]);
  const [rows, setRows] = useState([
    { group: "", shifts: dayArray.map(() => "") },
  ]);

  // State variables for loading, success message, and error message
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDateChange = (date) => {
    // Ensure start date is a Sunday
    if (date.getDay() !== 0) {
      alert("Start date must be a Sunday");
      return;
    }
    setStartDate(date);
  };

  function handleGroupChange(index, event) {
    const newRows = [...rows];
    newRows[index].group = event.target.value;
    setRows(newRows);
  }

  function handleShiftChange(rowIndex, dayIndex, event) {
    const newRows = [...rows];
    newRows[rowIndex].shifts[dayIndex] = event.target.value;
    setRows(newRows);
  }

  function handleAddRow() {
    setRows([...rows, { group: "", shifts: dayArray.map(() => "") }]);
  }

  const generatePayload = () => {
    const payload = {
      startDate: startDate, 
      schedule: rows.map(row => {
        const shiftsByDay = {};
        dayArray.forEach((day, index) => {
          shiftsByDay[day] = row.shifts[index];
        });
        return {
          group: row.group,
          shifts: shiftsByDay
        };
      })
    };
    return payload;
  };
  

  function sendPayloadToBackend() {
    setIsLoading(true); 
  
    const payload = generatePayload();
    console.log("########");
    console.log(payload);
    console.log("#######");

    // Example fetch call to send payload to backend
    fetch('backend-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      setIsLoading(false); // Reset loading state
      setSuccessMessage("Schedule submitted successfully");
      console.log(data);
    })
    .catch(error => {
      setIsLoading(false); // Reset loading state
      setErrorMessage("Failed to submit schedule");
      console.error('Error:', error);
    });
  }

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1>Employees Schedule</h1>
        <div className="date-picker-container">
          <label htmlFor="startDate" style={{fontSize:"23px" }}>Start Date:</label>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={handleDateChange}
            dateFormat="MM/dd/yyyy"
          />
        </div>
      </div>
      <div className="table-container">
        <button className="add-button" onClick={handleAddRow}>
          Add Shift
        </button>
        <table>
          <thead>
            <tr>
              <th>Group</th>
              {dayArray.map((day, index) => (
                <th key={index}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>
                  <select
                    value={row.group}
                    onChange={(event) => handleGroupChange(rowIndex, event)}
                  >
                    <option value="">Select Group</option>
                    {groupArray.map((group, index) => (
                      <option key={index} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </td>
                {row.shifts.map((shift, dayIndex) => (
                  <td key={dayIndex}>
                    <select
                      value={shift}
                      onChange={(event) =>
                        handleShiftChange(rowIndex, dayIndex, event)
                      }
                    >
                      {shiftArray.map((shiftOption, index) => (
                        <option key={index} value={shiftOption}>
                          {shiftOption}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Conditional rendering for loading spinner, success message, and error message */}
      {isLoading && <div className="loading-spinner">Loading...</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <button className="submit-button" onClick={sendPayloadToBackend} >Submit Schedule</button>
    </div>
  );
};

export default ScheduleLayout;
