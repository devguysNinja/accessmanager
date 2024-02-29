import React, { useContext, useEffect, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import ApiRoute, { ApiLogout } from "../config/ApiSettings";
import { Context } from "../App";

export default function AccessLeftFeeder({ userData }) {
  const { meal_category, used_count, balance } = userData || "";
  const { grant_type } = userData || "";
  const ACCESS_GRANTED = "ACCESS GRANTED";
  return (
    <div style={{ height: "335px" }}>
      <div style={{ display: "inline" }}>
        <b style={{ fontSize: "xx-large", color:"#000", marginRight:"30px" }}>Access Allowed</b>
      </div>{" "}
      <Badge  bg={"dark"} style={{ fontSize: "25px"}}>
        {meal_category || 0}
      </Badge>
      <br />
      <div style={{ display: "inline" }}>
        <b style={{ fontSize: "xx-large", color:"#000", marginRight:"30px"  }}>Used Access</b>
      </div>{" "}
      <Badge bg={"dark"} style={{ fontSize: "25px" }}>
        {used_count || 0}
      </Badge>
      <br />
      <div style={{ display: "inline" }}>
        <b style={{ fontSize: "xx-large", color:"#000", marginRight:"30px"  }}>Balance</b>
      </div>{" "}
      <Badge
        bg={"dark"}
        style={{ fontSize: "25px", borderRadius: "0px !important" }}
      >
        {balance || 0}
      </Badge>
      <br />
      <div style={{ display: "inline" }}>
        <b style={{ fontSize: "xx-large", color:"#000" }}>Permission Type</b>
      </div>{" "}
      <span
        className={
          grant_type === ACCESS_GRANTED ? "badge bg-success" : "badge bg-danger"
        }
        style={{
          bordeRadius: "0px!important",
          padding: "15px",
          marginTop: "35px",
          textAlign: "center",
          fontSize: grant_type === ACCESS_GRANTED ? "71px" : "77px",
        }}
      >
        {grant_type || "NO ACCESS"}
      </span>
    </div>
  );
}
