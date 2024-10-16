import { ChangeEventHandler, FC } from 'react';
import { FaFileUpload } from 'react-icons/fa';

interface FileInputProps {
  onChooseFile: ChangeEventHandler<HTMLInputElement>;
}

const FileInput: FC<FileInputProps> = ({ onChooseFile }) => {
  return (
    <div className="flex justify-center items-center">
      <input
        type="file"
        onChange={onChooseFile}
        multiple
        id="fileInput"
        className="hidden"
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <FaFileUpload />
        Choose Files
      </label>
    </div>
  );
};

export default FileInput;