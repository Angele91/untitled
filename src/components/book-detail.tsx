import React, {useCallback, useContext, useRef, useState} from 'react';
import {AppContext} from "../App.tsx";
import BookDetailHeader from "./book-detail-header.tsx";
import {useLocalStorage} from "usehooks-ts";
import {twMerge} from "tailwind-merge";
import {ScrollBlockOption} from "./scroll-block-selector.tsx";
import {useSequentialReading} from "../hooks/use-sequential-reading.ts";
import {useWordHighlight} from "../hooks/use-word-highlight.ts";
import {useMarkdownRenderer} from "../hooks/use-markdown-renderer.tsx";
import SequentialReadingBar from "./sequential-reading-bar.tsx";
import {ContextMenu} from "./context-menu.tsx";

interface BookDetailProps {
  onBack: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({onBack}) => {
  const {selectedBook} = useContext(AppContext);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', '16px');
  const [focusWordPace, setFocusWordPace] = useState(200);
  const [scrollBlock, setScrollBlock] = useState<ScrollBlockOption>("center");
  const [isFastReadingFontEnabled, setIsFastReadingFontEnabled] = useLocalStorage('isFastReadingFontEnabled', false);
  const [contextMenuPosition, setContextMenuPosition] = useState({x: 0, y: 0});
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);

  const contentRef = useRef<HTMLDivElement | null>(null);

  const {
    focusedWordIndex,
    sequentialReadingEnabled,
    toggleSequentialReading,
    startReadingFrom,
  } = useSequentialReading(focusWordPace, scrollBlock);

  const {focusedWordCoords} = useWordHighlight({
    contentRef,
    focusedWordIndex,
  });

  const {memoizedChapters} = useMarkdownRenderer({
    selectedBook,
    fontSize,
    enableFastReadingFont: isFastReadingFontEnabled,
    fastReadingFontPercentage: 0.45,
    onWordRightClick: (event, word, wordIndex) => {
      event.preventDefault();
      setContextMenuPosition({x: event.clientX, y: event.clientY});
      setSelectedWordIndex(wordIndex);
    },
  });

  const onToggleFastReadingFont = useCallback(() => setIsFastReadingFontEnabled(!isFastReadingFontEnabled), [isFastReadingFontEnabled, setIsFastReadingFontEnabled]);

  const onRequestReadingFromPoint = (wordIndex) => {
    startReadingFrom(wordIndex);
    setContextMenuPosition({x: 0, y: 0});
    setSelectedWordIndex(null);
  };

  const onCloseContextMenu = () => {
    setSelectedWordIndex(null);
    setContextMenuPosition({x: 0, y: 0});
  };

  return (
    <div className={twMerge("w-screen h-screen overflow-y-auto overflow-x-hidden relative")}>
      <BookDetailHeader
        title={selectedBook!.title}
        onBack={onBack}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        pace={focusWordPace}
        onChangePace={setFocusWordPace}
        isPlaying={sequentialReadingEnabled}
        onPlayPauseToggle={toggleSequentialReading}
        scrollBlock={scrollBlock}
        onChangeScrollBlock={setScrollBlock}
        isFastReadingFontEnabled={isFastReadingFontEnabled}
        onToggleFastReadingFont={onToggleFastReadingFont}
      />
      {sequentialReadingEnabled && (
        <div
          className={'absolute transition-all duration-100 rounded-md'}
          style={{
            top: focusedWordCoords?.top ?? 0,
            left: (focusedWordCoords?.left ?? 0) - 4,
            width: (focusedWordCoords?.width ?? 0) + 8,
            height: (focusedWordCoords?.height ?? 0) + 4,
            border: '1px solid red',
          }}
        />
      )}

      {selectedWordIndex !== null && (
        <ContextMenu
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          onClose={onCloseContextMenu}
          onRequestReadingFromPoint={() => {
            console.log(selectedWordIndex);
            onRequestReadingFromPoint(selectedWordIndex)
          }}
        />
      )}

      <SequentialReadingBar
        isPaused={!sequentialReadingEnabled}
        onPlayPauseToggle={toggleSequentialReading}
      />
      <main className="p-8 flex flex-col gap-8" ref={contentRef}>
        {memoizedChapters}
      </main>
    </div>
  );
};

export default React.memo(BookDetail);
