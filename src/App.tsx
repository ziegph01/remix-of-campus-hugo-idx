import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CopingProvider } from "@/contexts/CopingContext";
import BadgeNotification from "@/components/BadgeNotification";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Forum from "./pages/Forum";
import Berater from "./pages/Berater";
import Einstellungen from "./pages/Einstellungen";
import Artikel from "./pages/Artikel";
import ArtikelDetail from "./pages/ArtikelDetail";
import Notenplaner from "./pages/Notenplaner";

import Registrierung from "./pages/Registrierung";
import Login from "./pages/Login";
import Impressum from "./pages/Impressum";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CopingProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BadgeNotification />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/registrierung" element={<Registrierung />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/berater" element={<Berater />} />
            <Route path="/einstellungen" element={<Einstellungen />} />
            <Route path="/artikel" element={<Artikel />} />
            <Route path="/artikel/:id" element={<ArtikelDetail />} />
            <Route path="/notenplaner" element={<Notenplaner />} />
            
            <Route path="/impressum" element={<Impressum />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CopingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;