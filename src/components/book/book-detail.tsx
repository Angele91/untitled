import React, { useRef, useState } from "react";
import BookDetailHeader from "./book-detail-header.tsx";
import { twMerge } from "tailwind-merge";
import { useSequentialReading } from "../../hooks/use-sequential-reading.ts";
import { useWordHighlight } from "../../hooks/use-word-highlight.ts";
import { useMarkdownRenderer } from "../../hooks/use-markdown-renderer.tsx";
import SequentialReadingBar from "../reading/sequential-reading-bar.tsx";
import { ContextMenu } from "../utility/context-menu.tsx";
import { useAtomValue } from "jotai";
import { selectedBookAtom } from "../../state/atoms.ts";

interface BookDetailProps {
  onBack: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ onBack }) => {
  const selectedBook = useAtomValue(selectedBookAtom);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(
    null
  );

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
  } = useSequentialReading();

  const { focusedWordCoords } = useWordHighlight({
    contentRef,
    focusedWordIndex,
  });

  const { memoizedChapters } = useMarkdownRenderer({
    onWordRightClick: (event, _, wordIndex) => {
      event.preventDefault();
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
      setSelectedWordIndex(wordIndex);
    },
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

  return (
    <div
      className={twMerge(
        "w-screen h-screen overflow-y-auto overflow-x-hidden relative"
      )}
    >
      <BookDetailHeader title={selectedBook!.title} onBack={onBack} />

      {sequentialReadingEnabled && (
        <div
          className={"absolute transition-all duration-100"}
          style={{
            top: focusedWordCoords?.top ?? 0,
            left: (focusedWordCoords?.left ?? 0) - 4,
            width: (focusedWordCoords?.width ?? 0) + 8,
            height: (focusedWordCoords?.height ?? 0) + 4,
            borderBottom: "4px solid #f6e05e",
          }}
        />
      )}

      {selectedWordIndex !== null && (
        <ContextMenu
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          onClose={onCloseContextMenu}
          onRequestReadingFromPoint={() => {
            onRequestReadingFromPoint(selectedWordIndex);
          }}
        />
      )}

      {sequentialReadingEnabled && (
        <SequentialReadingBar
          isPaused={!isPlaying}
          onPlayPauseToggle={togglePlaying}
          onGoAhead={goAhead}
          onGoBackwards={goBackwards}
        />
      )}

      <main className="p-8 flex flex-col gap-8" ref={contentRef}>
        {memoizedChapters}
      </main>
    </div>
  );
};

export default React.memo(BookDetail);
