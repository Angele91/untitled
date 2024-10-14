import {useEffect, useMemo, useRef, useState} from 'react';
import {ScrollBlockOption} from "../components/scroll-block-selector.tsx";
import {delayConfig} from "../lib/constants.ts";
import {getNextWord} from "../lib/textProcessing.tsx";

export const useSequentialReading = (
  focusWordPace: number,
  scrollBlock: ScrollBlockOption
) => {
  const [focusedWordIndex, setFocusedWordIndex] = useState(0);
  const focusedWordIndexRef = useRef(focusedWordIndex);
  const [sequentialReadingEnabled, setSequentialReadingEnabled] = useState(false);
  const sequentialReadingAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        toggleSequentialReading();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const animateNextWord = async () => {
      if (!isMounted) return;

      clearTimeout(sequentialReadingAnimationRef.current!);

      const focusedWord = document.getElementById(`word-${focusedWordIndexRef.current}`);
      const { element: nextWord, punctuation, isParagraphEnd } = getNextWord(focusedWord);

      if (!nextWord) {
        console.warn('No next word found, stopping sequential reading');
        setSequentialReadingEnabled(false);
        return;
      }

      const delayForPunctuation = delayConfig[punctuation as keyof typeof delayConfig];
      const delay = focusWordPace + (isParagraphEnd ? delayConfig.paragraph : (delayForPunctuation || delayConfig.default));

      const nextWordId = parseInt(nextWord.id.split('-')[1]);

      await new Promise((resolve) => setTimeout(resolve, delay));

      nextWord.scrollIntoView({ behavior: 'smooth', block: scrollBlock, inline: 'nearest' });
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

  const toggleSequentialReading = useMemo(() => () => {
    setSequentialReadingEnabled((prev) => !prev);
  }, []);

  return { focusedWordIndex, sequentialReadingEnabled, setSequentialReadingEnabled, toggleSequentialReading };
};
