import React from "react";
import TextReveal from "@/components/magicui/text-reveal";
import BoxReveal from "@/components/magicui/box-reveal";
import { useTheme } from "next-themes";
import { MagicCard } from "@/components/magicui/magic-card";

const home2: React.FC = () => {
  const { theme } = useTheme();
  return (
    <>
      {/**scroll */}
      <div className="z-10 flex min-h-[10rem] items-center justify-center rounded-lg  bg-white dark:bg-black">
        <TextReveal text="Lets save food and utilise it to its best." />
      </div>
      {/**objective */}
      <div className="h-1/2 w-screen flex items-center justify-center ">
        <div className="h-auto w-full max-w-[52rem] items-center justify-center overflow-hidden pt-8">
          <BoxReveal boxColor={"#5046e6"} duration={0.5}>
            <p className="text-[4.5rem] font-semibold">
              Our Objective<span className="text-[#5046e6]">.</span>
            </p>
          </BoxReveal>

          <BoxReveal boxColor={"#5046e6"} duration={0.5}>
            <p className="text-2xl">
              Our project aims to address the issue of food wastage in
              restaurants by creating a web application that facilitates the
              sharing and redistribution of surplus food. Restaurants often have
              excess food at the end of the day that goes to waste. Our platform
              allows restaurants to register and list their surplus food
              donations. Organizations dedicated to food redistribution are
              notified to collect and distribute the surplus food, reducing
              wastage and helping those in need
              <span className="text-[#5046e6]">.</span>
            </p>
          </BoxReveal>
        </div>
      </div>
      {/**cards */}
      <div className="h-screen w-screen flex items-center justify-center ">
        <div
          className={
            "flex h-[500px] w-full flex-col items-center justify-center gap-10 lg:h-[250px] lg:flex-row"
          }
        >
          <MagicCard
            className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
          >
            We are a restaurant
          </MagicCard>
          <MagicCard
            className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
          >
            We are an organisation
          </MagicCard>
        </div>
      </div>
    </>
  );
};

export default home2;
