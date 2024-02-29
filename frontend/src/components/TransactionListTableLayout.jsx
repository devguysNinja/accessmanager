import React, {useState} from "react";
import Card from "react-bootstrap/Card";


export default function TransactionListTableLayout(props) {
  const {admin} = props;
  return (
    admin && (
      <Card>
        <Card.Body>
          {props.children}
        </Card.Body>
      </Card>
    )
  );
}
