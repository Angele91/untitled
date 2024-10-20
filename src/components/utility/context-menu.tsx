import React, { useRef } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { IoIosPlay } from "react-icons/io";
import useDarkMode from "../../hooks/useDarkMode";
import { twMerge } from "tailwind-merge";

export const ContextMenu: React.FC<{
  x: number;
  y: number;
  onClose: () => void;
  onRequestReadingFromPoint: () => void;
}> = ({ x, y, onClose, onRequestReadingFromPoint }) => {
  const isDarkMode = useDarkMode();
  const ref = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(ref, onClose);

  return (
    <div
      ref={ref}
      className={twMerge(
        "bg-gray-50 border border-gray-200 rounded-sm shadow-md flex flex-col gap-2 transition-opacity",
        isDarkMode && "bg-gray-800 border-gray-600"
      )}
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 1000,
      }}
    >
      <button
        className={twMerge(
          "flex items-center gap-2 p-2 hover:bg-gray-100 transition-all",
          isDarkMode && "hover:bg-gray-700"
        )}
        onClick={() => onRequestReadingFromPoint()}
      >
        <IoIosPlay className={"w-4 h-4 text-green-500"} />
        <span className={"text-sm"}>Start Reading From Here</span>
      </button>
    </div>
  );
};
