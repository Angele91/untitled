import {Book} from '../lib/epub';
import {twMerge} from 'tailwind-merge';
import {FC} from 'react';
import {FaTrash} from 'react-icons/fa';

interface BookCardProps {
  book: Book;
  onBookSelect: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
}

const BookCard: FC<BookCardProps> = ({book, onBookSelect, onDeleteBook}) => {
  return (
    <button
      className={"overflow-hidden flex flex-col w-full h-[540px] relative group rounded-md"}
      onClick={() => onBookSelect(book)}
    >
      <img
        className={"w-full h-full object-cover group-hover:scale-125 transition-all duration-500"}
        src={book.cover} alt={book.title}
      />
      <div className={twMerge(
        "transition-all absolute backdrop-blur-sm flex flex-col justify-center items-center bg-black/50 z-10 top-0 left-0 w-full h-full",
        "opacity-0 group-hover:opacity-100"
      )}>
        <span className={"text-lg text-white"}>
          {book.title}
        </span>
        <span className={"text-sm text-white"}>
          {book.author}
        </span>
        <button
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBook(book);
          }}
        >
          <FaTrash/>
        </button>
      </div>
    </button>
  );
};

export default BookCard;