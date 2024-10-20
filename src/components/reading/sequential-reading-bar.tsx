import React from "react";
import { useAtom } from "jotai";
import {
  fastReadingPercentageAtom,
} from "../../state/atoms";
import { WordGroup } from "./word-group.tsx";
import { ControlButtons } from "./control-buttons.tsx";
import useDarkMode from "../../hooks/useDarkMode";

const SequentialReadingBar: React.FC<{
  isPaused: boolean;
  onPlayPauseToggle: () => void;
  onGoBackwards: () => void;
  onGoAhead: () => void;
  startContinuousMovement: (direction: "forward" | "backward") => void;
  stopContinuousMovement: () => void;
  currentWordGroup: string;
}> = ({
  isPaused,
  onPlayPauseToggle,
  onGoBackwards,
  onGoAhead,
  startContinuousMovement,
  stopContinuousMovement,
  currentWordGroup,
}) => {
  const [fastReadingPercentage] = useAtom(fastReadingPercentageAtom);
  const isDarkMode = useDarkMode();

  return (
    <>
      <div
        className={`transition-all fixed bottom-0 left-0 w-full pt-2 pb-1 flex items-center justify-between flex-col ${
          isDarkMode
            ? "bg-gray-800 border-t-gray-700"
            : "bg-white border-t-gray-200"
        } border-t shadow-md z-10`}
      >
        <div className="w-full flex justify-center px-4 mb-2 h-full relative">
          <WordGroup
            currentWordGroup={currentWordGroup}
            fastReadingPercentage={fastReadingPercentage}
          />
        </div>

        <ControlButtons
          isPaused={isPaused}
          onPlayPauseToggle={onPlayPauseToggle}
          onGoBackwards={onGoBackwards}
          onGoAhead={onGoAhead}
          startContinuousMovement={startContinuousMovement}
          stopContinuousMovement={stopContinuousMovement}
        />
      </div>
    </>
  );
};

export default SequentialReadingBar;
