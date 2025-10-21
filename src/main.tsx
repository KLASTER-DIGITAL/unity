
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "@/shared/lib/monitoring";

// Инициализируем Sentry перед всем остальным
initSentry();

// Обработка ошибок preload для предотвращения белого экрана
window.addEventListener('vite:preloadError', (event) => {
  console.error('Vite preload error:', event);
  // Перезагружаем страницу при ошибке загрузки модулей
  window.location.reload();
});

// Обработка ошибок загрузки модулей
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('Loading chunk')) {
    console.error('Chunk loading error:', event.error);
    window.location.reload();
  }
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Не перезагружаем страницу для промисов, только логируем
});

createRoot(document.getElementById("root")!).render(<App />);
  