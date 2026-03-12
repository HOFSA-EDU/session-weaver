import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import CreateSession from "./pages/CreateSession";
import DMDashboard from "./pages/DMDashboard";
import JoinSession from "./pages/JoinSession";
import PlayerView from "./pages/PlayerView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
    <Route path="/" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
    <Route path="/create" element={<ProtectedRoute><CreateSession /></ProtectedRoute>} />
    <Route path="/dm/:sessionId" element={<ProtectedRoute><DMDashboard /></ProtectedRoute>} />
    <Route path="/join" element={<ProtectedRoute><JoinSession /></ProtectedRoute>} />
    <Route path="/player/:sessionId" element={<ProtectedRoute><PlayerView /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
