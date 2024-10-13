import { Book } from '../lib/epub';
import { twMerge } from 'tailwind-merge';
import {FC, useState, useRef, useEffect} from 'react';
import { FaTrash, FaEllipsisV } from 'react-icons/fa';
import {useOnClickOutside} from "usehooks-ts";
import ColorThief from "colorthief";

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
  useOnClickOutside(mobileDropdownRef, () => setShowDropdown(false));

  const analyzeImageColor = () => {
    const colorThief = new ColorThief();
    const img = imgRef.current;

    if (img) {
      const dominantColor = colorThief.getColor(img);
      const brightness = (dominantColor[0] * 299 + dominantColor[1] * 587 + dominantColor[2] * 114) / 1000;
      setIsDarkBackground(brightness < 128);
    }
  }

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      analyzeImageColor();
    }
  }, [book.cover]);

  return (
    <div
      className="overflow-hidden flex flex-col w-full h-[360px] relative group rounded-md"
      onClick={() => onBookSelect(book)}
    >
      <img
        className="w-full h-full object-cover group-hover:scale-125 transition-all duration-500"
        src={book.cover}
        alt={book.title}
      />
      <div
        className={twMerge(
          "transition-all absolute backdrop-blur-sm flex flex-col justify-center items-center bg-black/50 z-10 top-0 left-0 w-full h-full",
          "opacity-0 group-hover:opacity-100 md:flex hidden"
        )}
      >
        <span className="text-lg text-white">{book.title}</span>
        <span className="text-sm text-white">{book.author}</span>
      </div>

      {/* Mobile-only three-dot icon */}
      <button
        className={`absolute top-2 right-2 md:hidden ${isDarkBackground ? 'text-white' : 'text-black'}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
      >
        <FaEllipsisV className="text-2xl"/>
      </button>

      {/* Mobile dropdown */}
      <div
        className={twMerge(
          "absolute right-2 top-10 bg-white rounded-md shadow-lg z-20 transition-all duration-300 md:hidden",
          showDropdown ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        ref={mobileDropdownRef}
      >
        <button
          className="flex items-center px-4 py-2 text-red-600 hover:bg-red-100 rounded-md transition-colors w-full"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBook(book);
          }}
        >
          <FaTrash className="mr-2"/> Delete
        </button>
      </div>

      {/* Desktop delete button */}
      <button
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors hidden md:block"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteBook(book);
        }}
      >
        <FaTrash/>
      </button>

      {/* Mobile book info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 md:hidden">
        <h3 className="text-lg font-semibold">{book.title}</h3>
        <p className="text-sm">{book.author}</p>
      </div>
    </div>
  );
};

export default BookCard;
