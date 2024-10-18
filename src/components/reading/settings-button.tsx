import {IoIosSettings} from "react-icons/io";

import React from "react";
import {Button} from "../control/button.tsx";
import {twMerge} from "tailwind-merge";

export const SettingsButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      onClick={onClick}
      className={twMerge(
        "flex flex-col gap-4 justify-center items-center rounded-full w-10 h-10",
      )}
    >
      <IoIosSettings size={24}/>
    </Button>
  );
};
