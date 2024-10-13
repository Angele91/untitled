import {getNextElementWithText} from "./domTraversal.ts";

export const convertWordsToSpans = (children: React.ReactNode) => {
  if (typeof children === 'string') {
    return children.split(' ').map((word, index) => (
      <span key={`word-${index}`}>
    {word}{" "}
    </span>
  ));
  }
  if (Array.isArray(children)) {
    return children.flatMap((child, childIndex) => {
      if (typeof child === 'string') {
        return child.split(' ' as any).map((word, wordIndex) => (
          <span key={`${childIndex}-${wordIndex}`}>
        {word}{" "}
        </span>
      ));
      }
      return child;
    });
  }
  return children;
};

export const getNextWord = (currentWord: HTMLElement | null): {
  element: HTMLElement | null,
  punctuation: string,
  isParagraphEnd: boolean
} => {
  if (!currentWord) return { element: null, punctuation: '', isParagraphEnd: false };

  let nextWord = currentWord.nextElementSibling as HTMLElement;
  let isParagraphEnd = false;

  // If there's no next sibling, it might be the end of a paragraph
  if (!nextWord) {
    const candidate = getNextElementWithText(currentWord);

    if (!candidate) {
      console.warn('No candidate found');
      return { element: null, punctuation: '', isParagraphEnd: true };
    }

    nextWord = candidate;
    isParagraphEnd = true; // Mark as paragraph end
  }

  // If the next element is not a word (doesn't have an id starting with 'word-'),
  // we need to find the next valid word
  if (nextWord && (!nextWord.id || !nextWord.id.startsWith('word-'))) {
    const wordElements = document.querySelectorAll('[id^="word-"]');
    const currentIndex = Array.from(wordElements).findIndex(el => el === currentWord);
    if (currentIndex !== -1 && currentIndex < wordElements.length - 1) {
      nextWord = wordElements[currentIndex + 1] as HTMLElement;
    } else {
      return { element: null, punctuation: '', isParagraphEnd: true };
    }
  }

  // Check for punctuation
  const punctuation = currentWord.textContent?.trim().slice(-1) || '';

  return { element: nextWord, punctuation, isParagraphEnd };
};

