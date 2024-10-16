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

const MANUAL_SPEED_MULTIPLIER = 5; // Increase manual navigation speed
const CONTINUOUS_MOVEMENT_INTERVAL = 50; // Decrease interval for faster continuous movement

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
  const continuousMovementRef = useRef<number | null>(null);

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
  }, [selectedBook, setIsPlaying, setReadingPositions]);

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
  }, [togglePlaying]);

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
  }, [
    focusWordPace,
    scrollBlock,
    isPlaying,
    sequentialReadingEnabled,
    setIsPlaying,
  ]);

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

  const moveWord = useCallback(
    (direction: "forward" | "backward", steps: number = 1) => {
      if (!selectedBook) return;

      const currentWord = document.getElementById(
        `word-${focusedWordIndexRef.current}`
      );
      let newWord = currentWord;

      for (let i = 0; i < steps; i++) {
        const { element: nextWord } =
          direction === "forward"
            ? getNextWord(newWord)
            : getPreviousWord(newWord);
        if (nextWord) {
          newWord = nextWord;
        } else {
          break;
        }
      }

      if (newWord && newWord !== currentWord) {
        const newWordId = parseInt(newWord.id.split("-")[1]);
        setFocusedWordIndex(newWordId);
        focusedWordIndexRef.current = newWordId;
        newWord.scrollIntoView({
          behavior: "smooth",
          block: scrollBlock,
          inline: "nearest",
        });

        setReadingPositions((prev) => ({
          ...prev,
          [selectedBook.id]: newWordId,
        }));
      }
    },
    [scrollBlock, selectedBook, setReadingPositions]
  );

  const goAhead = useCallback(() => {
    setIsPlaying(false);
    moveWord("forward", MANUAL_SPEED_MULTIPLIER);
  }, [moveWord, setIsPlaying]);

  const goBackwards = useCallback(() => {
    setIsPlaying(false);
    moveWord("backward", MANUAL_SPEED_MULTIPLIER);
  }, [moveWord, setIsPlaying]);

  const startContinuousMovement = useCallback(
    (direction: "forward" | "backward") => {
      setIsPlaying(false);
      if (continuousMovementRef.current) {
        clearInterval(continuousMovementRef.current);
      }

      const move = () => moveWord(direction, MANUAL_SPEED_MULTIPLIER);
      move(); // Move immediately on button press
      continuousMovementRef.current = window.setInterval(
        move,
        CONTINUOUS_MOVEMENT_INTERVAL
      );
    },
    [moveWord, setIsPlaying]
  );

  const stopContinuousMovement = useCallback(() => {
    if (continuousMovementRef.current) {
      clearInterval(continuousMovementRef.current);
      continuousMovementRef.current = null;
    }
  }, []);

  return {
    focusedWordIndex,
    sequentialReadingEnabled,
    setSequentialReadingEnabled,
    togglePlaying,
    startReadingFrom,
    isPlaying,
    goAhead,
    goBackwards,
    startContinuousMovement,
    stopContinuousMovement,
  };
};
