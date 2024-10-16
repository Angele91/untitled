import React from "react";
import Checkbox from "../input/checkbox";

interface FastReadingFontSwitchProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const FastReadingFontSwitch: React.FC<FastReadingFontSwitchProps> = ({
  isEnabled,
  onToggle,
}) => {
  return (
    <div className="flex items-center">
      <div className="flex items-center cursor-pointer">
        <Checkbox isChecked={isEnabled} onToggle={onToggle} />
      </div>
    </div>
  );
};
