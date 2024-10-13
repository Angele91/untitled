import React, {LegacyRef, useContext, useEffect, useMemo, useRef, useState} from 'react';
import ResourceImage from "./resource-image.tsx";
import {AppContext} from "../App.tsx";
import BookDetailHeader from "./book-detail-header.tsx";
import {MemoizedMarkdown} from "./memoized-markdown.tsx";
import {useLocalStorage} from "usehooks-ts";
import {MarkdownToJSX} from "markdown-to-jsx";
import {isEmpty, trim} from "lodash";
import {twMerge} from "tailwind-merge";
import {ScrollBlockOption} from "./scroll-block-selector.tsx";

interface BookDetailProps {
  onBack: () => void;
}

const delayConfig = {
  default: 0,
  '.': 300,
  ',': 150,
  '!': 300,
  '?': 300,
  ';': 200,
  ':': 200,
  paragraph: 1000,
};

function getNextElementWithText(currentElement: HTMLElement | null): HTMLElement | null {
  if (!currentElement || !document.body.contains(currentElement)) return null;

  const styleCache = new WeakMap<Element, { display: string; visibility: string }>();

  const getComputedStyleProperties = (element: Element) => {
    if (!styleCache.has(element)) {
      const style = window.getComputedStyle(element);
      styleCache.set(element, {
        display: style.display,
        visibility: style.visibility
      });
    }
    return styleCache.get(element)!;
  };

  const isVisible = (element: Element): boolean => {
    const {display, visibility} = getComputedStyleProperties(element);
    return display !== 'none' && visibility !== 'hidden';
  };

  const hasVisibleText = (node: Node): boolean => {
    return node.nodeType === Node.TEXT_NODE &&
      node.textContent !== null &&
      node.textContent.trim() !== '' &&
      node.parentElement !== null &&
      isVisible(node.parentElement);
  };

  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (node.nodeType === Node.ELEMENT_NODE && !isVisible(node as Element)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  // Position the TreeWalker at the current element
  while (treeWalker.nextNode()) {
    if (treeWalker.currentNode === currentElement) {
      break;
    }
  }

  // Get the text content of the current element
  const currentTextContent = currentElement.textContent?.trim() || '';

  // Move to the next node after the current element
  if (!treeWalker.nextNode()) return null;

  // Traverse the DOM to find the next element with different visible text
  do {
    const node = treeWalker.currentNode;
    if (hasVisibleText(node)) {
      const parentElement = node.parentElement;
      if (parentElement && parentElement.textContent?.trim() !== currentTextContent) {
        return parentElement;
      }
    }
  } while (treeWalker.nextNode());

  return null;
}


const getNextWord = (currentWord: HTMLElement | null): {
  element: HTMLElement | null,
  punctuation: string,
  isParagraphEnd: boolean
} => {
  if (!currentWord) return {element: null, punctuation: '', isParagraphEnd: false};

  let nextWord = currentWord.nextElementSibling as HTMLElement;
  let isParagraphEnd = false;

  // If there's no next sibling, it might be the end of a paragraph
  if (!nextWord) {
    const candidate = getNextElementWithText(currentWord);

    if (!candidate) {
      console.warn('No candidate found');
      return {element: null, punctuation: '', isParagraphEnd: false};
    }

    nextWord = candidate;
    isParagraphEnd = true; // Mark as paragraph end
  }

  // If the next element is not a word, recursively call getNextWord
  if (nextWord && (!nextWord.id || !nextWord.id.includes('word'))) {
    return getNextWord(nextWord);
  }

  // Check for punctuation
  const punctuation = currentWord.textContent?.trim().slice(-1) || '';

  return {element: nextWord, punctuation, isParagraphEnd};
};

const BookDetail: React.FC<BookDetailProps> = ({onBack}) => {
  const {selectedBook} = useContext(AppContext);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', '16px');
  const [idsGenerated, setIdsGenerated] = useState(false);
  const [focusedWordIndex, setFocusedWordIndex] = useState(0);
  const focusedWordIndexRef = useRef(focusedWordIndex);
  const [focusWordPace, setFocusWordPace] = useState(200);
  const sequentialReadingAnimationRef = useRef<number | null>(null);
  const [sequentialReadingEnabled, setSequentialReadingEnabled] = useState(false);
  const [scrollBlock, setScrollBlock] = useState<ScrollBlockOption>("center");

  // toggles the sequential reading mode with space bar
  useEffect(() => {
    const listener = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        const newVal = !sequentialReadingEnabled;
        console.log(`Sequential reading enabled: ${newVal}`);
        setSequentialReadingEnabled(newVal);
      }
    };

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [sequentialReadingEnabled]);


  // animates the sequential reading mode when it is enabled
  useEffect(() => {
    let isMounted = true;

    const animateNextWord = async () => {
      if (!isMounted) return;

      // clear the previous timeout
      clearTimeout(sequentialReadingAnimationRef.current!);

      const focusedWord = document.getElementById(`word-${focusedWordIndexRef.current}`);
      const {element: nextWord, punctuation} = getNextWord(focusedWord);

      const isParagraphEnd = !focusedWord.nextElementSibling;

      if (!nextWord) {
        console.warn('No next word found, stopping sequential reading');
        setSequentialReadingEnabled(false);
        return;
      }

      let delay = focusWordPace;
      if (isParagraphEnd) {
        delay += delayConfig.paragraph;
      } else {
        delay += (delayConfig[punctuation] || delayConfig.default);
      }

      const nextWordId = parseInt(nextWord.id.split('-')[1]);

      await new Promise((resolve) => {
        return setTimeout(resolve, delay);
      })

      nextWord.scrollIntoView({behavior: 'smooth', block: scrollBlock, inline: 'nearest'});
      setFocusedWordIndex(nextWordId);
      focusedWordIndexRef.current = nextWordId;

      if (isMounted) {
        animateNextWord();
      }
    };

    if (sequentialReadingEnabled) {
      animateNextWord();
    } else {
      clearTimeout(sequentialReadingAnimationRef.current!);
    }

    return () => {
      isMounted = false;
      clearTimeout(sequentialReadingAnimationRef.current!);
    };
  }, [focusWordPace, scrollBlock, sequentialReadingEnabled]);


  const contentRef = useRef<HTMLDivElement>();

  const convertWordsToSpans = (children: React.ReactNode) => {
    if (typeof children === 'string') {
      return children.split(' ').map((word, index) => (
        <span key={`word-${index}`}>
        {word}{" "}
      </span>
      ));
    }
    if (Array.isArray(children)) {
      return children.flatMap((child, childIndex) => {
        if (typeof child === 'string') {
          return child.split(' ' as any).map((word, wordIndex) => (
            <span key={`${childIndex}-${wordIndex}`}>
            {word}{" "}
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
      h1: ({children}) => <h1 className="text-2xl font-bold my-4">{convertWordsToSpans(children)}</h1>,
      h2: ({children}) => <h2 className="text-xl font-bold my-4">{convertWordsToSpans(children)}</h2>,
      h3: ({children}) => <h3 className="text-lg font-bold my-4">{convertWordsToSpans(children)}</h3>,
      h4: ({children}) => <h4 className="text-lg font-semibold my-3">{convertWordsToSpans(children)}</h4>,
      h5: ({children}) => <h5 className="text-base font-semibold my-2">{convertWordsToSpans(children)}</h5>,
      h6: ({children}) => <h6 className="text-sm font-semibold my-2">{convertWordsToSpans(children)}</h6>,
      img: ({src, alt}) => <ResourceImage book={selectedBook!} path={src} alt={alt}/>,
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

    Array.from(spans).filter((span) => {
      return !isEmpty(trim(span.textContent));
    }).forEach((span, index) => {
      span.id = `word-${index}`;
    });

    setIdsGenerated(true);
  }, [memoizedChapters]);

  const focusedWordCoords = useMemo(() => {
    const focusedWord = document.getElementById(`word-${focusedWordIndex}`);
    const container = contentRef.current

    if (!focusedWord || !container || !idsGenerated) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();
    const wordRect = focusedWord.getBoundingClientRect();

    return {
      top: wordRect.top - containerRect.top + container.scrollTop,
      left: wordRect.left - containerRect.left + container.scrollLeft,
      width: wordRect.width,
      height: wordRect.height
    };
  }, [focusedWordIndex, idsGenerated]);


  return (
    <div className={twMerge(
      "w-screen h-screen overflow-y-auto overflow-x-hidden relative",
      // !firstWordCoords && 'hidden'
    )}>
      <BookDetailHeader
        title={selectedBook!.title}
        onBack={onBack}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        pace={focusWordPace}
        onChangePace={setFocusWordPace}
        isPlaying={sequentialReadingEnabled}
        onPlayPauseToggle={() => setSequentialReadingEnabled(!sequentialReadingEnabled)}
        scrollBlock={scrollBlock}
        onChangeScrollBlock={setScrollBlock}
      />
      <div
        className={'absolute transition-all duration-100 rounded-md'}
        style={{
          top: focusedWordCoords?.top,
          left: focusedWordCoords?.left - 4,
          width: focusedWordCoords?.width + 8,
          height: focusedWordCoords?.height + 4,
          border: '1px solid red',
        }}
      >

      </div>
      <main className="p-8 flex flex-col gap-8" ref={contentRef as LegacyRef<HTMLDivElement>}>
        {memoizedChapters}
      </main>
    </div>
  );
};


export default React.memo(BookDetail);
