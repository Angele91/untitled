import React, {useState} from "react";
import DarkModeToggle from "./reading/DarkModeToggle";
import useDarkMode from "../hooks/useDarkMode.ts";
import {twMerge} from "tailwind-merge";
import {SettingsModal} from "./reading/settings-modal.tsx";
import {useAtom} from "jotai";
import {wordGroupSizeAtom} from "../state/atoms.ts";
import {SettingsButton} from "./reading/settings-button.tsx";

const MainHeader: React.FC = () => {
  const isDarkMode = useDarkMode();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [wordGroupSize, setWordGroupSize] = useAtom(wordGroupSizeAtom);

  const onCloseSettings = () => {
    setIsSettingsOpen(false);
  }

  return (
    <header className={twMerge(
      "px-4 h-16 flex items-center justify-between bg-gray-50 border-b shadow-sm",
      isDarkMode && "bg-gray-800 text-gray-200"
    )}>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        wordGroupSize={wordGroupSize}
        setWordGroupSize={setWordGroupSize}
      />
      <h1 className="text-xl font-semibold">Untitled</h1>
      <div
        className={twMerge(
          "flex gap-4 items-center",
        )}
      >
        <DarkModeToggle />
        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
      </div>
    </header>
  );
};

export default MainHeader;
