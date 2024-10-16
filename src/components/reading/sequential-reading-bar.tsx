import React, { useState } from "react";
import {
  IoIosFastforward,
  IoIosPause,
  IoIosPlay,
  IoIosRewind,
  IoIosSettings,
  IoIosArrowUp,
  IoIosArrowDown,
} from "react-icons/io";
import { twMerge } from "tailwind-merge";
import { useAtom } from "jotai";
import {
  wordGroupSizeAtom,
  fastReadingPercentageAtom,
} from "../../state/atoms";
import Modal from "../utility/modal.js";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";

const SettingsSchema = Yup.object().shape({
  wordGroupSize: Yup.number()
    .min(1, "Must be at least 1")
    .max(10, "Must be at most 10")
    .required("Required"),
});

interface SettingsFormValues {
  wordGroupSize: number;
}

const SequentialReadingBar: React.FC<{
  isPaused: boolean;
  onPlayPauseToggle: () => void;
  onGoBackwards: () => void;
  onGoAhead: () => void;
  startContinuousMovement: (direction: "forward" | "backward") => void;
  stopContinuousMovement: () => void;
  currentWordGroup: string;
}> = ({
  isPaused,
  onPlayPauseToggle,
  onGoBackwards,
  onGoAhead,
  startContinuousMovement,
  stopContinuousMovement,
  currentWordGroup,
}) => {
  const [wordGroupSize, setWordGroupSize] = useAtom(wordGroupSizeAtom);
  const [fastReadingPercentage] = useAtom(fastReadingPercentageAtom);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWordGroupExpanded, setIsWordGroupExpanded] = useState(false);

  const renderPartiallyBoldWord = (word: string) => {
    const boldLength = Math.ceil(word.length * fastReadingPercentage);
    return (
      <span>
        <strong>{word.slice(0, boldLength)}</strong>
        {word.slice(boldLength)}
      </span>
    );
  };

  const handleSubmit = (
    values: SettingsFormValues,
    { setSubmitting }: FormikHelpers<SettingsFormValues>
  ) => {
    setWordGroupSize(values.wordGroupSize);
    setSubmitting(false);
    setIsSettingsModalOpen(false);
  };

  return (
    <>
      <div
        className={
          "transition-all fixed bottom-0 left-0 w-screen pt-2 pb-1 flex items-center justify-between flex-col bg-white border-t border-t-gray-50 shadow-md"
        }
      >
        <div className="w-full flex justify-between items-center px-4 mb-2">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-xs bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 flex items-center"
          >
            <IoIosSettings className="mr-1" /> Settings
          </button>
          <div
            className="text-center cursor-pointer"
            onClick={() => setIsWordGroupExpanded(!isWordGroupExpanded)}
          >
            {isWordGroupExpanded ? (
              <div className="text-xl font-medium">
                {currentWordGroup.split(" ").map((word, index) => (
                  <React.Fragment key={index}>
                    {renderPartiallyBoldWord(word)}{" "}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="text-sm font-medium">
                {currentWordGroup.split(" ").slice(0, 3).join(" ")}
                {currentWordGroup.split(" ").length > 3 ? "..." : ""}
              </div>
            )}
            {isWordGroupExpanded ? (
              <IoIosArrowDown className="inline-block ml-2" />
            ) : (
              <IoIosArrowUp className="inline-block ml-2" />
            )}
          </div>
          <div className="w-[76px]"></div> {/* Placeholder for balance */}
        </div>
        <div className={"flex items-center gap-4 mb-2"}>
          <button
            className={
              "w-14 h-14 duration-100 rounded-full pr-0.5 hover:bg-gray-200 border border-gray-100 flex items-center justify-center transition-all"
            }
            onClick={onGoBackwards}
            onMouseDown={() => startContinuousMovement("backward")}
            onMouseUp={stopContinuousMovement}
            onMouseLeave={stopContinuousMovement}
          >
            <IoIosRewind className={"w-8 h-8"} />
          </button>
          <button
            className={twMerge(
              "w-14 h-14 rounded-full hover:bg-gray-200 border flex items-center justify-center",
              isPaused
                ? "border-blue-500 pl-1"
                : "border-green-500 animate-pulse"
            )}
            onClick={onPlayPauseToggle}
          >
            {isPaused ? (
              <IoIosPlay className={"w-8 h-8 text-blue-500"} />
            ) : (
              <IoIosPause className={"w-8 h-8 text-green-500"} />
            )}
          </button>
          <button
            className={
              "w-14 h-14 rounded-full pl-1.5 hover:bg-gray-200 border border-gray-100 flex items-center justify-center"
            }
            onClick={onGoAhead}
            onMouseDown={() => startContinuousMovement("forward")}
            onMouseUp={stopContinuousMovement}
            onMouseLeave={stopContinuousMovement}
          >
            <IoIosFastforward className={"w-8 h-8"} />
          </button>
        </div>
        <span
          className={twMerge(
            "text-xs font-semibold",
            isPaused ? "text-blue-500" : "text-green-500"
          )}
        >
          {isPaused ? "Paused" : "Reading"}
        </span>
      </div>

      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Reading Settings"
      >
        <Formik
          initialValues={{ wordGroupSize }}
          validationSchema={SettingsSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="flex flex-col items-start">
              <div className="flex items-center mb-4">
                <label htmlFor="wordGroupSize" className="text-sm mr-2">
                  Words per group:
                </label>
                <Field
                  id="wordGroupSize"
                  name="wordGroupSize"
                  type="number"
                  className="w-16 text-sm border rounded px-2 py-1"
                />
              </div>
              {errors.wordGroupSize && touched.wordGroupSize ? (
                <div className="text-red-500 text-xs mb-2">
                  {errors.wordGroupSize}
                </div>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                Save
              </button>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default SequentialReadingBar;
