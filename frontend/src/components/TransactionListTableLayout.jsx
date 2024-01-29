import React from "react";
import Card from "react-bootstrap/Card";

export default function TransactionListTableLayout(props) {
  return (
    <Card>
      <Card.Body>
        
        {/* <Card.Text></Card.Text> */}
        {props.children}
      </Card.Body>
    </Card>
  );
}
