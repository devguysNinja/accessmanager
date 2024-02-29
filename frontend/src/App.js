import React, { useEffect, useState, useMemo } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import PageNavbar from "./components/PageNavbar";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Access from "./pages/Access";
import DrinksAcess from "./pages/DrinksAcess";
import { connect } from "./config/mqttService";
import Footer from "./pages/Footer";

export const Context = React.createContext("");
export const ReportContext = React.createContext("");

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [client, setClient] = useState(null);
  const [filterQuery, setFilterQuery] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  const TOPIC = "orinlakantobad";

  console.log("App @UserProfile:", userProfile);
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
  }, []);

  useEffect(() => {
    //...Connect to MQTT broker on component mount
    try {
      const mqttClient = connect();
      setClient(mqttClient);
    } catch (error) {
      console.log("#$#$#$#$MQTT Client-eroor: ", error.message);
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
    }),
    [userProfile, client, authToken]
  );

  return (
    <BrowserRouter>
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
          <Route path="/drinks-access-gate" component={() => <DrinksAcess />} />
        </ReportContext.Provider>
      </Context.Provider>
      {/* </div> */}
    </BrowserRouter>
  );
}

export default App;
