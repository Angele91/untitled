import "./App.css";
import { ChangeEventHandler, useCallback, lazy, Suspense } from "react";
import { Book, parseBook } from "./lib/epub";
import BookGrid from "./components/book/book-grid";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./lib/db.ts";
import { useAtom } from "jotai";
import { selectedBookAtom } from "./state/atoms.ts";
import useEyeSaverMode from "./hooks/useEyeSaverMode.ts";
import useDarkMode from "./hooks/useDarkMode.ts";
import MainHeader from "./components/MainHeader";

const BookDetail = lazy(() => import("./components/book/book-detail"));

function App() {
  const books = useLiveQuery(() => db.books.toArray(), []);
  const [selectedBook, setSelectedBook] = useAtom(selectedBookAtom);
  const eyeSaverMode = useEyeSaverMode();
  const darkMode = useDarkMode();

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

  const onBack = useCallback(() => setSelectedBook(null), [setSelectedBook]);

  return (
    <div
      className={`${eyeSaverMode ? "eye-saver-mode" : ""} ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      {selectedBook ? (
        <Suspense fallback={<div>Loading...</div>}>
          <BookDetail onBack={onBack} />
        </Suspense>
      ) : (
        <>
          <MainHeader />
          <BookGrid
            books={books ?? []}
            onChooseFile={onChooseFile}
            onBookSelect={(book) => setSelectedBook(book)}
            onBookDelete={onBookDelete}
          />
        </>
      )}
    </div>
  );
}

export default App;
