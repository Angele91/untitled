import JSZip from "jszip";

export async function loadImageFromZip(
  zip: JSZip,
  src: string
): Promise<string> {
  const file = zip.file(src);
  if (!file) {
    throw new Error(`File ${src} not found in zip`);
  }
  const blob = await file.async("blob");
  return URL.createObjectURL(blob);
}

export const normalizePath = (path: string) => {
  // a normalized path is a path that can be used to be loaded from the resources object.
  // a normalized path should not start with 'OEBPS/' and should be lowercase, also, shouldn't be relative, so
  // it should not start with './' or '../'
  let normalizedPath = path.startsWith("OEBPS/") ? path.slice(6) : path;
  normalizedPath = normalizedPath.toLowerCase();

  if (normalizedPath.startsWith("./")) {
    normalizedPath = normalizedPath.slice(2);
  }

  if (normalizedPath.startsWith("../")) {
    normalizedPath = normalizedPath.slice(3);
  }

  return normalizedPath;
};

export interface MatchResult {
  match: string;
  preview: string;
  index: number;
  element: HTMLElement;
}

export function findMatchesInElement(
  element: HTMLElement,
  searchText: string
): MatchResult[] {
  console.debug("Starting findMatchesInElement");
  console.debug("Element:", element);
  console.debug("Search Text:", searchText);

  // Helper function to normalize text
  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Normalize the search text
  const normalizedSearchText = normalizeText(searchText);
  console.debug("Normalized Search Text:", normalizedSearchText);

  const regex = new RegExp(
    `(?:\\S*\\s*){0,3}(${normalizedSearchText})(?:\\s*\\S*){0,3}`,
    "gi"
  );

  const results: MatchResult[] = [];

  // Function to traverse the DOM and search for matches
  const traverseAndSearch = (node: Node) => {
    console.debug("Traversing node:", node);

    if (node.nodeType === Node.ELEMENT_NODE) {
      const elementNode = node as HTMLElement;
      const textContent = elementNode.textContent || "";
      console.debug("Text Content:", textContent);

      const normalizedTextContent = normalizeText(textContent);
      console.debug("Normalized Text Content:", normalizedTextContent);

      let match;
      while ((match = regex.exec(normalizedTextContent)) !== null) {
        console.debug("Match found:", match);

        const fullMatch = match[0];
        const matchedText = match[1];

        // Find the original text in the textContent
        const originalFullMatch = textContent.slice(
          match.index,
          match.index + fullMatch.length
        );

        const originalMatchedText = textContent.slice(
          match.index,
          match.index + matchedText.length
        );

        console.debug("Original Full Match:", originalFullMatch);
        console.debug("Original Matched Text:", originalMatchedText);

        // Check if the match is within a header element
        const headerRegex = /^(#+\s*.*)$/gm;
        const isHeader = headerRegex.test(originalFullMatch);
        console.debug("Is Header:", isHeader);

        // Find the most appropriate container element
        let containerElement: HTMLElement | null = elementNode;
        elementNode.querySelectorAll("*:not(span)").forEach((child) => {
          if (
            child.textContent &&
            child.textContent.includes(originalMatchedText)
          ) {
            containerElement = child as HTMLElement;
          }
        });

        const preview = isHeader
          ? originalFullMatch.replace(
              originalMatchedText,
              `<span>${originalMatchedText}</span>`
            )
          : originalFullMatch.replace(
              originalMatchedText,
              `<span>${originalMatchedText}</span>`
            );

        results.push({
          match: originalMatchedText,
          preview: preview.trim(),
          index: match.index,
          element: containerElement,
        });

        console.debug("Result added:", results[results.length - 1]);
      }
    } else {
      node.childNodes.forEach(traverseAndSearch);
    }
  };

  traverseAndSearch(element);

  console.debug("Results:", results);
  return results;
}
