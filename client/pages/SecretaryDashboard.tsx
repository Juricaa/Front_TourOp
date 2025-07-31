import React, { useState, useEffect } from "react";
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
  Settings,
  FileText,
  Car,
  Building,
  Plane,
  Activity,
  Globe,
  Receipt,
  Route,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardStats, Reservation } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";

export default function SecretaryDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockStats: DashboardStats = {
          totalClients: 127,
          totalReservations: 45,
          totalRevenue: 85420,
          monthlyRevenue: 12350,
          popularDestinations: [
            { name: "Andasibe-Mantadia", count: 15 },
            { name: "Nosy Be", count: 12 },
            { name: "Tsingy de Bemaraha", count: 8 },
            { name: "Morondava", count: 6 },
          ],
          recentReservations: [
            {
              id: "RES001",
              clientId: "CLI001",
              status: "confirmed" as const,
              totalPrice: 2500,
              currency: "EUR" as const,
              dateCreated: new Date("2024-12-15"),
              dateTravel: new Date("2025-01-15"),
            },
            {
              id: "RES002",
              clientId: "CLI002",
              status: "pending" as const,
              totalPrice: 1800,
              currency: "EUR" as const,
              dateCreated: new Date("2024-12-14"),
              dateTravel: new Date("2025-02-10"),
            },
          ],
        };
        setStats(mockStats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Erreur lors du chargement des données
        </div>
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
              Gérez votre activité de tour opérateur depuis ce tableau de bord
            </p>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800">
                <Shield className="w-3 h-3 mr-1" />
                Secrétaire - Gestion complète
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline h-3 w-3 text-green-500" />
              +8.2% depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline h-3 w-3 text-green-500" />
              +15.2% depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d'Affaires
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline h-3 w-3 text-green-500" />
              +12.5% depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenus de décembre 2024
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button asChild className="justify-start h-12">
                <Link to="/reservations/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Réservation
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start h-12">
                <Link to="/clients">
                  <Users className="h-4 w-4 mr-2" />
                  Gérer les Clients
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start h-12">
                <Link to="/factures">
                  <Receipt className="h-4 w-4 mr-2" />
                  Facturation
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start h-12">
                <Link to="/plans-voyage">
                  <Route className="h-4 w-4 mr-2" />
                  Plans de Voyage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Management Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Modules de Gestion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild className="h-16 flex-col gap-2">
                <Link to="/hebergements">
                  <Building className="h-5 w-5" />
                  Hébergements
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16 flex-col gap-2">
                <Link to="/voitures">
                  <Car className="h-5 w-5" />
                  Véhicules
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16 flex-col gap-2">
                <Link to="/activites">
                  <MapPin className="h-5 w-5" />
                  Activités
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16 flex-col gap-2">
                <Link to="/vols">
                  <Plane className="h-5 w-5" />
                  Vols
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Destinations Populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularDestinations.map((destination, index) => (
                <div
                  key={destination.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-madagascar-500"></div>
                    <span className="text-sm font-medium">
                      {destination.name}
                    </span>
                  </div>
                  <Badge variant="secondary">{destination.count}</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" asChild className="w-full mt-4" size="sm">
              <Link to="/destinations">
                <Globe className="h-4 w-4 mr-2" />
                Voir toutes les destinations
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Réservations Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-madagascar-100 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-madagascar-600" />
                  </div>
                  <div>
                    <p className="font-medium">{reservation.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Voyage: {reservation.dateTravel.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {reservation.currency === "EUR" ? "€" : "$"}
                    {reservation.totalPrice.toLocaleString()}
                  </p>
                  <Badge
                    variant={
                      reservation.status === "confirmed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {reservation.status === "confirmed"
                      ? "Confirmée"
                      : "En attente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" asChild className="w-full mt-4">
            <Link to="/reservations">
              <FileText className="h-4 w-4 mr-2" />
              Voir toutes les réservations
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
