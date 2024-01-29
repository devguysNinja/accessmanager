import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ApiRoute from "../config/ApiSettings";

export default function AccessControlFormLayout(props) {
  const BASE_URL = ApiRoute.API_DOMAIN;
  const ACTRL_URL = ApiRoute.TRANSACTION_ACTRL_URL;

  const [holderUsername, setHolderUsername] = useState("");
  const [holderUid, setHolderUid] = useState("");
  const [genricError, setGenricError] = useState("");
  const [grantType, setGrantType] = useState("");
  const [grantError, setGrantError] = useState("");

  const payload = { username: holderUsername, uid: holderUid };

  
  const submit = async (e) => {
    e.preventDefault();
    console.log("ACTRL:", payload);
    const response = await fetch(ACTRL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const content = await response.json();
    if (content?.detail) {
      setGenricError(content?.detail);
      setGrantError("");
      setGrantType("");
      console.log("Detail:", content.detail);
    }
    if (content?.grant_type) {
      setGrantType(props?.brokerMessage);
      setGrantError("");
      setGenricError("");
      console.log("Grant:", content.grant_type);
    }
    if (content?.error) {
      setGrantError(content?.error);
      setGenricError("");
      setGrantType("");
    }
    console.log("ACTRL RESPONSE:", content.error);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Text>Access Control</Card.Text>
        {genricError ? (
          <p style={{ backgroundColor: "tomato" }}>
          {genricError}
          </p>
        ) : null}
        {grantType ? (
          <p style={{ backgroundColor: "green" }}>{grantType}</p>
        ) : null}
        {grantError ? (
          <p style={{ backgroundColor: "#f26340" }}>{grantError}</p>
        ) : null}
        <Form onSubmit={submit}>
          <Form.Group controlId="formInputSm" className="mb-3">
            {/* <Form.Label>Username</Form.Label> */}
            <Form.Control
              type="input"
              size="sm"
              name="username"
              placeholder="Card Holder Username"
              onChange={(e) => setHolderUsername(e.target.value)}
              value={holderUsername}
            />
          </Form.Group>

          <Form.Group controlId="formInputSm" className="mb-3">
            {/* <Form.Label>UID</Form.Label> */}
            <Form.Control
              type="input"
              size="sm"
              name="uid"
              placeholder="Card Holder UID"
              onChange={(e) => setHolderUid(e.target.value)}
              value={holderUid}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            style={{
              width: "100%",
            }}
            // onClick={() => setProfilePixValue("")}
          >
            Grant Access
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
