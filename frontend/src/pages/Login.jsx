import React, { useState } from "react";
import CenterCardLayout from "../components/CenterCardLayout";
import LoginForm from "../components/LoginForm";

function Login(props) {
  return (
    <CenterCardLayout formTitle={"Login"}>
      <LoginForm />
    </CenterCardLayout>
  );
}

export default Login;
