import React, { useRef, useState, useCallback, useMemo, FC } from "react";
import BookDetailHeader from "../components/book/book-detail-header.tsx";
import { twMerge } from "tailwind-merge";
import { useSequentialReading } from "../hooks/use-sequential-reading.ts";
import { useWordHighlight } from "../hooks/use-word-highlight.ts";
import { useMarkdownRenderer } from "../hooks/use-markdown-renderer.tsx";
import SequentialReadingBar from "../components/reading/sequential-reading-bar.tsx";
import { ContextMenu } from "../components/utility/context-menu.tsx";
import { useAtomValue } from "jotai";
import { wordGroupSizeAtom } from "../state/atoms.ts";
import useEyeSaverMode from "../hooks/useEyeSaverMode.ts";
import useDarkMode from "../hooks/useDarkMode.ts";
import { useNavigate } from "react-router-dom";
import { useSelectedBook } from "../hooks/use-selected-book.ts";

const BookDetail: FC = () => {
  const navigate = useNavigate();

  const selectedBook = useSelectedBook();

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

  const onBack = () => {
    setSelectedWordIndex(null);
    navigate("/");
  };

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

  const renderedChapters = useMemo(() => {
    return memoizedChapters.map((chapter, index) => (
      <React.Fragment key={`chapter-${index}`}>
        {React.cloneElement(chapter, {
          onContextMenu: handleContextMenu,
          onTouchStart: handleContextMenu,
        } as any)}
      </React.Fragment>
    ));
  }, [memoizedChapters, handleContextMenu]);

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

  const barColor = "red";

  if (!selectedBook) {
    return null;
  }

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
              coords && (
                <div
                  key={index}
                  className="absolute transition-all duration-100"
                  id={`untitled-highlight-${index}`}
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
          {renderedChapters}
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
