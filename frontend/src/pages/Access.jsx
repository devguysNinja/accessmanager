import React, { useContext, useEffect, useState, memo } from "react";
import { Container } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import LeftCardLayout from "../components/LeftCardLayout";
import { Context } from "../App";
import AccessRightFeeder from "../components/AccessRightFeeder";
import AccessLeftFeeder from "../components/AccessLeftFeeder";
import BarAccessLeftFeeder from "../components/BarAccessLeftFeeder";
import ApiRoute, { ApiLogout, Capitalize, BEARER } from "../config/ApiSettings";

function Access() {
	const { mqttclient } = useContext(Context);
	const {
		profile: [userProfile, setUserProfile],
	} = useContext(Context);
	const [brokerMessage, setBrokerMessage] = useState(null);
	const [ownerDetails, setOwnerDetails] = useState(null);
	const [barDetails, setBarDetails] = useState(null);
	const [restaurantDetails, setRestaurantDetails] = useState(null);

	const BASE_URL = ApiRoute.API_DOMAIN;
	const DETAILS_URL = ApiRoute.TRANSACTION_OWNER_DETAILS_URL;

	console.log("***#### MqClient @Access:", mqttclient);

	useEffect(() => {
		if (mqttclient) {
			mqttclient.onMessageArrived = (message) => {
				setBrokerMessage(message);
				console.log(
					`Received message on topic ${message?.destinationName}: ${message?.payloadString}`
				);
			};
		}
	}, [mqttclient]);

	console.log("Broker Message: ", brokerMessage);

	//...Assemble the Payload
	let restaurantPayLoad;
	let barPayLoad;
	try {
		// console.log("Broker Message: ", brokerMessage)
		const { payloadString } = brokerMessage;
		const ownerData = JSON.parse(payloadString);
		if ("grant_type" in ownerData && !("access_point" in ownerData)) {
			restaurantPayLoad = { ...ownerData };
		}

		if ("grant_type" in ownerData && "access_point" in ownerData) {
			console.log("Bar Data: ", ownerData);
			barPayLoad = { ...ownerData };
			// setBarDetails((ownerData)=>ownerData)
		}
	} catch (error) {
		console.log("$$$$$$$ broker Error @Feeder:", error.message);
	}

	//...Call Backend with the Payload
	useEffect(() => {
		async function transactionDetail() {
			if (restaurantPayLoad) {
				try {
					const response = await fetch(`${DETAILS_URL}`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: BEARER,
							},
						body: JSON.stringify(restaurantPayLoad),
					});
					const content = await response?.json();
					if (content?.auth_error) {
						// await ApiLogout();
							console.log("####Error: ", content?.auth_error);
						// throw new Error(JSON.stringify(content));
					}
					if (content?.grant_type) {
						console.log("####DETAILS: ", content);
						setOwnerDetails(content);
					}
				} catch (error) {
					console.log("####ERROR: ", error.message);
				}
			}
		}
		const admin =
			userProfile?.user?.is_superuser ||
			userProfile?.user?.is_staff ||
			userProfile?.is_superuser ||
			userProfile?.is_staff;
		if (admin && restaurantPayLoad?.grant_type) {
			transactionDetail();
		}
	}, [brokerMessage]);

	let { username, department } = ownerDetails || barPayLoad|| {};

	return (
		<div style={{ marginBottom: "40px" }}>
			{" "}
			<Container>
				<div
					style={{
						textAlign: "center",
						fontSize: "110px",
						color: "#000",
					}}
				>
					<b>{"Daily Access"}</b>
				</div>
				<Row className="" style={{ backgroundColor: "none" }}>
					<Col style={{ marginBottom: "20px" }}>
						<LeftCardLayout>
							<AccessRightFeeder userData={ownerDetails} />
							<div
								style={{
									fontSize: "57px",
									color: "#000",
								}}
							>
								<b>{Capitalize(username) || "USERNAME"} </b> <br />
								<b>{Capitalize(department)|| "DEPARTMENT"}</b>
							</div>
						</LeftCardLayout>
					</Col>
					<Col>
						<LeftCardLayout>
							{<AccessLeftFeeder userData={ownerDetails || barPayLoad} />}
							{/* {barPayLoad && <BarAccessLeftFeeder userData={barPayLoad} />} */}
						</LeftCardLayout>
					</Col>
				</Row>
			</Container>
		</div>
	);
}

export default Access;
