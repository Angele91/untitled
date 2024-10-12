import Dexie, { type EntityTable } from 'dexie';
import {Book} from "./epub.ts";

export const BOOK_FIELDS = ['id', 'title', 'author', 'description', 'cover', 'chapters', 'resources', 'format', 'hash'];

export const db = new Dexie('Bookshelf') as Dexie & {
  books: EntityTable<
    Book,
    'id'
  >,
}

db.version(1).stores({
  books: `id++, ${BOOK_FIELDS.join(', ')}`,
})