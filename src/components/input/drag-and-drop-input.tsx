import { ChangeEventHandler, FC, useCallback, useState } from 'react';
import { FaFileUpload } from 'react-icons/fa';

interface DragAndDropInputProps {
  onChooseFile: ChangeEventHandler<HTMLInputElement>;
}

const DragAndDropInput: FC<DragAndDropInputProps> = ({ onChooseFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onChooseFile({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [onChooseFile]);

  return (
    <div
      className={`flex h-[230px] justify-center items-center border-2 border-dashed rounded-md p-4 transition-colors ${isDragging ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-white'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        onChange={onChooseFile}
        multiple
        id="fileInput"
        className="hidden"
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer text-blue-500 flex flex-col items-center gap-2"
      >
        <FaFileUpload size={48} />
        <span>Drag & Drop files here or click to upload</span>
      </label>
    </div>
  );
};

export default DragAndDropInput;