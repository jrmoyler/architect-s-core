import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Dev-only: exposes window.__validateSprites() to verify every sprite URL
// loads and detected frame rects match the expected width/height.
if (import.meta.env.DEV) {
  import("./lib/spriteValidator");
}

createRoot(document.getElementById("root")!).render(<App />);
