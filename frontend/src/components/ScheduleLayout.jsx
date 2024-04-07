import React, { useState, useEffect, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../ScheduleLayout.css";
import ApiRoute, { BEARER, DateTimeStringConverter } from "../config/ApiSettings";
import { AiOutlineDelete } from "react-icons/ai";
import { AiOutlineEdit } from "react-icons/ai";
import EditRoster from "./EditRoster";
import  toast, {Toaster}  from 'react-hot-toast';
import { Context } from "../App";

const ScheduleLayout = () => {
  const { auth_token} = useContext(Context);


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
  const [shiftTypeArray, setShiftTypeArray] = useState(null);
  const [groupArray, setGroupArray] = useState(null);
  const [rows, setRows] = useState([
    { id: 1, group: "", shifts: dayArray.map(() => "") },
  ]);

  // State variables for loading, success message, and error message
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [shiftsData, setShiftsData] = useState([]);
  const [payloadData, setPayloadData] = useState(null)
  const [editingRow, setEditingRow] = useState(null); 
  
 

  const handleDateChange = (date) => {
    // Ensure start date is a Sunday
    if (date.getDay() !== 0) {
      toast.error("Start date must be a Sunday");
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
    const newRow = { id: rows.length + 1, group: "", shifts: dayArray.map(() => "") };
    setRows([...rows, newRow]);
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
          Authorization: BEARER,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    
      setShiftsData(prevShiftsData => prevShiftsData.filter(shift => shift.id !== id));
      toast.success('Roster successfully deleted');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete roster');
    }
  };

  
  const fetchShifts = async () => {
       
    try {
        const response = await fetch(`${ApiRoute.SHIFTTYPES_URL}`);
        if (!response.ok) {
            throw new Error("Failed to fetch shift types");
        }
        const data = await response.json();
        console.log("shift type data", data)
        setShiftTypeArray(data);
    } catch (error) {
        console.error("Error fetching shift types:", error.message);
    }

    
};

const fetchGroups = async () => {
       
  try {
      const response = await fetch(`${ApiRoute.PROFILE_CHOICES_URL}`);
      if (!response.ok) {
          throw new Error("Failed to fetch groups");
      }
      const data = await response.json();
      console.log("shift group data", data)
      setGroupArray(data);
  } catch (error) {
      console.error("Error fetching group types:", error.message);
  }

  
};


useEffect(() => {
    fetchShifts();
    fetchGroups();
}, []);
  
  const generatePayload = () => {
    if (!startDate) {
      setIsLoading(false)
      toast.error("start date must be present")
      return;
    }

    for (const row of rows) {
      if (!row.group) {
        toast.error("Please select a group for all rows.");
        return null;
      }
    }
    
    const exactStartDate = DateTimeStringConverter(new Date(startDate));
    console.log("$$$ =>StartDate: ", exactStartDate)
    const payload = rows.map(row => {
        const shiftsByDay = {};
        dayArray.forEach((day, index) => {
          shiftsByDay[day] = row.shifts[index] || "Off";
        });
        console.log("$$$ => MAJOR SUSPECT StartDate: ", exactStartDate)
        return {
          start_date: exactStartDate, 

          group: row.group,
          shifts: shiftsByDay
        };
      })
    return payload;
  };
  

  const ROSTERS_URL = `${ApiRoute.ROSTERS_URL}`
  
  const postPayload = async () => {
    const payload = generatePayload();
    console.log("$$$ => ROSTER PAYLOAD: ", payload)
    try {
      const response = await fetch(ROSTERS_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: BEARER,
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
       
        const shiftData = await response.json();
        setShiftsData(shiftData);
      } catch (error) {
        console.error("Error fetching Schedule:", error.message);
      }
    };

    fetchShifts();
  }, [payloadData]);

  const handleEdit = (row) => {
    setEditingRow(row);
  };

  const handleEditSubmit = async (editedRow) => {
    try {
      const response = await fetch(`${ApiRoute.ROSTERS_URL}${editedRow.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: BEARER,
        },
        body: JSON.stringify(editedRow),
      });
  
      if (!response.ok) {
        throw new Error('Failed to edit roster');
      }
  
     // Update rows state with edited data
    const updatedRows = [...rows];
    updatedRows[editingRow] = editedRow;
    setRows(updatedRows);

     // Refetch the data to update shiftsData
     const updatedShiftDataResponse = await fetch(ROSTERS_URL);
     const updatedShiftData = await updatedShiftDataResponse.json();
     setShiftsData(updatedShiftData);
  
      setEditingRow(null);
      toast.success('Roster successfully updated');
    } catch (error) {
      toast.error('Failed to update roster');

    }
  };
  
  const cancelEditing = () => {
    setEditingRow(null);
  };
  
  const {group} = groupArray || {}

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
                    {group?.map((group) => (
                      <option key={group.id} value={group}>
                        {group.name}
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
                       <option value="">Select Shift</option>
                      {shiftTypeArray?.map((shiftOption) => (
                        <option key={shiftOption.id} value={shiftOption}>
                          {shiftOption.name}
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
                <td>{shift.shift_start_date}</td>
                <td style={{fontWeight:"700"}}>{shift.work_day}</td>
                <td>{shift.shift}</td>
                <td style={{fontWeight:"700"}}>{shift.batch}</td>
                <td style={{fontSize:"20px", cursor:"pointer"}}>
            <span style={{marginRight:"20px"}}>
              <AiOutlineEdit onClick={() => handleEdit(shift)} />
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
      {editingRow && (
            <div className="edit-roster-overlay" >
              <EditRoster
                rowData={editingRow}
                onSubmit={handleEditSubmit}
                onCancel={cancelEditing}
              />
            </div>
        )}
     <Toaster/>
    </div>
  );
};

export default ScheduleLayout;
