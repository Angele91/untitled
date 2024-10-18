import React from "react";
import useDarkMode from "../hooks/useDarkMode.ts";
import {twMerge} from "tailwind-merge";
import {SettingsButton} from "./reading/settings-button.tsx";
import {useNavigate} from "react-router-dom";

const MainHeader: React.FC = () => {
  const isDarkMode = useDarkMode();
  const navigate = useNavigate();

  return (
    <header className={twMerge(
      "px-4 h-16 flex items-center justify-between bg-gray-50 border-b shadow-sm",
      isDarkMode && "bg-gray-800 text-gray-200"
    )}>
      <h1 className="text-xl font-semibold">Untitled</h1>
      <div
        className={twMerge(
          "flex gap-4 items-center",
        )}
      >
        <SettingsButton
          onClick={() => {
            navigate("/settings");
          }}
        />
      </div>
    </header>
  );
};

export default MainHeader;
