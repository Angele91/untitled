import {
  useMemo,
  useState,
  useEffect,
  ReactNode,
  MouseEvent,
  TouchEvent,
  useCallback,
} from "react";
import { MarkdownToJSX } from "markdown-to-jsx";
import { isEmpty, trim } from "lodash";
import ResourceImage from "../components/utility/resource-image";
import { MemoizedMarkdown } from "../components/reading/memoized-markdown";
import { Chapter } from "../lib/epub.ts";
import {
  fontSizeAtom,
  isFastReadingFontEnabledAtom,
  fastReadingPercentageAtom,
} from "../state/atoms.ts";
import { useAtomValue } from "jotai";
import { useSelectedBook } from "./use-selected-book.ts";

interface UseMarkdownRendererProps {
  onWordRightClick: (e: MouseEvent, word: string, wordIndex: number) => void;
  onWordLongPress: (e: TouchEvent, word: string, wordIndex: number) => void;
}

export const useMarkdownRenderer = ({
  onWordRightClick,
  onWordLongPress,
}: UseMarkdownRendererProps) => {
  const selectedBook = useSelectedBook();
  const fontSize = useAtomValue(fontSizeAtom);
  const enableFastReadingFont = useAtomValue(isFastReadingFontEnabledAtom);
  const fastReadingFontPercentage = useAtomValue(fastReadingPercentageAtom);

  const [idsGenerated, setIdsGenerated] = useState(false);
  const spanBoldPercentage = enableFastReadingFont
    ? fastReadingFontPercentage ?? 45
    : 0;

  const handleWordEvent = useCallback(
    (e: MouseEvent | TouchEvent, eventType: "right-click" | "long-press") => {
      e.preventDefault();
      let target = e.target as HTMLElement;
      if (target.tagName === "STRONG")
        target = target.parentElement as HTMLElement;

      const word = target.textContent;
      const wordIndex = parseInt(target.id.replace("word-", ""), 10);

      if (isNaN(wordIndex) || !word) {
        console.error("Invalid word index");
        return;
      }

      if (eventType === "right-click") {
        onWordRightClick(e as MouseEvent, word, wordIndex);
      } else {
        onWordLongPress(e as TouchEvent, word, wordIndex);
      }
    },
    [onWordRightClick, onWordLongPress]
  );

  const createTouchHandlers = () => {
    let longPressTimer: number | null = null;
    let isLongPress = false;
    const LONG_PRESS_DURATION = 500;

    return {
      handleTouchStart: (e: TouchEvent) => {
        isLongPress = false;
        longPressTimer = window.setTimeout(() => {
          isLongPress = true;
          handleWordEvent(e, "long-press");
        }, LONG_PRESS_DURATION);
      },
      handleTouchEnd: (e: TouchEvent) => {
        if (longPressTimer !== null) window.clearTimeout(longPressTimer);
        if (isLongPress) e.preventDefault();
        isLongPress = false;
      },
      handleTouchMove: () => {
        if (longPressTimer !== null) {
          window.clearTimeout(longPressTimer);
          isLongPress = false;
        }
      },
    };
  };

  const { handleTouchStart, handleTouchEnd, handleTouchMove } =
    createTouchHandlers();

  const convertWordsToSpans = useCallback(
    (children: ReactNode, boldPercentage: number = 0.45) => {
      const boldPart = (word: string) => {
        const boldLength = Math.ceil(word.length * boldPercentage);
        return (
          <>
            <strong>{word.slice(0, boldLength)}</strong>
            {word.slice(boldLength)}
          </>
        );
      };

      const createSpan = (word: string, key: string) => (
        <span
          key={key}
          onContextMenu={(e) => handleWordEvent(e, "right-click")}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          {boldPart(word)}{" "}
        </span>
      );

      if (typeof children === "string") {
        return children
          .split(" ")
          .map((word, index) => createSpan(word, `word-${index}`));
      }

      if (Array.isArray(children)) {
        return children.flatMap((child, childIndex) =>
          typeof child === "string"
            ? child
                .split(" ")
                .map((word, wordIndex) =>
                  createSpan(word, `${childIndex}-${wordIndex}`)
                )
            : child
        );
      }

      return children;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleWordEvent]
  );

  const markdownOptions = useMemo(() => {
    const createHeading =
      (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6", className: string) =>
      ({ children }: { children: ReactNode }) =>
        (
          <Tag className={className}>
            {convertWordsToSpans(children, spanBoldPercentage)}
          </Tag>
        );

    return {
      wrapper: "article",
      overrides: {
        h1: createHeading("h1", "text-2xl font-bold my-4"),
        h2: createHeading("h2", "text-xl font-bold my-4"),
        h3: createHeading("h3", "text-lg font-bold my-4"),
        h4: createHeading("h4", "text-lg font-semibold my-3"),
        h5: createHeading("h5", "text-base font-semibold my-2"),
        h6: createHeading("h6", "text-sm font-semibold my-2"),
        img: ({ src }: { src: string }) =>
          selectedBook ? (
            <ResourceImage book={selectedBook} path={src} />
          ) : null,
        p: ({ children }: { children: ReactNode }) => (
          <p className="my-4" style={{ fontSize }}>
            {convertWordsToSpans(children, spanBoldPercentage)}
          </p>
        ),
        a: ({ children, href }: { children: ReactNode; href: string }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-500"
          >
            {convertWordsToSpans(children, spanBoldPercentage)}
          </a>
        ),
        strong: ({ children }: { children: ReactNode }) => (
          <strong>{convertWordsToSpans(children, spanBoldPercentage)}</strong>
        ),
        em: ({ children }: { children: ReactNode }) => (
          <em>{convertWordsToSpans(children, spanBoldPercentage)}</em>
        ),
        blockquote: ({ children }: { children: ReactNode }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
            {convertWordsToSpans(children, spanBoldPercentage)}
          </blockquote>
        ),
        li: ({ children }: { children: ReactNode }) => (
          <li>{convertWordsToSpans(children, spanBoldPercentage)}</li>
        ),
      },
    } as MarkdownToJSX.Options;
  }, [convertWordsToSpans, spanBoldPercentage, selectedBook, fontSize]);

  const memoizedChapters = useMemo(() => {
    console.debug("Generating chapters");
    return (
      selectedBook?.chapters.map((chapter: Chapter, index: number) => (
        <MemoizedMarkdown
          key={`chapter-${index}`}
          content={chapter.mdContent}
          options={markdownOptions}
        />
      )) ?? []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook?.id, markdownOptions]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.debug("Generating word ids");
      const articles = document.querySelectorAll("article");

      if (!articles.length) {
        console.warn("Article not found");
        return;
      }

      const allSpans = Array.from(articles).flatMap((el) =>
        Array.from(el.querySelectorAll("span")).filter(
          (span) => !isEmpty(trim(span.textContent ?? ""))
        )
      );

      allSpans.forEach((span, index) => (span.id = `word-${index}`));
      setIdsGenerated(true);
      console.debug("Generated word ids");
      clearInterval(intervalId);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [memoizedChapters]);

  return { memoizedChapters, idsGenerated };
};
