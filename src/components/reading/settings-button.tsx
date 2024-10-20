import { IoIosSettings } from "react-icons/io";

import { Button } from "../control/button.tsx";
import { twMerge } from "tailwind-merge";
import useDarkMode from "../../hooks/useDarkMode.ts";

export const SettingsButton = ({ onClick }: { onClick: () => void }) => {
  const isDarkMode = useDarkMode();

  return (
    <Button
      onClick={onClick}
      className={twMerge(
        "flex flex-col gap-4 justify-center items-center rounded-full w-10 h-10"
      )}
    >
      <IoIosSettings
        size={24}
        className={twMerge("text-gray-800", isDarkMode ? "text-gray-200" : "")}
      />
    </Button>
  );
};
