import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ApiRoute, {ApiLogout} from "../config/ApiSettings";

function PageNavbar(props) {
  // const [redirect, setRedirect] = useState(false);

  //...logout Handler
  const logout = async (e) => {
    await ApiLogout()
    props?.setProfile(null);
    // setRedirect(true);
  };

  //...login Handler
  const login = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/login`);
  };

  //...register Handler
  const register = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/register`);
  };

  //...Access-board Handler
  const accessBoard = (e) => {
    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/access-gate`);
  };
    //...Access board Handler
    const profile = (e) => {
      window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/profile`);
    };

  // if (redirect) {
  //   window.location.assign(ApiRoute.FRONTEND_DOMAIN);
  // }
  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Meal Manager</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <ButtonGroup aria-label="Basic example" size="sm" className="mb-2">
            <Button variant="secondary" onClick={accessBoard}>
                Access Board
              </Button>
              <Button variant="secondary" onClick={profile}>
                Profile
              </Button>
              <Button variant="secondary" onClick={register}>
                Register
              </Button>
              <Button variant="secondary" onClick={login}>
                Login
              </Button>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </ButtonGroup>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default PageNavbar;
