import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, RoleGuard } from './components/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import AskTvaritaPage from './pages/public/AskTvaritaPage';

// Corporate Pages
import CorporateExperiencesPage from './pages/corporate/CorporateExperiencesPage';
import CorporateExperienceDetailPage from './pages/corporate/CorporateExperienceDetailPage';
import CorporateSignupPage from './pages/corporate/CorporateSignupPage';
import CorporateVerifyOtpPage from './pages/corporate/CorporateVerifyOtpPage';
import CorporateDashboardPage from './pages/corporate/CorporateDashboardPage';
import CorporateRegistrationsPage from './pages/corporate/CorporateRegistrationsPage';
import CorporateRegistrationDetailPage from './pages/corporate/CorporateRegistrationDetailPage';
import CorporateProfilePage from './pages/corporate/CorporateProfilePage';
import CorporateNotificationsPage from './pages/corporate/CorporateNotificationsPage';
import CorporatePaymentPage from './pages/corporate/CorporatePaymentPage';
import CorporateConfirmationPage from './pages/corporate/CorporateConfirmationPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/ask-tvarita" element={<AskTvaritaPage />} />

              {/* Corporate User Journey Routes */}
              <Route path="/corporate/experiences" element={<CorporateExperiencesPage />} />
              <Route path="/corporate/experiences/:id" element={<CorporateExperienceDetailPage />} />
              <Route path="/corporate/signup" element={<CorporateSignupPage />} />
              <Route path="/corporate/verify-otp" element={<CorporateVerifyOtpPage />} />

              {/* Protected Corporate Flow Routes */}
              <Route
                path="/corporate/dashboard"
                element={
                  <RoleGuard roles={['corporate', 'admin']} redirectTo="/corporate/signup">
                    <CorporateDashboardPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/corporate/registrations"
                element={
                  <RoleGuard roles={['corporate', 'admin']} redirectTo="/corporate/signup">
                    <CorporateRegistrationsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/corporate/registrations/:id"
                element={
                  <RoleGuard roles={['corporate', 'admin']} redirectTo="/corporate/signup">
                    <CorporateRegistrationDetailPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/corporate/payment"
                element={
                  <RoleGuard roles={['corporate', 'admin']} redirectTo="/corporate/signup">
                    <CorporatePaymentPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/corporate/confirmation"
                element={
                  <RoleGuard roles={['corporate', 'admin']} redirectTo="/corporate/signup">
                    <CorporateConfirmationPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/corporate/profile"
                element={
                  <RoleGuard roles={['corporate', 'admin']} redirectTo="/corporate/signup">
                    <CorporateProfilePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/corporate/notifications"
                element={
                  <RoleGuard roles={['corporate', 'admin']} redirectTo="/corporate/signup">
                    <CorporateNotificationsPage />
                  </RoleGuard>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/corporate/experiences" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
