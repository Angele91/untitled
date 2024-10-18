import React from "react";
import {twMerge} from "tailwind-merge";
import useDarkMode from "../../hooks/useDarkMode.ts";

interface ButtonProps {
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({onClick, className, children}) => {
  const isDarkMode = useDarkMode();

  return (
    <button onClick={onClick} className={twMerge(
      "text-xs bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 flex items-center h-full",
      isDarkMode ? "text-gray-900 bg-gray-800 hover:bg-gray-700" : "text-gray-800",
      className,
    )}>
      {children}
    </button>
  );
};