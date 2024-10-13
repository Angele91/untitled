import { useMemo, useState, useEffect } from 'react';
import { MarkdownToJSX } from "markdown-to-jsx";
import { isEmpty, trim } from "lodash";
import ResourceImage from "../components/resource-image.tsx";
import {convertWordsToSpans} from "../lib/textProcessing.tsx";
import {MemoizedMarkdown} from "../components/memoized-markdown.tsx";

export const useMarkdownRenderer = (selectedBook: any, fontSize: string) => {
  const [idsGenerated, setIdsGenerated] = useState(false);

  const markdownOptions = useMemo(() => ({
    wrapper: 'article',
    overrides: {
      h1: ({children}) => <h1 className="text-2xl font-bold my-4">{convertWordsToSpans(children)}</h1>,
      h2: ({children}) => <h2 className="text-xl font-bold my-4">{convertWordsToSpans(children)}</h2>,
      h3: ({children}) => <h3 className="text-lg font-bold my-4">{convertWordsToSpans(children)}</h3>,
      h4: ({children}) => <h4 className="text-lg font-semibold my-3">{convertWordsToSpans(children)}</h4>,
      h5: ({children}) => <h5 className="text-base font-semibold my-2">{convertWordsToSpans(children)}</h5>,
      h6: ({children}) => <h6 className="text-sm font-semibold my-2">{convertWordsToSpans(children)}</h6>,
      img: ({src, alt}) => <ResourceImage book={selectedBook} path={src} alt={alt}/>,
      p: ({children}) => (
        <p className="my-4" style={{fontSize}}>
          {convertWordsToSpans(children)}
        </p>
      ),
      a: ({children, href}) => (
        <a href={href} target="_blank" rel="noreferrer" className="underline text-blue-500">
          {convertWordsToSpans(children)}
        </a>
      ),
      strong: ({children}) => <strong>{convertWordsToSpans(children)}</strong>,
      em: ({children}) => <em>{convertWordsToSpans(children)}</em>,
      blockquote: ({children}) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
          {convertWordsToSpans(children)}
        </blockquote>
      ),
      li: ({children}) => <li>{convertWordsToSpans(children)}</li>,
    },
  }) as MarkdownToJSX.Options, [selectedBook, fontSize]);

  const memoizedChapters = useMemo(() => {
    return selectedBook.chapters.map((chapter, index) => (
      <MemoizedMarkdown
        key={`chapter-${index}`}
        content={chapter.mdContent}
        options={markdownOptions}
      />
    ));
  }, [selectedBook, markdownOptions]);

  useEffect(() => {
    const article = document.querySelectorAll('article');

    if (!Array.from(article).length) {
      console.warn('Article not found');
      return;
    }

    const allSpans = Array.from(article).flatMap((el) => Array.from(el.querySelectorAll('span')));

    Array.from(allSpans).filter((span) => {
      return !isEmpty(trim(span.textContent));
    }).forEach((span, index) => {
      span.id = `word-${index}`;
    });

    setIdsGenerated(true);
  }, [memoizedChapters]);

  return { memoizedChapters, idsGenerated };
};
