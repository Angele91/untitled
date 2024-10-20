import React from "react";
import useDarkMode from "../hooks/useDarkMode";

interface SettingInputProps {
  label: string;
  type: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function SettingInput({
  label,
  type,
  value,
  onChange,
  min,
  max,
  step,
}: SettingInputProps) {
  const isDarkMode = useDarkMode();

  return (
    <label
      className={`flex flex-col ${isDarkMode ? "text-white" : "text-black"}`}
    >
      <span className="mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className={`form-input mt-1 block w-full rounded-md shadow-sm ${
          isDarkMode
            ? "bg-gray-800 border-gray-600"
            : "bg-white border-gray-300"
        }`}
      />
    </label>
  );
}
