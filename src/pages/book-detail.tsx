import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  FC,
  useEffect,
} from "react";
import BookDetailHeader from "../components/book/book-detail-header.tsx";
import { twMerge } from "tailwind-merge";
import { useSequentialReading } from "../hooks/use-sequential-reading.ts";
import { useWordHighlight } from "../hooks/use-word-highlight.ts";
import { useMarkdownRenderer } from "../hooks/use-markdown-renderer.tsx";
import SequentialReadingBar from "../components/reading/sequential-reading-bar.tsx";
import { ContextMenu } from "../components/utility/context-menu.tsx";
import { useAtom, useAtomValue } from "jotai";
import { isSearchModeAtom, wordGroupSizeAtom } from "../state/atoms.ts";
import useEyeSaverMode from "../hooks/useEyeSaverMode.ts";
import useDarkMode from "../hooks/useDarkMode.ts";
import { useNavigate } from "react-router-dom";
import { useSelectedBook } from "../hooks/use-selected-book.ts";
import { RxCrossCircled } from "react-icons/rx";
import { findMatchesInElement, MatchResult } from "../lib/utils.ts";
import debounce from "lodash/debounce";
import { trim } from "lodash";

export function SearchInfo({ onClose }: { onClose: () => void }) {
  const selectedBook = useSelectedBook();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const searchCache = useRef<Map<string, any[]>>(new Map());

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (searchCache.current.has(query)) {
          setResults(searchCache.current.get(query)!);
        } else {
          const content = document.getElementById("book-detail");

          if (!content) {
            return;
          }

          const matches = findMatchesInElement(content, query);

          searchCache.current.set(query, matches);
          setResults(matches);
        }
      }, 300),
    []
  );

  const handleSearch = useCallback(() => {
    if (searchQuery && selectedBook) {
      debouncedSearch(trim(searchQuery));
    } else {
      setResults([]);
    }
  }, [searchQuery, selectedBook, debouncedSearch]);

  const handleResultClick = (result: MatchResult) => {
    result.element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

    window.getSelection()?.removeAllRanges();
    const range = document.createRange();
    range.selectNode(result.element);
    console.log(result.element);
    window.getSelection()?.addRange(range);

    onClose();
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <>
      <button onClick={onClose} className="h-6 w-6 absolute right-4">
        <RxCrossCircled size={24} />
      </button>
      <div className="flex gap-4 mt-8">
        <input
          type="text"
          placeholder="Search..."
          className="w-full h-full p-2 border border-gray-200 rounded"
          value={searchQuery}
          onChange={(e) => {
            if (e.target.value === "") {
              setResults([]);
            }

            setSearchQuery(e.target.value);
          }}
          onBlur={handleSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Search
        </button>
      </div>
      {results?.map((result, index) => (
        <button
          key={index}
          className="p-2 border-b"
          onClick={() => handleResultClick(result)}
        >
          <p
            dangerouslySetInnerHTML={{
              __html: result.preview.replace(
                new RegExp(searchQuery, "gi"),
                (match: any) => `<span class="bg-yellow-200">${match}</span>`
              ),
            }}
          ></p>
        </button>
      ))}
    </>
  );
}

const SearchDrawer: FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed top-0 right-0 w-1/2 h-full bg-white shadow-lg z-50 p-4 flex flex-col gap-4 overflow-y-auto">
      <SearchInfo onClose={onClose} />
    </div>
  );
};

const SearchModal: FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <SearchInfo onClose={onClose} />
    </div>
  );
};

const BookDetail: FC = () => {
  const navigate = useNavigate();

  const selectedBook = useSelectedBook();

  const wordGroupSize = useAtomValue(wordGroupSizeAtom);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(
    null
  );
  const eyeSaverMode = useEyeSaverMode();
  const darkMode = useDarkMode();
  const [isSearchMode, setIsSearchMode] = useAtom(isSearchModeAtom);

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
          id="book-detail"
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
      {isSearchMode && (
        <>
          <div className="hidden md:block">
            <SearchDrawer onClose={() => setIsSearchMode(false)} />
          </div>
          <div className="block md:hidden">
            <SearchModal onClose={() => setIsSearchMode(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(BookDetail);
