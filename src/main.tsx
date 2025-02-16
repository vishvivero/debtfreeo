
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { useScrollTop } from "./hooks/use-scroll-top";
import App from "./App.tsx";
import "./index.css";

function Root() {
  useScrollTop();
  
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
