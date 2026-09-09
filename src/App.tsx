import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConnectivityProvider } from './contexts/ConnectivityContext';
import AppRoutes from './routes/AppRoutes';
import { initializeSeeds } from './mock/initializeSeeds';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.css';

function App() {
  useEffect(() => {
    initializeSeeds();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConnectivityProvider>
            <AppRoutes />
          </ConnectivityProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
