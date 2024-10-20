import { ChangeEventHandler, FC } from "react";
import BookCard from "./book-card.tsx";
import { Book, parseBook } from "../../lib/epub.ts";
import DragAndDropInput from "../input/drag-and-drop-input.tsx";
import { db } from "../../lib/db.ts";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

const BookGrid: FC = () => {
  const books = useLiveQuery(() => db.books.toArray(), []);

  const navigate = useNavigate();

  const onBookSelect = (book: Book): void => {
    navigate(`/book/${book.id}`);
  };

  const onBookDelete = (book: Book) => {
    db.books.delete(book.id);
  };

  const onChooseFile: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;

    if (!files) {
      return;
    }

    const newBooks: Book[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const book = await parseBook(file);
      newBooks.push(book);
    }

    db.books.bulkAdd(newBooks);

    e.target.value = "";
  };

  return (
    <div className={"w-screen h-screen flex flex-col gap-4 p-4"}>
      <DragAndDropInput onChooseFile={onChooseFile} />
      <div className={"grid grid-cols-2 md:grid-cols-3 gap-4"}>
        {books?.map((book, index) => (
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
