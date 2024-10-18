import React, { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { useHeaderScroll } from "../../hooks/use-header-scroll";
import ChapterDrawer from "./chapter-drawer.tsx";
import { truncate } from "lodash";
import useDarkMode from "../../hooks/useDarkMode.ts";

export interface HeaderOption {
  id: string;
  component: React.FC<{ isOpen: boolean; onToggle: () => void }>;
  label: string;
}

interface BookHeaderProps {
  title: string;
  onBack: () => void;
}


const BookDetailHeader: React.FC<BookHeaderProps> = ({ title, onBack }) => {
  const { showHeader } = useHeaderScroll();
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  const isDarkMode = useDarkMode();

  return (
    <header
      className={twMerge(
        "px-4 text-gray-800 h-16 flex items-center justify-between bg-gray-50 border-b shadow-sm fixed w-full top-0 transition-transform duration-100 z-10",
        showHeader ? "translate-y-0" : "-translate-y-full",
        isDarkMode ? "bg-gray-900 text-white" : ""
      )}
    >
      <div className="flex items-center gap-8">
        <button className="text-2xl hover:text-gray-600" onClick={onBack}>
          <FaChevronLeft />
        </button>
        <button
          className="text-2xl hover:text-gray-600"
          onClick={() => setIsChapterDrawerOpen(!isChapterDrawerOpen)}
        >
          <FaBars />
        </button>
        <span className="text-lg">
          {truncate(title, {
            length: 25,
            omission: "...",
            separator: " ",
          })}
        </span>
      </div>

      <ChapterDrawer
        isOpen={isChapterDrawerOpen}
        onClose={() => setIsChapterDrawerOpen(false)}
      />
    </header>
  );
};

export default React.memo(BookDetailHeader);
