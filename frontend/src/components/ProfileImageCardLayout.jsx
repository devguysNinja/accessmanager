import React, { useEffect, useState, useContext } from "react";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ApiRoute from "../config/ApiSettings";
import { Context } from "../App";

export default function ProfileImageCardLayout() {
  const {
    profile: [userProfile, setUserProfile],
  } = useContext(Context);

  const [profilePix, setProfilePix] = useState("");
  const [profilePixValue, setProfilePixValue] = useState("");
  const [fileObject, setFileObject] = useState({});
  const [disable, setDisable] = useState(true);

  const BASE_URL = ApiRoute.API_DOMAIN;
  const AVATAR_URL = ApiRoute.AVATAR_URL;
  const IMAGE_PATH = userProfile?.profile_image;

  useEffect(() => {
    setProfilePix(`${BASE_URL}${IMAGE_PATH}`);
  }, [IMAGE_PATH]);

  const getFile = (e) => {
    e.preventDefault();
    setDisable(false);
    setProfilePixValue(e.target.value);
    setFileObject(e.target.files[0]);
    try {
      const fileObjUrl = URL.createObjectURL(e.target.files[0]);
      setProfilePix(fileObjUrl);
    } catch (error) {
      setProfilePix("");
    }
  };

  const uploadPix = async (e) => {
    e.preventDefault();
    setDisable(true);
    const fData = new FormData();
    fData.append("profile_image", fileObject);
    const response = await fetch(`${AVATAR_URL}`, {
      method: "PATCH",
      // headers: { "Content-Type": "multipart/form-data" },
      credentials: "include",
      body: fData,
    });
    const { profile_image } = await response.json();
    const new_profile = { ...userProfile, profile_image };
    localStorage.setItem("profile", JSON.stringify(new_profile));
    setProfilePix(`${BASE_URL}${profile_image}`);
  };

  return (
    <Card>
      <Image
        src={profilePix || "headmug.jpeg"}
        roundedCircle
        width={profilePix ? 170 : 150}
        height={profilePix ? 170 : 150}
        style={{ marginRight: "auto", marginLeft: "auto" }}
      />
      <Card.Body>
        <Card.Text>
          <em>Avatar</em>
        </Card.Text>
        <Form onSubmit={uploadPix}>
          <Form.Group controlId="formFileSm" className="mb-3">
            {/* <Form.Label>Avatar</Form.Label> */}
            <Form.Control
              type="file"
              size="sm"
              name="profile_image"
              onChange={getFile}
              value={profilePixValue}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            style={{
              width: "100%",
            }}
            disabled={disable}
            onClick={() => {
              setProfilePixValue("");
            }}
          >
            Upload
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
