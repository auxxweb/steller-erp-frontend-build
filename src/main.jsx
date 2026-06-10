import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import PWAProvider from './components/pwa/PWAProvider.jsx';
import AuthSessionProvider from './providers/AuthSessionProvider.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ToastViewport from './components/ui/ToastViewport.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthSessionProvider>
        <ThemeProvider>
          <PWAProvider>
            <App />
            <ToastViewport />
          </PWAProvider>
        </ThemeProvider>
      </AuthSessionProvider>
    </BrowserRouter>
  </StrictMode>,
);
