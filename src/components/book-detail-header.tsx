import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronLeft, FaPlay, FaPause } from 'react-icons/fa';
import { FontSizeSelector } from "./font-size-selector.tsx";
import {PaceSelector} from "./pace-selector.tsx";
import {ScrollBlockOption, ScrollBlockSelector} from "./scroll-block-selector.tsx";

interface HeaderOption {
  id: string;
  component: React.FC<{ isOpen: boolean; onToggle: () => void }>;
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
  onChangeScrollBlock
                                                     }) => {
  const [openOptionId, setOpenOptionId] = useState<string | null>(null);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollTop = useRef(0);

  const handleScroll = useCallback(() => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScrollTop.current) {
      setShowHeader(false);
      setOpenOptionId(null);
    } else if (st < lastScrollTop.current) {
      setShowHeader(true);
    }
    lastScrollTop.current = st <= 0 ? 0 : st;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const headerElement = document.querySelector('header');
    if (headerElement && headerElement.contains(e.target as Node)) {
      return;
    }

    if (e.clientY < 20) {
      setShowHeader(true);
    } else if (e.clientY > 100) {
      setShowHeader(false);
      setOpenOptionId(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  const headerOptions: HeaderOption[] = useMemo(() => [
    {
      id: 'fontSize',
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
      component: ({isOpen, onToggle}) => (
        <ScrollBlockSelector
          isOpen={isOpen}
          onToggle={onToggle}
          currentBlock={scrollBlock}
          onBlockChange={onChangeScrollBlock}
        />
      ),
    },
  ], [fontSize, onChangeFontSize, pace, onChangePace, scrollBlock, onChangeScrollBlock]);

  return (
    <header
      className={`px-4 text-gray-800 h-16 flex items-center justify-between bg-gray-50 border-b shadow-sm fixed w-full top-0 transition-transform duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex items-center gap-8">
        <button className="text-2xl hover:text-gray-600" onClick={onBack}>
          <FaChevronLeft/>
        </button>
        <span className="text-lg">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onPlayPauseToggle}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        {headerOptions.map((option) => (
          <option.component
            key={option.id}
            isOpen={openOptionId === option.id}
            onToggle={() => setOpenOptionId(openOptionId === option.id ? null : option.id)}
          />
        ))}
      </div>
    </header>
  );
};

export default React.memo(BookDetailHeader);
