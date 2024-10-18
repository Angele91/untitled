import React from "react";

interface SettingSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
}

export function SettingSelect({label, value, onChange, options}: SettingSelectProps) {
  return (
    <label className="flex flex-col">
      <span className="mb-1">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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