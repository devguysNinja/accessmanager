import React, { useState, useContext, useEffect } from "react";
import { Redirect } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Context } from "../App";
import ApiRoute, {ApiLogout} from "../config/ApiSettings";

function LoginForm(props) {
  const {
    profile: [userProfile, setUserProfile],
  } = useContext(Context);
  const [email, setEmail] = useState("");
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
    const payLoad = {
      email,
      password,
    };
 try {
     const response = await fetch(LOGIN_URL, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       credentials: "include",
       body: JSON.stringify(payLoad),
     });
     const content = await response.json();
     //...Login is successful but will call getUser()
     if (content?.jwt?.length > 0) {
       await getUser();
     } else if (content?.password_error) {
       setError(content?.password_error);
     } else if (content?.invalid_user_error) {
       setError(content?.invalid_user_error);
     }
 } catch (error) {
  await ApiLogout();
 }
  };
  //...Get the logged-in user and set the profile object in LocalStorage
  const getUser = async () => {
    const PROFILE_URL = ApiRoute.AUTH_USER_URL;
    const response = await fetch(PROFILE_URL, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
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
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>

      <Button
        variant="primary"
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
