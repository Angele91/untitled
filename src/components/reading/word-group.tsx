import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export const WordGroup = ({
  currentWordGroup,
  fastReadingPercentage,
}: {
  currentWordGroup: string;
  fastReadingPercentage: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderPartiallyBoldWord = (word: string) => {
    const boldLength = Math.ceil(word.length * fastReadingPercentage);
    return (
      <span className={"font-light"}>
        <strong className={"font-bold"}>{word.slice(0, boldLength)}</strong>
        {word.slice(boldLength)}
      </span>
    );
  };

  return (
    <div
      className="text-center cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div
        className={twMerge(
          "text-xl font-medium h-0 transition-all overflow-hidden",
          isExpanded && "h-[33px]"
        )}
      >
        {currentWordGroup.split(" ").map((word, index) => (
          <React.Fragment key={index}>
            {renderPartiallyBoldWord(word)}{" "}
          </React.Fragment>
        ))}
      </div>

      {isExpanded ? (
        <IoIosArrowDown className="inline-block ml-2" />
      ) : (
        <IoIosArrowUp className="inline-block ml-2" />
      )}
    </div>
  );
};
