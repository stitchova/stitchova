import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WorkshopChatProvider } from "@/contexts/WorkshopChatContext";
import { LockProvider } from "@/contexts/LockContext";
import { ShowcaseProvider } from "@/contexts/ShowcaseContext";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import LockGate from "@/components/LockGate";
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
import DesignerMessages from "./pages/DesignerMessages";
import ReviewDesigner from "./pages/ReviewDesigner";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import Fabrics from "./pages/Fabrics";
import Workers from "./pages/Workers";
import OrderDetail from "./pages/OrderDetail";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerTasks from "./pages/WorkerTasks";
import WorkerMeasurements from "./pages/WorkerMeasurements";
import WorkerMaterials from "./pages/WorkerMaterials";
import WorkerProfile from "./pages/WorkerProfile";
import Materials from "./pages/Materials";
import AIInsights from "./pages/AIInsights";
import StyleLibrary from "./pages/StyleLibrary";
import ActivityLogs from "./pages/ActivityLogs";
import ThemePicker from "./pages/ThemePicker";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import WorkshopChat from "./pages/WorkshopChat";
import WorkshopConversation from "./pages/WorkshopConversation";
import SetPasscode from "./pages/SetPasscode";
import Showcase from "./pages/Showcase";
import ShowcaseCreate from "./pages/ShowcaseCreate";
import Referrals from "./pages/Referrals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/subscription" element={<Subscription />} />
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
                <Route path="/fabrics" element={<Fabrics />} />
                <Route path="/workers" element={<Workers />} />
                <Route path="/order/:clientId" element={<OrderDetail />} />
                <Route path="/designer-messages" element={<DesignerMessages />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/ai-insights" element={<AIInsights />} />
                <Route path="/style-library" element={<StyleLibrary />} />
                <Route path="/activity-logs" element={<ActivityLogs />} />
                <Route path="/themes" element={<ThemePicker />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
                <Route path="/workshop-chat" element={<WorkshopChat />} />
                <Route path="/workshop-chat/:chatId" element={<WorkshopConversation />} />
                <Route path="/set-passcode" element={<SetPasscode />} />
                <Route path="/showcase" element={<Showcase />} />
                <Route path="/showcase/new" element={<ShowcaseCreate />} />
                <Route path="/referrals" element={<Referrals />} />
                {/* Client routes */}
                <Route path="/client-home" element={<ClientHome />} />
                <Route path="/discover" element={<DiscoverDesigners />} />
                <Route path="/designer/:id" element={<DesignerProfilePage />} />
                <Route path="/client-orders" element={<ClientOrders />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/review/:id" element={<ReviewDesigner />} />
                <Route path="/profile" element={<Profile />} />
                {/* Worker routes */}
                <Route path="/worker-dashboard" element={<WorkerDashboard />} />
                <Route path="/worker-tasks" element={<WorkerTasks />} />
                <Route path="/worker-measurements" element={<WorkerMeasurements />} />
                <Route path="/worker-materials" element={<WorkerMaterials />} />
                <Route path="/worker-profile" element={<WorkerProfile />} />
                <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <RoleProvider>
            <SubscriptionProvider>
              <WorkshopChatProvider>
                <ShowcaseProvider>
                <LockProvider>
                  <LockGate>
                    <div className="app-shell mx-auto min-h-screen max-w-md relative w-full">
                      <AnimatedRoutes />
                      <BottomNav />
                    </div>
                  </LockGate>
                </LockProvider>
                </ShowcaseProvider>
              </WorkshopChatProvider>
            </SubscriptionProvider>
          </RoleProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
