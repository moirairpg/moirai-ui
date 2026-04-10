import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, ProtectedRoute } from './components/auth';
import { WebSocketProvider } from './contexts/WebSocketContext';
import AppContent from './components/app/AppContent';
import AuthErrorPage from './components/auth/view/AuthErrorPage';
import i18n from './i18n/config.js';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <Router basename={window.__ROUTER_BASENAME__ || ''}>
            <Routes>
              <Route path="/auth/error" element={<AuthErrorPage />} />
              <Route path="/*" element={
                <WebSocketProvider>
                  <ProtectedRoute>
                    <Routes>
                      <Route path="/" element={<AppContent />} />
                      <Route path="/adventure/play/:adventureId" element={<AppContent />} />
                    </Routes>
                  </ProtectedRoute>
                </WebSocketProvider>
              } />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
