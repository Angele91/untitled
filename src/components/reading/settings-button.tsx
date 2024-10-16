import {IoIosSettings} from "react-icons/io";
import React from "react";

export const SettingsButton = ({onClick}: {
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="text-xs bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 flex items-center h-full"
  >
    <IoIosSettings className="mr-1"/> Settings
  </button>
);