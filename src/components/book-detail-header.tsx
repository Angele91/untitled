import React, {useMemo, useState} from 'react';
import {FaChevronLeft, FaPause, FaPlay} from 'react-icons/fa';
import {FontSizeSelector} from "./font-size-selector.tsx";
import {PaceSelector} from "./pace-selector.tsx";
import {ScrollBlockOption, ScrollBlockSelector} from "./scroll-block-selector.tsx";
import {FastReadingFontSwitch} from "./fast-reading-font-switch.tsx";
import {useHeaderScroll} from "../hooks/use-header-scroll.tsx";
import {FaBars} from "react-icons/fa6";
import {twMerge} from "tailwind-merge";

export interface HeaderOption {
  id: string;
  component: React.FC<{ isOpen: boolean; onToggle: () => void }>;
  label: string;
}


interface BookHeaderProps {
  title: string;
  onBack: () => void;
  fontSize: string;
  onChangeFontSize: (newSize: string) => void;
  pace: number;
  onChangePace: (newPace: number) => void;
  isPlaying: boolean;
  onPlayPauseToggle: () => void;
  scrollBlock: ScrollBlockOption;
  onChangeScrollBlock: (newBlock: ScrollBlockOption) => void;
  isFastReadingFontEnabled: boolean;
  onToggleFastReadingFont: () => void;
}


function FaTimes() {
  return null;
}

const BookDetailHeader: React.FC<BookHeaderProps> = ({
                                                       title,
                                                       onBack,
                                                       fontSize,
                                                       onChangeFontSize,
                                                       pace,
                                                       onChangePace,
                                                       isPlaying,
                                                       onPlayPauseToggle,
                                                       scrollBlock,
                                                       onChangeScrollBlock,
                                                       onToggleFastReadingFont,
                                                       isFastReadingFontEnabled
                                                     }) => {
  const [openOptionId, setOpenOptionId] = useState<string | null>(null);
  const {showHeader} = useHeaderScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const headerOptions: HeaderOption[] = useMemo(() => [
    {
      id: 'fontSize',
      label: 'Font Size',
      component: ({isOpen, onToggle}) => (
        <FontSizeSelector
          isOpen={isOpen}
          onToggle={onToggle}
          currentSize={fontSize}
          onSizeChange={onChangeFontSize}
        />
      ),
    },
    {
      id: 'pace',
      label: 'Reading Pace',
      component: ({isOpen, onToggle}) => (
        <PaceSelector
          isOpen={isOpen}
          onToggle={onToggle}
          currentPace={pace}
          onPaceChange={onChangePace}
        />
      ),
    },
    {
      id: 'scrollBlock',
      label: 'Scroll Block',
      component: ({isOpen, onToggle}) => (
        <ScrollBlockSelector
          isOpen={isOpen}
          onToggle={onToggle}
          currentBlock={scrollBlock}
          onBlockChange={onChangeScrollBlock}
        />
      ),
    },
    {
      id: 'fastReadingFont',
      label: 'Fast Reading Font',
      component: () => (
        <FastReadingFontSwitch
          isEnabled={isFastReadingFontEnabled}
          onToggle={onToggleFastReadingFont}
        />
      ),
    },
  ], [
    fontSize,
    onChangeFontSize,
    pace,
    onChangePace,
    scrollBlock,
    onChangeScrollBlock,
    isFastReadingFontEnabled,
    onToggleFastReadingFont
  ]);

  return (
    <header
      className={twMerge(
        "px-4 text-gray-800 h-16 flex items-center justify-between bg-gray-50 border-b shadow-sm fixed w-full top-0 transition-transform duration-100 z-10",
        showHeader ? 'translate-y-0' : '-translate-y-full',
        isMobileMenuOpen ? 'h-full bg-transparent' : ''
      )}
    >
      <div
        className={twMerge(
          "flex items-center gap-8",
          isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
        )}
      >
        <button className="text-2xl hover:text-gray-600" onClick={onBack}>
          <FaChevronLeft/>
        </button>
        <span className="text-lg">{title}</span>
      </div>

      <div
        className={twMerge(
          "flex items-center gap-4",
          isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
        )}
      >
        <button
          onClick={onPlayPauseToggle}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? <FaPause/> : <FaPlay/>}
        </button>
        <div className="hidden md:flex items-center gap-4">
          {headerOptions.map((option) => (
            <option.component
              key={option.id}
              isOpen={openOptionId === option.id}
              onToggle={() => setOpenOptionId(openOptionId === option.id ? null : option.id)}
            />
          ))}
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-2xl"
        >
          {isMobileMenuOpen ? <FaTimes/> : <FaBars/>}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={twMerge(
          "md:hidden fixed inset-0 bg-gray-800 z-[9999] transition-all duration-300 backdrop-blur-sm bg-opacity-75",
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className="bg-white h-full w-64 absolute right-0 shadow-lg transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-16 px-4">
            {headerOptions.map((option) => {
              return (
                <div
                  key={option.id}
                  className="mb-4 flex gap-2 items-center"
                  id={option.id}
                  onClick={() => {
                    if (option.id === 'fastReadingFont') {
                      onToggleFastReadingFont();
                    } else {
                      setOpenOptionId(openOptionId === option.id ? null : option.id)
                    }
                  }}
                >
                  <option.component
                    isOpen={openOptionId === option.id}
                    onToggle={() => setOpenOptionId(openOptionId === option.id ? null : option.id)}
                  />
                  <div className="text-sm text-gray-500">{option.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(BookDetailHeader);
