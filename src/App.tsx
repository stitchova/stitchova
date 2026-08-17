import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import RequireRole from "@/components/RequireRole";
import DesignerTopNav from "@/components/designer-desktop/DesignerTopNav";
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
import Payments from "./pages/Payments";
import NotFound from "./pages/NotFound";
import BrandSettings from "./pages/BrandSettings";
import InvoiceEditor from "./pages/InvoiceEditor";
import InvoicePreview from "./pages/InvoicePreview";
import Invoices from "./pages/Invoices";
import { BrandInvoiceProvider } from "@/contexts/BrandInvoiceContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import ClientCommunications from "./pages/ClientCommunications";
import OAuthConsent from "./pages/OAuthConsent";
import { AtelierProvider } from "@/contexts/AtelierContext";

const queryClient = new QueryClient();

const D = ({ children }: { children: React.ReactNode }) => <RequireRole allow="designer">{children}</RequireRole>;
const C = ({ children }: { children: React.ReactNode }) => <RequireRole allow="client">{children}</RequireRole>;
const W = ({ children }: { children: React.ReactNode }) => <RequireRole allow="worker">{children}</RequireRole>;
const DC = ({ children }: { children: React.ReactNode }) => <RequireRole allow={["designer", "client"]}>{children}</RequireRole>;
const DW = ({ children }: { children: React.ReactNode }) => <RequireRole allow={["designer", "worker"]}>{children}</RequireRole>;
const ALL = ({ children }: { children: React.ReactNode }) => <RequireRole allow={["designer", "client", "worker"]}>{children}</RequireRole>;

const AppShell = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  // The Orders route has a dedicated tablet/desktop workspace layout, so the
  // mobile-width shell is released from lg upwards for that route only.
  const wideRoutes = ["/orders", "/", "/clients", "/measurements", "/payments", "/workers", "/workshop-chat"];
  const wideRoute = wideRoutes.includes(location.pathname);
  return (
    <LockGate>
      <DesignerTopNav />
      <div className={`app-shell mx-auto min-h-screen max-w-md relative w-full${wideRoute ? " lg:max-w-[1440px]" : ""}`}>
        <AnimatePresence
          mode="wait"
          initial={false}
          onExitComplete={() => setDisplayLocation(location)}
        >
          <PageTransition key={location.pathname}>
            <Routes location={location}>
              {/* Public / pre-auth */}
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/set-passcode" element={<SetPasscode />} />

              {/* Designer-only routes */}
              <Route path="/" element={<D><Index /></D>} />
              <Route path="/clients" element={<D><Clients /></D>} />
              <Route path="/orders" element={<D><Orders /></D>} />
              <Route path="/payments" element={<D><Payments /></D>} />
              <Route path="/more" element={<D><More /></D>} />
              <Route path="/add" element={<D><AddNew /></D>} />
              <Route path="/client/:id" element={<D><ClientProfile /></D>} />
              <Route path="/analytics" element={<D><Analytics /></D>} />
              <Route path="/measurements" element={<D><Measurements /></D>} />
              <Route path="/fabrics" element={<D><Fabrics /></D>} />
              <Route path="/workers" element={<D><Workers /></D>} />
              <Route path="/order/:clientId" element={<D><OrderDetail /></D>} />
              <Route path="/designer-messages" element={<D><DesignerMessages /></D>} />
              <Route path="/materials" element={<D><Materials /></D>} />
              <Route path="/ai-insights" element={<D><AIInsights /></D>} />
              <Route path="/style-library" element={<D><StyleLibrary /></D>} />
              <Route path="/activity-logs" element={<D><ActivityLogs /></D>} />
              <Route path="/workshop-chat" element={<DW><WorkshopChat /></DW>} />
              <Route path="/workshop-chat/:chatId" element={<DW><WorkshopConversation /></DW>} />
              <Route path="/referrals" element={<D><Referrals /></D>} />
              <Route path="/settings/brand" element={<D><BrandSettings /></D>} />
              <Route path="/invoices" element={<D><Invoices /></D>} />
              <Route path="/order/:clientId/invoice/new" element={<D><InvoiceEditor /></D>} />
              <Route path="/invoice/:invoiceId" element={<D><InvoicePreview /></D>} />
              <Route path="/client-comms" element={<D><ClientCommunications /></D>} />
              <Route path="/showcase/new" element={<D><ShowcaseCreate /></D>} />

              {/* Client-only routes */}
              <Route path="/client-home" element={<C><ClientHome /></C>} />
              <Route path="/discover" element={<C><DiscoverDesigners /></C>} />
              <Route path="/designer/:id" element={<C><DesignerProfilePage /></C>} />
              <Route path="/client-orders" element={<C><ClientOrders /></C>} />
              <Route path="/messages" element={<C><Messages /></C>} />
              <Route path="/review/:id" element={<C><ReviewDesigner /></C>} />

              {/* Worker-only routes */}
              <Route path="/worker-dashboard" element={<W><WorkerDashboard /></W>} />
              <Route path="/worker-tasks" element={<W><WorkerTasks /></W>} />
              <Route path="/worker-measurements" element={<W><WorkerMeasurements /></W>} />
              <Route path="/worker-materials" element={<W><WorkerMaterials /></W>} />
              <Route path="/worker-profile" element={<W><WorkerProfile /></W>} />

              {/* Shared routes (branch on role internally) */}
              <Route path="/appointments" element={<DC><Appointments /></DC>} />
              <Route path="/showcase" element={<DC><Showcase /></DC>} />
              <Route path="/profile" element={<ALL><Profile /></ALL>} />
              <Route path="/settings" element={<ALL><Settings /></ALL>} />
              <Route path="/help" element={<ALL><Help /></ALL>} />
              <Route path="/themes" element={<ALL><ThemePicker /></ALL>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
        <BottomNav pathname={displayLocation.pathname} />
      </div>
    </LockGate>
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
                <BrandInvoiceProvider>
                <NotificationsProvider>
                <ReviewsProvider>
                <AtelierProvider>
                <LockProvider>
                  <AppShell />
                </LockProvider>
                </AtelierProvider>
                </ReviewsProvider>
                </NotificationsProvider>
                </BrandInvoiceProvider>
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
