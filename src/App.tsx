import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, ProtectedRoute } from './components/auth';
import { WebSocketProvider } from './contexts/WebSocketContext';
import AppContent from './components/app/AppContent';
import AuthErrorPage from './components/auth/view/AuthErrorPage';
import CollectionPage from './features/collection/components/CollectionPage';
import { AdventureBrowsePage, WorldBrowsePage, PersonaBrowsePage } from './features/collection/components/BrowsePage';
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
                      <Route path="/my-stuff" element={<AppContent><CollectionPage view="MY_STUFF" title="My Stuff" /></AppContent>} />
                      <Route path="/shared-with-me" element={<AppContent><CollectionPage view="SHARED_WITH_ME" title="Shared With Me" /></AppContent>} />
                      <Route path="/adventures/browse" element={<AppContent><AdventureBrowsePage /></AppContent>} />
                      <Route path="/worlds/browse" element={<AppContent><WorldBrowsePage /></AppContent>} />
                      <Route path="/personas/browse" element={<AppContent><PersonaBrowsePage /></AppContent>} />
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
