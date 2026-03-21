import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Clients from "./pages/Clients";
import Orders from "./pages/Orders";
import More from "./pages/More";
import AddNew from "./pages/AddNew";
import ClientProfile from "./pages/ClientProfile";
import Appointments from "./pages/Appointments";
import Analytics from "./pages/Analytics";
import Measurements from "./pages/Measurements";
import ClientHome from "./pages/ClientHome";
import DiscoverDesigners from "./pages/DiscoverDesigners";
import DesignerProfilePage from "./pages/DesignerProfilePage";
import ClientOrders from "./pages/ClientOrders";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoleProvider>
          <div className="max-w-md mx-auto min-h-screen relative">
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              {/* Designer routes */}
              <Route path="/" element={<Index />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/more" element={<More />} />
              <Route path="/add" element={<AddNew />} />
              <Route path="/client/:id" element={<ClientProfile />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/measurements" element={<Measurements />} />
              {/* Client routes */}
              <Route path="/client-home" element={<ClientHome />} />
              <Route path="/discover" element={<DiscoverDesigners />} />
              <Route path="/designer/:id" element={<DesignerProfilePage />} />
              <Route path="/client-orders" element={<ClientOrders />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </RoleProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
