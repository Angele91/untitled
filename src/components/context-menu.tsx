import React, {useRef} from "react";
import {useOnClickOutside} from "usehooks-ts";
import {IoIosPlay} from "react-icons/io";

export const ContextMenu: React.FC<{
  x: number;
  y: number;
  onClose: () => void;
  onRequestReadingFromPoint: () => void;
}> = ({x, y, onClose, onRequestReadingFromPoint}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(ref, onClose);

  return (
    <div
      ref={ref}
      className={"bg-gray-50 border border-gray-200 rounded-sm shadow-md flex flex-col gap-2 transition-opacity"}
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 1000
      }}
    >
      <button
        className={"flex items-center gap-2 p-2 hover:bg-gray-100 transition-all"}
        onClick={() => onRequestReadingFromPoint()}
      >
        <IoIosPlay className={"w-4 h-4 text-green-500"}/>
        <span className={"text-sm"}>
          Start Reading From Here
        </span>
      </button>
    </div>
  );
};