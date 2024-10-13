import React from "react";
import { FaAlignCenter } from "react-icons/fa";

export type ScrollBlockOption = "start" | "center" | "end" | "nearest";

export const ScrollBlockSelector: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  currentBlock: ScrollBlockOption;
  onBlockChange: (block: ScrollBlockOption) => void
}> = ({isOpen, onToggle, currentBlock, onBlockChange}) => {
  const blockOptions: { name: string; value: ScrollBlockOption }[] = [
    { name: "Start", value: "start" },
    { name: "Center", value: "center" },
    { name: "End", value: "end" },
    { name: "Nearest", value: "nearest" },
  ];

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Change scroll block option"
      >
        <FaAlignCenter/>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-10">
          {blockOptions.map((option) => (
            <button
              key={option.value}
              onClick={(event) => {
                event.stopPropagation();
                onBlockChange(option.value);
                onToggle();
              }}
              className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-gray-100 ${
                currentBlock === option.value ? 'bg-gray-200' : ''
              }`}
            >
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
