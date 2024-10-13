import React from "react";
import { FaGauge } from "react-icons/fa6";

export const PaceSelector: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  currentPace: number;
  onPaceChange: (pace: number) => void
}> = ({isOpen, onToggle, currentPace, onPaceChange}) => {
  const paceSpeeds = [
    {name: 'Very Slow', value: 500, icon: <FaGauge size={10}/>},
    {name: 'Slow', value: 300, icon: <FaGauge size={12}/>},
    {name: 'Normal', value: 200, icon: <FaGauge size={14}/>},
    {name: 'Fast', value: 125, icon: <FaGauge size={16}/>},
    {name: 'Very Fast', value: 100, icon: <FaGauge size={18}/>},
  ];

  const msToWpm = (ms: number) => Math.round(60000 / ms);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Change reading pace"
      >
        <FaGauge/>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          {paceSpeeds.map((pace) => (
            <button
              key={pace.name}
              onClick={() => {
                onPaceChange(pace.value);
                onToggle();
              }}
              className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-gray-100 ${
                currentPace === pace.value ? 'bg-gray-200' : ''
              }`}
            >
              <span>{pace.name}</span>
              <div className="flex items-center">
                <span className="mr-2">{msToWpm(pace.value)} wpm</span>
                {pace.icon}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
