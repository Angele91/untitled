import React from 'react';

interface FastReadingFontSwitchProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const FastReadingFontSwitch: React.FC<FastReadingFontSwitchProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center">
      <div className="flex items-center cursor-pointer">
        <div className="relative">
          <input type="checkbox" className="sr-only" checked={isEnabled} onChange={onToggle} />
          <div className={`block w-10 h-6 rounded-full ${isEnabled ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 z-[99999] rounded-full transition-all ${isEnabled ? 'transform translate-x-full' : ''}`}></div>
        </div>
      </div>
    </div>
  );
};
