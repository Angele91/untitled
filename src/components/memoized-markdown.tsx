import React from "react";
import Markdown from "markdown-to-jsx";

export const MemoizedMarkdown = React.memo(({content, options}: {
  content: string;
  options: any;
}) => (
  <Markdown options={options}>{content}</Markdown>
));