import React from "react";
import { Container } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import "../App.css";

function CenterCardLayout(props) {
  return (
    <div className="background-container">
      <Container >
        <Row  className="justify-content-center" > 
          <Col xs={10} md={8} lg={6}> 
            <Card style={{ marginTop: "70px" }}>
              <Card.Body>
                <Card.Title>
                  <h3 >{props.formTitle}</h3>
                </Card.Title>
                <Card.Text>{/* {props.children} */}</Card.Text>
                {props.children}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CenterCardLayout;
