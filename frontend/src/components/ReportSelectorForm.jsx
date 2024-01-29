import React, { useEffect, useContext, useState } from "react";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ApiRoute, { ApiLogout } from "../config/ApiSettings";
import { ReportContext } from "../App";

export default function ReportSelectorForm(props) {
  const [filterQuery, setFilterQuery] = useContext(ReportContext);
  const [reportType, setReportType] = useState("");
  const [sortOption, setSortOption] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    let sort_option = "";
    switch (sortOption) {
      case "Grant Type":
        sort_option = "grant_type";
        break;
      case "UID":
        sort_option = "reader_uid";
        break;
      default:
        sort_option = sortOption;
    }
    setFilterQuery({
      ...filterQuery,
      report_type: reportType,
      sort_option: sort_option,
    });
  };

  return (
    <Card>
      <Card.Body>
        <Card.Text>Report Selector</Card.Text>

        <Form onSubmit={submit}>
          <Form.Group controlId="formReportType" className="mb-3">
            <Form.Label>Report type</Form.Label>
            <Form.Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option>Choose...</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="formSort" className="mb-3">
            <Form.Label>Sort options</Form.Label>
            <Form.Select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
              }}
            >
              <option>Choose...</option>
              <option>Date</option>
              <option>Owner</option>
              <option>Grant Type</option>
              <option>UID</option>
            </Form.Select>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            style={{
              width: "100%",
            }}
          >
            Get Report
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
