import "./i18n"; // Must be first — initialises i18next before any component renders
import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<div className="min-h-screen bg-[#fbfaf5] flex items-center justify-center font-mukta font-bold text-gray-500">Wait...</div>}>
    <App />
  </Suspense>
);
