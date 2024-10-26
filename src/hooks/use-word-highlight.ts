import { RefObject, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import {
  idsGeneratedAtom,
  isReadWholeSentencesAtom,
  scrollBlockAtom,
  store,
  wordGroupSizeAtom,
} from "../state/atoms";
import { getNextWord } from "../lib/textProcessing";
import { getCurrentSentence } from "../lib/speech";
import { smoothScroll } from "../lib/dom";

interface UseWordHighlightProps {
  contentRef: RefObject<HTMLDivElement>;
  focusedWordIndex?: number;
}

export const useWordHighlight = ({
  contentRef,
  focusedWordIndex,
}: UseWordHighlightProps) => {
  const wordGroupSize = useAtomValue(wordGroupSizeAtom, {
    store: store,
  });
  const scrollBlock = useAtomValue(scrollBlockAtom, {
    store: store,
  });
  const idsGenerated = useAtomValue(idsGeneratedAtom, {
    store: store,
  });
  const [firstFocusHappened, setFirstFocusHappened] = useState(false);
  const [focusedWordsCoords, setFocusedWordsCoords] = useState<
    Array<{ top: number; left: number; width: number; height: number } | null>
  >([]);

  const isReadWholeSentenceEnabled = useAtomValue(isReadWholeSentencesAtom, {
    store: store,
  });

  useEffect(() => {
    if (!idsGenerated || !focusedWordIndex) return;

    const updateCoords = () => {
      const container = contentRef.current;

      if (!container) {
        setFocusedWordsCoords([]);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const coords: Array<{
        top: number;
        left: number;
        width: number;
        height: number;
      } | null> = [];

      let currentWord = document.getElementById(`word-${focusedWordIndex}`);

      if (!currentWord) return;

      const wordsToHighlight = isReadWholeSentenceEnabled
        ? getCurrentSentence(currentWord).words
        : Array(wordGroupSize)
            .fill(null)
            .map((_, i) => {
              if (i === 0) return currentWord;
              const { element } = getNextWord(currentWord!);
              currentWord = element!;
              return element;
            })
            .filter(Boolean);

      wordsToHighlight.forEach((word) => {
        if (word) {
          const wordRect = word.getBoundingClientRect();
          coords.push({
            top: wordRect.top - containerRect.top + container.scrollTop,
            left: wordRect.left - containerRect.left + container.scrollLeft,
            width: wordRect.width,
            height: wordRect.height,
          });
        } else {
          coords.push(null);
        }
      });

      setFocusedWordsCoords(coords);

      const lastWord = wordsToHighlight[wordsToHighlight.length - 1];
      if (lastWord && !firstFocusHappened) {
        console.debug("Scrolling into view to focused word");
        smoothScroll(lastWord, scrollBlock);
        setFirstFocusHappened(true);
      }
    };

    updateCoords();
    window.addEventListener("resize", updateCoords);
    return () => window.removeEventListener("resize", updateCoords);
  }, [
    focusedWordIndex,
    contentRef,
    wordGroupSize,
    scrollBlock,
    idsGenerated,
    firstFocusHappened,
    isReadWholeSentenceEnabled,
  ]);

  return { focusedWordsCoords };
};
