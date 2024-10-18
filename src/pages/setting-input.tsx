import React from "react";

interface SettingInputProps {
  label: string;
  type: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function SettingInput({label, type, value, onChange, min, max, step}: SettingInputProps) {
  return (
    <label className="flex flex-col">
      <span className="mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
      />
    </label>
  );
}