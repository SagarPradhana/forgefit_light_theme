import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./styles/premium.css";
import "./i18n";
import ErrorBoundary from "./components/ErrorBoundary";

import { HelmetProvider } from "react-helmet-async";
import { registerSW } from 'virtual:pwa-register';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Initialize Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Register PWA service worker
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ErrorBoundary>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
