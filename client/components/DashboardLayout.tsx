import { ReactNode } from "react";
import React, { useEffect, useState } from "react";

import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Building,
  Car,
  MapPin,
  Plane,
  CalendarDays,
  Receipt,
  Route,
  Globe,
  Settings,
  LogOut,
  Menu,
  Shield,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePreview } from "@/contexts/PreviewContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    title: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Réservations",
    icon: CalendarDays,
    href: "/reservations",
  },
  {
    title: "Clients",
    icon: Users,
    href: "/clients",
  },
  {
    title: "Vols",
    icon: Plane,
    href: "/vols",
  },
  {
    title: "Hébergements",
    icon: Building,
    href: "/hebergements",
  },
  {
    title: "Véhicules",
    icon: Car,
    href: "/voitures",
  },
  {
    title: "Activités",
    icon: MapPin,
    href: "/activites",
  },
  // {
  //   title: "Destinations",
  //   icon: Globe,
  //   href: "/destinations",
  // },
  // {
  //   title: "Factures",
  //   icon: Receipt,
  //   href: "/factures",
  // },
  {
    title: "Plans de Voyage",
    icon: Route,
    href: "/plans-voyage",
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { user, logout, canAccessRoute } = useAuth();
  const { hasInvoicePreview, hasTravelPlanPreview } = usePreview();
  const [settings, setSettings] = useState<any>(null);
  useEffect(() => {
    const saved = localStorage.getItem("app_settings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);
  // Filter navigation items based on user permissions
  const filteredNavigation = navigation.filter((item) =>
    canAccessRoute(item.href),
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="border-b border-border bg-gradient-to-r from-madagascar-50 to-ocean-50">
            <div className="flex items-center gap-3 px-5 py-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-madagascar-500 to-ocean-500 flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  
                  {settings?.companyName ?? "TourOp Madagascar"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {user?.name}
                  </p>
                  <Badge
                    variant={user?.role === "admin" ? "secondary" : "default"}
                    className="text-sm px-2 py-1 font-medium"
                  >
                    {user?.role === "admin" ? (
                      <>
                        <Eye className="w-4 h-4 mr-1.5" />
                        Admin
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-1.5" />
                        Secrétaire
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sm font-semibold text-foreground px-4 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-3">
                <SidebarMenu className="space-y-1">
                  {filteredNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="h-11 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200"
                        >
                          <Link
                            to={item.href}
                            className="flex items-center gap-3"
                          >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Preview Section */}
            {(hasInvoicePreview || hasTravelPlanPreview) && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-sm font-semibold text-foreground px-4 py-3">
                  Aperçus disponibles
                </SidebarGroupLabel>
                <SidebarGroupContent className="px-3">
                  <SidebarMenu className="space-y-1">
                    {hasInvoicePreview && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === "/apercu-facture"}
                          className="h-11 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200"
                        >
                          <Link
                            to="/apercu-facture"
                            className="flex items-center gap-3"
                          >
                            <Eye className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium flex-1">
                              Aperçu Facture
                            </span>
                            <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1 font-medium">
                              Nouveau
                            </Badge>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    {hasTravelPlanPreview && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === "/apercu-plan-voyage"}
                          className="h-11 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200"
                        >
                          <Link
                            to="/apercu-plan-voyage"
                            className="flex items-center gap-3"
                          >
                            <Eye className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium flex-1">
                              Aperçu Plan
                            </span>
                            <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1 font-medium">
                              Nouveau
                            </Badge>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-border bg-muted/30 p-3">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="h-11 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200"
                >
                  <Link to="/settings" className="flex items-center gap-3">
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Paramètres</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="h-11 px-3 py-2.5 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                >
                  <button
                    className="w-full text-left flex items-center gap-3"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Déconnexion</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card border-b border-border px-6 py-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <Button variant="ghost" size="sm" className="hover:bg-muted/80">
                  <Menu className="w-5 h-5" />
                </Button>
              </SidebarTrigger>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  {filteredNavigation.find(
                    (item) => item.href === location.pathname,
                  )?.title || (settings?.companyName ?? "TourOp Madagascar")}
                </h2>
                <p className="text-base text-muted-foreground mt-1">
                  {user?.role === "admin"
                    ? "Consultation des données et statistiques"
                    : `Gérez votre activité ${settings?.companyName ?? "TourOp Madagascar"}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-base font-semibold text-foreground">
                  {user?.name}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {user?.role === "admin" ? "Administrateur" : "Secrétaire"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-madagascar-500 to-ocean-500 flex items-center justify-center shadow-lg">
                <span className="text-base font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
