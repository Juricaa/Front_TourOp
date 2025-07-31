import { ReactNode } from "react";
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
  BarChart3,
  Globe,
  LogOut,
  Menu,
  Eye,
  TrendingUp,
  Users,
  Activity,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavigation = [
  {
    title: "Tableau de Bord",
    icon: BarChart3,
    href: "/",
  },
  {
    title: "Destinations",
    icon: Globe,
    href: "/destinations",
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-blue-900">
            <div className="flex items-center gap-3 px-4 py-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-white">
                <h1 className="text-lg font-bold">TourOp Admin</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30 text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    {user?.name}
                  </Badge>
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="bg-white/50">
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-600 font-semibold">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "hover:bg-slate-100 transition-colors",
                            isActive &&
                              "bg-blue-50 border-r-2 border-blue-500 text-blue-700",
                          )}
                        >
                          <Link to={item.href}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Admin Info Panel */}
            <SidebarGroup className="mt-8">
              <SidebarGroupContent>
                <div className="p-4 mx-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Mode Consultation
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Accès en lecture aux statistiques et données de performance.
                  </p>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Quick Stats in Sidebar */}
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-slate-600 font-semibold">
                Aperçu Rapide
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 px-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      <span className="text-xs text-emerald-700">Revenus</span>
                    </div>
                    <span className="text-xs font-medium text-emerald-900">
                      €85.4k
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-700">Clients</span>
                    </div>
                    <span className="text-xs font-medium text-blue-900">
                      127
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-purple-700">
                        Réservations
                      </span>
                    </div>
                    <span className="text-xs font-medium text-purple-900">
                      45
                    </span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 bg-white/50">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-slate-100">
                  <Link to="/settings">
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-slate-100">
                  <button>
                    <HelpCircle className="w-4 h-4" />
                    <span>Aide</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <button className="w-full text-left" onClick={logout}>
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SidebarTrigger>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {adminNavigation.find(
                    (item) => item.href === location.pathname,
                  )?.title || "TourOp Admin"}
                </h2>
                <p className="text-sm text-slate-600">
                  Consultation des données et statistiques
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-900">
                  {user?.name}
                </span>
                <span className="text-xs text-slate-600">Administrateur</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
