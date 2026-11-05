import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AppProvider } from './context/AppContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.08)',
            },
            success: { iconTheme: { primary: '#14B8A6', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
          }}
        />
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
