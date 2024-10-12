import React, {LegacyRef, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import ResourceImage from "./resource-image.tsx";
import { AppContext } from "../App.tsx";
import BookDetailHeader from "./book-detail-header.tsx";
import { MemoizedMarkdown } from "./memoized-markdown.tsx";
import {useLocalStorage} from "usehooks-ts";

interface Highlight {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  color: string;
}

interface BookDetailProps {
  onBack: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ onBack }) => {
  const { selectedBook } = useContext(AppContext);
  const [showHeader, setShowHeader] = useState(true);
  const [fontSize, setFontSize] = useLocalStorage('reading-font-size', '24px');
  const [openOptionId, setOpenOptionId] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const lastScrollTop = useRef(0);
  const contentRef = useRef<HTMLDivElement>();

  const handleFontSizeChange = useCallback((newSize: string) => {
    setFontSize(newSize);
  }, [setFontSize]);

  const handleScroll = useCallback(() => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScrollTop.current) {
      setShowHeader(false);
      setOpenOptionId(null);
    } else if (st < lastScrollTop.current) {
      setShowHeader(true);
    }
    lastScrollTop.current = st <= 0 ? 0 : st;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const headerElement = document.querySelector('header');
    if (headerElement && headerElement.contains(e.target as Node)) {
      return;
    }

    if (e.clientY < 20) {
      setShowHeader(true);
    } else if (e.clientY > 100) {
      setShowHeader(false);
      setOpenOptionId(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  const handleHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && contentRef.current) {
      const range = selection.getRangeAt(0);
      const startOffset = getTextOffset(contentRef.current!, range.startContainer, range.startOffset);
      const endOffset = getTextOffset(contentRef.current!, range.endContainer, range.endOffset);

      const newHighlight: Highlight = {
        id: Date.now().toString(),
        text: range.toString(),
        startOffset,
        endOffset,
        color: 'yellow',
      };

      setHighlights(prev => [...prev, newHighlight]);
      applyHighlight(newHighlight);
      selection.removeAllRanges();
    }
  }, []);

  const removeHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    const span = document.querySelector(`[data-highlight-id="${id}"]`);
    if (span) {
      const parent = span.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(span.textContent || ''), span);
        parent.normalize();
      }
    }
  }, []);

  const applyHighlights = useCallback(() => {
    if (!contentRef.current) return;

    highlights.forEach(highlight => {
      applyHighlight(highlight);
    });
  }, [highlights]);

  useEffect(() => {
    applyHighlights();
  }, [applyHighlights]);

  const markdownOptions = useMemo(() => ({
    wrapper: 'article',
    overrides: {
      h1: ({ children }) => <h1 className="text-2xl font-bold my-4">{children}</h1>,
      h2: ({ children }) => <h2 className="text-xl font-bold my-4">{children}</h2>,
      h3: ({ children }) => <h3 className="text-lg font-bold my-4">{children}</h3>,
      img: ({ src, alt }) => <ResourceImage book={selectedBook!} path={src} alt={alt} />,
      p: ({ children }) => (
        <p
          className="my-4"
          style={{ fontSize }}
          onMouseUp={handleHighlight}
        >
          {children}
        </p>
      ),
      a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="underline text-blue-500">{children}</a>,
    },
  }), [selectedBook, fontSize, handleHighlight]);

  const memoizedChapters = useMemo(() =>
      selectedBook!.chapters.map((chapter, index) => (
        <MemoizedMarkdown
          key={`chapter-${index}`}
          content={chapter.mdContent}
          options={markdownOptions}
        />
      )),
    [selectedBook, markdownOptions]
  );

  return (
    <div className="w-screen h-screen overflow-y-auto overflow-x-hidden relative">
      <BookDetailHeader
        title={selectedBook!.title}
        onBack={onBack}
        showHeader={showHeader}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        openOptionId={openOptionId}
        setOpenOptionId={setOpenOptionId}
      />
      <main className="p-8 flex flex-col gap-8 mt-16" ref={contentRef as LegacyRef<HTMLDivElement>}>
        {memoizedChapters}
      </main>
      <HighlightsList highlights={highlights} onRemove={removeHighlight} />
    </div>
  );
};

const HighlightsList: React.FC<{ highlights: Highlight[], onRemove: (id: string) => void }> = ({ highlights, onRemove }) => (
  <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-y-auto">
    <h3 className="text-lg font-bold mb-2">Highlights</h3>
    <ul className="list-disc pl-5">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="mb-2 flex justify-between items-center">
          <span style={{ backgroundColor: highlight.color }}>{highlight.text}</span>
          <button onClick={() => onRemove(highlight.id)} className="ml-2 text-red-500">Remove</button>
        </li>
      ))}
    </ul>
  </div>
);

function getTextOffset(root: Node, node: Node, offset: number): number {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let currentOffset = 0;

  while (walker.nextNode()) {
    if (walker.currentNode === node) {
      return currentOffset + offset;
    }
    currentOffset += walker.currentNode.textContent?.length || 0;
  }

  return -1;
}

function applyHighlight(highlight: Highlight) {
  const content = document.querySelector('main');
  if (!content) return;

  const range = document.createRange();
  const startPos = getTextNodeAndOffset(content, highlight.startOffset);
  const endPos = getTextNodeAndOffset(content, highlight.endOffset);

  if (startPos && endPos) {
    range.setStart(startPos.node, startPos.offset);
    range.setEnd(endPos.node, endPos.offset);

    const span = document.createElement('span');
    span.style.backgroundColor = highlight.color;
    span.dataset.highlightId = highlight.id;
    range.surroundContents(span);
  }
}

function getTextNodeAndOffset(root: Node, targetOffset: number): { node: Node, offset: number } | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let currentOffset = 0;

  while (walker.nextNode()) {
    const nodeLength = walker.currentNode.textContent?.length || 0;
    if (currentOffset + nodeLength > targetOffset) {
      return {
        node: walker.currentNode,
        offset: targetOffset - currentOffset
      };
    }
    currentOffset += nodeLength;
  }

  return null;
}

export default React.memo(BookDetail);
