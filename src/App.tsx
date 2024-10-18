import "./App.css";
import useEyeSaverMode from "./hooks/useEyeSaverMode.ts";
import useDarkMode from "./hooks/useDarkMode.ts";
import BookDetail from "./pages/book-detail.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import MainPage from "./pages/main-page.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/book/:id",
    element: <BookDetail />,
  },
]);

function App() {
  const eyeSaverMode = useEyeSaverMode();
  const darkMode = useDarkMode();

  return (
    <div
      className={twMerge(
        eyeSaverMode ? "eye-saver-mode" : "",
        darkMode ? "dark-mode" : ""
      )}
    >
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
