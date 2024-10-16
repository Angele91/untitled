import {FC, useRef} from "react";
import {useAtomValue} from "jotai";
import {selectedBookAtom} from "../../state/atoms.ts";
import {FaTimes} from "react-icons/fa";
import {Chapter} from "../../lib/epub.ts";
import {useOnClickOutside} from "usehooks-ts";

interface ChapterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChapterDrawer: FC<ChapterDrawerProps> = ({isOpen, onClose}) => {
  const selectedBook = useAtomValue(selectedBookAtom);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(contentRef, onClose);

  const handleChapterClick = (chapter: Chapter) => {
    console.log(chapter);
    // Implement the logic to jump to the selected chapter
    console.log(`Jumping to chapter ${chapter.title}`);
    onClose();
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 h-screen bg-white shadow-lg transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-50`}
      ref={contentRef}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Chapters</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes/>
        </button>
      </div>
      <div className="overflow-y-auto h-full">
        {selectedBook?.chapters?.map((chapter) => (
          <button
            key={chapter.title}
            onClick={() => handleChapterClick(chapter)}
            className="w-full text-left p-4 hover:bg-gray-100 border-b"
          >
            {chapter.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChapterDrawer;