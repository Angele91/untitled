import React from "react";
import DarkModeToggle from "./reading/DarkModeToggle";

const MainHeader: React.FC = () => {
  return (
    <header className="px-4 h-16 flex items-center justify-between bg-gray-50 border-b shadow-sm">
      <h1 className="text-xl font-semibold">Untitled</h1>
      <DarkModeToggle />
    </header>
  );
};

export default MainHeader;
