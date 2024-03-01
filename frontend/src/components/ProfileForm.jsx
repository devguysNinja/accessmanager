import React, { useState, useContext, useEffect, memo } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Context } from "../App";
import ApiRoute, { ApiLogout } from "../config/ApiSettings";

function ProfileForm(props) {
  const { auth_token } = useContext(Context);
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
      user: { first_name, last_name },
      department,
      meal_category,
      reader_uid,
    };
    try {
      const REQUEST_METHOD = userProfile?.user ? "PATCH" : "POST";
      const response = await fetch(PROFILE_URL, {
        method: REQUEST_METHOD,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth_token,
        },
        body: JSON.stringify(payLoad),
      });
      const content = await response.json();
      console.log("#####...PROFILE UPDATE CONTENT: ", content);
      if (content?.id) {
        localStorage.setItem("profile", JSON.stringify(content));
        console.log("Content:", content);
        setDisableAll(!disabledAll);
        setUserProfile(content);
      }
      if (content?.auth_error) {
        await ApiLogout();
      }
    } catch (error) {
      await ApiLogout();
    }
  };

  return (
  <Form onSubmit={submit} style={{ padding: '20px', borderRadius: '10px' }}>
  <Row className="mb-3">
    <Form.Group as={Col} controlId="formGridFirstName">
      <Form.Label>First Name</Form.Label>
      <Form.Control
        type="text"
        value={first_name}
        placeholder="First Name"
        disabled={!!disabledAll}
        onChange={(e) => setFirstName(e.target.value)}
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
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
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
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
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
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
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
      />
    </Form.Group>

    <Form.Group as={Col} controlId="formGridMealCategory">
      <Form.Label>Meal Category</Form.Label>
      <Form.Control
        type="number"
        value={meal_category}
        placeholder="Meal Category"
        disabled={disabledOne || disabledAll}
        onChange={(e) => setMealCategory(e.target.value)}
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
      />
    </Form.Group>

  </Row>

  <Button
    variant="light"
    type="submit"
    disabled={disabledAll ? true : false}
    style={{ color: 'black' }}
  >
    Submit
  </Button>

  <Form.Check
    type="switch"
    label="Edit profile"
    onstyle="outline-warning" offstyle="outline-info"
    id="disabled-custom-switch"
    onClick={editSwitch}
    style={{
      float: 'right',
      color: 'black',
    }}
  />
</Form>

  );
}

export default memo(ProfileForm);
