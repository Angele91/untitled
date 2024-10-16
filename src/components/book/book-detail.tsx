import React, { useRef, useState, useCallback, useEffect } from "react";
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
  const [scrollTop, setScrollTop] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setScrollTop(contentRef.current!.scrollTop);
        setContentHeight(contentRef.current!.clientHeight);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial call to set initial values
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleContextMenu = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent,
      _word: string,
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

  const isHighlightVisible = (top: number) => {
    return top >= scrollTop && top <= scrollTop + contentHeight;
  };

  const barColor = "red";

  return (
    <div
      className={twMerge(
        "w-screen h-screen overflow-hidden relative flex flex-col",
        darkMode ? "dark-mode" : "",
        eyeSaverMode ? "eye-saver-mode" : ""
      )}
    >
      <BookDetailHeader title={selectedBook!.title} onBack={onBack} />
      <div
        className="flex-grow overflow-y-auto pb-24 relative"
        ref={contentRef}
      >
        {sequentialReadingEnabled &&
          focusedWordsCoords.map(
            (coords, index) =>
              coords &&
              isHighlightVisible(coords.top) && (
                <div
                  key={index}
                  className="absolute transition-all duration-100"
                  style={{
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                    height: coords.height,
                    borderBottom: `2px solid ${barColor}`,
                    pointerEvents: "none",
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
