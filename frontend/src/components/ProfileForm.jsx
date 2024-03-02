import React, { useState, useContext, useEffect, memo } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Context } from "../App";
import ApiRoute, { ApiLogout } from "../config/ApiSettings";

function ProfileForm(props) {
  const { auth_token , choice_fields} = useContext(Context);
  console.log("@@choice_fields",choice_fields)
  const {
    profile: [userProfile, setUserProfile],
  } = useContext(Context);
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [reader_uid, setReaderUid] = useState("");
  const [dept, setDept] = useState("");
  const [middle_name, setMiddleName] = useState("")
  const [staff_id, setStaffId] = useState("");
  const [staff_catg, setStaff_Catg] = useState("")
  const [staff_status, setStaffStatus] = useState("")
  const [privilege, setPrivilege] = useState(1);
  const [disabledOne, setDisabledOne] = useState(true);
  const [disabledAll, setDisableAll] = useState(true);
  const [staff_loc, setStaff_Loc] = useState("");
  const [gender, setGender] = useState("")

  // useEffect(()=>{
  //   const profile = JSON.parse(localStorage.getItem("profile"));
  //   if (profile) {
  //     setUserProfile(profile);
  //   }
  // },[userProfile, setUserProfile])

  const {location, department, emp_status,category } = choice_fields || {}


  useEffect(() => {
    console.log("State Context @Profile Form:", userProfile);

    if (userProfile?.user) {
      setFirstName(userProfile?.user?.first_name);
      setLastName(userProfile?.user?.last_name);
      setDept(userProfile?.department);
      setReaderUid(userProfile?.reader_uid);
      setPrivilege(userProfile?.privilege);
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
      user: { id:userProfile.id,first_name,middle_name, last_name },
      dept,
      privilege,
      reader_uid,
      staff_loc,
      gender,
      staff_catg,
      staff_id,
      staff_status,

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
  <Form onSubmit={submit} style={{ padding: '20px', borderRadius: '10px', }}>
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

    <Form.Group as={Col} controlId="formGridFirstName">
      <Form.Label>Middle Name</Form.Label>
      <Form.Control
        type="text"
        value={middle_name}
        placeholder="Middle Name"
        disabled={!!disabledAll}
        onChange={(e) => setMiddleName(e.target.value)}
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
      <Form.Label>Staff Status</Form.Label>
      <Form.Select
        type="text"
        value={staff_status}
        placeholder="Staff Status"
        disabled={disabledAll ? true : false}
        onChange={(e) => setStaffStatus(e.target.value)}
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
      >
        {emp_status?.map((empStatus) => (
          <option value={empStatus.id} key={empStatus.id}>{empStatus.status}</option>
        ))}
        
       
      </Form.Select>
    </Form.Group>

    <Form.Group as={Col} controlId="formReaderUid">
      <Form.Label>Card Code</Form.Label>
      <Form.Control
        type="text"
        value={reader_uid}
        placeholder="Card Code"
        disabled={disabledAll ? true : false}
        onChange={(e) => setReaderUid(e.target.value)}
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
      />
    </Form.Group>

    <Form.Group as={Col} controlId="formGridMealCategory">
      <Form.Label>Privilege</Form.Label>
      <Form.Control
        type="number"
        value={privilege}
        placeholder="Privilege"
        disabled={disabledOne || disabledAll}
        onChange={(e) => setPrivilege(e.target.value)}
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
      />
    </Form.Group>

  </Row>

  <Row className="mb-3">
    <Form.Group as={Col} controlId="formGridDepartment">
      <Form.Label>Department</Form.Label>
      <Form.Select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            disabled={disabledAll ? true : false}
            style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
          >
            {department?.map((staffDept) => (
              <option value={staffDept.id} key={staffDept.id}>{staffDept.dept_name}</option>
            ))}
            
           
          </Form.Select>
    </Form.Group>

    <Form.Group as={Col} controlId="formReaderUid">
      <Form.Label>Category</Form.Label>
      <Form.Select
        type="text"
        value={staff_catg}
        placeholder="Category"
        disabled={disabledAll ? true : false}
        onChange={(e) => setStaff_Catg(e.target.value)}
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
      > 
      {category?.map((staffCategory) => (
        <option value={staffCategory.id} key={staffCategory.id}>{staffCategory.cat_name}</option>
      ))}
      </Form.Select>
    </Form.Group>

    <Form.Group as={Col} controlId="formGridMealCategory">
      <Form.Label>Staff ID</Form.Label>
      <Form.Control
        type="text"
        value={staff_id}
        placeholder="Staff ID"
        disabled={disabledAll ? true : false}
        onChange={(e) => setStaffId(e.target.value)}
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
      />
    </Form.Group>

  </Row>
  {/* kk */}
  
  <Row className="mb-3">
    <Form.Group as={Col} controlId="formGridDepartment">
      <Form.Label>Location</Form.Label>
      <Form.Select
        type="text"
        value={staff_loc}
        placeholder="Location"
        disabled={disabledAll ? true : false}
        onChange={(e) => setStaff_Loc(e.target.value)}
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
      >
        {location?.map((staffLocation) => (
          <option value={staffLocation.id} key={staffLocation.id}>{staffLocation.name}</option>
        ))}
      </Form.Select>
    </Form.Group>

    <Form.Group as={Col} controlId="formReaderUid">
      <Form.Label>Gender</Form.Label>
      <Form.Select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={disabledAll ? true : false}
            style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Form.Select>
    </Form.Group>

    {/* <Form.Group as={Col} controlId="formGridMealCategory">
      <Form.Label>Staff ID</Form.Label>
      <Form.Control
        type="text"
        value={staff_id}
        placeholder="Staff ID"
        disabled={disabledOne || disabledAll}
        onChange={(e) => setStaffId(e.target.value)}
        style={{ backgroundColor: 'transparent', color: 'black', border: 'none', borderBottom: '1px solid black' }}
      />
    </Form.Group> */}

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
