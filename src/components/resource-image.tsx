import {FC, useEffect, useState} from "react";
import {Book} from "../lib/epub.ts";
import {normalizePath} from "../lib/utils.ts";

const ResourceImage: FC<{
  book: Book;
  path: string;
}> = ({book, path}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [src, setSrc] = useState('');

  useEffect(() => {
    const normalizedPath = normalizePath(path)
    const base64 = book.resources[normalizedPath];
    if (base64) {
      setSrc(base64);
      setIsLoading(false);
    } else {
      console.warn(`Resource ${normalizedPath} not found in book resources`);
    }
  }, [book.resources, path]);

  return (
    isLoading ? (
      <div>
        <span>
          Loading...
        </span>
      </div>
    ) : (
      <div className={"w-full max-h-3/4 flex justify-center"}>
        <img
          src={src}
          alt={path}
          className={"object-contain"}
        />
      </div>
    )
  )
}

export default ResourceImage;