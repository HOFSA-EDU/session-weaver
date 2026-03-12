import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import CreateSession from "./pages/CreateSession";
import DMDashboard from "./pages/DMDashboard";
import JoinSession from "./pages/JoinSession";
import PlayerView from "./pages/PlayerView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CreateSession />} />
          <Route path="/dm/:sessionId" element={<DMDashboard />} />
          <Route path="/join" element={<JoinSession />} />
          <Route path="/player/:sessionId" element={<PlayerView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
