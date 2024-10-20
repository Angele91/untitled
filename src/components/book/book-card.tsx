import { twMerge } from "tailwind-merge";
import { FC, useState, useRef, useEffect } from "react";
import { FaTrash, FaEllipsisV } from "react-icons/fa";
import { useOnClickOutside } from "usehooks-ts";
import ColorThief from "colorthief";
import { Book } from "../../lib/epub.ts";
import { truncate } from "lodash";
import useDarkMode from "../../hooks/useDarkMode.ts";

interface BookCardProps {
  book: Book;
  onBookSelect: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
}

const BookCard: FC<BookCardProps> = ({ book, onBookSelect, onDeleteBook }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isDarkMode = useDarkMode();

  useOnClickOutside(mobileDropdownRef, () => setShowDropdown(false));

  const analyzeImageColor = () => {
    const colorThief = new ColorThief();
    const img = imgRef.current;

    if (img) {
      const dominantColor = colorThief.getColor(img);
      const brightness =
        (dominantColor[0] * 299 +
          dominantColor[1] * 587 +
          dominantColor[2] * 114) /
        1000;
      setIsDarkBackground(brightness < 128);
    }
  };

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      analyzeImageColor();
    }
  }, [book.cover]);

  return (
    <div
      className={twMerge(
        "overflow-hidden flex flex-col w-full h-[360px] relative group rounded-md",
        isDarkMode ? "bg-gray-800" : "bg-white"
      )}
      onClick={() => onBookSelect(book)}
    >
      <img
        className="w-full h-full object-cover group-hover:scale-125 transition-all"
        src={book.cover}
        alt={book.title}
        ref={imgRef}
        onLoad={analyzeImageColor}
      />
      <div
        className={twMerge(
          "transition-all absolute backdrop-blur-sm cursor-pointer flex flex-col justify-center items-center z-10 top-0 left-0 w-full h-full",
          isDarkMode ? "bg-black/70" : "bg-black/50",
          "opacity-0 group-hover:opacity-100 md:flex hidden"
        )}
      >
        <span
          className={twMerge(
            "text-lg text-white font-semibold",
            isDarkBackground ? "text-white" : "text-black"
          )}
        >
          {truncate(book.title, {
            length: 25,
            omission: "...",
            separator: " ",
          })}
        </span>
        <span className="text-sm text-white">{book.author}</span>
      </div>

      {/* Mobile-only three-dot icon */}
      <button
        className={`absolute top-2 right-2 md:hidden ${
          isDarkBackground ? "text-white" : "text-black"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
      >
        <FaEllipsisV className="text-2xl" />
      </button>

      {/* Mobile dropdown */}
      <div
        className={twMerge(
          "absolute right-2 top-10 rounded-md shadow-lg z-20 transition-all md:hidden",
          isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black",
          showDropdown
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        ref={mobileDropdownRef}
      >
        <button
          className={twMerge(
            "flex items-center px-4 py-2 rounded-md transition-colors w-full",
            isDarkMode
              ? "text-red-400 hover:bg-red-500"
              : "text-red-600 hover:bg-red-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBook(book);
          }}
        >
          <FaTrash className="mr-2" /> Delete
        </button>
      </div>

      {/* Desktop delete button */}
      <button
        className={twMerge(
          "absolute top-2 right-2 rounded-full p-2 transition-colors hidden md:block z-[999]",
          isDarkMode
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-red-500 text-white hover:bg-red-600"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDeleteBook(book);
        }}
      >
        <FaTrash />
      </button>

      {/* Mobile book info overlay */}
      <div
        className={twMerge(
          "absolute bottom-0 left-0 right-0 p-2 md:hidden",
          isDarkMode ? "bg-black/80 text-white" : "bg-black/70 text-white"
        )}
      >
        <h3
          className={twMerge(
            "text-lg",
            isDarkBackground ? "text-white" : "text-black"
          )}
        >
          {truncate(book.title, {
            length: 25,
            omission: "...",
            separator: " ",
          })}
        </h3>
        <p className="text-sm">{book.author}</p>
      </div>
    </div>
  );
};

export default BookCard;
