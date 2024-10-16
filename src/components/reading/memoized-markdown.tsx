import React from "react";
import Markdown from "markdown-to-jsx";

const addChapterMarkers = (content: string) => {
  const lines = content.split("\n");
  let chapterIndex = 0;

  const processedLines = lines.map((line) => {
    if (line.startsWith("# ")) {
      chapterIndex++;
      return `<div id="chapter-${chapterIndex}" class="chapter-marker"></div>\n${line}`;
    }
    return line;
  });

  return processedLines.join("\n");
};

export const MemoizedMarkdown = React.memo(
  ({ content, options }: { content: string; options: any }) => {
    const processedContent = addChapterMarkers(content);

    const updatedOptions = {
      ...options,
      forceBlock: true,
      overrides: {
        ...options.overrides,
        div: {
          component: "div",
        },
      },
    };

    return <Markdown options={updatedOptions}>{processedContent}</Markdown>;
  }
);
