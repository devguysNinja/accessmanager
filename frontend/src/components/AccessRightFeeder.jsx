import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import ApiRoute, { ApiLogout, Capitalize } from "../config/ApiSettings";
import { Context } from "../App";

export default function AccessRightFeeder({ userData }) {
  const BASE_URL = ApiRoute.API_DOMAIN;
  const { avatar } = userData || "";
  const srcUrl = avatar ? `${BASE_URL}${avatar}` : "";
  return (
    <Card style={{ height: "172px"}} >
      <Image
        src={srcUrl || "headmug.jpeg"}
        roundedCircle
        width={avatar ? 170 : 150}
        height={avatar ? 170 : 150}
        style={{ marginRight: "auto", marginLeft: "auto" }}
      />
    </Card>
  );
}
