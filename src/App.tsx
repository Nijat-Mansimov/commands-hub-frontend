import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navigation from "@/components/common/Navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TemplateListPage from "./pages/TemplateListPage";
import TemplateDetail from "./pages/TemplateDetail";
import CreateTemplatePage from "./pages/CreateTemplatePage";
import MyTemplatesPage from "./pages/MyTemplatesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Auth pages - no nav */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Main app - with nav */}
              <Route path="/*" element={
                <>
                  <Navigation />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/templates" element={<TemplateListPage />} />
                    <Route path="/templates/:id" element={<TemplateDetail />} />
                    <Route path="/templates/create" element={
                      <ProtectedRoute><CreateTemplatePage mode="create" /></ProtectedRoute>
                    } />
                    <Route path="/templates/:id/edit" element={
                      <ProtectedRoute><CreateTemplatePage mode="edit" /></ProtectedRoute>
                    } />
                    <Route path="/templates/my-templates" element={
                      <ProtectedRoute><MyTemplatesPage /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </>
              } />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
