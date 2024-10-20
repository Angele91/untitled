import React from "react";
import useDarkMode from "../hooks/useDarkMode";

interface SettingSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
}

export function SettingSelect({
  label,
  value,
  onChange,
  options,
}: SettingSelectProps) {
  const isDarkMode = useDarkMode();

  return (
    <label
      className={`flex flex-col ${isDarkMode ? "text-white" : "text-black"}`}
    >
      <span className="mb-1">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className={`form-select mt-1 block w-full rounded-md shadow-sm ${
          isDarkMode
            ? "bg-gray-800 border-gray-600"
            : "bg-white border-gray-300"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
