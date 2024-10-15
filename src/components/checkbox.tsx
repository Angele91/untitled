import React from 'react';

interface CheckboxProps {
  isChecked: boolean;
  onToggle: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({isChecked, onToggle}) => {
  return (
    <div className="relative" onClick={onToggle}>
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={onToggle}
      />
      <div className={`block w-10 h-6 rounded-full ${isChecked ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
      <div
        className={`dot absolute left-1 top-1 bg-white w-4 h-4 z-[99999] rounded-full transition-all ${isChecked ? 'transform translate-x-full' : ''}`}
      ></div>
    </div>
  );
};

export default Checkbox;