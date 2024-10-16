import { useCallback, useEffect, useRef, useState } from "react";
import { delayConfig } from "../lib/constants.ts";
import { getNextWord, getPreviousWord } from "../lib/textProcessing.tsx";
import { useAtom } from "jotai";
import {
  focusWordPaceAtom,
  isPlayingAtom,
  isSequentialReadingEnabledAtom,
  lastReadingPositionsAtom,
  scrollBlockAtom,
  selectedBookAtom,
} from "../state/atoms.ts";
import { useAtomValue } from "jotai";

export const useSequentialReading = () => {
  const selectedBook = useAtomValue(selectedBookAtom);
  const scrollBlock = useAtomValue(scrollBlockAtom);
  const focusWordPace = useAtomValue(focusWordPaceAtom);
  const [readingPositions, setReadingPositions] = useAtom(
    lastReadingPositionsAtom
  );

  const [sequentialReadingEnabled, setSequentialReadingEnabled] = useAtom(
    isSequentialReadingEnabledAtom
  );

  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);

  const [focusedWordIndex, setFocusedWordIndex] = useState(0);

  const focusedWordIndexRef = useRef(focusedWordIndex);
  const sequentialReadingAnimationRef = useRef<number | null>(null);

  const togglePlaying = useCallback(() => {
    if (!selectedBook) {
      console.warn("No book selected, cannot toggle playing state");
      return;
    }
    console.debug("Toggling playing state");
    setIsPlaying((prev) => {
      const newVal = !prev;

      if (!newVal) {
        // save the current reading position
        setReadingPositions((prev) => ({
          ...prev,
          [selectedBook.id]: focusedWordIndexRef.current,
        }));
      }

      return newVal;
    });
  }, []);

  // enables/disables playing when space bar is pressed
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        togglePlaying();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // sequential reading animation
  useEffect(() => {
    let isMounted = true;

    const animateNextWord = async () => {
      if (!isMounted) return;

      clearTimeout(sequentialReadingAnimationRef.current!);

      const focusedWord = document.getElementById(
        `word-${focusedWordIndexRef.current}`
      );
      const {
        element: nextWord,
        punctuation,
        isParagraphEnd,
      } = getNextWord(focusedWord);

      if (!nextWord) {
        console.warn("No next word found, stopping sequential reading");
        setIsPlaying(false);
        return;
      }

      const delayForPunctuation =
        delayConfig[punctuation as keyof typeof delayConfig];
      const delay =
        focusWordPace +
        (isParagraphEnd
          ? delayConfig.paragraph
          : delayForPunctuation || delayConfig.default);

      const nextWordId = parseInt(nextWord.id.split("-")[1]);

      await new Promise((resolve) => setTimeout(resolve, delay));

      nextWord.scrollIntoView({
        behavior: "smooth",
        block: scrollBlock,
        inline: "nearest",
      });
      setFocusedWordIndex(nextWordId);
      focusedWordIndexRef.current = nextWordId;

      if (isMounted) {
        animateNextWord();
      }
    };

    if (isPlaying && sequentialReadingEnabled) {
      console.debug("Starting sequential reading");
      animateNextWord();
    } else {
      console.debug("Stopping sequential reading");
      clearTimeout(sequentialReadingAnimationRef.current!);
    }

    return () => {
      isMounted = false;
      clearTimeout(sequentialReadingAnimationRef.current!);
    };
  }, [focusWordPace, scrollBlock, isPlaying, sequentialReadingEnabled]);

  // restores the last reading position when the component is mounted
  useEffect(() => {
    if (!selectedBook) return;
    const lastReadingPosition = readingPositions[selectedBook.id];
    if (lastReadingPosition) {
      setFocusedWordIndex(lastReadingPosition);
      focusedWordIndexRef.current = lastReadingPosition;
    } else {
      setFocusedWordIndex(0);
      focusedWordIndexRef.current = 0;
    }
  }, [selectedBook?.id, readingPositions]);

  // on mount, scrolls into view the focused word
  useEffect(() => {
    const focusedWord = document.getElementById(`word-${focusedWordIndex}`);
    focusedWord?.scrollIntoView({
      behavior: "smooth",
      block: scrollBlock,
      inline: "nearest",
    });
  }, [focusedWordIndex, scrollBlock]);

  const startReadingFrom = (wordIndex: number) => {
    if (!selectedBook) {
      console.warn("No book selected, cannot start reading from word");
      return;
    }

    setFocusedWordIndex(wordIndex);
    setIsPlaying(true);
    focusedWordIndexRef.current = wordIndex;

    setReadingPositions((prev) => ({
      ...prev,
      [selectedBook.id]: wordIndex,
    }));
  };

  const goAhead = useCallback(() => {
    const focusedWord = document.getElementById(
      `word-${focusedWordIndexRef.current}`
    );
    const { element: nextWord } = getNextWord(focusedWord);
    if (nextWord) {
      const nextWordId = parseInt(nextWord.id.split("-")[1]);
      setFocusedWordIndex(nextWordId);
      focusedWordIndexRef.current = nextWordId;
      nextWord.scrollIntoView({
        behavior: "smooth",
        block: scrollBlock,
        inline: "nearest",
      });
    }
  }, [scrollBlock]);

  const goBackwards = useCallback(() => {
    const focusedWord = document.getElementById(
      `word-${focusedWordIndexRef.current}`
    );
    const { element: previousWord } = getPreviousWord(focusedWord);
    if (previousWord) {
      const previousWordId = parseInt(previousWord.id.split("-")[1]);
      setFocusedWordIndex(previousWordId);
      focusedWordIndexRef.current = previousWordId;
      previousWord.scrollIntoView({
        behavior: "smooth",
        block: scrollBlock,
        inline: "nearest",
      });
    }
  }, [scrollBlock]);

  return {
    focusedWordIndex,
    sequentialReadingEnabled,
    setSequentialReadingEnabled,
    togglePlaying,
    startReadingFrom,
    isPlaying,
    goAhead,
    goBackwards,
  };
};
