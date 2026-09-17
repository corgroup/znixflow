import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
function App() {
  return (
    <main>
      <div className="brand-logo">
        <img src="/znixflow-brand.png" alt="Znixflow" />
      </div>
      <p className="eyebrow">ZNIXFLOW / CONSOLE</p>
      <h1>Communication infrastructure.</h1>
      <p>A tenant-aware foundation for reliable customer messaging.</p>
      <section>
        <span>Foundation release</span>
        <h2>Setup in progress</h2>
        <p>
          API health checks, database migrations and queue connectivity are
          available in the workspace. Operational screens will connect after
          authentication and tenant isolation are implemented.
        </p>
        <ul>
          <li>Provider dispatch: disabled</li>
          <li>Infyntra: existing routing unchanged</li>
          <li>Meta ownership and security review: pending</li>
        </ul>
      </section>
      <footer>Local scaffold · No live customer data</footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
