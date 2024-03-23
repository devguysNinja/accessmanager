import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./transaction.styles.css";
import toast, { Toaster } from "react-hot-toast";
import TransactionTableComponent from "./TransactionTableComponent";
import ApiRoute, { CLEANED_URL, DateConverter } from "../config/ApiSettings";

const ReportFilterComponent = ({
  handleSearch,
  handleDownload,
  handleExport,
  filterChoices,
}) => {
  const [date, setDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [staffName, setStaffName] = useState("");
  const [staffID, setStaffID] = useState("");
  const [status, setStatus] = useState("");
  const [emp_department, setDepartment] = useState("");
  const [emp_group, setGroup] = useState("");
  const [emp_location, setLocation] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [swipeCount, setSwipeCount] = useState("");
  const [accessPoint, setAccessPoint] = useState("");
  const [grantType, setGrantType] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [transaction, setTransaction] = useState(null)

    
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "staffName":
        setStaffName(value);
        break;
      case "staffID":
        setStaffID(value);
        break;
      case "status":
        setStatus(value);
        break;
      case "department":
        setDepartment(value);
        break;
      case "group":
        setGroup(value);
        break;
      case "location":
        setLocation(value);
        break;
      case "swipe_count":
        setSwipeCount(value)
        break;
        case "accessPoint":
            setAccessPoint(value)
            break;
        case "grantType":
            setGrantType(value)
            break;
      default:
        break;
    }
    setSearchEnabled(true); // Enable search when any filter is selected
  };

  const handleSearchClick = () => {
    if (!searchEnabled) {
      toast.error("Please select a search filter to enable search");
      return;
    }

    const filters = {
      staffName,
      staffID,
      status,
      emp_department,
      emp_group,
      emp_location,
      startDate,
      endDate,
    };

    const queryString = buildQueryString(filters);

    handleSearch(queryString);
  };

  const buildQueryString = (
    params = {
      start_date: startDate,
      end_date: endDate,
      staff_name: staffName,
      staff_id: staffID,
      status: status,
      department: emp_department,
      group: emp_group,
      location: emp_location,
      accessPoint: accessPoint,
      swipeCount: swipeCount,
      grantType: grantType,
    }
  ) => {
    let REPORT_URL = `${ApiRoute.REPORT_URL}/?`;
    if (params?.start_date) {
      REPORT_URL = `${REPORT_URL}start_date=${DateConverter(
        params?.start_date
      )}`;
    }
    if (params?.end_date) {
      REPORT_URL = `${REPORT_URL}&end_date=${DateConverter(params?.end_date)}`;
    }
    if (params?.staff_name) {
      REPORT_URL = `${REPORT_URL}&staff_name=${params?.staff_name}`;
    }
    if (params?.staff_id) {
      REPORT_URL = `${REPORT_URL}&staff_id=${params?.staff_id}`;
    }
    if (params?.status) {
      REPORT_URL = `${REPORT_URL}&staff_status=${params?.status}`;
    }
    if (params?.department) {
      REPORT_URL = `${REPORT_URL}&department=${params?.department}`;
    }
    if (params?.group) {
      REPORT_URL = `${REPORT_URL}&group=${params?.group}`;
    }
    if (params?.location) {
      REPORT_URL = `${REPORT_URL}&location=${params?.location}`;
    }
    if (params?.accessPoint) {
        REPORT_URL = `${REPORT_URL}&access_point=${params?.accessPoint}`;
      }

      if (params?.swipeCount) {
        REPORT_URL = `${REPORT_URL}&swipe_count=${params?.swipeCount}`;
      }
      if (params?.grantType) {
        REPORT_URL = `${REPORT_URL}&grant_type=${params?.grantType}`;
      }
    REPORT_URL = CLEANED_URL(REPORT_URL);
    console.log("&&&& REPORT_URL: ", REPORT_URL);
    return REPORT_URL;
  };

//   useEffect(() => {
//     buildQueryString();
//   });

  const handleFetchAllTransactions = () => {
    // Fetch all transactions
    handleSearch({});
  };

  const getTransactionData = async () => {
       
    try {
        const response = await fetch(`${buildQueryString()}`);
        if (!response.ok) {
            throw new Error("Failed to fetch transactions");
        }
        const data = await response.json();
        console.log("getTransaction data", data)
        setTransaction(data);
    } catch (error) {
        console.error("Error fetching transactions:", error.message);
    }

    
};


  const {location, group, emp_status, department}  =  filterChoices || {}
 
 


  return (
    <>
    <div className="report-filter-container">
      <div className="report-filter-children">
        <div>
          <label>Start Date:</label>
          <DatePicker
            selected={startDate}
            selectsStart
            startDate={startDate}
            onChange={(date) => setStartDate(date)}
            endDate={endDate}
            placeholderText="Select start date"
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={20}
            onChangeRaw={() => setSearchEnabled(true)}
          />
        </div>
        <div>
          <label>End Date:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="Select end date"
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={20}
            onChangeRaw={() => setSearchEnabled(true)}
          />
        </div>

        <div>
          <label>Staff Name:</label>
          <input
            type="text"
            name="staffName"
            value={staffName}
            placeholder="Enter staff name"
            onChange={handleFilterChange}
          />
        </div>

        <div>
          <label>Staff ID:</label>
          <input
            type="text"
            name="staffID"
            value={staffID}
            placeholder="Enter staff ID"
            onChange={handleFilterChange}
          />
        </div>
        <div>
          <label>Swipe count:</label>
          <input
            type="text"
            name="swipe_count"
            value={swipeCount}
            placeholder="Enter staff ID"
            onChange={handleFilterChange}
          />
        </div>

        <div>
          <label>Status:</label>
          <select name="status" value={status} onChange={handleFilterChange}>
            <option value="">Select Status</option>
            {emp_status?.map((status) => (
              <option key={status.id} value={status.status}>
                {status.status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Access point:</label>
          <select name="accessPoint" value={accessPoint} onChange={handleFilterChange}>
            <option value="">Select Access-point</option>
           
             <option value="Restaurant">
                Restaurant
              </option>
              <option value="Bar">
                Bar
              </option>
            
          </select>
        </div>

        <div>
          <label>Grant type:</label>
          <select name="grantType" value={grantType} onChange={handleFilterChange}>
            <option value="">Select Access-point</option>
           
             <option value="Access_granted">
                Access granted
              </option>
              <option value="Access_denied">
                Access denied
              </option>
            
          </select>
        </div>

        <div>
          <label>Department:</label>
          <select
            name="department"
            value={emp_department}
            onChange={handleFilterChange}
          >
            <option value="">Select Department</option>
            {department?.map((staffDept) => (
              <option value={staffDept.name} key={staffDept.id}>
                {staffDept.dept_name}
              </option>
            ))}
          </select>
        </div>

        <div className="report-filter-item">
          <label>Group:</label>
          <select name="group" value={emp_group} onChange={handleFilterChange}>
            <option value="">Select Group</option>
            {group?.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Location:</label>
          <select
            name="location"
            value={emp_location}
            onChange={handleFilterChange}
          >
            <option value="">Select Location</option>
            {location?.map((staffLocation) => (
              <option value={staffLocation.name} key={staffLocation.id}>
                {staffLocation.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="report-filter-buttons">
        <button onClick={getTransactionData}>Search</button>
        <button onClick={handleFetchAllTransactions}>
          Get All Transactions
        </button>

        <div className="report-filter-children">
         
            <div className="report-filter-children">
              <button >Download</button>
              <button>Export</button>
            </div>
          
        </div>
      </div>
      <Toaster />
    </div>
    <TransactionTableComponent transaction={transaction}/>
    </>
  );
};

export default ReportFilterComponent;
