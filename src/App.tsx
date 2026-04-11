import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, ProtectedRoute } from './components/auth';
import { WebSocketProvider } from './contexts/WebSocketContext';
import AppContent from './components/app/AppContent';
import AuthErrorPage from './components/auth/view/AuthErrorPage';
import CollectionPage from './features/collection/components/CollectionPage';
import BrowsePage from './features/collection/components/BrowsePage';
import AdventureFormPage from './features/adventure/components/AdventureFormPage';
import WorldFormPage from './features/world/components/WorldFormPage';
import PersonaFormPage from './features/persona/components/PersonaFormPage';
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
                      <Route path="/my-stuff" element={<AppContent><CollectionPage view="MY_STUFF" /></AppContent>} />
                      <Route path="/shared-with-me" element={<AppContent><CollectionPage view="SHARED_WITH_ME" /></AppContent>} />
                      <Route path="/explore" element={<AppContent><BrowsePage /></AppContent>} />
                      <Route path="/adventure/new" element={<AppContent><AdventureFormPage mode="create" /></AppContent>} />
                      <Route path="/adventure/:adventureId/edit" element={<AppContent><AdventureFormPage mode="edit" /></AppContent>} />
                      <Route path="/adventure/:adventureId/view" element={<AppContent><AdventureFormPage mode="view" /></AppContent>} />
                      <Route path="/world/new" element={<AppContent><WorldFormPage mode="create" /></AppContent>} />
                      <Route path="/world/:worldId/edit" element={<AppContent><WorldFormPage mode="edit" /></AppContent>} />
                      <Route path="/world/:worldId/view" element={<AppContent><WorldFormPage mode="view" /></AppContent>} />
                      <Route path="/persona/new" element={<AppContent><PersonaFormPage mode="create" /></AppContent>} />
                      <Route path="/persona/:personaId/edit" element={<AppContent><PersonaFormPage mode="edit" /></AppContent>} />
                      <Route path="/persona/:personaId/view" element={<AppContent><PersonaFormPage mode="view" /></AppContent>} />
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
