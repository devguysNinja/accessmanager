import { Redirect } from "react-router-dom";
import CenterCardLayout from "../components/CenterCardLayout";
import RegisterForm from "../components/RegisterForm";

function Register(props) {
  return (
    <CenterCardLayout formTitle={"Register"}>
      <RegisterForm />
    </CenterCardLayout>
  );
}

export default Register;
