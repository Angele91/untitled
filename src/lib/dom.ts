/**
 * Gets word element by index
 */
export const getWordElementById = (
  wordIndex: number | undefined
): HTMLElement | null => {
  return wordIndex !== undefined
    ? document.getElementById(`word-${wordIndex}`)
    : null;
};

/**
 * Gets chapter element by index
 */
export const getChapterElementById = (
  chapterIndex: number
): HTMLElement | null => {
  return document.getElementById(`chapter-${chapterIndex + 1}`);
};

/**
 * Extracts word index from element ID
 */
export const getWordIndexFromElement = (element: HTMLElement): number => {
  return parseInt(element.id.split("-")[1]);
};

const scrollQueue: { element: any; block: ScrollLogicalPosition }[] = [];
let isProcessingScroll = false;

export function smoothScroll(element: any, block: ScrollLogicalPosition) {
  // Add new scroll request to queue
  scrollQueue.push({ element, block });

  // If not currently processing, start processing queue
  if (!isProcessingScroll) {
    processScrollQueue();
  }
}

function processScrollQueue() {
  isProcessingScroll = true;

  // Get the last scroll request (most recent)
  const lastScroll = scrollQueue[scrollQueue.length - 1];

  // Clear the queue
  scrollQueue.length = 0;

  if (lastScroll) {
    // Execute the scroll
    lastScroll.element.scrollIntoView({
      behavior: "smooth",
      block: lastScroll.block,
    });

    // Wait for scroll animation to complete (roughly)
    setTimeout(() => {
      isProcessingScroll = false;

      // Check if new items were added to queue during scroll
      if (scrollQueue.length > 0) {
        processScrollQueue();
      }
    }, 500); // Adjust this timing based on your scroll animation duration
  } else {
    isProcessingScroll = false;
  }
}
