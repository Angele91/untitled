import './App.css';
import {ChangeEventHandler, createContext, useCallback} from 'react';
import {Book, parseBook} from './lib/epub';
import BookGrid from './components/book-grid';
import BookDetail from './components/book-detail';
import {useLocalStorage} from 'usehooks-ts';
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "./lib/db.ts";

export const AppContext = createContext({
  books: [] as Book[] | null,
  selectedBook: null as Book | null,
  setSelectedBook: (() => {
  }) as (book: Book | null) => void,
});

function App() {
  const books = useLiveQuery(() => db.books.toArray(), []);
  const [selectedBook, setSelectedBook] = useLocalStorage<Book | null>('selectedBook', null);

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
    <AppContext.Provider value={{
      books: books ?? [],
      selectedBook,
      setSelectedBook,
    }}>
      {selectedBook ? (
        <BookDetail
          onBack={onBack}
        />
      ) : (
        <BookGrid
          books={books ?? []}
          onChooseFile={onChooseFile}
          onBookSelect={setSelectedBook}
          onBookDelete={onBookDelete}
        />
      )}
    </AppContext.Provider>
  );
}

export default App;