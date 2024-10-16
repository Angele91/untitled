import {useCallback, useEffect, useRef, useState} from "react";
import {delayConfig} from "../lib/constants.ts";
import {getNextWord, getPreviousWord} from "../lib/textProcessing.tsx";
import {useAtom} from "jotai";
import {
  focusWordPaceAtom,
  isPlayingAtom,
  isSequentialReadingEnabledAtom,
  lastReadingPositionsAtom,
  scrollBlockAtom,
  selectedBookAtom,
  wordGroupSizeAtom,
} from "../state/atoms.ts";
import {useAtomValue} from "jotai";

const MANUAL_SPEED_MULTIPLIER = 5; // Increase manual navigation speed
const CONTINUOUS_MOVEMENT_INTERVAL = 50; // Decrease interval for faster continuous movement

export const useSequentialReading = () => {
  const selectedBook = useAtomValue(selectedBookAtom);
  const scrollBlock = useAtomValue(scrollBlockAtom);
  const focusWordPace = useAtomValue(focusWordPaceAtom);
  const wordGroupSize = useAtomValue(wordGroupSizeAtom);
  const [readingPositions, setReadingPositions] = useAtom(lastReadingPositionsAtom);

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

    const animateNextWordGroup = async () => {
      if (!isMounted) return;

      clearTimeout(sequentialReadingAnimationRef.current!);

      const currentWord = document.getElementById(
        `word-${focusedWordIndexRef.current}`
      );
      let nextWord = currentWord;
      let isParagraphEnd = false;
      let maxPunctuation = "";
      let totalDelay = 0;

      for (let i = 0; i < wordGroupSize; i++) {
        const {
          element,
          punctuation,
          isParagraphEnd: isEnd,
        } = getNextWord(nextWord);
        if (!element) break;
        nextWord = element;
        isParagraphEnd = isParagraphEnd || isEnd;
        if (
          delayConfig[punctuation as keyof typeof delayConfig] >
          delayConfig[maxPunctuation as keyof typeof delayConfig]
        ) {
          maxPunctuation = punctuation;
        }

        const wordDelay =
          focusWordPace +
          (isEnd
            ? delayConfig.paragraph
            : delayConfig[punctuation as keyof typeof delayConfig] ||
            delayConfig.default);
        totalDelay += wordDelay;
      }

      if (nextWord === currentWord || !nextWord) {
        console.warn("No next word found, stopping sequential reading");
        setIsPlaying(false);
        return;
      }

      // Use the total delay for the entire word group
      await new Promise((resolve) => setTimeout(resolve, totalDelay));

      nextWord.scrollIntoView({
        behavior: "smooth",
        block: scrollBlock,
        inline: "nearest",
      });
      const nextWordId = parseInt(nextWord.id.split("-")[1]);
      setFocusedWordIndex(nextWordId);
      focusedWordIndexRef.current = nextWordId;

      if (isMounted) {
        animateNextWordGroup();
      }
    };

    if (isPlaying && sequentialReadingEnabled) {
      console.debug("Starting sequential reading");
      animateNextWordGroup();
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
    wordGroupSize,
  ]);

  const startReadingFrom = useCallback(
    (wordIndex: number) => {
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
    },
    [selectedBook, setIsPlaying, setReadingPositions]
  );

  const moveWord = useCallback(
    (direction: "forward" | "backward", steps: number = 1) => {
      if (!selectedBook) return;

      const currentWord = document.getElementById(
        `word-${focusedWordIndexRef.current}`
      );
      let newWord = currentWord;

      for (let i = 0; i < steps * wordGroupSize; i++) {
        const {element: nextWord} =
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
    [scrollBlock, selectedBook, setReadingPositions, wordGroupSize]
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
        clearInterval(continuousMovementRef.current!);
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
      clearInterval(continuousMovementRef.current!);
      continuousMovementRef.current = null;
    }
  }, []);

  const getCurrentWordGroup = useCallback(
    (size: number) => {
      const words: string[] = [];
      let currentWord = document.getElementById(`word-${focusedWordIndex}`);

      for (let i = 0; i < size; i++) {
        if (currentWord) {
          words.push(currentWord.textContent || "");
          const {element} = getNextWord(currentWord);
          currentWord = element as HTMLElement;
        } else {
          break;
        }
      }

      return words.join(" ");
    },
    [focusedWordIndex]
  );

  // restore the readingPosition when the book is changed
  useEffect(() => {
    if (selectedBook) {
      const newWordIndex = readingPositions[selectedBook.id] || 0;
      setFocusedWordIndex(newWordIndex);
      focusedWordIndexRef.current = newWordIndex;
    }
  }, [selectedBook, readingPositions, scrollBlock]);

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
    wordGroupSize,
    getCurrentWordGroup,
  };
};
