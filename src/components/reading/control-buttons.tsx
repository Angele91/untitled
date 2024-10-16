import {IoIosFastforward, IoIosPause, IoIosPlay, IoIosRewind} from "react-icons/io";
import {twMerge} from "tailwind-merge";
import React from "react";

export const ControlButtons = ({
                                 isPaused,
                                 onPlayPauseToggle,
                                 onGoBackwards,
                                 onGoAhead,
                                 startContinuousMovement,
                                 stopContinuousMovement,
                               }: {
  isPaused: boolean;
  onPlayPauseToggle: () => void;
  onGoBackwards: () => void;
  onGoAhead: () => void;
  startContinuousMovement: (direction: "forward" | "backward") => void;
  stopContinuousMovement: () => void;
}) => (
  <>
    <div className={"flex items-center gap-4 mb-2"}>
      <button
        className="w-14 h-14 duration-100 rounded-full pr-0.5 hover:bg-gray-200 border border-gray-100 flex items-center justify-center transition-all"
        onClick={onGoBackwards}
        onMouseDown={() => startContinuousMovement("backward")}
        onMouseUp={stopContinuousMovement}
        onMouseLeave={stopContinuousMovement}
      >
        <IoIosRewind className={"w-8 h-8"}/>
      </button>
      <button
        className={twMerge(
          "w-14 h-14 rounded-full hover:bg-gray-200 border flex items-center justify-center",
          isPaused
            ? "border-blue-500 pl-1"
            : "border-green-500 animate-pulse"
        )}
        onClick={onPlayPauseToggle}
      >
        {isPaused ? (
          <IoIosPlay className={"w-8 h-8 text-blue-500"}/>
        ) : (
          <IoIosPause className={"w-8 h-8 text-green-500"}/>
        )}
      </button>
      <button
        className="w-14 h-14 rounded-full pl-1.5 hover:bg-gray-200 border border-gray-100 flex items-center justify-center"
        onClick={onGoAhead}
        onMouseDown={() => startContinuousMovement("forward")}
        onMouseUp={stopContinuousMovement}
        onMouseLeave={stopContinuousMovement}
      >
        <IoIosFastforward className={"w-8 h-8"}/>
      </button>
    </div>
    <span
      className={twMerge(
        "text-xs font-semibold",
        isPaused ? "text-blue-500" : "text-green-500"
      )}
    >
      {isPaused ? "Paused" : "Reading"}
    </span>
  </>
);