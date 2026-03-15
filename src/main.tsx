import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./ui/uikit.css";
import "./ui/admin-theme.css";
import "./ui/admin-components.css";

import { App } from "./app/App";
import { AppProviders } from "./app/providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);