import React from "react";
import {FaA} from "react-icons/fa6";
import {FaFont} from "react-icons/fa";

export const FontSizeSelector: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  currentSize: string;
  onSizeChange: (size: string) => void
}> = ({isOpen, onToggle, currentSize, onSizeChange}) => {
  const fontSizes = [
    {name: 'XS', value: '16px', icon: <FaA size={10}/>},
    {name: 'S', value: '20px', icon: <FaA size={12}/>},
    {name: 'M', value: '24px', icon: <FaA size={14}/>},
    {name: 'L', value: '28px', icon: <FaA size={16}/>},
    {name: 'XL', value: '32px', icon: <FaA size={18}/>},
  ];

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Change font size"
      >
        <FaFont/>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
          {fontSizes.map((size) => (
            <button
              key={size.name}
              onClick={() => {
                onSizeChange(size.value);
                onToggle();
              }}
              className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-gray-100 ${
                currentSize === size.value ? 'bg-gray-200' : ''
              }`}
            >
              <span>{size.name}</span>
              {size.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};