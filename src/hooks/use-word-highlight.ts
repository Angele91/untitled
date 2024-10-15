import {RefObject, useEffect, useState} from 'react';

interface UseWordHighlightProps {
  contentRef: RefObject<HTMLDivElement>;
  focusedWordIndex: number;
}

export const useWordHighlight = ({contentRef, focusedWordIndex}: UseWordHighlightProps) => {
  const [focusedWordCoords, setFocusedWordCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const updateCoords = () => {
      const focusedWord = document.getElementById(`word-${focusedWordIndex}`);
      const container = contentRef.current;

      if (!focusedWord || !container) {
        setFocusedWordCoords(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const wordRect = focusedWord.getBoundingClientRect();

      setFocusedWordCoords({
        top: wordRect.top - containerRect.top + container.scrollTop,
        left: wordRect.left - containerRect.left + container.scrollLeft,
        width: wordRect.width,
        height: wordRect.height
      });
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [focusedWordIndex, contentRef]);

  return { focusedWordCoords };
};
