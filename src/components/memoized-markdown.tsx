import React from "react";
import Markdown from "markdown-to-jsx";

export const MemoizedMarkdown = React.memo(({content, options}) => (
  <Markdown options={options}>{content}</Markdown>
));