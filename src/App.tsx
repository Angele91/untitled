import './App.css';
import {ChangeEventHandler, useCallback} from 'react';
import {Book, parseBook} from './lib/epub';
import BookGrid from './components/book-grid';
import BookDetail from './components/book-detail';
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "./lib/db.ts";
import {useAtom} from "jotai";
import {selectedBookAtom} from "./state/atoms.ts";

function App() {
  const books = useLiveQuery(() => db.books.toArray(), []);
  const [selectedBook, setSelectedBook] = useAtom(selectedBookAtom);

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
    <>
      {selectedBook ? (
        <BookDetail
          onBack={onBack}
        />
      ) : (
        <BookGrid
          books={books ?? []}
          onChooseFile={onChooseFile}
          onBookSelect={(book) => setSelectedBook(book)}
          onBookDelete={onBookDelete}
        />
      )}
    </>
  );
}

export default App;