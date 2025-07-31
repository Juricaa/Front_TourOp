import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CalendarDays,
  TrendingUp,
  MapPin,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardStats, Reservation } from "@shared/types";
import ApiTest from "@/components/ApiTest";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGuard } from "@/components/ProtectedRoute";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-forest-100 text-forest-800 border-forest-200";
      case "pending":
        return "bg-sunset-100 text-sunset-800 border-sunset-200";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "completed":
        return "bg-ocean-100 text-ocean-800 border-ocean-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      case "completed":
        return "Terminée";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          Erreur lors du chargement des données
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-madagascar-500 to-ocean-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Bienvenue {user?.name}</h1>
            <p className="text-madagascar-100">
              {user?.role === "admin"
                ? "Consultez les statistiques et performances de l'agence"
                : "Gérez votre activité de tour opérateur depuis ce tableau de bord"}
            </p>
            <div className="mt-2">
              <Badge
                variant="secondary"
                className={`${user?.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
              >
                {user?.role === "admin"
                  ? "👨‍💼 Administrateur - Consultation"
                  : "👩‍💻 Secrétaire - Gestion complète"}
              </Badge>
            </div>
          </div>
          <div className="hidden md:block">
            <MapPin className="w-16 h-16 text-madagascar-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-madagascar-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalClients}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-forest-500" />
              +12% ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Réservations
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-ocean-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalReservations}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-forest-500" />
              +8% ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-forest-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalRevenue)} Ar
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-forest-500" />
              +15% ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ce Mois
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-sunset-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.monthlyRevenue)} Ar
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-forest-500" />
              Objectif: 120%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Destinations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Destinations Populaires</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/destinations">
                  Voir tout
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.popularDestinations.map((destination, index) => (
              <div key={destination.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-madagascar-500 to-ocean-500 flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {destination.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {destination.count} réservations
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className="bg-madagascar-50 text-madagascar-700 border-madagascar-200"
                  >
                    {Math.round(
                      (destination.count / stats.totalReservations) * 100,
                    )}
                    %
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Réservations Récentes</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/reservations">
                  Voir tout
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {reservation.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(reservation.dateCreated).toLocaleDateString(
                      "fr-FR",
                    )}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge
                    variant="outline"
                    className={getStatusColor(reservation.status)}
                  >
                    {getStatusText(reservation.status)}
                  </Badge>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(reservation.totalPrice)} Ar
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PermissionGuard
              permission="write"
              fallback={
                <div className="h-16 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-md">
                  Accès limité
                </div>
              }
            >
              <Button asChild className="h-16 flex-col gap-2">
                <Link to="/reservations/new">
                  <Plus className="h-5 w-5" />
                  Nouvelle Réservation
                </Link>
              </Button>
            </PermissionGuard>
            <PermissionGuard
              permission="write"
              fallback={
                <div className="h-16 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-md">
                  Consultation uniquement
                </div>
              }
            >
              <Button variant="outline" asChild className="h-16 flex-col gap-2">
                <Link to="/clients/new">
                  <Users className="h-5 w-5" />
                  Nouveau Client
                </Link>
              </Button>
            </PermissionGuard>
            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link to="/hebergements">
                <MapPin className="h-5 w-5" />
                Hébergements
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col gap-2">
              <Link to="/vols">
                <TrendingUp className="h-5 w-5" />
                Rapports
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Test Component for debugging */}
      <ApiTest />
    </div>
  );
}
