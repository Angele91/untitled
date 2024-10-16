import React, { useRef, useState, useCallback } from "react";
import BookDetailHeader from "./book-detail-header.tsx";
import { twMerge } from "tailwind-merge";
import { useSequentialReading } from "../../hooks/use-sequential-reading.ts";
import { useWordHighlight } from "../../hooks/use-word-highlight.ts";
import { useMarkdownRenderer } from "../../hooks/use-markdown-renderer.tsx";
import SequentialReadingBar from "../reading/sequential-reading-bar.tsx";
import { ContextMenu } from "../utility/context-menu.tsx";
import { useAtomValue } from "jotai";
import { selectedBookAtom, wordGroupSizeAtom } from "../../state/atoms.ts";
import useEyeSaverMode from "../../hooks/useEyeSaverMode";
import useDarkMode from "../../hooks/useDarkMode";

interface BookDetailProps {
  onBack: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ onBack }) => {
  const selectedBook = useAtomValue(selectedBookAtom);
  const wordGroupSize = useAtomValue(wordGroupSizeAtom);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(
    null
  );
  const eyeSaverMode = useEyeSaverMode();
  const darkMode = useDarkMode();

  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const contentRef = useRef<HTMLDivElement | null>(null);

  const {
    focusedWordIndex,
    sequentialReadingEnabled,
    startReadingFrom,
    togglePlaying,
    isPlaying,
    goAhead,
    goBackwards,
    startContinuousMovement,
    stopContinuousMovement,
    getCurrentWordGroup,
  } = useSequentialReading();

  const { focusedWordsCoords } = useWordHighlight({
    contentRef,
    focusedWordIndex,
  });

  const handleContextMenu = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent,
      word: string,
      wordIndex: number
    ) => {
      event.preventDefault();
      const { clientX, clientY } =
        "touches" in event ? event.touches[0] : event;
      setContextMenuPosition({ x: clientX, y: clientY });
      setSelectedWordIndex(wordIndex);
    },
    []
  );

  const { memoizedChapters } = useMarkdownRenderer({
    onWordRightClick: handleContextMenu,
    onWordLongPress: handleContextMenu,
  });

  const onRequestReadingFromPoint = (wordIndex: number) => {
    startReadingFrom(wordIndex);
    setContextMenuPosition({ x: 0, y: 0 });
    setSelectedWordIndex(null);
  };

  const onCloseContextMenu = () => {
    setSelectedWordIndex(null);
    setContextMenuPosition({ x: 0, y: 0 });
  };

  const currentWordGroup = getCurrentWordGroup(wordGroupSize);

  return (
    <div
      className={twMerge(
        "w-screen h-screen overflow-y-auto overflow-x-hidden relative flex flex-col",
        darkMode ? "dark-mode" : "",
        eyeSaverMode ? "eye-saver-mode" : ""
      )}
    >
      <BookDetailHeader title={selectedBook!.title} onBack={onBack} />

      <div className="flex-grow overflow-y-auto pb-24">
        {sequentialReadingEnabled &&
          focusedWordsCoords.map(
            (coords, index) =>
              coords && (
                <div
                  key={index}
                  className={"absolute transition-all duration-100"}
                  style={{
                    top: coords.top,
                    left: coords.left - 4,
                    width: coords.width + 8,
                    height: coords.height + 4,
                    borderBottom: "4px solid #f6e05e",
                  }}
                />
              )
          )}

        {selectedWordIndex !== null && (
          <ContextMenu
            x={contextMenuPosition.x}
            y={contextMenuPosition.y}
            onClose={onCloseContextMenu}
            onRequestReadingFromPoint={() => {
              onRequestReadingFromPoint(selectedWordIndex!);
            }}
          />
        )}

        <main
          className="p-8 flex flex-col gap-8"
          ref={contentRef}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {memoizedChapters}
        </main>
      </div>

      {sequentialReadingEnabled && (
        <SequentialReadingBar
          isPaused={!isPlaying}
          onPlayPauseToggle={togglePlaying}
          onGoAhead={goAhead}
          onGoBackwards={goBackwards}
          startContinuousMovement={startContinuousMovement}
          stopContinuousMovement={stopContinuousMovement}
          currentWordGroup={currentWordGroup}
        />
      )}
    </div>
  );
};

export default React.memo(BookDetail);
