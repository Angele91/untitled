import { useParams } from "react-router-dom";
import { db } from "../lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export const useSelectedBook = () => {
  const { id } = useParams();

  const selectedBook = useLiveQuery(async () => {
    if (!id) return undefined;
    const book = await db.books.get(id);
    if (!book) {
      console.error("Book not found");
      return undefined;
    }
    return book;
  });

  return selectedBook;
};
