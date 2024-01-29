import React, { useState, useContext, useEffect } from "react";
import { Redirect } from "react-router-dom";
import Table from "react-bootstrap/Table";
import ApiRoute, { ApiLogout } from "../config/ApiSettings";
import { ReportContext } from "../App";

export default function TransactionTable(props) {
  const [transactions, setTransactions] = useState([]);
  //...this context is set in ReportSelectorForm
  const [filterQuery, setFilterQuery] = useContext(ReportContext);

  useEffect(() => {
    const TRANSACTIONS_URL = ApiRoute.TRANSACTION_LIST_URL;
    console.log("#####@@@@@#### Filter Query:", filterQuery);
    const { report_type, sort_option } = filterQuery || {};
    const TRANSACTIONS_URL_WITH_QUERY = filterQuery
      ? `${TRANSACTIONS_URL}/?report-type=${report_type}&sort-option=${sort_option}`
      : TRANSACTIONS_URL;

    async function fetchData() {
      try {
        const response = await fetch(TRANSACTIONS_URL_WITH_QUERY, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const content = await response.json();
        if (content?.detail) {
          setTransactions([]);
        }
        if (content?.auth_error) {
          await ApiLogout();
        }
        if (content?.length > 0) {
          setTransactions(content);
          console.log("Transaction List:", content);
        }
      } catch (error) {
        // console.log("Erro Failed: ", error.message);
        if (error.message.includes("Failed to fetch")) {
          console.error("Network error: Failed to fetch data", error.message);
          await ApiLogout();
        }
        console.error(error.message);
      }
    }

    const admin =
      props?.userprofile?.user?.is_superuser ||
      props?.userProfile?.user?.is_staff ||
      props?.userprofile?.is_superuser ||
      props?.userprofile?.is_staff;
    if (admin) {
      fetchData();
    }
    // fetchData();
  }, [filterQuery]);

  const columns = [
    "#",
    "Holder",
    "UID",
    "Access Point",
    "Swipe Count",
    "Raw Payload",
    "Authorized By",
    "Grant Type",
    "Transaction Date",
  ];
  return (
    <Table striped="columns">
      <thead>
        <tr style={{ fontSize: "x-small" }} key={"tr-0"}>
          {columns?.map((column, idx) => (
            <th key={`${column}-${idx}`}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody style={{ fontSize: "x-small" }}>
        {transactions
          ? transactions.map((xtion, idx) => (
              <tr key={xtion?.id}>
                <td>{`${idx + 1}`}</td>
                <td>{xtion?.owner?.user?.username}</td>
                <td>{xtion?.reader_uid}</td>
                <td>{xtion?.access_point}</td>
                <td>{xtion?.swipe_count}</td>
                <td>{xtion?.raw_payload}</td>
                <td>{xtion?.authorizer?.user?.username}</td>
                <td>{xtion?.grant_type}</td>
                <td>{xtion?.date}</td>
              </tr>
            ))
          : null}
      </tbody>
    </Table>
  );
}
