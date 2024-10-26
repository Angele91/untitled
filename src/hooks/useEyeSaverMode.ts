import { useEffect } from "react";
import { useAtom } from "jotai";
import { eyeSaverModeAtom, store } from "../state/atoms";

const useEyeSaverMode = () => {
  const [eyeSaverMode] = useAtom(eyeSaverModeAtom, {
    store: store,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (eyeSaverMode) {
      root.style.setProperty("--filter", "brightness(0.95) sepia(0.2)");
    } else {
      root.style.removeProperty("--filter");
    }
  }, [eyeSaverMode]);

  return eyeSaverMode;
};

export default useEyeSaverMode;
