import React, { memo, useState } from "react";
import { Container } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ProfileImageCardLayout from "../components/ProfileImageCardLayout";
import ProfileForm from "../components/ProfileForm";
import LeftCardLayout from "../components/LeftCardLayout";
import TransactionListTableLayout from "../components/TransactionListTableLayout";
import TransactionTable from "../components/TransactionTable";
import ReportSelectorForm from "../components/ReportSelectorForm";


function Profile(props) {
  // const [fiterQuery, setFiterQuery] = useState(null);
  return (
    <div>
      {props?.profile?.username
        ? `Hi ${props?.profile?.username}`
        : props?.profile?.user
        ? `Hi ${props?.profile?.user?.username}`
        : "You are not authenticated"}
      <Container>
        <Row className="" style={{ backgroundColor: "#726d6d" }}>
          <Col>
            <LeftCardLayout>
              <ProfileForm />
            </LeftCardLayout>
          </Col>
          <Col sm={3} style={{ marginBottom: "10px" }}>
            <ProfileImageCardLayout />
          </Col>
        </Row>
        <Row className="" style={{ backgroundColor: "#726d6d" }}>
          <Col>
            <TransactionListTableLayout>
              <TransactionTable userprofile={props?.profile} />
            </TransactionListTableLayout>
          </Col>
          <Col sm={3}>
            <ReportSelectorForm />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default memo(Profile);
