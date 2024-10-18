import MainHeader from "../components/MainHeader.tsx";
import BookGrid from "../components/book/book-grid.tsx";
import useEyeSaverMode from "../hooks/useEyeSaverMode.ts";
import useDarkMode from "../hooks/useDarkMode.ts";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db.ts";
import { ChangeEventHandler } from "react";
import { Book, parseBook } from "../lib/epub.ts";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const books = useLiveQuery(() => db.books.toArray(), []);
  const navigate = useNavigate();

  const darkMode = useDarkMode();
  const eyeSaverMode = useEyeSaverMode();

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

  const onBookDelete = (book: Book) => {
    db.books.delete(book.id);
  };

  const onBookSelect = (book: Book): void => {
    console.log("book selected", book);
    navigate(`/book/${book.id}`);
  };

  return (
    <div
      className={`${eyeSaverMode ? "eye-saver-mode" : ""} ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      <MainHeader />
      <BookGrid
        books={books ?? []}
        onChooseFile={onChooseFile}
        onBookSelect={onBookSelect}
        onBookDelete={onBookDelete}
      />
    </div>
  );
}
