import "../styles/app.css";
import { installMediaFallback } from "./ui/media.js";
import { initApp } from "./app.js";

installMediaFallback();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
