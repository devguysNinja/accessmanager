import React, { useState } from 'react';

const ScheduleTable = () => {
  const [dayArray] = useState(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
  const [shiftArray] = useState(["off", "night", "morning", "afternoon", "mid-day"]);
  const [groupArray, setGroupArray] = useState(["g1", "g2", "g3"]);
  const [rows, setRows] = useState([{ group: '', shifts: dayArray.map(() => '') }]);

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
    setRows([...rows, { group: '', shifts: dayArray.map(() => '') }]);
  }

  function generatePayload() {
    const payload = rows.map(row => {
      return {
        group: row.group,
        shifts: row.shifts
      };
    });
    return payload;
  }

  // Example function to send payload to backend
  function sendPayloadToBackend() {
    const payload = generatePayload();
    // Example fetch call to send payload to backend
    fetch('backend-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
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
                    <option key={index} value={group}>{group}</option>
                  ))}
                </select>
              </td>
              {row.shifts.map((shift, dayIndex) => (
                <td key={dayIndex}>
                  <select
                    value={shift}
                    onChange={(event) => handleShiftChange(rowIndex, dayIndex, event)}
                  >
                    {shiftArray.map((shiftOption, index) => (
                      <option key={index} value={shiftOption}>{shiftOption}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddRow}>Add</button>
      <button onClick={sendPayloadToBackend}>Send Payload to Backend</button>
    </div>
  );
}

export default ScheduleTable;
===================================Sample payloads===================================
[
    {
        "group": "g1",
        "shifts": {
            "Sunday": "morning",
            "Monday": "morning",
            "Tuesday": "",
            "Wednesday": "",
            "Thursday": "night",
            "Friday": "night",
            "Saturday": "afternoon"
        }
    },
    {
        "group": "g2",
        "shifts": {
            "Sunday": "night",
            "Monday": "night",
            "Tuesday": "",
            "Wednesday": "",
            "Thursday": "afternoon",
            "Friday": "afternoon",
            "Saturday": "night"
        }
    },
    {
        "group": "g3",
        "shifts": {
            "Sunday": "morning",
            "Monday": "morning",
            "Tuesday": "off",
            "Wednesday": "afternoon",
            "Thursday": "afternoon",
            "Friday": "off",
            "Saturday": "night"
        }
    }
]
===========================BAR===========================
{
  "cart_item": {
    "coke": 3
  },
  "grant_type": "ACCESS GRANTED",
  "reader_uid": "969948274",
  "access_point": "BAR",
  "swipe_count": 1,
  "owner_profile": "c2c77dab-851a-4b0a-af77-dd3766e35d3d"
}
========================BROKER================================
DELAY = 1.2
TIMEOUT = 1.2
# TOPIC = "orinlakantobad"
# MQTT_BROKER = "broker.hivemq.com"
MQTT_BROKER = 'mqtt.eclipseprojects.io'
client = mqtt.Client("Cafeteria")
TOPIC = "TEMPERATURE"

========================Exporter URLs================================
For pdf => transactions/reports/export-to-file/?exporter=pdf
For excel => transactions/reports/export-to-file/
