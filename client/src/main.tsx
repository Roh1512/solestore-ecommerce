import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Provider } from "react-redux";
import { store } from "@/app/store.ts";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
