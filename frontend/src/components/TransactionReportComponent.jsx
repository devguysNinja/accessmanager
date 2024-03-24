import React, { useState, useEffect } from 'react';
import ReportFilterComponent from './ReportFilterComponent';
// import TransactionTableComponent from './TransactionTableComponent';
import "./transaction.styles.css";
import ApiRoute from "../config/ApiSettings";

const TransactionReportComponent = () => {
    
    const [filterChoices, setFilterChoices] = useState(null);

   
    const fetchFilterChoices = async () => {
       
        try {
            const response = await fetch(`${ApiRoute.PROFILE_CHOICES_URL}`);
            if (!response.ok) {
                throw new Error("Failed to fetch transactions");
            }
            const data = await response.json();
            console.log("filterchoices data", data)
            setFilterChoices(data);
        } catch (error) {
            console.error("Error fetching transactions:", error.message);
        }

        
    };


    useEffect(() => {
        fetchFilterChoices();
    }, []);

    //    // Function to handle search
    //    const handleSearch = (filters) => {
    //     let filteredTransactions = [...transactionData];

      
    //     // Filter based on staff name
    //     if (filters.staffName) {
    //         filteredTransactions = filteredTransactions.filter(transaction =>
    //             transaction.staff.toLowerCase().includes(filters.staffName.toLowerCase())
    //         );
    //     }

    //     // Filter based on staff ID
    //     if (filters.staffID) {
    //         filteredTransactions = filteredTransactions.filter(transaction =>
    //             transaction.staffID.toLowerCase().includes(filters.staffID.toLowerCase())
    //         );
    //     }

    //     // Filter based on status
    //     if (filters.status) {
    //         filteredTransactions = filteredTransactions.filter(transaction =>
    //             transaction.status?.toLowerCase().includes(filters.status.toLowerCase())
    //         );
    //     }

    //     // Filter based on department
    //     if (filters.department) {
    //         filteredTransactions = filteredTransactions.filter(transaction =>
    //             transaction.department.toLowerCase().includes(filters.department.toLowerCase())
    //         );
    //     }

    //     if (filters.startDate && filters.endDate) {
    //         filteredTransactions = filteredTransactions.filter(transaction =>
    //             new Date(transaction.transactionDate) >= filters.startDate && new Date(transaction.transactionDate) <= filters.endDate
    //         );
    //     }


    //     setFilteredData(filteredTransactions);
    // };

   

    return (
        <div className='transaction-report-container'>
            <h2>Transaction Report</h2>
            <ReportFilterComponent  filterChoices={filterChoices} />
            {/* <TransactionTableComponent  /> */}
        </div>
    );
};

export default TransactionReportComponent;
