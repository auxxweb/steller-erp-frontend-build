import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { assertProductionEnv, getRouterBasename } from './config/env.js';
import App from './App.jsx';
import PWAProvider from './components/pwa/PWAProvider.jsx';
import AuthSessionProvider from './providers/AuthSessionProvider.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ToastViewport from './components/ui/ToastViewport.jsx';
import GlobalLoader from './components/ui/GlobalLoader.jsx';
import './index.css';

assertProductionEnv();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={getRouterBasename()}>
      <AuthSessionProvider>
        <ThemeProvider>
          <PWAProvider>
            <App />
            <GlobalLoader />
            <ToastViewport />
          </PWAProvider>
        </ThemeProvider>
      </AuthSessionProvider>
    </BrowserRouter>
  </StrictMode>,
);
