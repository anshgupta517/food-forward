import React from "react";
const navbar: React.FC = () => {
  return (
    <div
      className="flex items-center justify-between px-5 bg-slate-800 h-20 w-full text-white absolute top-0 z-50 
    "
    >
      <div className="text-3xl font-bold text-white">FoodForward</div>
      <div className="flex items-center justify-center ">
        <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
          <a href="">Home</a>
        </div>
        <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
          <a href="">Login</a>
        </div>
        <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
          <a href="">Register</a>
        </div>
        <div className="px-5 py-2 hover:bg-slate-400 rounded-md">
          <a href="">Contact Us</a>
        </div>
      </div>
    </div>
  );
};

export default navbar;
