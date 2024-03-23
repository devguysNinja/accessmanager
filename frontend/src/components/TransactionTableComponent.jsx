import React from 'react';
import "./transaction.styles.css";
import { TimeStringConverter } from "../config/ApiSettings"

const TransactionTableComponent = ({ transaction }) => {
    // Check if transaction is null or undefined
    if (!transaction) {
        return <div className='no-records'>No records found.</div>;
    }

    // Calculate total number of records
    const totalRecords = transaction.length;

    return (
        <div className='transaction-table-container' style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }}>
            <h3>Total Records: {totalRecords}</h3>
            <table style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th>Card Code</th>
                        <th>Transaction Date</th>
                        <th>Staff</th>
                        <th>Name</th>
                        <th>Count</th>
                        <th>Department</th>
                        <th>Staff ID</th>
                        <th>Group</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Grant type</th>
                    </tr>
                </thead>
                <tbody>
                    {transaction.map((transactionItem, id) => (
                        <tr key={id}>
                            <td>{transactionItem?.reader_uid}</td>
                            <td>{transactionItem?.date ? TimeStringConverter(transactionItem.date) : ""}</td>
                            <td>{transactionItem?.employee}</td>
                            <td>{transactionItem?.access_point}</td>
                            <td>{transactionItem?.swipe_count}</td>
                            <td>{transactionItem?.department}</td>
                            <td>{transactionItem?.employee_id}</td>
                            <td>{transactionItem?.group}</td>
                            <td>{transactionItem?.location}</td>
                            <td>{transactionItem?.employee_status}</td>
                            <td>{transactionItem?.grant_type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTableComponent;
