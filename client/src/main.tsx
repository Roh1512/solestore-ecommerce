import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Provider } from "react-redux";
import { store } from "@/app/store.ts";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Logo from "@/assets/soleStoreLogoSmall.svg";

const setFavicon = (href: string) => {
  // Remove existing favicon links first
  const existingFavicons = document.querySelectorAll('link[rel="icon"]');
  existingFavicons.forEach((el) => el.remove());

  // Create new favicon link
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/x-icon"; // Specify MIME type
  favicon.href = href;

  // Add error handling
  favicon.onerror = () => {
    console.warn(`Failed to load favicon: ${href}`);
  };

  // Append to head
  document.head.appendChild(favicon);
};

// Set favicon
setFavicon(Logo);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_API_GOOGLE_CLIENT_ID}
        >
          <App />
        </GoogleOAuthProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
