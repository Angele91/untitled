import React, {LegacyRef, useContext, useEffect, useMemo, useRef, useState} from 'react';
import ResourceImage from "./resource-image.tsx";
import {AppContext} from "../App.tsx";
import BookDetailHeader from "./book-detail-header.tsx";
import {MemoizedMarkdown} from "./memoized-markdown.tsx";
import {useLocalStorage} from "usehooks-ts";
import {MarkdownToJSX} from "markdown-to-jsx";
import {isEmpty} from "lodash";

interface BookDetailProps {
  onBack: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({onBack}) => {
  const {selectedBook} = useContext(AppContext);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', '16px');
  const [idsGenerated, setIdsGenerated] = useState(false);
  const contentRef = useRef<HTMLDivElement>();

  const markdownOptions = useMemo(() => ({
    wrapper: 'article',
    overrides: {
      h1: ({children}) => <h1 className="text-2xl font-bold my-4">{children}</h1>,
      h2: ({children}) => <h2 className="text-xl font-bold my-4">{children}</h2>,
      h3: ({children}) => <h3 className="text-lg font-bold my-4">{children}</h3>,
      img: ({src, alt}) => <ResourceImage book={selectedBook!} path={src} alt={alt}/>,
      p: ({children}) => {
        return (
          <p
            className="my-4"
            style={{fontSize}}
          >
            {Array.isArray(children) ? children.flatMap((paragraph, paragraphIndex) => {
              if (!paragraph.split) {
                return paragraph;
              }

              return paragraph.split(' ').flatMap((word, wordIndex) => (
                <span
                  key={`${paragraph}-${paragraphIndex}-${wordIndex}`}
                >
                  {word}{" "}
                </span>
              ));
            }) : children}
          </p>
        );
      },
      a: ({children, href}) => {
        return (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-500">
            {children}
          </a>
        );
      },
    },
  }) as MarkdownToJSX.Options, [selectedBook, fontSize]);

  const memoizedChapters = useMemo(() => {
      return selectedBook!.chapters.map((chapter, index) => (
        <MemoizedMarkdown
          key={`chapter-${index}`}
          content={chapter.mdContent}
          options={markdownOptions}
        />
      ));
    },
    [selectedBook, markdownOptions]
  );

  useEffect(() => {
    // assign an ID based on the index of the element to all words inside the markdown
    const article = contentRef.current;
    if (!article) {
      return;
    }

    const spans = article.querySelectorAll('span');

    spans.forEach((span, index) => {
      if (isEmpty(span.textContent)) {
        return;
      }

      span.id = `word-${index}`;
    });

    setIdsGenerated(true);
  }, [memoizedChapters]);

  const [firstWordCoords, setFirstWordCoords] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!idsGenerated) {
      return;
    }

    const firstWord = document.getElementById('word-0');
    if (firstWord) {
      const coords = firstWord.getBoundingClientRect();
      setFirstWordCoords(coords);
    }
  }, [idsGenerated]);

  return (
    <div className="w-screen h-screen overflow-y-auto overflow-x-hidden relative">
      <BookDetailHeader
        title={selectedBook!.title}
        onBack={onBack}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
      />
      <div
        className={'fixed'}
        style={{
          top: firstWordCoords?.top,
          left: firstWordCoords?.left,
          width: firstWordCoords?.width,
          height: firstWordCoords?.height,
          border: '1px solid red',
        }}
      >

      </div>
      <main className="p-8 flex flex-col gap-8 mt-16" ref={contentRef as LegacyRef<HTMLDivElement>}>
        {memoizedChapters}
      </main>
    </div>
  );
};


export default React.memo(BookDetail);
