import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./transaction.styles.css";
import toast, { Toaster } from "react-hot-toast";
import TransactionTableComponent from "./TransactionTableComponent";
import ApiRoute, {
  CLEANED_URL,
  YearMonthDayDateConverter,
} from "../config/ApiSettings";

const ReportFilterComponent = ({ handleSearch, filterChoices }) => {
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
  const [transaction, setTransaction] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
        setSwipeCount(value);
        break;
      case "accessPoint":
        setAccessPoint(value);
        break;
      case "grantType":
        setGrantType(value);
        break;
      case "limit":
        setItemsPerPage(parseInt(value));
      default:
        break;
    }
    setSearchEnabled(true); // Enable search when any filter is selected
  };

  // const handleSearchClick = () => {

  //   const filters = {
  //     staffName,
  //     staffID,
  //     status,
  //     emp_department,
  //     emp_group,
  //     emp_location,
  //     startDate,
  //     endDate,
  //   };

  //   const queryString = buildQueryString(filters);

  //   handleSearch(queryString);
  // };

  const buildQueryString = (
    reportUrl,
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
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage
    }
  ) => {
    let REPORT_URL = reportUrl;
    if (params?.start_date) {
      REPORT_URL = `${REPORT_URL}start_date=${YearMonthDayDateConverter(
        params?.start_date
      )}`;
    }
    if (params?.end_date) {
      REPORT_URL = `${REPORT_URL}&end_date=${YearMonthDayDateConverter(
        params?.end_date
      )}`;
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
    if (params?.limit) {
      REPORT_URL = `${REPORT_URL}&limit=${params?.limit}`;
    }
    REPORT_URL = CLEANED_URL(REPORT_URL);
    console.log("&&&& REPORT_URL: ", REPORT_URL);
    return REPORT_URL;
  };

  // useEffect(() => {
  //   buildQueryString();
  // });



  const getTransactionData = async () => {
    try {
      let reportUrl = ApiRoute.REPORT_URL;
      if (!searchEnabled) {
        toast.error("Please select a search filter to enable search");
        return;
      }
      const response = await fetch(`${buildQueryString(reportUrl)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data = await response.json();
      console.log("getTransaction data", data);
      setTransaction(data);
      console.log(reportUrl);
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
    }
  };


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    getTransactionData()
  }

  const handleItemsPerPageChange = (pageSize) => {
    setItemsPerPage(pageSize)
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(transaction.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = transaction.slice(startIndex, endIndex);
  

  const exportToFile = async (e) => {
    try {
      if (!searchEnabled) {
        toast.error("Please select a search filter to enable search");
        return;
      }
      let reportUrl = ApiRoute.EXCEL_URL;
      if (e.target.value === "pdf") {
        reportUrl = ApiRoute.PDF_URL;
      }
      let queryString = buildQueryString(reportUrl);
      console.log("QueryString", queryString);
      const response = await fetch(queryString);
      console.dir(response);
      const blobUrl = await response.blob();
      const pdfUrl = URL.createObjectURL(blobUrl);
      window.open(pdfUrl, "_blank");

      console.log("response..", response);
      if (!response.ok) {
        throw new Error("Failed to export transactions");
      }
    } catch (error) {
      console.error("Error exporting to pdf:", error.message);
    }
  };

  const { location, group, emp_status, department } = filterChoices || {};

  return (
    <>
      <div className="report-filter-container">
        <div className="date-rows">
          <div>
            <label>Start Date:</label> <br />
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
            <label>End Date:</label> <br />
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
        </div>
        <div className="rows">
          <div className="column">
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
              <label>Status:</label>
              <select
                name="status"
                value={status}
                onChange={handleFilterChange}
              >
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
              <select
                name="accessPoint"
                value={accessPoint}
                onChange={handleFilterChange}
              >
                <option value="">Select Access-point</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Bar">Bar</option>
              </select>
            </div>
          </div>
          <div className="column">
            <div>
              <label>Group:</label>
              <select
                name="group"
                value={emp_group}
                onChange={handleFilterChange}
              >
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
          </div>
          <div className="column">
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
              <label>Grant type:</label>
              <select
                name="grantType"
                value={grantType}
                onChange={handleFilterChange}
              >
                <option value="">Select Access-point</option>
                <option value="ACCESS GRANTED">Access granted</option>
                <option value="ACCESS DENIED">Access denied</option>
              </select>
            </div>

            <div>
              <label>Swipe count:</label>
              <input
                type="text"
                name="swipe_count"
                value={swipeCount}
                placeholder="Enter swipe count"
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="report-filter-buttons">
        <button onClick={getTransactionData}>Search</button>

        <button value="pdf" onClick={exportToFile}>
          Pdf
        </button>
        <button onClick={exportToFile}>Excel</button>
        <select
          style={{ width: "80px", marginLeft: "10px", cursor: "pointer" }}
          onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={40}>40</option>
          <option value={50}>50</option>
        </select>
      </div>
      <TransactionTableComponent 
      transaction={currentItems}
      onPageChange={handlePageChange}
      currentPage={currentPage}
      totalPages={totalPages}
       />
      <Toaster />
    </>
  );
};

export default ReportFilterComponent;
