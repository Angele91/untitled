import React, { useMemo, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { useAtom } from "jotai";
import {
  focusWordPaceAtom,
  fontSizeAtom,
  isFastReadingFontEnabledAtom,
} from "../../state/atoms";
import { useHeaderScroll } from "../../hooks/use-header-scroll";
import { FontSizeSelector } from "../reading/font-size-selector";
import { PaceSelector } from "../reading/pace-selector";
import { FastReadingFontSwitch } from "../reading/fast-reading-font-switch";
import ChapterDrawer from "./chapter-drawer.tsx";
import {truncate} from "lodash";

export interface HeaderOption {
  id: string;
  component: React.FC<{ isOpen: boolean; onToggle: () => void }>;
  label: string;
}

interface BookHeaderProps {
  title: string;
  onBack: () => void;
}

function FaTimes() {
  return null;
}

const BookDetailHeader: React.FC<BookHeaderProps> = ({ title, onBack }) => {
  const [fontSize, setFontSize] = useAtom(fontSizeAtom);
  const [pace, onChangePace] = useAtom(focusWordPaceAtom);
  const [isFastReadingFontEnabled, setIsFastReadingFontEnabled] = useAtom(
    isFastReadingFontEnabledAtom
  );
  const [openOptionId, setOpenOptionId] = useState<string | null>(null);
  const { showHeader } = useHeaderScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);


  const headerOptions: HeaderOption[] = useMemo(() => {
    return [
      {
        id: "fontSize",
        label: "Font Size",
        component: ({ isOpen, onToggle }) => (
          <FontSizeSelector
            isOpen={isOpen}
            onToggle={onToggle}
            currentSize={fontSize}
            onSizeChange={setFontSize}
          />
        ),
      },
      {
        id: "pace",
        label: "Reading Pace",
        component: ({ isOpen, onToggle }) => (
          <PaceSelector
            isOpen={isOpen}
            onToggle={onToggle}
            currentPace={pace}
            onPaceChange={onChangePace}
          />
        ),
      },
      // Disabled for now, as I can't find a good use case for it
      // {
      //   id: 'scrollBlock',
      //   label: 'Scroll Block',
      //   component: ({isOpen, onToggle}) => (
      //     <ScrollBlockSelector
      //       isOpen={isOpen}
      //       onToggle={onToggle}
      //       currentBlock={scrollBlock}
      //       onBlockChange={onChangeScrollBlock}
      //     />
      //   ),
      // },
      {
        id: "fastReadingFont",
        label: "Fast Reading Font",
        component: () => {
          return (
            <FastReadingFontSwitch
              isEnabled={isFastReadingFontEnabled}
              onToggle={() => {
                console.debug(
                  `Fast Reading Font Enabled: ${isFastReadingFontEnabled}`
                );
                setIsFastReadingFontEnabled(!isFastReadingFontEnabled);
              }}
            />
          );
        },
      },
    ];
  }, [
    fontSize,
    setFontSize,
    pace,
    onChangePace,
    isFastReadingFontEnabled,
    setIsFastReadingFontEnabled,
  ]);

  return (
    <header
      className={twMerge(
        "px-4 text-gray-800 h-16 flex items-center justify-between bg-gray-50 border-b shadow-sm fixed w-full top-0 transition-transform duration-100 z-10",
        showHeader ? "translate-y-0" : "-translate-y-full",
        isMobileMenuOpen ? "h-full bg-transparent" : ""
      )}
    >
      <div className="flex items-center gap-8">
        <button className="text-2xl hover:text-gray-600" onClick={onBack}>
          <FaChevronLeft/>
        </button>
        <button
          className="text-2xl hover:text-gray-600"
          onClick={() => setIsChapterDrawerOpen(!isChapterDrawerOpen)}
        >
          <FaBars/>
        </button>
        <span className="text-lg">{truncate(title, {
          length: 25,
          omission: '...',
          separator: ' ',
        })}</span>
      </div>

      <ChapterDrawer
        isOpen={isChapterDrawerOpen}
        onClose={() => setIsChapterDrawerOpen(false)}
      />

      <div
        className={twMerge(
          "flex items-center gap-4",
          isMobileMenuOpen ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="hidden md:flex items-center gap-4">
          {headerOptions.map((option) => (
            <option.component
              key={option.id}
              isOpen={openOptionId === option.id}
              onToggle={() =>
                setOpenOptionId(openOptionId === option.id ? null : option.id)
              }
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
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
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
                    console.log("test");
                    if (option.id === "fastReadingFont") {
                      setIsFastReadingFontEnabled(!isFastReadingFontEnabled);
                    } else {
                      console.log("toggle", option.id);
                      setOpenOptionId(
                        openOptionId === option.id ? null : option.id
                      );
                    }
                  }}
                >
                  <option.component
                    isOpen={openOptionId === option.id}
                    onToggle={() =>
                      setOpenOptionId(
                        openOptionId === option.id ? null : option.id
                      )
                    }
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
