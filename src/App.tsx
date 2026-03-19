import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LanguageSwitcher from "@/components/LanguageSwitcher";

import LoginPage from "./pages/LoginPage";
import JoinPage from "./pages/JoinPage";
import WelcomePage from "./pages/WelcomePage";
import ProfilePage from "./pages/ProfilePage";
import ServicesPage from "./pages/ServicesPage";
import ProductsUploadPage from "./pages/ProductsUploadPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const isEditorPreview = () =>
  window.location.hostname.includes("lovableproject.com") ||
  new URLSearchParams(window.location.search).has("__lovable_token");

const RootRedirect = () => {
  const { loading, hasProfile, user } = useAuth();
  if (isEditorPreview()) return <Navigate to="/profile" replace />;
  if (loading) return null;
  if (hasProfile) return <Navigate to="/profile" replace />;
  if (user && !hasProfile) return <Navigate to="/join" replace />;
  return <LoginPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <LanguageSwitcher />
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <ServicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products-upload"
                element={
                  <ProtectedRoute>
                    <ProductsUploadPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
