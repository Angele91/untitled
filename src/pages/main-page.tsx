import MainHeader from "../components/main-header.tsx";
import BookGrid from "../components/book/book-grid.tsx";
import useEyeSaverMode from "../hooks/useEyeSaverMode.ts";
import useDarkMode from "../hooks/useDarkMode.ts";

export default function MainPage() {
  const darkMode = useDarkMode();
  const eyeSaverMode = useEyeSaverMode();

  return (
    <div
      className={`${eyeSaverMode ? "eye-saver-mode" : ""} ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      <MainHeader />
      <BookGrid />
    </div>
  );
}
