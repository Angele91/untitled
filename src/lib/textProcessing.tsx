import {
  getNextElementWithText,
  getPreviousElementWithText,
} from "./domTraversal.ts";

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
