import React, { useContext, useEffect, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import ApiRoute, { ApiLogout } from "../config/ApiSettings";

export default function AccessLeftFeeder({ userData }) {
	const { meal_category, used_count, balance, message, owner_profile, swipe_count, } = userData || {};
	const { grant_type } = userData || {};
	const { drink_category, access_point } = userData || {};
	const ACCESS_GRANTED = "ACCESS GRANTED";
	const ACCESS_POINT = "BAR"



	useEffect(()=>{
		if (grant_type===ACCESS_GRANTED && access_point===ACCESS_POINT){
			const timeout = setTimeout(()=>{
				window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/drinks-access-gate/?drink=${drink_category}&&uid=${owner_profile}&&swipe=${swipe_count}&&used=${used_count}&&access=${access_point}&&grant=${grant_type}`);

			},3000)
		}
		return (timeout)=>(clearTimeout(timeout))
	})

	return (
		<div style={{ height: "335px" }}>
			<div style={{ display: "inline" }}>
				<b style={{ fontSize: "xx-large", color:"#000", marginRight:"30px" }}>Access Allowed</b>
			</div>{" "}
			<Badge bg={"dark"} style={{ fontSize: "25px"}}>
				{meal_category || drink_category|| 0}
			</Badge>
			<br />
			<div style={{ display: "inline" }}>
				<b style={{ fontSize: "xx-large", color:"#000", marginRight:"30px" }}>Used Access</b>
			</div>{" "}
			<Badge bg={"dark"} style={{ fontSize: "25px" }}>
				{used_count || 0}
			</Badge>
			<br />
			<div style={{ display: "inline" }}>
				<b style={{ fontSize: "xx-large", color:"#000", marginRight:"30px" }}>Balance</b>
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
			<span style={{color:"red", fontSize:"14px", textAlign:"center"}}>{message}</span>
		</div>
	);
}
