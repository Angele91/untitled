import { useAtom } from "jotai";
import {
  darkModeAtom,
  eyeSaverModeAtom,
  fastReadingPercentageAtom,
  focusWordPaceAtom,
  fontSizeAtom,
  isFastReadingFontEnabledAtom,
  isReadWholeSentencesAtom,
  isSequentialReadingEnabledAtom,
  scrollBlockAtom,
  ScrollBlockOption,
  store,
  textToSpeechEnabledAtom,
  wordGroupSizeAtom,
} from "../state/atoms";
import { PreviewSection } from "./preview-section.tsx";
import { SettingSelect } from "./setting-select.tsx";
import { SettingInput } from "./setting-input.tsx";
import { SettingToggle } from "./setting-toggle.tsx";
import { Button } from "../components/control/button.tsx";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { useState } from "react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [eyeSaverMode, setEyeSaverMode] = useAtom(eyeSaverModeAtom, {
    store: store,
  });
  const [darkMode, setDarkMode] = useAtom(darkModeAtom, {
    store: store,
  });
  const [fontSize, setFontSize] = useAtom(fontSizeAtom, {
    store: store,
  });
  const [pace, setPace] = useAtom(focusWordPaceAtom, {
    store: store,
  });
  const [scrollBlock, setScrollBlock] = useAtom(scrollBlockAtom, {
    store: store,
  });
  const [isFastReadingFontEnabled, setIsFastReadingFontEnabled] = useAtom(
    isFastReadingFontEnabledAtom,
    {
      store: store,
    }
  );
  const [isSequentialReadingEnabled, setIsSequentialReadingEnabled] = useAtom(
    isSequentialReadingEnabledAtom,
    {
      store: store,
    }
  );
  const [fastReadingPercentage, setFastReadingPercentage] = useAtom(
    fastReadingPercentageAtom,
    {
      store: store,
    }
  );
  const [wordGroupSize, setWordGroupSize] = useAtom(wordGroupSizeAtom, {
    store: store,
  });

  const [isReadWholeSentences, setIsReadWholeSentences] = useAtom(
    isReadWholeSentencesAtom,
    {
      store: store,
    }
  );

  const [textToSpeechEnabled, setTextToSpeechEnabled] = useAtom(
    textToSpeechEnabledAtom,
    {
      store: store,
    }
  );

  const [fontSizeOption, setFontSizeOption] = useState("custom");
  const [paceOption, setPaceOption] = useState("custom");

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <header
        className={`py-4 px-6 border-b ${
          darkMode ? "border-b-gray-700" : "border-b-gray-200"
        }`}
      >
        <Button
          onClick={goBack}
          className={"bg-transparent h-8 justify-center items-center flex"}
        >
          <FaChevronLeft
            className={twMerge(
              "text-xl",
              darkMode ? "text-white" : "text-black"
            )}
          />
        </Button>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div
          className={`shadow-md rounded-lg p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingToggle
              label="Eye Saver Mode"
              checked={eyeSaverMode}
              onChange={(e) => setEyeSaverMode(e.target.checked)}
            />
            <SettingToggle
              label="Dark Mode"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <SettingSelect
              label="Font Size"
              value={fontSizeOption}
              onChange={(e) => {
                const value = e.target.value;
                setFontSizeOption(value);
                if (value !== "custom") {
                  setFontSize(value);
                }
              }}
              options={[
                { value: "12px", label: "12px" },
                { value: "14px", label: "14px" },
                { value: "16px", label: "16px" },
                { value: "18px", label: "18px" },
                { value: "20px", label: "20px" },
                { value: "24px", label: "24px" },
                { value: "28px", label: "28px" },
                { value: "32px", label: "32px" },
                { value: "36px", label: "36px" },
                { value: "custom", label: "Custom" },
              ]}
            />
            {fontSizeOption === "custom" && (
              <SettingInput
                label="Custom Font Size"
                type="number"
                value={parseInt(fontSize)}
                onChange={(e) => setFontSize(`${e.target.value}px`)}
                min={8}
                max={32}
              />
            )}
          </div>
        </div>

        <div
          className={`shadow-md rounded-lg p-6 mt-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">Reading Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingSelect
              label="Focus Word Pace"
              value={paceOption}
              onChange={(e) => {
                const value = e.target.value;
                setPaceOption(value);
                if (value !== "custom") {
                  setPace(parseInt(value));
                }
              }}
              options={[
                { value: "50", label: "Very Fast" },
                { value: "100", label: "Fast" },
                { value: "150", label: "Normal" },
                { value: "200", label: "Slow" },
                { value: "250", label: "Very Slow" },
                { value: "custom", label: "Custom" },
              ]}
            />
            {paceOption === "custom" && (
              <SettingInput
                label="Custom Focus Word Pace"
                type="number"
                value={pace}
                onChange={(e) => setPace(parseInt(e.target.value))}
                min={100}
                max={1000}
              />
            )}
            <SettingSelect
              label="Scroll Block"
              value={scrollBlock}
              onChange={(e) =>
                setScrollBlock(e.target.value as ScrollBlockOption)
              }
              options={[
                { value: "start", label: "Start" },
                { value: "center", label: "Center" },
                { value: "end", label: "End" },
                { value: "nearest", label: "Nearest" },
              ]}
            />
            <SettingToggle
              label="Fast Reading Font Enabled"
              checked={isFastReadingFontEnabled}
              onChange={(e) => setIsFastReadingFontEnabled(e.target.checked)}
            />
            <SettingToggle
              label="Sequential Reading Enabled"
              checked={isSequentialReadingEnabled}
              onChange={(e) => setIsSequentialReadingEnabled(e.target.checked)}
            />

            <SettingInput
              label="Fast Reading Percentage"
              type="number"
              value={fastReadingPercentage}
              onChange={(e) =>
                setFastReadingPercentage(parseFloat(e.target.value))
              }
              min={0}
              max={100}
              step={0.1}
            />

            {isSequentialReadingEnabled && (
              <SettingToggle
                label="Read Whole Sentences"
                checked={isReadWholeSentences}
                onChange={(e) => setIsReadWholeSentences(e.target.checked)}
              />
            )}

            {isSequentialReadingEnabled && (
              <SettingToggle
                label="Text to Speech Enabled"
                checked={textToSpeechEnabled}
                onChange={(e) => setTextToSpeechEnabled(e.target.checked)}
              />
            )}

            {isSequentialReadingEnabled && !isReadWholeSentences && (
              <SettingInput
                label="Word Group Size"
                type="number"
                value={wordGroupSize}
                onChange={(e) => setWordGroupSize(parseInt(e.target.value))}
                min={1}
                max={10}
              />
            )}
          </div>
        </div>

        <div
          className={`shadow-md rounded-lg p-6 mt-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="space-y-4">
            <PreviewSection
              title="Book text preview"
              text="This is a preview text"
            />
            <PreviewSection
              title="Word group tab preview"
              text="This is a preview text"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
