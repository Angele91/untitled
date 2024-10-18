import {ChangeEventHandler, FC, useCallback, useState, DragEvent, ChangeEvent} from 'react';
import { FaFileUpload } from 'react-icons/fa';
import {twMerge} from "tailwind-merge";
import useDarkMode from "../../hooks/useDarkMode.ts";

interface DragAndDropInputProps {
  onChooseFile: ChangeEventHandler<HTMLInputElement>;
}

const DragAndDropInput: FC<DragAndDropInputProps> = ({ onChooseFile }) => {
  const isDarkMode = useDarkMode();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onChooseFile({ target: { files: e.dataTransfer.files } } as ChangeEvent<HTMLInputElement>);
    }
  }, [onChooseFile]);

  return (
    <div
      className={twMerge(
        `flex h-[230px] justify-center items-center border-2 border-dashed rounded-md p-4 transition-colors`,
        isDarkMode ? 'border-gray-600 bg-gray-800' : '',
        isDragging ? isDarkMode ? 'border-blue-500' : 'border-blue-400' : isDarkMode ? 'border-gray-600' : 'border-gray-400'
      )}
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