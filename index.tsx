
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("App initializing...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Root element not found!");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("App rendered successfully");
  } catch (err) {
    console.error("Critical rendering error:", err);
    rootElement.innerHTML = `<div style="padding: 20px; color: white;">Rendering Error: ${err.message}</div>`;
  }
}
