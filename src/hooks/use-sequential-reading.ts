import { useCallback, useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import EasySpeech from "easy-speech";
import { delayConfig } from "../lib/constants";
import { getNextWord, getPreviousWord } from "../lib/textProcessing";
import {
  focusWordPaceAtom,
  isPlayingAtom,
  isSequentialReadingEnabledAtom,
  lastReadingPositionsAtom,
  scrollBlockAtom,
  wordGroupSizeAtom,
  currentChapterIndexAtom,
  idsGeneratedAtom,
  isSearchModeAtom,
  textToSpeechEnabledAtom,
  isReadWholeSentencesAtom,
  store,
} from "../state/atoms";
import { useSelectedBook } from "./use-selected-book";
import { getCurrentSentence, initializeSpeech, speakText } from "../lib/speech";
import { smoothScroll } from "../lib/dom";

const MANUAL_SPEED_MULTIPLIER = 1;
const CONTINUOUS_MOVEMENT_INTERVAL = 50;

export const useSequentialReading = () => {
  const selectedBook = useSelectedBook();
  const isSearchMode = useAtomValue(isSearchModeAtom, {
    store: store,
  });
  const scrollBlock = useAtomValue(scrollBlockAtom, {
    store: store,
  });
  const focusWordPace = useAtomValue(focusWordPaceAtom, {
    store: store,
  });
  const wordGroupSize = useAtomValue(wordGroupSizeAtom, {
    store: store,
  });
  const [readingPositions, setReadingPositions] = useAtom(
    lastReadingPositionsAtom,
    {
      store: store,
    }
  );
  const [currentChapterIndex, setCurrentChapterIndex] = useAtom(
    currentChapterIndexAtom,
    {
      store: store,
    }
  );
  const [sequentialReadingEnabled, setSequentialReadingEnabled] = useAtom(
    isSequentialReadingEnabledAtom,
    {
      store: store,
    }
  );

  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom, {
    store: store,
  });

  const idsGenerated = useAtomValue(idsGeneratedAtom, {
    store: store,
  });

  const textToSpeechEnabled = useAtomValue(textToSpeechEnabledAtom, {
    store: store,
  });

  const isReadWholeSentence = useAtomValue(isReadWholeSentencesAtom, {
    store: store,
  });

  const [focusedWordIndex, setFocusedWordIndex] = useState<number | undefined>(
    undefined
  );

  const focusedWordIndexRef = useRef(focusedWordIndex);
  const sequentialReadingAnimationRef = useRef<number | null>(null);
  const continuousMovementRef = useRef<number | null>(null);

  useEffect(() => {
    initializeSpeech().catch(console.error);
  }, []);

  const togglePlaying = useCallback(() => {
    if (!selectedBook) {
      console.warn("No book selected, cannot toggle playing state");
      return;
    }

    setIsPlaying((prev) => {
      const newVal = !prev;
      if (!newVal) {
        setReadingPositions((prev) => ({
          ...prev,
          [selectedBook.id]: focusedWordIndexRef.current || 0,
        }));
      }
      if (textToSpeechEnabled) {
        EasySpeech.cancel();
      }
      return newVal;
    });
  }, [selectedBook, setIsPlaying, setReadingPositions, textToSpeechEnabled]);

  useEffect(() => {
    if (isSearchMode) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        togglePlaying();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [togglePlaying, isSearchMode]);

  useEffect(() => {
    let isMounted = true;

    const animateNextWordGroup = async () => {
      if (!isMounted) return;

      cancelAnimationFrame(sequentialReadingAnimationRef.current!);

      const currentWord = document.getElementById(
        `word-${focusedWordIndexRef.current}`
      );
      if (!currentWord) {
        setIsPlaying(false);
        return;
      }

      let nextElement;
      let totalDelay = focusWordPace;

      if (isReadWholeSentence) {
        const { lastElement, text } = getCurrentSentence(currentWord);

        if (textToSpeechEnabled) {
          try {
            await speakText(text);
            const { element } = getNextWord(lastElement);
            nextElement = element;
          } catch (error) {
            console.error("Speech failed:", error);
            setIsPlaying(false);
            return;
          }
        } else {
          totalDelay += delayConfig.sentence;
          const { element } = getNextWord(lastElement);
          nextElement = element;
        }
      } else {
        let currentElement = currentWord;
        for (let i = 0; i < wordGroupSize; i++) {
          const { element, punctuation, isParagraphEnd } =
            getNextWord(currentElement);
          if (!element) break;
          currentElement = element;
          const wordDelay = isParagraphEnd
            ? delayConfig.paragraph
            : delayConfig[punctuation as keyof typeof delayConfig] ||
              delayConfig.default;
          totalDelay += wordDelay;
        }
        nextElement = currentElement;
      }

      if (!nextElement || nextElement === currentWord) {
        console.warn("No next word found, stopping sequential reading");
        setIsPlaying(false);
        return;
      }

      const startTime = performance.now();

      const animate = (currentTime: number) => {
        if (currentTime - startTime >= totalDelay) {
          console.debug(`Scrolling into view to word ${nextElement.id}`);
          smoothScroll(nextElement, scrollBlock);

          const nextWordId = parseInt(nextElement.id.split("-")[1]);
          setFocusedWordIndex(nextWordId);
          focusedWordIndexRef.current = nextWordId;

          if (isMounted) {
            sequentialReadingAnimationRef.current =
              requestAnimationFrame(animateNextWordGroup);
          }
        } else {
          sequentialReadingAnimationRef.current =
            requestAnimationFrame(animate);
        }
      };

      sequentialReadingAnimationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying && sequentialReadingEnabled) {
      animateNextWordGroup();
    } else if (sequentialReadingAnimationRef.current) {
      cancelAnimationFrame(sequentialReadingAnimationRef.current);
    }

    return () => {
      isMounted = false;
      if (sequentialReadingAnimationRef.current) {
        cancelAnimationFrame(sequentialReadingAnimationRef.current);
      }
    };
  }, [
    focusWordPace,
    scrollBlock,
    isPlaying,
    sequentialReadingEnabled,
    setIsPlaying,
    wordGroupSize,
    isReadWholeSentence,
    textToSpeechEnabled,
  ]);

  const resetReadingPosition = useCallback(
    (chapterIndex: number) => {
      if (!selectedBook) {
        console.warn("No book selected, cannot reset reading position");
        return;
      }

      const chapterElement = document.getElementById(
        `chapter-${chapterIndex + 1}`
      );

      if (chapterElement) {
        const firstWordElement =
          chapterElement.nextElementSibling?.querySelector('[id^="word-"]');
        if (firstWordElement) {
          const wordIndex = parseInt(firstWordElement.id.split("-")[1]);
          setFocusedWordIndex(wordIndex);
          focusedWordIndexRef.current = wordIndex;
          setCurrentChapterIndex(chapterIndex);

          setReadingPositions((prev) => ({
            ...prev,
            [selectedBook.id]: wordIndex,
          }));

          console.debug(`Scrolling into view to chapter ${chapterIndex + 1}`);

          smoothScroll(firstWordElement, scrollBlock);
        }
      }
    },
    [selectedBook, setCurrentChapterIndex, setReadingPositions, scrollBlock]
  );

  const startReadingFrom = useCallback(
    (wordIndex: number, chapterIndex?: number) => {
      if (!selectedBook) {
        console.warn("No book selected, cannot start reading from word");
        return;
      }

      if (chapterIndex !== undefined) {
        resetReadingPosition(chapterIndex);
      } else {
        setFocusedWordIndex(wordIndex);
        focusedWordIndexRef.current = wordIndex;

        setReadingPositions((prev) => ({
          ...prev,
          [selectedBook.id]: wordIndex,
        }));
      }

      setIsPlaying(true);
    },
    [selectedBook, setIsPlaying, setReadingPositions, resetReadingPosition]
  );

  const moveWord = useCallback(
    (direction: "forward" | "backward", steps: number = 1) => {
      if (!selectedBook) return;

      const currentWord = document.getElementById(
        `word-${focusedWordIndexRef.current}`
      );
      if (!currentWord) return;

      let newWord = currentWord;

      if (isReadWholeSentence) {
        for (let i = 0; i < steps; i++) {
          if (direction === "forward") {
            const { lastElement } = getCurrentSentence(newWord);
            const { element } = getNextWord(lastElement);
            if (element) {
              newWord = element;
            } else {
              break;
            }
          } else {
            // Backward movement
            const { firstElement } = getCurrentSentence(newWord);
            const { element } = getPreviousWord(firstElement);
            if (element) {
              const { firstElement: prevSentenceStart } =
                getCurrentSentence(element);
              newWord = prevSentenceStart;
            } else {
              break;
            }
          }
        }
      } else {
        for (let i = 0; i < steps * wordGroupSize; i++) {
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
      }

      if (newWord && newWord !== currentWord) {
        const newWordId = parseInt(newWord.id.split("-")[1]);
        setFocusedWordIndex(newWordId);
        focusedWordIndexRef.current = newWordId;

        console.debug(`Scrolling into view to word ${newWord.id}`);
        smoothScroll(newWord, scrollBlock);

        setReadingPositions((prev) => ({
          ...prev,
          [selectedBook.id]: newWordId,
        }));
      }
    },
    [
      scrollBlock,
      selectedBook,
      setReadingPositions,
      wordGroupSize,
      isReadWholeSentence,
    ]
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
      move();
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

  const getCurrentWordGroup = useCallback(() => {
    const currentWord = document.getElementById(`word-${focusedWordIndex}`);
    if (!currentWord) return "";

    if (isReadWholeSentence) {
      const { text } = getCurrentSentence(currentWord);
      return text;
    } else {
      const words: string[] = [];
      let currentElement = currentWord;

      for (let i = 0; i < wordGroupSize; i++) {
        if (currentElement) {
          words.push(currentElement.textContent || "");
          const { element } = getNextWord(currentElement);
          currentElement = element as HTMLElement;
        } else {
          break;
        }
      }

      return words.join(" ");
    }
  }, [focusedWordIndex, wordGroupSize, isReadWholeSentence]);

  useEffect(() => {
    if (selectedBook && idsGenerated) {
      const newWordIndex = readingPositions[selectedBook.id] || 0;
      setFocusedWordIndex(newWordIndex);
      focusedWordIndexRef.current = newWordIndex;
    }
  }, [selectedBook, readingPositions, idsGenerated]);

  return {
    focusedWordIndex,
    sequentialReadingEnabled,
    setSequentialReadingEnabled,
    togglePlaying,
    startReadingFrom,
    resetReadingPosition,
    isPlaying,
    goAhead,
    goBackwards,
    startContinuousMovement,
    stopContinuousMovement,
    wordGroupSize,
    getCurrentWordGroup,
    currentChapterIndex,
  };
};
