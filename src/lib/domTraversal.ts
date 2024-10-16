export function getNextElementWithText(
  currentElement: HTMLElement | null
): HTMLElement | null {
  if (!currentElement || !document.body.contains(currentElement)) return null;

  const styleCache = new WeakMap<
    Element,
    { display: string; visibility: string }
  >();

  const getComputedStyleProperties = (element: Element) => {
    if (!styleCache.has(element)) {
      const style = window.getComputedStyle(element);
      styleCache.set(element, {
        display: style.display,
        visibility: style.visibility,
      });
    }
    return styleCache.get(element)!;
  };

  const isVisible = (element: Element): boolean => {
    const { display, visibility } = getComputedStyleProperties(element);
    return display !== "none" && visibility !== "hidden";
  };

  const hasVisibleText = (node: Node): boolean => {
    return (
      node.nodeType === Node.TEXT_NODE &&
      node.textContent !== null &&
      node.textContent.trim() !== "" &&
      node.parentElement !== null &&
      isVisible(node.parentElement)
    );
  };

  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          !isVisible(node as Element)
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  // Position the TreeWalker at the current element
  while (treeWalker.nextNode()) {
    if (treeWalker.currentNode === currentElement) {
      break;
    }
  }

  // Get the text content of the current element
  const currentTextContent = currentElement.textContent?.trim() || "";

  // Move to the next node after the current element
  if (!treeWalker.nextNode()) return null;

  // Traverse the DOM to find the next element with different visible text
  do {
    const node = treeWalker.currentNode;
    if (hasVisibleText(node)) {
      const parentElement = node.parentElement;
      if (
        parentElement &&
        parentElement.textContent?.trim() !== currentTextContent
      ) {
        return parentElement;
      }
    }
  } while (treeWalker.nextNode());

  return null;
}

export function getPreviousElementWithText(
  currentElement: HTMLElement | null
): HTMLElement | null {
  if (!currentElement || !document.body.contains(currentElement)) return null;

  const styleCache = new WeakMap<
    Element,
    { display: string; visibility: string }
  >();

  const getComputedStyleProperties = (element: Element) => {
    if (!styleCache.has(element)) {
      const style = window.getComputedStyle(element);
      styleCache.set(element, {
        display: style.display,
        visibility: style.visibility,
      });
    }
    return styleCache.get(element)!;
  };

  const isVisible = (element: Element): boolean => {
    const { display, visibility } = getComputedStyleProperties(element);
    return display !== "none" && visibility !== "hidden";
  };

  const hasVisibleText = (node: Node): boolean => {
    return (
      node.nodeType === Node.TEXT_NODE &&
      node.textContent !== null &&
      node.textContent.trim() !== "" &&
      node.parentElement !== null &&
      isVisible(node.parentElement)
    );
  };

  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          !isVisible(node as Element)
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  // Position the TreeWalker at the current element
  while (treeWalker.nextNode()) {
    if (treeWalker.currentNode === currentElement) {
      break;
    }
  }

  // Get the text content of the current element
  const currentTextContent = currentElement.textContent?.trim() || "";

  // Move to the previous node before the current element
  if (!treeWalker.previousNode()) return null;

  // Traverse the DOM backwards to find the previous element with different visible text
  do {
    const node = treeWalker.currentNode;
    if (hasVisibleText(node)) {
      const parentElement = node.parentElement;
      if (
        parentElement &&
        parentElement.textContent?.trim() !== currentTextContent
      ) {
        return parentElement;
      }
    }
  } while (treeWalker.previousNode());

  return null;
}
