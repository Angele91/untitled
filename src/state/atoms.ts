import { atomWithStorage } from "jotai/utils";
import { Book } from "../lib/epub.ts";
import { atom } from "jotai";

export type ScrollBlockOption = "start" | "center" | "end" | "nearest";

export const selectedBookAtom = atomWithStorage<Book | null>(
  "selectedBook",
  null
);

export const fontSizeAtom = atomWithStorage<string>("fontSize", "16px");
export const focusWordPaceAtom = atomWithStorage<number>("focusWordPace", 200);

export const scrollBlockAtom = atomWithStorage<ScrollBlockOption>(
  "scrollBlock",
  "center"
);

export const isFastReadingFontEnabledAtom = atomWithStorage<boolean>(
  "isFastReadingFontEnabled",
  false
);

export const lastReadingPositionsAtom = atomWithStorage<{
  [key: string]: number;
}>("lastReadingPositions", {});

export const isPlayingAtom = atom(false);

export const fastReadingPercentageAtom = atomWithStorage<number>(
  "fastReadingPercentage",
  0.45
);

export const isSequentialReadingEnabledAtom = atomWithStorage(
  "isSequentialReadingEnabled",
  true
);

export const wordGroupSizeAtom = atomWithStorage<number>("wordGroupSize", 1);

// Atom for Eye Saver Mode
export const eyeSaverModeAtom = atomWithStorage<boolean>("eyeSaverMode", false);

// New atom for Dark Mode
export const darkModeAtom = atomWithStorage<boolean>("darkMode", false);
