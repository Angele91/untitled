// utils/speech.ts
import EasySpeech from "easy-speech";
import { getNextWord, getPreviousWord } from "./textProcessing";
import { focusWordPaceAtom, store } from "../state/atoms";

export const initializeSpeech = async () => {
  try {
    // const pace = focusWordPaceAtom.read();
    const focusWordPace = store.get(focusWordPaceAtom);

    console.log({ focusWordPace });

    await EasySpeech.init({ maxTimeout: 5000, interval: focusWordPace });
    return true;
  } catch (e) {
    console.error("Speech initialization failed:", e);
    return false;
  }
};

/**
 * Gets all words in the current sentence
 */
export const getCurrentSentence = (
  startElement: HTMLElement
): {
  words: HTMLElement[];
  text: string;
  lastElement: HTMLElement;
  firstElement: HTMLElement;
} => {
  // First, find the start of the sentence
  let sentenceStart = startElement;
  let previousWord = getPreviousWord(startElement);

  while (
    previousWord.element &&
    !previousWord.isParagraphStart &&
    ![".", "!", "?"].includes(previousWord.punctuation)
  ) {
    sentenceStart = previousWord.element;
    previousWord = getPreviousWord(sentenceStart);
  }

  // Then collect words until the end of the sentence
  const words: HTMLElement[] = [sentenceStart];
  let currentWord = sentenceStart;
  let text = sentenceStart.textContent || "";

  while (true) {
    const { element, punctuation } = getNextWord(currentWord);

    if (!element) break;

    // If we found end of sentence, don't continue
    if ([".", "!", "?"].includes(punctuation)) {
      break;
    }

    // Add current word (which has the punctuation)
    words.push(element);
    text += " " + (element.textContent || "");

    currentWord = element;
  }

  return {
    words,
    text: text.trim(),
    lastElement: words[words.length - 1],
    firstElement: words[0],
  };
};

/**
 * Speaks the given text and returns a promise that resolves when done
 */
export const speakText = async (text: string): Promise<void> => {
  const focusWordPace = store.get(focusWordPaceAtom);
  const incrementInRate = focusWordPace / 100;

  return new Promise((resolve, reject) => {
    EasySpeech.speak({
      text,
      rate: 1 + incrementInRate,
      pitch: 1,
      end: () => resolve(),
      error: (e) => reject(e),
    });
  });
};
