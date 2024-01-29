import React, { useState, useContext, useEffect, memo } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Context } from "../App";
import ApiRoute, { ApiLogout } from "../config/ApiSettings";

function ProfileForm(props) {
  const {
    profile: [userProfile, setUserProfile],
  } = useContext(Context);
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [reader_uid, setReaderUid] = useState("");
  const [department, setDeptartment] = useState("");
  const [meal_category, setMealCategory] = useState(1);
  const [disabledOne, setDisabledOne] = useState(true);
  const [disabledAll, setDisableAll] = useState(true);

  // useEffect(()=>{
  //   const profile = JSON.parse(localStorage.getItem("profile"));
  //   if (profile) {
  //     setUserProfile(profile);
  //   }
  // },[userProfile, setUserProfile])

  useEffect(() => {
    console.log("State Context @Profile Form:", userProfile);

    if (userProfile?.user) {
      setFirstName(userProfile?.user?.first_name);
      setLastName(userProfile?.user?.last_name);
      setDeptartment(userProfile?.department);
      setReaderUid(userProfile?.reader_uid);
      setMealCategory(userProfile?.meal_category);
    } else if (userProfile?.username) {
      setFirstName(userProfile?.first_name);
      setLastName(userProfile?.last_name);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile?.user?.is_superuser) {
      setDisabledOne(false);
    } else {
      setDisabledOne(true);
    }
  }, [disabledOne]);

  //...handles Switch Events
  const editSwitch = (e) => {
    setDisableAll(!disabledAll);
  };

  //...handles Form submission Events
  const submit = async (e) => {
    e.preventDefault();
    const PROFILE_URL = ApiRoute.PROFILE_URL;
    const payLoad = {
      first_name,
      last_name,
      department,
      meal_category,
      reader_uid,
    };
    try {
      const REQUEST_METHOD = userProfile?.user ? "PATCH" : "POST";
      const response = await fetch(PROFILE_URL, {
        method: REQUEST_METHOD,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payLoad),
      });
      const content = await response.json();
      if (content?.id) {
        localStorage.setItem("profile", JSON.stringify(content));
        console.log("Content:", content);
        setDisableAll(!disabledAll);
        setUserProfile(content);
      }
    } catch (error) {
      await ApiLogout();
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            value={first_name}
            placeholder="First Name"
            disabled={!!disabledAll}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} controlId="formGridLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            value={last_name}
            placeholder="Last Name"
            disabled={disabledAll ? true : false}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridDepartment">
          <Form.Label>Department</Form.Label>
          <Form.Control
            type="text"
            value={department}
            placeholder="Department"
            disabled={disabledAll ? true : false}
            onChange={(e) => setDeptartment(e.target.value)}
          />
        </Form.Group>

        <Form.Group as={Col} controlId="formReaderUid">
          <Form.Label>UID</Form.Label>
          <Form.Control
            type="text"
            value={reader_uid}
            placeholder="UID"
            disabled={disabledOne || disabledAll}
            onChange={(e) => setReaderUid(e.target.value)}
          />
        </Form.Group>

        {/* <Form.Group as={Col} controlId="formGridMealCategory">
          <Form.Label>Meal Category</Form.Label>
          <Form.Select
            // defaultValue={meal_category || "Choose..."}
            value={meal_category}
            disabled={disabledOne || disabledAll}
            onChange={(e) => setMealCategory(e.target.value)}
          >
            <option>Choose...</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </Form.Select>
        </Form.Group> */}

        <Form.Group as={Col} controlId="formGridMealCategory">
          <Form.Label>Meal Category</Form.Label>
          <Form.Control
            type="number"
            value={meal_category}
            placeholder="Meal Category"
            disabled={disabledOne || disabledAll}
            onChange={(e) => setMealCategory(e.target.value)}
          />
        </Form.Group>
        
      </Row>

      <Button
        variant="primary"
        type="submit"
        disabled={disabledAll ? true : false}
      >
        Submit
      </Button>

      <Form.Check // prettier-ignore
        // disabled={switchStatus}
        // value={switchStatus}
        type="switch"
        label="Edit profile"
        id="disabled-custom-switch"
        onClick={editSwitch}
        style={{
          float: "right",
        }}
      />
    </Form>
  );
}

export default memo(ProfileForm);
