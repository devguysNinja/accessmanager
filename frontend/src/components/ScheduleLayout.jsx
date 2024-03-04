import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../ScheduleLayout.css"; 

const ScheduleLayout = () => {
  const [startDate, setStartDate] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [shifts, setShifts] = useState({}); // State to store selected shifts for each group

  const handleDateChange = (date) => {
    setStartDate(date);
  };

  const handleGroupChange = (group) => {
    setSelectedGroup(group);
  };

  const handleShiftChange = (group, day, value) => {
    setShifts({
      ...shifts,
      [group]: { ...shifts[group], [day]: value },
    });
  };

  const handleSubmit = () => {
    // Payload
    const data = {
      startDate: startDate,
      selectedGroup: selectedGroup,
      shifts: shifts
    };

    fetch("", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        console.log("Data sent successfully:", data);
        // Handle any further actions after successful data submission
      })
      .catch(error => {
        console.error("There was an error sending the data:", error);
        // Handle error cases
      });
  };


  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1>Employees Schedule</h1>
        <div className="date-picker-container">
          <label htmlFor="startDate">Start Date:</label>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={handleDateChange}
            dateFormat="MM/dd/yyyy"
          />
          <p className="error-message">Start date must be Sunday</p>
        </div>
      </div>

      <div className="schedule-content">
        <div className="group-select-container">
          <label>Select a group:</label>
          <select
            value={selectedGroup}
            onChange={(e) => handleGroupChange(e.target.value)}
          >
            <option value="">Select a group</option>
            <option value="1">Group 1</option>
            <option value="2">Group 2</option>
            <option value="3">Group 3</option>
            <option value="4">Group 4</option>
          </select>
        </div>

        <div className="shift-selection">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="shift-day">
              <h3>{day}</h3>
              <select
                value={shifts[selectedGroup]?.[day] || ""}
                onChange={(e) =>
                  handleShiftChange(selectedGroup, day, e.target.value)
                }
              >
                <option value="">Select Shift</option>
                <option value="Morning Shift">Morning Shift</option>
                <option value="Afternoon Shift">Afternoon Shift</option>
                <option value="Night Shift">Night Shift</option>
                <option value="Off day">Off Day</option>
              </select>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleSubmit}>Submit Schedule</button>
    </div>
  );
};

export default ScheduleLayout;
