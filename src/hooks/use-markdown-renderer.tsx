import {useMemo, useState, useEffect, ReactNode, MouseEvent} from 'react';
import {MarkdownToJSX} from "markdown-to-jsx";
import {isEmpty, trim} from "lodash";
import ResourceImage from "../components/resource-image.tsx";
import {MemoizedMarkdown} from "../components/memoized-markdown.tsx";
import {Chapter} from "../lib/epub.ts";

interface UseMarkdownRendererProps {
  selectedBook: any;
  fontSize: string;
  enableFastReadingFont: boolean;
  fastReadingFontPercentage: number;
  onWordRightClick: (e: MouseEvent, word: string, wordIndex: number) => void;
}

export const useMarkdownRenderer = ({
                                      selectedBook,
                                      fontSize,
                                      enableFastReadingFont,
                                      fastReadingFontPercentage,
                                      onWordRightClick,
                                    }: UseMarkdownRendererProps) => {
  const [idsGenerated, setIdsGenerated] = useState(false);
  const spanBoldPercentage = enableFastReadingFont ? fastReadingFontPercentage ?? 45 : 0;

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    let target = e.target as HTMLElement;

    // if target is a strong, use the parent
    if (target.tagName === 'STRONG') {
      target = target.parentElement as HTMLElement;
    }

    const word = target.textContent;
    const wordIndex = parseInt(target.id.replace('word-', ''), 10);

    if (isNaN(wordIndex)) {
      console.error('Invalid word index');
      return;
    }

    onWordRightClick(e, word, wordIndex);
  }


  const convertWordsToSpans = (children: ReactNode, boldPercentage: number = 0.45) => {
    const boldPart = (word: string) => {
      const boldLength = Math.ceil(word.length * boldPercentage);
      const boldText = word.slice(0, boldLength);
      const normalText = word.slice(boldLength);
      return (
        <>
          <strong
            onContextMenu={onContextMenu}
          >
            {boldText}
          </strong>{normalText}
        </>
      );
    };

    if (typeof children === 'string') {
      return children.split(' ').map((word, index) => {
        return (
          <span
            key={`word-${index}`}
            onContextMenu={onContextMenu}
          >
            {boldPart(word)}{" "}
          </span>
        );
      });
    }

    if (Array.isArray(children)) {
      return children.flatMap((child, childIndex) => {
        if (typeof child === 'string') {
          return child.split(' ' as any).map((word, wordIndex) => (
            <span
              key={`${childIndex}-${wordIndex}`}
              onContextMenu={onContextMenu}
            >
              {boldPart(word)}{" "}
            </span>
          ));
        }

        return child;
      });
    }
    return children;
  };

  const markdownOptions = useMemo(() => ({
    wrapper: 'article',
    overrides: {
      h1: ({children}) => {
        return <h1
          className="text-2xl font-bold my-4">{convertWordsToSpans(children, spanBoldPercentage)}</h1>;
      },
      h2: ({children}) => <h2
        className="text-xl font-bold my-4">{convertWordsToSpans(children, spanBoldPercentage)}</h2>,
      h3: ({children}) => <h3
        className="text-lg font-bold my-4">{convertWordsToSpans(children, spanBoldPercentage)}</h3>,
      h4: ({children}) => <h4
        className="text-lg font-semibold my-3">{convertWordsToSpans(children, spanBoldPercentage)}</h4>,
      h5: ({children}) => <h5
        className="text-base font-semibold my-2">{convertWordsToSpans(children, spanBoldPercentage)}</h5>,
      h6: ({children}) => <h6
        className="text-sm font-semibold my-2">{convertWordsToSpans(children, spanBoldPercentage)}</h6>,
      img: ({src}) => <ResourceImage book={selectedBook} path={src}/>,
      p: ({children}) => (
        <p className="my-4" style={{fontSize}}>
          {convertWordsToSpans(children, spanBoldPercentage)}
        </p>
      ),
      a: ({children, href}) => (
        <a href={href} target="_blank" rel="noreferrer" className="underline text-blue-500">
          {convertWordsToSpans(children, spanBoldPercentage)}
        </a>
      ),
      strong: ({children}) => <strong>{convertWordsToSpans(children, spanBoldPercentage)}</strong>,
      em: ({children}) => <em>{convertWordsToSpans(children, spanBoldPercentage)}</em>,
      blockquote: ({children}) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
          {convertWordsToSpans(children, spanBoldPercentage)}
        </blockquote>
      ),
      li: ({children}) => <li>{convertWordsToSpans(children, spanBoldPercentage)}</li>,
    },
  }) as MarkdownToJSX.Options, [spanBoldPercentage, selectedBook, fontSize]);

  const memoizedChapters = useMemo(() => {
    console.log('Recalculating chapters');
    return selectedBook.chapters.map((chapter: Chapter, index: number) => (
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
      return !isEmpty(trim(span.textContent ?? undefined));
    }).forEach((span, index) => {
      span.id = `word-${index}`;
    });

    setIdsGenerated(true);
  }, [memoizedChapters]);

  return {memoizedChapters, idsGenerated};
};
