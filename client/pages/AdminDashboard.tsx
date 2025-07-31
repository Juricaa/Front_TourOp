import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CalendarDays,
  Euro,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  Globe,
  Target,
  Trophy,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardStats, Reservation } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
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
            { name: "Sainte-Marie", count: 4 },
          ],
          recentReservations: [],
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

  const revenueGrowth = 12.5; // Mock growth percentage
  const clientGrowth = 8.3;
  const reservationGrowth = 15.2;

  return (
    <div className="p-6 space-y-8">
      {/* Executive Welcome Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Tableau de Bord Exécutif
                  </h1>
                  <p className="text-blue-100">
                    Bienvenue {user?.name} - Vue d'ensemble des performances
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30">
                  <Eye className="w-3 h-3 mr-1" />
                  Mode Consultation
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30">
                  <Activity className="w-3 h-3 mr-1" />
                  Données en temps réel
                </Badge>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 flex items-center justify-center">
                <Target className="w-12 h-12 text-blue-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-emerald-700">
                Chiffre d'Affaires Total
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Euro className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-emerald-900">
                €{stats.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-600">
                  +{revenueGrowth}% ce mois
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">
                Clients Actifs
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-900">
                {stats.totalClients}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600">
                  +{clientGrowth}% ce mois
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">
                Réservations
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-900">
                {stats.totalReservations}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600">
                  +{reservationGrowth}% ce mois
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-700">
                Revenus Mensuels
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-900">
                €{stats.monthlyRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-600">Ce mois-ci</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Destinations */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Destinations Populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularDestinations.map((destination, index) => (
                <div
                  key={destination.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0
                          ? "bg-gradient-to-r from-amber-400 to-amber-600"
                          : index === 1
                            ? "bg-gradient-to-r from-gray-400 to-gray-600"
                            : index === 2
                              ? "bg-gradient-to-r from-amber-600 to-amber-800"
                              : "bg-gradient-to-r from-blue-400 to-blue-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{destination.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {destination.count} réservations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-16 h-2 rounded-full bg-gradient-to-r ${
                        index === 0
                          ? "from-amber-200 to-amber-400"
                          : index === 1
                            ? "from-gray-200 to-gray-400"
                            : index === 2
                              ? "from-amber-300 to-amber-500"
                              : "from-blue-200 to-blue-400"
                      }`}
                    ></div>
                    <span className="text-sm font-medium w-8 text-right">
                      {Math.round(
                        (destination.count / stats.totalReservations) * 100,
                      )}
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Aperçus Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    Taux de Conversion
                  </span>
                  <Badge className="bg-blue-500 text-white">Excellent</Badge>
                </div>
                <div className="text-2xl font-bold text-blue-900">78.5%</div>
                <p className="text-xs text-blue-600">
                  Des visiteurs deviennent clients
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-700">
                    Panier Moyen
                  </span>
                  <Badge className="bg-emerald-500 text-white">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-emerald-900">
                  €
                  {Math.round(
                    stats.totalRevenue / stats.totalReservations,
                  ).toLocaleString()}
                </div>
                <p className="text-xs text-emerald-600">
                  Valeur moyenne par réservation
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">
                    Satisfaction Client
                  </span>
                  <Badge className="bg-purple-500 text-white">4.8/5</Badge>
                </div>
                <div className="text-2xl font-bold text-purple-900">96%</div>
                <p className="text-xs text-purple-600">
                  Clients satisfaits ou très satisfaits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons for Admin */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-600" />
            Actions Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-16 flex-col gap-2 border-2 border-dashed hover:border-solid"
            >
              <Link to="/destinations">
                <Globe className="w-6 h-6" />
                <span>Consulter les Destinations</span>
                <span className="text-xs text-muted-foreground">
                  Explorer notre catalogue
                </span>
              </Link>
            </Button>

            <div className="h-16 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
              <Eye className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-sm text-muted-foreground">
                Mode Consultation
              </span>
              <span className="text-xs text-muted-foreground">
                Accès limité aux données
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Eye className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-1">
                  Accès Administrateur
                </p>
                <p className="text-sm text-blue-700">
                  Vous avez accès en lecture seule aux statistiques et données
                  de performance. Pour effectuer des modifications, contactez un
                  utilisateur avec des droits de secrétaire.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
