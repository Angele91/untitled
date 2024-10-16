import React, {useState} from "react";
import {useAtom} from "jotai";
import {fastReadingPercentageAtom, wordGroupSizeAtom,} from "../../state/atoms";
import {SettingsButton} from "./settings-button.tsx";
import {WordGroup} from "./word-group.tsx";
import {ControlButtons} from "./control-buttons.tsx";
import {SettingsModal} from "./settings-modal.tsx";

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
  const [wordGroupSize, setWordGroupSize] = useAtom(wordGroupSizeAtom);
  const [fastReadingPercentage] = useAtom(fastReadingPercentageAtom);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <>
      <div className="transition-all fixed bottom-0 left-0 w-screen pt-2 pb-1 flex items-center justify-between flex-col bg-white border-t border-t-gray-50 shadow-md">
        <div className="w-full flex justify-between px-4 mb-2 h-full">
          <SettingsButton onClick={() => setIsSettingsModalOpen(true)} />

          <WordGroup
            currentWordGroup={currentWordGroup}
            fastReadingPercentage={fastReadingPercentage}
          />
          <div className="w-[76px]"></div>
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

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        wordGroupSize={wordGroupSize}
        setWordGroupSize={setWordGroupSize}
      />
    </>
  );
};

export default SequentialReadingBar;
