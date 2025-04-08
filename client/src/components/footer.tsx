import React from "react";

const Footer: React.FC = () => {
  return (
    <>
      <footer className="bg-slate-800 text-white py-16">
        <div className="container mx-auto flex flex-col items-center justify-center max-w-[1200px]">
          <p className="text-center text-sm md:text-base">
            © 2023 FoodForward. All rights reserved
          </p>
          <div className="flex mt-5 justify-center space-x-5 text-sm">
            <a href="#" className="hover:underline">
              Policy
            </a>
            <a href="#" className="hover:underline">
              Terms
            </a>
            <a href="#" className="hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
