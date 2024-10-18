import React from "react";

interface PreviewSectionProps {
  title: string;
  text: string;
}

export function PreviewSection({title, text}: PreviewSectionProps) {
  return (
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="bg-gray-100 p-3 rounded">{text}</p>
    </div>
  );
}