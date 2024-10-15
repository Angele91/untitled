import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {delayConfig} from "../lib/constants.ts";
import {getNextWord} from "../lib/textProcessing.tsx";
import {useAtom} from "jotai";
import {
  focusWordPaceAtom,
  isPlayingAtom,
  isSequentialReadingEnabledAtom,
  lastReadingPositionsAtom,
  scrollBlockAtom, selectedBookAtom
} from "../state/atoms.ts";
import {useAtomValue} from "jotai";

export const useSequentialReading = () => {
  const selectedBook = useAtomValue(selectedBookAtom);
  const scrollBlock = useAtomValue(scrollBlockAtom);
  const focusWordPace = useAtomValue(focusWordPaceAtom);
  const [readingPositions, setReadingPositions] = useAtom(lastReadingPositionsAtom);

  const [
    sequentialReadingEnabled,
    setSequentialReadingEnabled
  ] = useAtom(isSequentialReadingEnabledAtom)

  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom)

  const [focusedWordIndex, setFocusedWordIndex] = useState(0);

  const focusedWordIndexRef = useRef(focusedWordIndex);
  const sequentialReadingAnimationRef = useRef<number | null>(null);

  const togglePlaying = useCallback(() => {
    console.debug('Toggling playing state');
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
      if (e.key === ' ') {
        e.preventDefault();
        togglePlaying();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // sequential reading animation
  useEffect(() => {
    let isMounted = true;

    const animateNextWord = async () => {
      if (!isMounted) return;

      clearTimeout(sequentialReadingAnimationRef.current!);

      const focusedWord = document.getElementById(`word-${focusedWordIndexRef.current}`);
      const {element: nextWord, punctuation, isParagraphEnd} = getNextWord(focusedWord);

      if (!nextWord) {
        console.warn('No next word found, stopping sequential reading');
        setIsPlaying(false);
        return;
      }

      const delayForPunctuation = delayConfig[punctuation as keyof typeof delayConfig];
      const delay = focusWordPace + (isParagraphEnd ? delayConfig.paragraph : (delayForPunctuation || delayConfig.default));

      const nextWordId = parseInt(nextWord.id.split('-')[1]);

      await new Promise((resolve) => setTimeout(resolve, delay));

      nextWord.scrollIntoView({behavior: 'smooth', block: scrollBlock, inline: 'nearest'});
      setFocusedWordIndex(nextWordId);
      focusedWordIndexRef.current = nextWordId;

      if (isMounted) {
        animateNextWord();
      }
    };

    if (isPlaying && sequentialReadingEnabled) {
      console.debug('Starting sequential reading');
      animateNextWord();
    } else {
      console.debug('Stopping sequential reading');
      clearTimeout(sequentialReadingAnimationRef.current!);
    }

    return () => {
      isMounted = false;
      clearTimeout(sequentialReadingAnimationRef.current!);
    };
  }, [focusWordPace, scrollBlock, isPlaying, sequentialReadingEnabled]);

  // restores the last reading position when the component is mounted
  useEffect(() => {
    const lastReadingPosition = readingPositions[selectedBook.id]
    if (lastReadingPosition) {
      setFocusedWordIndex(lastReadingPosition)
    }
  }, [
    selectedBook.id,
    readingPositions
  ]);

  const startReadingFrom = (wordIndex: number) => {
    setFocusedWordIndex(wordIndex);
    setIsPlaying(true);
    focusedWordIndexRef.current = wordIndex;

    setReadingPositions((prev) => ({
      ...prev,
      [selectedBook.id]: wordIndex,
    }));
  }

  return {
    focusedWordIndex,
    sequentialReadingEnabled,
    setSequentialReadingEnabled,
    togglePlaying,
    startReadingFrom,
    isPlaying,
  };
};
