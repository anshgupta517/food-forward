import React from "react";
import Navbar from "../components/navbar";
import Home1 from "../components/home1";
import Home2 from "../components/home2";
import Footer from "../components/footer";

const home: React.FC = () => {
  return (
    <>
      <Navbar />
      <Home1 />
      <Home2 />
      <Footer />
    </>
  );
};

export default home;
