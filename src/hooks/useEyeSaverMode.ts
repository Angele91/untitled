import { useEffect } from "react";
import { useAtom } from "jotai";
import { eyeSaverModeAtom } from "../state/atoms";

const useEyeSaverMode = () => {
  const [eyeSaverMode] = useAtom(eyeSaverModeAtom);

  useEffect(() => {
    const root = document.documentElement;
    if (eyeSaverMode) {
      root.style.setProperty("--background-color", "#f4e9d9");
      root.style.setProperty("--text-color", "#3c3c3c");
      root.style.setProperty("--link-color", "#1a5f7a");
      root.style.setProperty("--filter", "brightness(0.95) sepia(0.2)");
    } else {
      root.style.removeProperty("--background-color");
      root.style.removeProperty("--text-color");
      root.style.removeProperty("--link-color");
      root.style.removeProperty("--filter");
    }
  }, [eyeSaverMode]);

  return eyeSaverMode;
};

export default useEyeSaverMode;
