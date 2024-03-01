import React, { useState, useContext, useEffect } from "react";
import { Redirect } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Context } from "../App";
import ApiRoute, { ApiLogout } from "../config/ApiSettings";

function LoginForm(props) {
  const {
    profile: [userProfile, setUserProfile],
  } = useContext(Context);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState(null);

  //...fires after everytime userProfile and/or error changes
  useEffect(() => {
    if (userProfile) {
      setRedirect(true);
    }
    if (!userProfile) {
      setRedirect(false);
    }
  }, [userProfile, error]);

  const submit = async (e) => {
    e.preventDefault();
    const LOGIN_URL = ApiRoute.LOGIN_URL;
    console.log("LOGIN_URL...", LOGIN_URL);
    const payLoad = {
      username,
      password,
    };
    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payLoad),
      });
      const content = await response.json();
      //...Login is successful but will call getUser()
      if (content?.jwt?.length > 0) {
        localStorage.setItem("jwt", JSON.stringify(content.jwt));
        console.log("AUTH TOKEN", content);
        await getUser(content.jwt);
      } else if (content?.password_error) {
        setError(content?.password_error);
      } else if (content?.invalid_user_error) {
        setError(content?.invalid_user_error);
      }
    } catch (error) {
      console.log("Login ERROR...", error);
      // await ApiLogout();
    }
  };
  //...Get the logged-in user and set the profile object in LocalStorage
  const getUser = async (token) => {
    const PROFILE_URL = ApiRoute.AUTH_USER_URL;
    const response = await fetch(PROFILE_URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    console.log("#####...USER RESPONSE: ", response);
    const content = await response.json();
    if (content?.username || content?.user?.username) {
      localStorage.setItem("profile", JSON.stringify(content));
      setUserProfile(content);
    }
  };

  //...Effect redirect
  if (redirect) {
    return <Redirect to="/profile" />;
  }

  return (
    <Form onSubmit={submit}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter username"
          onChange={(e) => setUsername(e.target.value)}
        />
        {/* <Form.Text className="text-muted">
          We'll never share your data with anyone else.
        </Form.Text> */}
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Enter password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>

      <Button
        variant="warning"
        type="submit"
        style={{
          width: "100%",
        }}
      >
        Submit
      </Button>
      <div>
        <p>{error}</p>
      </div>
    </Form>
  );
}
export default LoginForm;
