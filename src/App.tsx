import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Auth from "./pages/Auth";
import BootstrapOwner from "./pages/BootstrapOwner";
import WorkerHome from "./pages/WorkerHome";
import WeekSummary from "./pages/WeekSummary";
import LegalReport from "./pages/LegalReport";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import HRDashboard from "./pages/HRDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import MyRequests from "./pages/MyRequests";
import ApprovalQueue from "./pages/ApprovalQueue";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle role-based home redirect
function RoleBasedHome() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (role === "owner") {
    return <Navigate to="/admin" replace />;
  }
  if (role === "hr") {
    return <Navigate to="/hr" replace />;
  }
  return <WorkerHome />;
}

const AppRoutes = () => (
  <Routes>
    {/* Auth */}
    <Route path="/login" element={<Auth />} />
    <Route path="/bootstrap-owner" element={<BootstrapOwner />} />

    {/* Compatibility routes (fix 404s from old links/menu) */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <RoleBasedHome />
        </ProtectedRoute>
      }
    />
    <Route
      path="/config"
      element={
        <ProtectedRoute>
          <Navigate to="/settings" replace />
        </ProtectedRoute>
      }
    />
    <Route
      path="/rules"
      element={
        <ProtectedRoute>
          <Navigate to="/settings" replace />
        </ProtectedRoute>
      }
    />

    {/* Role-based home */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <RoleBasedHome />
        </ProtectedRoute>
      }
    />

    {/* Worker Routes */}
    <Route
      path="/week"
      element={
        <ProtectedRoute allowedRoles={["worker"]}>
          <WeekSummary />
        </ProtectedRoute>
      }
    />
    <Route
      path="/history"
      element={
        <ProtectedRoute allowedRoles={["worker"]}>
          <History />
        </ProtectedRoute>
      }
    />
    <Route
      path="/requests"
      element={
        <ProtectedRoute allowedRoles={["worker"]}>
          <MyRequests />
        </ProtectedRoute>
      }
    />

    {/* Shared Routes */}
    <Route
      path="/reports"
      element={
        <ProtectedRoute allowedRoles={["worker", "hr", "owner"]}>
          <Reports />
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      }
    />

    {/* HR Routes */}
    <Route
      path="/hr"
      element={
        <ProtectedRoute allowedRoles={["hr", "owner"]}>
          <HRDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/legal-report"
      element={
        <ProtectedRoute allowedRoles={["hr", "owner"]}>
          <LegalReport />
        </ProtectedRoute>
      }
    />
    <Route
      path="/approvals"
      element={
        <ProtectedRoute allowedRoles={["hr", "owner"]}>
          <ApprovalQueue />
        </ProtectedRoute>
      }
    />

    {/* Admin/Owner Routes */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={["owner"]}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/users"
      element={
        <ProtectedRoute allowedRoles={["owner"]}>
          <UserManagement />
        </ProtectedRoute>
      }
    />

    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
