import './App.css';
import {ChangeEventHandler, createContext, Dispatch, SetStateAction, useMemo} from 'react';
import { Book, parseBook } from './lib/epub';
import BookGrid from './components/book-grid';
import BookDetail from './components/book-detail';
import { useLocalStorage } from 'usehooks-ts';

export const AppContext = createContext<{
  books: Book[];
  setBooks: Dispatch<SetStateAction<Book[]>>;
  selectedBook: Book | null;
  setSelectedBook: Dispatch<SetStateAction<Book | null>>;
}>({
  books: [],
  setBooks: () => {},
  selectedBook: null,
  setSelectedBook: () => {},
});

function App() {
  const [books, setBooks] = useLocalStorage<Book[]>('books', []);
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

    console.debug({ newBooks });

    setBooks([...books, ...newBooks]);

    e.target.value = "";
  };

  const onBookDelete = (book: Book) => {
    setBooks(books.filter((b) => b !== book));
  };

  const contextValue = useMemo(() => {
    return {
      books,
      setBooks,
      selectedBook,
      setSelectedBook,
    };
  }, [books, selectedBook, setBooks, setSelectedBook]);

  return (
    <AppContext.Provider value={contextValue}>
      {selectedBook ? (
        <BookDetail
          selectedBook={selectedBook}
          onBack={() => setSelectedBook(null)}
        />
      ) : (
        <BookGrid
          books={books}
          onChooseFile={onChooseFile}
          onBookSelect={setSelectedBook}
          onBookDelete={onBookDelete}
        />
      )}
    </AppContext.Provider>
  );
}

export default App;