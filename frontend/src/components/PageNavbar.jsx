import React, { useContext, useState } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ApiRoute, { ApiLogout } from "../config/ApiSettings";
import Dashboard from "./MyAdmin";
import  Image  from "react-bootstrap/Image";
import { Context } from "../App";

function PageNavbar(props) {
  // const [redirect, setRedirect] = useState(false);
  const {profile} = useContext(Context)
  const userProfile = profile[0];
  const isAdmin = userProfile?.is_superuser || userProfile?.user?.is_superuser;

 
  //...logout Handler
  const logout = async (e) => {
    await ApiLogout();
    props?.setProfile(null);
    // setRedirect(true);
  };

  //...login Handler
  const login = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/login`);
  };

  const goToHome = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/`);
  };

  //...register Handler
  // const register = (e) => {
  //   window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/register`);
  // };

  //...Profile Handler
  const goToProfile = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/profile`);
  };

  //...Admin Handler
  const gotoAdmin = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/admin`);
  };

  //...Access-board Handler
  const accessBoard = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/access-gate`);
  };

   //...Drinks Access-board Handler
   const drinksAccessBoard = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/drinks-access-gate`);
  };

  const schedule = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/schedule`);
  };

  // if (redirect) {
  //   window.location.assign(ApiRoute.FRONTEND_DOMAIN);
  // }

  // get user profile
  // const {
  //   profile: [userProfile, setUserProfile],
  // } = useContext(Context);


  // const admin = userProfile?.user?.is_superuser 
 if (!userProfile) {
    return (
      <Navbar className="navbar-container">
        <Container>
          <Image
            src="/diageo.jpeg"
            style={{
              height: "70px",
              width: "70px",
              display: "block",
              borderRadius: "5px",
              cursor:"pointer"
            }}
            onClick={goToHome}
          />
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text className="ml-auto">
              <Button
                variant="outline-secondary"
                style={{ color: "black", margin: "5px" }}
                onClick={login}
              >
                Login
              </Button>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar className="navbar-container">
      <Container>
        <Image
          src="/diageo.jpeg"
          style={{
            height: "70px",
            width: "70px",
            display: "block",
            borderRadius: "5px",
          }}
        />
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className="ml-auto">
            <Button
              variant="outline-secondary"
              style={{ color: "black", margin: "5px" }}
              onClick={goToProfile}
            >
              Profile
            </Button>
            <Button
              variant="outline-secondary"
              style={{ color: "black", margin: "5px" }}
              onClick={logout}
            >
              Logout
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="outline-secondary"
                  style={{ color: "black", margin: "5px" }}
                  onClick={gotoAdmin}
                >
                  Admin
                </Button>
                <Button
                  variant="outline-secondary"
                  style={{ color: "black", margin: "5px" }}
                  onClick={accessBoard}
                >
                  Access Board
                </Button>
                <Button
                  variant="outline-secondary"
                  style={{ color: "black", margin: "5px" }}
                  onClick={drinksAccessBoard}
                >
                  Drinks Access Board
                </Button>
              </>
            )}
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}


export default PageNavbar;
