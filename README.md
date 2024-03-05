import React, { useState } from "react";

const ScheduleTable = () => {
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

  return (
    <div>
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
      <button onClick={handleAddRow}>Add</button>
    </div>
  );
};

export default ScheduleTable;
