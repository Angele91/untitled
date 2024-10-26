export type WordInfo = {
  punctuation: string;
  isParagraphEnd: boolean;
};

export type WordSequence = {
  wordIndices: number[];
  wordInfos: WordInfo[];
};

export type WordElement = {
  element: HTMLElement | null;
  punctuation: string;
  isParagraphEnd: boolean;
};

import { delayConfig } from "../lib/constants";
import { getWordIndexFromElement } from "./dom";

/**
 * Calculates delay for a single word based on its punctuation
 */
export const calculateWordDelay = (
  wordInfo: WordInfo,
  baseDelay: number
): number => {
  const punctuationDelay = wordInfo.isParagraphEnd
    ? delayConfig.paragraph
    : delayConfig[wordInfo.punctuation as keyof typeof delayConfig] ||
      delayConfig.default;

  return baseDelay + punctuationDelay;
};

/**
 * Determines which punctuation should take precedence
 */
export const getHighestPriorityPunctuation = (
  currentMax: string,
  newPunctuation: string
): string => {
  const currentDelay = delayConfig[currentMax as keyof typeof delayConfig] || 0;
  const newDelay = delayConfig[newPunctuation as keyof typeof delayConfig] || 0;

  return newDelay > currentDelay ? newPunctuation : currentMax;
};

/**
 * Calculates total delay for a sequence of words
 */
export const calculateSequenceDelay = (
  wordInfos: WordInfo[],
  baseDelay: number
): number => {
  return wordInfos.reduce(
    (total, wordInfo) => total + calculateWordDelay(wordInfo, baseDelay),
    0
  );
};

/**
 * Processes word sequence timing
 */
export const processSequenceTiming = (
  sequence: WordSequence,
  focusWordPace: number
): {
  totalDelay: number;
  lastWordIndex: number | null;
} => {
  if (sequence.wordIndices.length === 0) {
    return {
      totalDelay: 0,
      lastWordIndex: null,
    };
  }

  return {
    totalDelay: calculateSequenceDelay(sequence.wordInfos, focusWordPace),
    lastWordIndex: sequence.wordIndices[sequence.wordIndices.length - 1],
  };
};

/**
 * Creates a word sequence from a starting element
 */
export const buildWordSequence = (
  startElement: HTMLElement,
  size: number,
  getNextWord: (element: HTMLElement) => WordElement
): WordSequence => {
  const sequence: WordSequence = {
    wordIndices: [],
    wordInfos: [],
  };

  let currentElement: HTMLElement | null = startElement;

  for (let i = 0; i < size; i++) {
    if (!currentElement) break;

    const { element, punctuation, isParagraphEnd } =
      getNextWord(currentElement);
    if (!element) break;

    sequence.wordIndices.push(getWordIndexFromElement(element));
    sequence.wordInfos.push({ punctuation, isParagraphEnd });
    currentElement = element;
  }

  return sequence;
};
