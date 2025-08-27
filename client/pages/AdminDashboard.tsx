import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  Users,
  CalendarDays,
  Euro,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  Globe,
  Target,
  Trophy,
  Clock,
  Plane,
  Car,
  Home,
  MapPin,
  Star,
  Package,
  ShoppingCart,
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart,
  LineChart,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardStats, Reservation } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { reservationService } from "@/services/reservationService";
import { clientService } from "@/services/clientService";
import { hebergementService } from "@/services/hebergementService";
import { factureService } from "@/services/factureService";
import { volService } from "@/services/volService";
import { voitureService } from "@/services/voitureService";
import { activiteService } from "@/services/activiteService";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [adminStats, setAdminStats] = useState({
    totalFlights: 0,
    totalVehicles: 0,
    totalActivities: 0,
    totalAccommodations: 0,
    totalRevenue: 0,
    totalClients: 0,
    totalReservations: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    dailyRevenueData: [] as { date: string; revenue: number }[],
    monthlyRevenueData: [] as { month: string; revenue: number }[],
    yearlyRevenueData: [] as { year: number; revenue: number }[],
    popularDestinations: [],
    recentReservations: [],
  });
  const [clients, setClients] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [searchClient, setSearchClient] = useState('');
  const [searchVehicle, setSearchVehicle] = useState('');
  const [searchAccommodation, setSearchAccommodation] = useState('');
  const [searchFlight, setSearchFlight] = useState('');
  const [searchActivity, setSearchActivity] = useState('');
  const [searchReservation, setSearchReservation] = useState('');
  const { user } = useAuth();

  // Fonctions de filtrage
  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.phone?.includes(searchClient) ||
    client.nationality?.toLowerCase().includes(searchClient.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.brand?.toLowerCase().includes(searchVehicle.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchVehicle.toLowerCase()) ||
    vehicle.vehicleType?.toLowerCase().includes(searchVehicle.toLowerCase()) ||
    vehicle.location?.toLowerCase().includes(searchVehicle.toLowerCase())
  );

  const filteredAccommodations = accommodations.filter(accommodation =>
    accommodation.name?.toLowerCase().includes(searchAccommodation.toLowerCase()) ||
    accommodation.type?.toLowerCase().includes(searchAccommodation.toLowerCase()) ||
    accommodation.location?.toLowerCase().includes(searchAccommodation.toLowerCase())
  );

  const filteredFlights = flights.filter(flight =>
    flight.airline?.toLowerCase().includes(searchFlight.toLowerCase()) ||
    flight.flightNumber?.toLowerCase().includes(searchFlight.toLowerCase()) ||
    flight.departure?.toLowerCase().includes(searchFlight.toLowerCase()) ||
    flight.arrival?.toLowerCase().includes(searchFlight.toLowerCase())
  );

  const filteredActivities = activities.filter(activity =>
    activity.name?.toLowerCase().includes(searchActivity.toLowerCase()) ||
    activity.category?.toLowerCase().includes(searchActivity.toLowerCase()) ||
    activity.location?.toLowerCase().includes(searchActivity.toLowerCase()) ||
    activity.difficulty?.toLowerCase().includes(searchActivity.toLowerCase())
  );

  const filteredReservations = adminStats.recentReservations.filter((facture: any) =>
    facture.id?.toString().includes(searchReservation) ||
    facture.clientId.name?.toLowerCase().includes(searchReservation.toLowerCase()) ||
    (facture.totalPrice?.toString() || '').includes(searchReservation)
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          reservationsResponse,
          clientsResponse,
          hebergementsResponse,
          facturesResponse,
          flightsResponse,
          vehiclesResponse,
          activitiesResponse,
        ] = await Promise.all([
          reservationService.getReservations(),
          clientService.getClients(),
          hebergementService.getHebergements(),
          factureService.getFactures(),
          volService.getVols(),
          voitureService.getVoitures(),
          activiteService.getActivites(),
        ]);

        // Extract data from API responses
        const factures = facturesResponse.data || [];
        const clients = clientsResponse.data || [];
        const hebergements = hebergementsResponse.data || [];
        const flights = flightsResponse.data || [];
        const vehicles = vehiclesResponse.data || [];
        const activities = activitiesResponse.data || [];
        
        // Utiliser les factures comme réservations pour les statistiques
        const reservations = factures.map(facture => {
          // Mapper le statut des factures vers le statut des réservations
          const factureStatus = facture.status as string;
          let status: "en_attente" | "confirmé" | "en_cours" | "annulé" | "completed" = "en_attente";
          
          if (factureStatus === "paid" || factureStatus === "confirmé") {
            status = "confirmé";
          } else if (factureStatus === "sent") {
            status = "en_cours";
          } else if (factureStatus === "annulé" || factureStatus === "cancelled") {
            status = "annulé";
          } else if (factureStatus === "completed" || factureStatus === "terminé") {
            status = "completed";
          }
          
          // Convertir totalPrice en nombre
          const totalPrice = Number(facture.totalPrice || facture.totalAmount || 0);
          
          return {
            ...facture,
            id: facture.idFacture || facture.id,
            clientName: facture.clientName || 'Client inconnu',
            totalPrice,
            createdAt: facture.dateCreated || facture.createdAt || new Date(),
            status
          };
        });

        // Calcul des statistiques
        const totalReservations = factures.length;
        const totalClients = clients.length;
        const totalHebergements = hebergements.length;
        const totalFlights = flights.length;
        const totalVehicles = vehicles.length;
        const totalActivities = activities.length;
        
        // Calcul du chiffre d'affaires avec conversion en nombre
        const totalRevenue = factures.reduce((sum, facture) => {
          const amount = Number((facture as any).totalPrice || (facture as any).montant || (facture as any).montantTotal || 0);
          return sum + amount;
        }, 0);

        // Calcul des revenus détaillés
        const dailyRevenueData = calculateDailyRevenue(factures);
        const monthlyRevenueData = calculateMonthlyRevenue(factures);
        const yearlyRevenueData = calculateYearlyRevenue(factures);
        
        // Revenu du jour
        const today = new Date().toISOString().split('T')[0];
        const dailyRevenue = dailyRevenueData.find(d => d.date === today)?.revenue || 0;
        
        // Revenu mensuel total
        const monthlyRevenue = monthlyRevenueData.reduce((sum, item) => sum + item.revenue, 0);
        
        // Destinations populaires
        const popularDestinations = calculatePopularDestinations(factures);

        const realStats: DashboardStats = {
          totalClients,
          totalReservations,
          totalRevenue,
          monthlyRevenue,
          popularDestinations,
          recentReservations: reservations
            .sort((a, b) => new Date((b as any).createdAt || (b as any).dateCreation || Date.now()).getTime() - new Date((a as any).createdAt || (a as any).dateCreation || Date.now()).getTime())
            .slice(0, 5),
        };

        const adminRealStats = {
          totalFlights,
          totalVehicles,
          totalActivities,
          totalAccommodations: totalHebergements,
          totalRevenue,
          totalClients,
          totalReservations,
          monthlyRevenue,
          dailyRevenue,
          dailyRevenueData,
          monthlyRevenueData,
          yearlyRevenueData,
          popularDestinations,
          recentReservations: reservations
            .sort((a, b) => new Date((b as any).createdAt || (b as any).dateCreation || Date.now()).getTime() - new Date((a as any).createdAt || (a as any).dateCreation || Date.now()).getTime())
            .slice(0, 5),
        };

        // Set detailed data
        setClients(clients);
        setVehicles(vehicles);
        setAccommodations(hebergements);
        setFlights(flights);
        setActivities(activities);

        setStats(realStats);
        setAdminStats(adminRealStats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    const calculateDailyRevenue = (factures: any[]) => {
      const dailyData: { [key: string]: number } = {};
      
      factures.forEach(facture => {
        const dateSource = facture.dateCreated || facture.dateEmission || facture.createdAt;
        
        if (dateSource) {
          const date = new Date(dateSource);
          if (!isNaN(date.getTime())) {
            const dateKey = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
            
            const amount = Number(
              (facture as any).totalPrice || 
              (facture as any).montant || 
              (facture as any).montantTotal || 0
            );
            
            dailyData[dateKey] = (dailyData[dateKey] || 0) + amount;
          }
        }
      });

      // Convertir en tableau et trier par date
      return Object.entries(dailyData)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // Derniers 30 jours
    };

    const calculateMonthlyRevenue = (factures: any[]) => {
      const monthlyData: { [key: string]: { display: string; total: number } } = {};
      
      factures.forEach(facture => {
        const dateSource = facture.dateCreated || facture.dateEmission || facture.createdAt;
        
        if (dateSource) {
          const date = new Date(dateSource);
          if (!isNaN(date.getTime())) {
            const yearMonth = date.toISOString().slice(0, 7);
            const displayMonth = date.toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long' 
            });
            
            const amount = Number(
              (facture as any).totalPrice || 
              (facture as any).montant || 
              (facture as any).montantTotal || 0
            );
            
            if (!monthlyData[yearMonth]) {
              monthlyData[yearMonth] = { display: displayMonth, total: 0 };
            }
            monthlyData[yearMonth].total += amount;
          }
        }
      });

      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, data]) => ({
          month: data.display,
          revenue: data.total
        }));
    };

    const calculateYearlyRevenue = (factures: any[]) => {
      const yearlyData: { [key: number]: number } = {};
      
      factures.forEach(facture => {
        const dateSource = facture.dateCreated || facture.dateEmission || facture.createdAt;
        
        if (dateSource) {
          const date = new Date(dateSource);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            
            const amount = Number(
              (facture as any).totalPrice || 
              (facture as any).montant || 
              (facture as any).montantTotal || 0
            );
            
            yearlyData[year] = (yearlyData[year] || 0) + amount;
          }
        }
      });

      return Object.entries(yearlyData)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, revenue]) => ({
          year: Number(year),
          revenue
        }));
    };

    const calculatePopularDestinations = (factures: any[]) => {
      const destinations: { [key: string]: number } = {};
      
      factures.forEach(facture => {
        const destinationString = (facture as any).destination || "";
        
        if (destinationString) {
          const allDestinations = destinationString
            .split(',')
            .map((dest: string) => dest.trim())
            .filter((dest: string) => dest && dest !== "Non spécifié");
          
          allDestinations.forEach((dest: string) => {
            destinations[dest] = (destinations[dest] || 0) + 1;
          });
        }
        console.log("Destinations extraites:", destinationString);
      });

      return Object.entries(destinations)
        .map(([name, count]) => ({ 
          name: name.replace(/,/g, ''),
          count 
        }))
        .sort((a, b) => b.count - a.count)
        
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

  const revenueGrowth = 12.5;
  const clientGrowth = 8.3;
  const reservationGrowth = 15.2;

  // Calculer la croissance du revenu journalier
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const todayRevenue = adminStats.dailyRevenueData.find(d => d.date === today)?.revenue || 0;
  const yesterdayRevenue = adminStats.dailyRevenueData.find(d => d.date === yesterday)?.revenue || 0;
  const dailyGrowth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

  // Données pour le graphique basé sur le filtre
  const getChartData = () => {
    switch (timeFilter) {
      case 'day':
        return adminStats.dailyRevenueData.slice(-7).map(item => ({
          label: item.date,
          revenue: item.revenue
        }));
      case 'week':
        // Regrouper par semaine
        const weeklyData: { [key: string]: number } = {};
        adminStats.dailyRevenueData.forEach(day => {
          const date = new Date(day.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];
          weeklyData[weekKey] = (weeklyData[weekKey] || 0) + day.revenue;
        });
        return Object.entries(weeklyData)
          .map(([week, revenue]) => {
            const date = new Date(week);
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            return { 
              label: `Sem ${weekNumber}`,
              revenue 
            };
          })
          .slice(-8);
      case 'month':
        return adminStats.monthlyRevenueData.slice(-12).map(item => ({
          label: item.month,
          revenue: item.revenue
        }));
      case 'year':
        return adminStats.yearlyRevenueData.map(item => ({
          label: item.year.toString(),
          revenue: item.revenue
        }));
      default:
        return adminStats.monthlyRevenueData.slice(-12).map(item => ({
          label: item.month,
          revenue: item.revenue
        }));
    }
  };

  const chartData = getChartData();
  const maxRevenue = Math.max(...chartData.map(item => item.revenue), 0);

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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-emerald-900">
                {stats.totalRevenue.toLocaleString()} Ar 
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
                Revenu Journalier
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-900">
                {adminStats.dailyRevenue.toLocaleString()} Ar
              </div>
              <div className="flex items-center gap-1">
                {dailyGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${dailyGrowth >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {dailyGrowth >= 0 ? '+' : ''}{dailyGrowth.toFixed(1)}% vs hier
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Destinations */}
      <Card className="space-y-3 max-h-80 overflow-y-auto">
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

      {/* Detailed Content Sections */}
      <div className="space-y-8">
        {/* Reservations Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-500" />
                Réservations ({adminStats.totalReservations})
              </CardTitle>
              <div className="w-64">
                <Input
                  placeholder="Rechercher une réservation..."
                  value={searchReservation}
                  onChange={(e) => setSearchReservation(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredReservations.slice(0, 5).map((reservation: any) => (
                <div key={reservation.idFacture} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Réservation #{reservation.idFacture}</p>
                    <p className="text-sm text-muted-foreground">
                      Client: {reservation.clientId.name || 'Non spécifié'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Number(reservation.totalPrice || 0).toLocaleString()} Ar</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reservation.dateCreated || Date.now()).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clients Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Clients ({adminStats.totalClients})
              </CardTitle>
              <div className="w-64">
                <Input
                  placeholder="Rechercher un client..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredClients.slice(0, 10).map((client) => (
                <div key={client.idClient} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.email} • {client.phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.nationality} • {client.nbpersonnes} personnes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{client.destinations?.join(', ') || 'Aucune destination'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-500" />
                Véhicules ({adminStats.totalVehicles})
              </CardTitle>
              <div className="w-64">
                <Input
                  placeholder="Rechercher un véhicule..."
                  value={searchVehicle}
                  onChange={(e) => setSearchVehicle(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredVehicles.slice(0, 10).map((vehicle) => (
                <div key={vehicle.idVoiture} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.vehicleType} • {vehicle.capacity} places
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.location} • {vehicle.pricePerDay.toLocaleString()} Ar/jour
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={vehicle.availability === 'available' ? 'default' : 'destructive'}>
                        {vehicle.availability === 'available' ? 'Disponible' : 'Indisponible'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accommodations Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-purple-500" />
                Hébergements ({adminStats.totalAccommodations})
              </CardTitle>
              <div className="w-64">
                <Input
                  placeholder="Rechercher un hébergement..."
                  value={searchAccommodation}
                  onChange={(e) => setSearchAccommodation(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredAccommodations.slice(0, 10).map((accommodation) => (
                <div key={accommodation.idHebergement} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{accommodation.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {accommodation.type} • {accommodation.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {accommodation.capacity} personnes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{accommodation.priceRange.toLocaleString()} Ar</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Flights Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-500" />
                Vols ({adminStats.totalFlights})
              </CardTitle>
              <div className="w-64">
                <Input
                  placeholder="Rechercher un vol..."
                  value={searchFlight}
                  onChange={(e) => setSearchFlight(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredFlights.slice(0, 10).map((flight) => (
                <div key={flight.idVol} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{flight.airline} {flight.flightNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {flight.aircraft} 
                      </p>
                      <p className="text-xs text-muted-foreground">
                Prix {flight.price.toLocaleString()} Ar
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={flight.availability === 'available' ? 'default' : 'destructive'}>
                        {flight.availability === 'available' ? 'Disponible' : 'Complet'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activities Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Activités ({adminStats.totalActivities})
              </CardTitle>
              <div className="w-64">
                <Input
                  placeholder="Rechercher une activité..."
                  value={searchActivity}
                  onChange={(e) => setSearchActivity(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredActivities.slice(0, 10).map((activity) => (
                <div key={activity.idActivite} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.category} • {activity.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                       Duré {activity.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{activity.priceAdult.toLocaleString()} Ar</p>
                    </div>
                  </div>
                </div>
              ))}
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
                  de performance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
