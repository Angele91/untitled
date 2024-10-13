import React, { useContext, useRef, useState } from 'react';
import { AppContext } from "../App.tsx";
import BookDetailHeader from "./book-detail-header.tsx";
import { useLocalStorage } from "usehooks-ts";
import { twMerge } from "tailwind-merge";
import { ScrollBlockOption } from "./scroll-block-selector.tsx";
import {useSequentialReading} from "../hooks/useSequentialReading.ts";
import {useWordHighlight} from "../hooks/useWordHighlight.ts";
import {useMarkdownRenderer} from "../hooks/useMarkdownRenderer.tsx";

interface BookDetailProps {
  onBack: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ onBack }) => {
  const { selectedBook } = useContext(AppContext);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', '16px');
  const [focusWordPace, setFocusWordPace] = useState(200);
  const [scrollBlock, setScrollBlock] = useState<ScrollBlockOption>("center");
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    focusedWordIndex,
    sequentialReadingEnabled,
    toggleSequentialReading
  } = useSequentialReading(contentRef, focusWordPace, scrollBlock);

  const { focusedWordCoords } = useWordHighlight(contentRef, focusedWordIndex);

  const { memoizedChapters } = useMarkdownRenderer(selectedBook, fontSize);

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
      />
      <div
        className={'absolute transition-all duration-100 rounded-md'}
        style={{
          top: focusedWordCoords?.top,
          left: focusedWordCoords?.left - 4,
          width: focusedWordCoords?.width + 8,
          height: focusedWordCoords?.height + 4,
          border: '1px solid red',
        }}
      />
      <main className="p-8 flex flex-col gap-8" ref={contentRef}>
        {memoizedChapters}
      </main>
    </div>
  );
};

export default React.memo(BookDetail);
