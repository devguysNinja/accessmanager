import React from "react";

import Card from "react-bootstrap/Card";

import "../App.css";

function LeftCardLayout(props) {
  return (
    <Card style={{background: "gold", height:"450px"}}>
      <Card.Body>
        <Card.Title>
          <div
          // style={{
          //   marginLeft: "100px",
          //   marginRight: "auto",
          // }}
          >
            {props?.formTitle}
          </div>
        </Card.Title>
        {/* <Card.Text></Card.Text> */}
        {props.children}
      </Card.Body>
    </Card>
  );
}

export default LeftCardLayout;
