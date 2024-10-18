import { RefObject, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import {idsGeneratedAtom, scrollBlockAtom, wordGroupSizeAtom} from "../state/atoms";
import { getNextWord } from "../lib/textProcessing";

interface UseWordHighlightProps {
  contentRef: RefObject<HTMLDivElement>;
  focusedWordIndex?: number;
}

export const useWordHighlight = ({
  contentRef,
  focusedWordIndex,
}: UseWordHighlightProps) => {
  const wordGroupSize = useAtomValue(wordGroupSizeAtom);
  const scrollBlock = useAtomValue(scrollBlockAtom);
  const idsGenerated = useAtomValue(idsGeneratedAtom);
  const [firstFocusHappened, setFirstFocusHappened] = useState(false);
  const [focusedWordsCoords, setFocusedWordsCoords] = useState<
    Array<{ top: number; left: number; width: number; height: number } | null>
  >([]);

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

      for (let i = 0; i < wordGroupSize; i++) {
        if (currentWord) {
          const wordRect = currentWord.getBoundingClientRect();

          coords.push({
            top: wordRect.top - containerRect.top + container.scrollTop,
            left: wordRect.left - containerRect.left + container.scrollLeft,
            width: wordRect.width,
            height: wordRect.height,
          });

          const { element } = getNextWord(currentWord);
          currentWord = element!;
          currentWord.scrollIntoView({ block: scrollBlock, behavior: firstFocusHappened ? "smooth" : "auto" });
          setFirstFocusHappened(
            coords.filter(Boolean).length === wordGroupSize
          );
        } else {
          console.warn(`Word with index ${focusedWordIndex + i} not found`);
          coords.push(null);
        }
      }

      setFocusedWordsCoords(coords);
    };

    updateCoords();
    window.addEventListener("resize", updateCoords);
    return () => window.removeEventListener("resize", updateCoords);
  }, [focusedWordIndex, contentRef, wordGroupSize, scrollBlock, idsGenerated, firstFocusHappened]);

  return { focusedWordsCoords };
};
