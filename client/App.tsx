import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { AdminLayout } from "./components/AdminLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { PreviewProvider } from "./contexts/PreviewContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleBasedDashboard } from "./components/RoleBasedDashboard";
import { RoleBasedLayout } from "./components/RoleBasedLayout";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SecretaryDashboard from "./pages/SecretaryDashboard";
import Clients from "./pages/Clients";
import Reservations from "./pages/Reservations";
import NewReservation from "./pages/NewReservation";
import ReservationDetail from "./pages/ReservationDetail";
import EditReservation from "./pages/EditReservation";
import Hebergements from "./pages/Hebergements";
import VehiculesCrud from "./pages/VehiculesCrud";
import ActivitesCrud from "./pages/ActivitesCrud";
import VolsCrud from "./pages/VolsCrud";
import Destinations from "./pages/Destinations";
import Factures from "./pages/Factures";
import PlansVoyage from "./pages/PlansVoyage";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import NewClient from "./pages/NewClient";
import ClientDetail from "./pages/ClientDetail";
import TravelPlanDetail from "./pages/TravelPlanDetail";
import InvoicePreview from "./pages/InvoicePreview";
import TravelPlanPreview from "./pages/TravelPlanPreview";

import { BookingProvider } from "@/contexts/BookingContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PreviewProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RoleBasedDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/secretary/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SecretaryDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <Clients />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients/new"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <NewClient />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients/:id"
                element={
                  <ProtectedRoute requiredPermission="read">
                    <DashboardLayout>
                      <ClientDetail />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients/:idClient/edit"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <NewClient />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <Reservations />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations/new"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <NewReservation />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations/:id/edit"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <EditReservation />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations/:id"
                element={
                  <ProtectedRoute requiredPermission="read">
                    <DashboardLayout>
                      <ReservationDetail />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hebergements"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <Hebergements />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/voitures"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <VehiculesCrud />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activites"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <ActivitesCrud />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vols"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <VolsCrud />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/destinations"
                element={
                  <ProtectedRoute requiredPermission="read">
                    <RoleBasedLayout>
                      <Destinations />
                    </RoleBasedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/factures"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <Factures />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans-voyage"
                element={
                  <ProtectedRoute requiredPermission="write">
                    <DashboardLayout>
                      <PlansVoyage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans-voyage/:id"
                element={
                  <ProtectedRoute requiredPermission="read">
                    <DashboardLayout>
                      <TravelPlanDetail />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apercu-facture"
                element={
                  <ProtectedRoute requiredPermission="read">
                    <DashboardLayout>
                      <InvoicePreview />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apercu-plan-voyage"
                element={
                  <ProtectedRoute requiredPermission="read">
                    <DashboardLayout>
                      <TravelPlanPreview />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requiredPermission="read">
                    <RoleBasedLayout>
                      <Settings />
                    </RoleBasedLayout>
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
           </TooltipProvider>
      </PreviewProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
