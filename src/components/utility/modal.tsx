import React from "react";
import { IoIosClose } from "react-icons/io";
import {useDarkMode} from "usehooks-ts";
import {twMerge} from "tailwind-merge";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const isDarkMode = useDarkMode();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={twMerge(
        "bg-white rounded-lg p-6 w-96 max-w-full",
        isDarkMode ? "text-white" : "text-gray-800",
        isDarkMode ? "bg-gray-800" : "bg-white",
      )}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoIosClose size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
