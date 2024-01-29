import React from "react";
import { Container } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import "../App.css";

function CenterCardLayout(props) {
  return (
    <Container className="align-items-center d-flex justify-content-center">
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>
                <h3
                  style={{
                    marginLeft: "100px",
                    marginRight: "auto",
                  }}
                >
                  {props.formTitle}
                </h3>
              </Card.Title>
              <Card.Text>{/* {props.children} */}</Card.Text>
              {props.children}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CenterCardLayout;
