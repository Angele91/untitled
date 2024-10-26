import React from "react";
import { useAtom } from "jotai";
import { eyeSaverModeAtom, store } from "../../state/atoms";

const EyeSaverModeToggle: React.FC = () => {
  const [eyeSaverMode, setEyeSaverMode] = useAtom(eyeSaverModeAtom, {
    store: store,
  });

  return (
    <div className="flex items-center">
      <label htmlFor="eye-saver-mode" className="mr-2">
        Eye Saver Mode
      </label>
      <input
        type="checkbox"
        id="eye-saver-mode"
        checked={eyeSaverMode}
        onChange={(e) => setEyeSaverMode(e.target.checked)}
        className="toggle toggle-primary"
      />
    </div>
  );
};

export default EyeSaverModeToggle;
