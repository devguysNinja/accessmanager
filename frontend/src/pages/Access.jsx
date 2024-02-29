import React, { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import LeftCardLayout from "../components/LeftCardLayout";
import { Context } from "../App";
import AccessRightFeeder from "../components/AccessRightFeeder";
import AccessLeftFeeder from "../components/AccessLeftFeeder";
import ApiRoute, { ApiLogout, Capitalize } from "../config/ApiSettings";

function Access() {
  const { mqttclient } = useContext(Context);
  const {
    profile: [userProfile, setUserProfile],
  } = useContext(Context);
  const [brokerMessage, setBrokerMessage] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState(null);
  
  const BASE_URL = ApiRoute.API_DOMAIN;
  const DETAILS_URL = ApiRoute.TRANSACTION_OWNER_DETAILS_URL;

  console.log("***#### MqClient @Access:", mqttclient);

  useEffect(() => {
    if (mqttclient) {
      mqttclient.onMessageArrived = (message) => {
        console.log(
          `Received message on topic ${message?.destinationName}: ${message?.payloadString}`
        );
        setBrokerMessage(message);
      };
    }
  }, [mqttclient]);


  //...Assemble the Payload
  let payLoad;
  try {
    const { payloadString } = brokerMessage;
    const ownerData = JSON.parse(payloadString);
    if ("grant_type" in ownerData) {
      payLoad = { ...ownerData };
    }
  } catch (error) {
    console.log("$$$$$$$ broker Error @Feeder:", error.message);
  }

  //...Call Backend with the Payload
  useEffect(() => {
    async function transactionDetail() {
      try {
        const response = await fetch(`${DETAILS_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payLoad),
        });
        const content = await response?.json();
        if (content?.auth_error) {
          await ApiLogout();
          throw new Error(JSON.stringify(content));
        }
        if (content?.grant_type) {
          console.log("####DETAILS: ", content);
          setOwnerDetails(content);
        }
      } catch (error) {
        console.log("####ERROR: ", error.message);
      }
    }
    const admin =
      userProfile?.user?.is_superuser ||
      userProfile?.user?.is_staff ||
      userProfile?.is_superuser ||
      userProfile?.is_staff;
    if (admin && payLoad?.grant_type) {
      transactionDetail();
    }
  }, [brokerMessage]);

  let { username } = ownerDetails || "";

  return (
    <div style={{backgroundColor:"#555"}}>
      {" "}
      <Container >
        <div
          style={{
            textAlign: "center",
            fontSize: "110px",
            color: "#ffd700"
          }}
        >
          <b>{"Daily Access"}</b>
        </div>
        <Row className="" style={{ backgroundColor: "none" }}>
          <Col>
            <LeftCardLayout>
              <AccessRightFeeder userData={ownerDetails} />
              <div
                style={{
                  fontSize: "57px",
                  color:"#000"
                }}
              >
                <b >{Capitalize(username)}</b>
                <b><p>Department</p></b>
              </div>
            </LeftCardLayout>
          </Col>
          <Col>
            <LeftCardLayout>
              <AccessLeftFeeder userData={ownerDetails} />
            </LeftCardLayout>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Access;
