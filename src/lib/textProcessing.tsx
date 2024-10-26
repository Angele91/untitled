import { delayConfig } from "./constants.ts";
import { getWordElementById } from "./dom.ts";
import {
  getNextElementWithText,
  getPreviousElementWithText,
} from "./domTraversal.ts";
import { getCurrentSentence } from "./speech.ts";

export const getNextWord = (
  currentWord: HTMLElement | null
): {
  element: HTMLElement | null;
  punctuation: string;
  isParagraphEnd: boolean;
} => {
  if (!currentWord)
    return { element: null, punctuation: "", isParagraphEnd: false };

  let nextWord = currentWord.nextElementSibling as HTMLElement;
  let isParagraphEnd = false;

  // If there's no next sibling, it might be the end of a paragraph
  if (!nextWord) {
    const candidate = getNextElementWithText(currentWord);

    if (!candidate) {
      console.warn("No candidate found");
      return { element: null, punctuation: "", isParagraphEnd: true };
    }

    nextWord = candidate;
    isParagraphEnd = true; // Mark as paragraph end
  }

  // If the next element is not a word (doesn't have an id starting with 'word-'),
  // we need to find the next valid word
  if (nextWord && (!nextWord.id || !nextWord.id.startsWith("word-"))) {
    const wordElements = document.querySelectorAll('[id^="word-"]');
    const currentIndex = Array.from(wordElements).findIndex(
      (el) => el === currentWord
    );
    if (currentIndex !== -1 && currentIndex < wordElements.length - 1) {
      nextWord = wordElements[currentIndex + 1] as HTMLElement;
    } else {
      return { element: null, punctuation: "", isParagraphEnd: true };
    }
  }

  // Check for punctuation
  const punctuation = currentWord.textContent?.trim().slice(-1) || "";

  return { element: nextWord, punctuation, isParagraphEnd };
};

export const getPreviousWord = (
  currentWord: HTMLElement | null
): {
  element: HTMLElement | null;
  punctuation: string;
  isParagraphStart: boolean;
} => {
  if (!currentWord)
    return { element: null, punctuation: "", isParagraphStart: false };

  let previousWord = currentWord.previousElementSibling as HTMLElement;
  let isParagraphStart = false;

  // If there's no previous sibling, it might be the start of a paragraph
  if (!previousWord) {
    const candidate = getPreviousElementWithText(currentWord);

    if (!candidate) {
      console.warn("No candidate found");
      return { element: null, punctuation: "", isParagraphStart: true };
    }

    previousWord = candidate;
    isParagraphStart = true; // Mark as paragraph start
  }

  // If the previous element is not a word (doesn't have an id starting with 'word-'),
  // we need to find the previous valid word
  if (
    previousWord &&
    (!previousWord.id || !previousWord.id.startsWith("word-"))
  ) {
    const wordElements = document.querySelectorAll('[id^="word-"]');
    const currentIndex = Array.from(wordElements).findIndex(
      (el) => el === currentWord
    );
    if (currentIndex > 0) {
      previousWord = wordElements[currentIndex - 1] as HTMLElement;
    } else {
      return { element: null, punctuation: "", isParagraphStart: true };
    }
  }

  // Check for punctuation
  const punctuation = previousWord.textContent?.trim().slice(-1) || "";

  return { element: previousWord, punctuation, isParagraphStart };
};

/**
 * Gets the next word group based on current position and size
 */
export const getWordGroup = (
  startWordIndex: number | undefined,
  size: number
): string[] => {
  const words: string[] = [];
  let currentWord = getWordElementById(startWordIndex);

  for (let i = 0; i < size; i++) {
    if (currentWord) {
      words.push(currentWord.textContent || "");
      const { element } = getNextWord(currentWord);
      currentWord = element as HTMLElement;
    } else {
      break;
    }
  }

  return words;
};

/**
 * Calculates total delay for a word group
 */
export const calculateWordGroupDelay = (
  currentWord: HTMLElement,
  wordGroupSize: number,
  focusWordPace: number
): {
  totalDelay: number;
  nextWord: HTMLElement | null;
} => {
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

  return { totalDelay, nextWord: nextWord === currentWord ? null : nextWord };
};

export const getCurrentTextGroup = (
  startElement: HTMLElement | null,
  isReadWholeSentence: boolean,
  wordGroupSize: number
): string => {
  if (!startElement) return "";

  if (isReadWholeSentence) {
    const { text } = getCurrentSentence(startElement);
    return text;
  }

  const words: string[] = [];
  let currentWord = startElement;

  for (let i = 0; i < wordGroupSize; i++) {
    if (currentWord) {
      words.push(currentWord.textContent || "");
      const { element } = getNextWord(currentWord);
      currentWord = element!;
    } else {
      break;
    }
  }

  return words.join(" ");
};
