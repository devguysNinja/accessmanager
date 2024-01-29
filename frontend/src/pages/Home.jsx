import React, { useState, useEffect } from "react";
import CenterCardLayout from "../components/CenterCardLayout";
import HomeLinks from "../components/HomeLinks";

const Home = (props) => {
  return (
    <CenterCardLayout>
      <HomeLinks />
    </CenterCardLayout>
  );
};

export default Home;
