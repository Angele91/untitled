import {
  IoIosFastforward,
  IoIosPause,
  IoIosPlay,
  IoIosRewind,
} from "react-icons/io";
import { twMerge } from "tailwind-merge";

const SequentialReadingBar = ({
  isPaused,
  onPlayPauseToggle,
  onGoBackwards,
  onGoAhead,
}: {
  isPaused: boolean;
  onPlayPauseToggle: () => void;
  onGoBackwards: () => void;
  onGoAhead: () => void;
}) => {
  return (
    <div
      className={
        "transition-all fixed bottom-0 left-0 w-screen pt-2 pb-1 flex items-center justify-center flex-col bg-white border-t border-t-gray-50 shadow-md"
      }
    >
      <div className={"flex items-center gap-4"}>
        <button
          className={
            "w-14 h-14 duration-100 rounded-full pr-0.5 hover:bg-gray-200 border border-gray-100 flex items-center justify-center transition-all"
          }
          onClick={onGoBackwards}
        >
          <IoIosRewind className={"w-8 h-8"} />
        </button>
        <button
          className={twMerge(
            "w-14 h-14 rounded-full hover:bg-gray-200 border flex items-center justify-center",
            isPaused
              ? "border-blue-500"
              : "border-green-500 animate-pulse pl-1.5"
          )}
          onClick={onPlayPauseToggle}
        >
          {isPaused ? (
            <IoIosPlay className={"w-8 h-8 text-blue-500"} />
          ) : (
            <IoIosPause className={"w-8 h-8 text-green-500"} />
          )}
        </button>
        <button
          className={
            "w-14 h-14 rounded-full pl-1.5 hover:bg-gray-200 border border-gray-100 flex items-center justify-center"
          }
          onClick={onGoAhead}
        >
          <IoIosFastforward className={"w-8 h-8"} />
        </button>
      </div>
      <div>
        <span
          className={twMerge(
            "text-xs font-semibold",
            isPaused ? "text-blue-500" : "text-green-500"
          )}
        >
          {isPaused ? "Paused" : "Reading"}
        </span>
      </div>
    </div>
  );
};

export default SequentialReadingBar;
