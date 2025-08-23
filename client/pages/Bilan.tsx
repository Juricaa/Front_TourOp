import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart,
  LineChart,
  DollarSign,
  Download,
  Printer,
  Filter,
  PieChart,
  Target,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { factureService } from "@/services/factureService";

interface RevenueData {
  daily: { date: string; revenue: number }[];
  monthly: { month: string; revenue: number }[];
  yearly: { year: number; revenue: number }[];
  totalRevenue: number;
  averageMonthly: number;
  averageDaily: number;
  growthRate: number;
}

export default function Bilan() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'day' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const { user } = useAuth();

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const facturesResponse = await factureService.getFactures();
        const factures = facturesResponse.data || [];

        // Calcul des revenus détaillés
        const dailyRevenueData = calculateDailyRevenue(factures);
        const monthlyRevenueData = calculateMonthlyRevenue(factures);
        const yearlyRevenueData = calculateYearlyRevenue(factures);
        
        // Revenu total
        const totalRevenue = factures.reduce((sum, facture) => {
          const amount = Number((facture as any).totalPrice || (facture as any).montant || (facture as any).montantTotal || 0);
          return sum + amount;
        }, 0);

        // Moyennes
        const averageMonthly = monthlyRevenueData.length > 0 
          ? monthlyRevenueData.reduce((sum, item) => sum + item.revenue, 0) / monthlyRevenueData.length 
          : 0;
        
        const averageDaily = dailyRevenueData.length > 0 
          ? dailyRevenueData.reduce((sum, item) => sum + item.revenue, 0) / dailyRevenueData.length 
          : 0;

        // Taux de croissance (comparaison mois précédent)
        const growthRate = calculateGrowthRate(monthlyRevenueData);

        const revenueStats: RevenueData = {
          daily: dailyRevenueData,
          monthly: monthlyRevenueData,
          yearly: yearlyRevenueData,
          totalRevenue,
          averageMonthly,
          averageDaily,
          growthRate,
        };

        setRevenueData(revenueStats);
      } catch (error) {
        console.error("Erreur lors du chargement des données financières:", error);
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
            const dateKey = date.toISOString().split('T')[0];
            
            const amount = Number(
              (facture as any).totalPrice || 
              (facture as any).montant || 
              (facture as any).montantTotal || 0
            );
            
            dailyData[dateKey] = (dailyData[dateKey] || 0) + amount;
          }
        }
      });

      return Object.entries(dailyData)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);
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

    const calculateGrowthRate = (monthlyData: { month: string; revenue: number }[]) => {
      if (monthlyData.length < 2) return 0;
      
      const currentMonth = monthlyData[monthlyData.length - 1].revenue;
      const previousMonth = monthlyData[monthlyData.length - 2].revenue;
      
      if (previousMonth === 0) return 0;
      
      return ((currentMonth - previousMonth) / previousMonth) * 100;
    };

    fetchRevenueData();
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

  if (!revenueData) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Erreur lors du chargement des données financières
        </div>
      </div>
    );
  }

  const getChartData = () => {
    switch (timeFilter) {
      case 'day':
        return revenueData.daily.slice(-7).map(item => ({
          label: item.date,
          revenue: item.revenue
        }));
      case 'month':
        return revenueData.monthly.slice(-12).map(item => ({
          label: item.month,
          revenue: item.revenue
        }));
      case 'year':
        return revenueData.yearly.map(item => ({
          label: item.year.toString(),
          revenue: item.revenue
        }));
      default:
        return revenueData.monthly.slice(-12).map(item => ({
          label: item.month,
          revenue: item.revenue
        }));
    }
  };

  const chartData = getChartData();
  const maxRevenue = Math.max(...chartData.map(item => item.revenue), 0);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Bilan Financier
                  </h1>
                  <p className="text-emerald-100">
                    Analyse détaillée des revenus et performances financières
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30">
                  <Target className="w-3 h-3 mr-1" />
                  Données Financières
                </Badge>
                <Badge className="bg-teal-500/20 text-teal-100 border-teal-400/30">
                  <PieChart className="w-3 h-3 mr-1" />
                  Analyse Avancée
                </Badge>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-emerald-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Financial Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-emerald-700">
                Chiffre d'Affaires Total
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-emerald-900">
                {revenueData.totalRevenue.toLocaleString()} Ar 
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-emerald-600">
                  Revenu cumulé
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">
                Revenu Mensuel Moyen
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <BarChart className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-900">
                {revenueData.averageMonthly.toLocaleString()} Ar
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-blue-600">
                  Moyenne mensuelle
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">
                Croissance Mensuelle
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                {revenueData.growthRate >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-white" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${revenueData.growthRate >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {revenueData.growthRate >= 0 ? '+' : ''}{revenueData.growthRate.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1">
                {revenueData.growthRate >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${revenueData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  vs mois précédent
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-teal-700">
                Revenu Journalier Moyen
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-teal-900">
                {revenueData.averageDaily.toLocaleString()} Ar
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-teal-600">
                  Moyenne journalière
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Analyse des Revenus</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={timeFilter} onValueChange={(value: 'day' | 'month' | 'year') => setTimeFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Journalier</SelectItem>
                  <SelectItem value="month">Mensuel</SelectItem>
                  <SelectItem value="year">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4 text-muted-foreground" />
              <Select value={chartType} onValueChange={(value: 'bar' | 'line') => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Barres</SelectItem>
                  <SelectItem value="line">Ligne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </div>
        </div>

        {/* Graphique de revenu */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {chartType === 'bar' ? <BarChart className="w-5 h-5 text-blue-500" /> : <LineChart className="w-5 h-5 text-green-500" />}
              Évolution du Chiffre d'Affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 relative">
              <div className="absolute inset-0 flex flex-col justify-between">
                {/* Échelle verticale */}
                <div className="flex flex-col justify-between h-full text-xs text-muted-foreground">
                  <span>{maxRevenue.toLocaleString()} Ar</span>
                  <span>{(maxRevenue * 0.75).toLocaleString()} Ar</span>
                  <span>{(maxRevenue * 0.5).toLocaleString()} Ar</span>
                  <span>{(maxRevenue * 0.25).toLocaleString()} Ar</span>
                  <span>0 Ar</span>
                </div>
              </div>
              
              {/* Graphique */}
              <div className="ml-12 h-full flex items-end gap-4">
                {chartData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-full ${
                        chartType === 'bar' 
                          ? 'bg-gradient-to-t from-blue-400 to-blue-600 rounded-t' 
                          : 'bg-blue-500 rounded-full'
                      }`}
                      style={{
                        height: maxRevenue > 0 ? `${(item.revenue / maxRevenue) * 85}%` : '0%',
                        minHeight: '4px'
                      }}
                    />
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      {timeFilter === 'day' 
                        ? new Date(item.label).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                        : item.label
                      }
                    </div>
                    <div className="text-xs font-medium text-blue-900 mt-1">
                      {item.revenue.toLocaleString()} Ar
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bilan Journalier */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Bilan Journalier (30 derniers jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {revenueData.daily.slice().reverse().map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {new Date(day.date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-900">
                        {day.revenue.toLocaleString()} Ar
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {revenueData.daily.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune donnée de revenu journalier</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bilan Mensuel */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-green-500" />
                Bilan Mensuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {revenueData.monthly.slice().reverse().map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-green-700">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{month.month}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-900">
                        {month.revenue.toLocaleString()} Ar
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {revenueData.monthly.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <BarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune donnée de revenu mensuel</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bilan Annuel */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-purple-500" />
                Bilan Annuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {revenueData.yearly.slice().reverse().map((year, index) => (
                  <div key={year.year} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-700">
                          {year.year}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">Année {year.year}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-900">
                        {year.revenue.toLocaleString()} Ar
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {revenueData.yearly.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune donnée de revenu annuel</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-600" />
            Résumé des Performances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Points Forts</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Croissance positive</p>
                    <p className="text-xs text-emerald-700">Tendance à la hausse sur les derniers mois</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <BarChart className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Stabilité mensuelle</p>
                    <p className="text-xs text-blue-700">Revenus constants et prévisibles</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Recommandations</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Target className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Diversification</p>

                    <p className="text-xs text-amber-700">Explorer de nouvelles sources de revenus</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Surveillance</p>
                    <p className="text-xs text-red-700">Analyser les baisses pour ajuster la stratégie</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}