import "./styles/chatppiok.css";
import { boot } from "./lib/app.js";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => boot());
} else {
  boot();
}
