import React from "react";
import IMG from "../assets/FoodForward (2).png";

const home1: React.FC = () => {
  return (
    <>
      <div className="h-screen flex items-center justify-center bg-hero">
        <div className=" flex items-center justify-center h-1/2 w-2/3 bg-transparent backdrop-blur-sm rounded-lg border-2 border-white  font-bold text-center ">
          <img src={IMG} alt="" />
        </div>
      </div>
    </>
  );
};

export default home1;
