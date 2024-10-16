import { useEffect } from "react";
import { useAtom } from "jotai";
import { darkModeAtom } from "../state/atoms";

const useDarkMode = () => {
  const [darkMode] = useAtom(darkModeAtom);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.style.setProperty("--background-color", "#1a1a1a");
      root.style.setProperty("--text-color", "#e0e0e0");
      root.style.setProperty("--link-color", "#4da6ff");
      root.style.setProperty("--filter", "brightness(0.8) invert(0.9)");
    } else {
      root.style.removeProperty("--background-color");
      root.style.removeProperty("--text-color");
      root.style.removeProperty("--link-color");
      root.style.removeProperty("--filter");
    }
  }, [darkMode]);

  return darkMode;
};

export default useDarkMode;
