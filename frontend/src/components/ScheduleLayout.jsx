import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../ScheduleLayout.css";
import ApiRoute from "../config/ApiSettings";
import { AiOutlineDelete } from "react-icons/ai";
import { AiOutlineEdit } from "react-icons/ai";

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
  const [groupArray, setGroupArray] = useState(["Batch A", "Batch B", "Batch C"]);
  const [rows, setRows] = useState([
    { group: "", shifts: dayArray.map(() => "") },
  ]);

  // State variables for loading, success message, and error message
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [shiftsData, setShiftsData] = useState([]);
  const [payloadData, setPayloadData] = useState(null)

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

  const handleRemoveShift = (rowIndex) => {
    const newRows = [...rows];
    newRows.splice(rowIndex, 1); 
    setRows(newRows);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${ROSTERS_URL}${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    
      setShiftsData(prevShiftsData => prevShiftsData.filter(shift => shift.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  
  const generatePayload = () => {
    if (!startDate) {
      setIsLoading(false)
      return;
    }

    for (const row of rows) {
      if (!row.group) {
        alert("Please select a group for all rows.");
        return null;
      }
    }
    
    const exactStartDate = new Date(startDate);
    const payload = rows.map(row => {
        const shiftsByDay = {};
        dayArray.forEach((day, index) => {
          shiftsByDay[day] = row.shifts[index] || "Off";
        });
        return {
          start_date: exactStartDate.toISOString(), 

          group: row.group,
          shifts: shiftsByDay
        };
      })
    return payload;
  };
  

  const ROSTERS_URL = `${ApiRoute.ROSTERS_URL}`
  
  const postPayload = async () => {
    const payload = generatePayload();
    try {
      const response = await fetch(ROSTERS_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)

      });
     
      const data = await response.json();
      setPayloadData(data);
    } catch (error) {
      console.error("Error Posting payload:", error.message);
    }
  };

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await fetch(ROSTERS_URL);
       
        const shiftdata = await response.json();
        setShiftsData(shiftdata);
      } catch (error) {
        console.error("Error fetching Schedule:", error.message);
      }
    };

    fetchShifts();
  }, []);


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
              <th>Action</th>
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
                <td>
                  {rows.length > 1 && (
                    <span>
                       <AiOutlineDelete onClick={() => handleRemoveShift(rowIndex)}/>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Conditional rendering for loading spinner, success message, and error message */}
      {isLoading && <div className="loading-spinner">Loading...</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <button className="submit-button" onClick={postPayload} >Submit Schedule</button>

      <div style={{ marginTop: "30px", marginBottom: "30px", maxHeight: "300px", overflowY: "auto" }}>
        <table style={{ marginBottom: "60px" }} >
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Shift</th>
              <th>Group</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody style={{padding:"5px"}}>
            {shiftsData.map((shift) => (
              <tr key={shift.id} style={{fontWeight:"500"}}>
                <td>{shift.shift_date}</td>
                <td style={{fontWeight:"700"}}>{shift.work_day}</td>
                <td>{shift.shift}</td>
                <td style={{fontWeight:"700"}}>{shift.batch}</td>
                <td style={{fontSize:"20px", cursor:"pointer"}}>
            <span style={{marginRight:"20px"}}>
              <AiOutlineEdit />
            </span>
            <span>
              <AiOutlineDelete  onClick={() => handleDelete(shift.id)}/>
            </span>
          </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ScheduleLayout;
