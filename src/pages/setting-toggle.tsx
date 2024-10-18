import React from "react";

interface SettingToggleProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SettingToggle({label, checked, onChange}: SettingToggleProps) {
  return (
    <label className="flex items-center justify-between">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-5 w-5 text-blue-600"
      />
    </label>
  );
}