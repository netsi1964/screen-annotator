import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Fix for Chrome extensions: redirect /index.html to #/
if (window.location.pathname === "/index.html" && !window.location.hash) {
  window.location.replace("#/");
}

createRoot(document.getElementById("root")!).render(<App />);
