import React, { useEffect, useState, useMemo } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import PageNavbar from "./components/PageNavbar";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Access from "./pages/Access";
import DrinksAccess from "./pages/DrinksAccess";
import Schedule from "./pages/Schedule";
import { connect, TOPIC } from "./config/mqttService";
import Footer from "./pages/Footer";
import ApiRoute from "./config/ApiSettings";
import Dashboard from "./components/MyAdmin";
import TransactionReportComponent from "./components/TransactionReportComponent";

export const Context = React.createContext("");
export const ReportContext = React.createContext("");

function App() {
	const [userProfile, setUserProfile] = useState(null);
	const [client, setClient] = useState(null);
	const [filterQuery, setFilterQuery] = useState(null);
	const [authToken, setAuthToken] = useState(null)
	const [profileFields, setProfileFields] = useState(null)

	// const TOPIC = "orinlakantobad";

	console.log("App @UserProfile:", userProfile);
	console.log("#####...App @UserProfileChoiceField:", profileFields);
	useEffect(() => {
		const profile = JSON.parse(localStorage.getItem("profile"));
		if (profile) {
			setUserProfile(profile);
		}
	}, []);

	useEffect(() => {
		const token = JSON.parse(localStorage.getItem("jwt"));
		if (token) {
			console.log("APP TOKEN: ", token);
			setAuthToken(token);
		}
	}, [userProfile])

	const PROFILE_CHOICES_URL = ApiRoute.PROFILE_CHOICES_URL
	useEffect(() => {
		const fetchProfileChoices = async () => {
			try {
				const response = await fetch(PROFILE_CHOICES_URL, {
					headers: {
						"Content-Type": "application/json",
					},
				});
				const content = await response.json();
				if (content) {
					setProfileFields(content);
				}
			} catch (error) {
				console.error("Error fetching profile choices:", error);
			}
		};

		fetchProfileChoices();
}, [PROFILE_CHOICES_URL]);

	useEffect(() => {
		//...Connect to MQTT broker on component mount
		try {
			const mqttClient = connect();
			setClient(mqttClient);
		} catch (error) {
			console.log("#$#$#$#$MQTT Client-error: ", error.message);
		}

		// Cleanup function on component unmount
		return () => {
			if (client?.isConnected()) {
				//...Unsubscribe from the topic
				client?.unsubscribe(TOPIC);
				//...Disconnect from the MQTT broker
				client?.disconnect();
			}
		};
	}, []);

	const contextValue = useMemo(
		() => ({
			profile: [userProfile, setUserProfile],
			mqttclient: client,
			auth_token: authToken,
			choice_fields: profileFields,
		}),
		[userProfile, client, authToken, profileFields, ]
	);
	return (

		<BrowserRouter>
		<div style={{ maxWidth: "100%", overflowX: "hidden" }}>
		<Context.Provider value={contextValue}>
			<ReportContext.Provider value={[filterQuery, setFilterQuery]}>
				<PageNavbar setProfile={setUserProfile} />
				<Route path="/" exact component={() => <Home />} />
				<Route
					path="/profile"
					component={() => (
						<Profile
							username={userProfile?.username}
							setName={setUserProfile}
							profile={userProfile}
						/>
					)}
				/>
				<Route path="/login" component={() => <Login />} />
				<Route path="/register" component={Register} />
				<Route path="/access-gate" component={() => <Access />} />
				<Route path="/drinks-access-gate" component={() => <DrinksAccess />} />
				<Route path="/schedule" component={() => <Schedule/>}/>
				<Route path="/admin" component={() => <Dashboard/>} />
				<Route path="/transaction-report" component={() => <TransactionReportComponent/>} />
				<Footer/>
			</ReportContext.Provider>
			</Context.Provider>
			</div>
		</BrowserRouter>
	);
}

export default App;
