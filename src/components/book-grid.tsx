import {ChangeEventHandler, FC} from 'react';
import {Book} from '../lib/epub';
import BookCard from "./book-card.tsx";
import DragAndDropInput from "./drag-and-drop-input.tsx";

interface BookGridProps {
  books: Book[];
  onChooseFile: ChangeEventHandler<HTMLInputElement>;
  onBookSelect: (book: Book) => void;
  onBookDelete: (book: Book) => void;
}

const BookGrid: FC<BookGridProps> = ({books, onChooseFile, onBookSelect, onBookDelete}) => {
  return (
    <div className={"w-screen h-screen flex flex-col gap-4 p-4"}>
      <DragAndDropInput onChooseFile={onChooseFile}/>
      <div className={"grid grid-cols-3 gap-4"}>
        {books.map((book, index) => (
          <BookCard
            book={book}
            onBookSelect={onBookSelect}
            onDeleteBook={() => {
              onBookDelete(book);
            }}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};

export default BookGrid;