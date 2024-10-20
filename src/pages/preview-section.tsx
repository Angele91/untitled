interface PreviewSectionProps {
  title: string;
  text: string;
}

export function PreviewSection({ title, text }: PreviewSectionProps) {
  return (
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="p-3 rounded">{text}</p>
    </div>
  );
}
