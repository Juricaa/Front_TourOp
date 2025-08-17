import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CalendarDays,
  MapPin,
  Plus,
  FileText,
  Car,
  Building,
  Plane,
  Activity,
  Globe,
  Route,
  Shield,
  Bell,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { factureService } from "@/services/factureService";

interface Reservation {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientDestinations: string;
  status: string;
  totalPrice: number;
  currency: string;
  dateCreated: Date;
  dateReturn: Date;
  dateTravel: Date;
}

interface DashboardStats {
  totalClients: number;
  totalReservations: number;
  totalRevenue: number;
  monthlyRevenue: number;
  popularDestinations: { name: string; count: number }[];
  recentReservations: Reservation[];
}

interface Notification {
  id: string;
  type: 'warning' | 'info';
  title: string;
  message: string;
  reservationId: string;
  clientName: string;
  daysRemaining: number;
  dateReturn: Date;
}

export default function SecretaryDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await factureService.getFactures(); 
        const result = response;

        if (result.success) {
          // Récupérer les réservations récentes
          const recentReservations: Reservation[] = result.data.map((item: any) => ({
            id: item.idFacture,
            clientId: item.clientId.idClient,
            clientName: item.clientId.name,
            clientEmail: item.clientId.email,
            clientDestinations: item.destination || [],
            status: item.status,
            totalPrice: parseFloat(item.totalPrice),
            currency: "MGA",
            dateCreated: new Date(item.dateCreated),
            dateReturn: new Date(item.dateReturn),
            dateTravel: new Date(item.dateTravel),
          }));

          // Calculer les destinations populaires
          const destinationCount: Record<string, number> = {};
          recentReservations.forEach((r) => {
            r.clientDestinations.split(',').forEach((d) => {
              destinationCount[d] = (destinationCount[d] || 0) + 1;
            });
          });

          const popularDestinations = Object.entries(destinationCount).map(
            ([name, count]) => ({ name, count })
          );

          // Trier les réservations par date de création (plus récent en premier)
          const sortedReservations = recentReservations.sort((a, b) => 
            new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
          );

          // Vérifier et mettre à jour les réservations dont la date de retour est passée
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour la comparaison

          const updatedReservations = [];
          const activeNotifications = [];

          for (const reservation of sortedReservations) {
            const dateReturn = new Date(reservation.dateReturn);
            dateReturn.setHours(0, 0, 0, 0);

            // Si la date de retour est passée ou égale à aujourd'hui et que le statut n'est pas "payé"
            if (dateReturn <= today && reservation.status !== "payé") {
              try {
                // Mettre à jour le statut via l'API
                const updateResponse = await factureService.updateFacture(reservation.id, {
                  status: "payé"
                });

                if (updateResponse.success) {
                  updatedReservations.push(reservation.id);
              // Mettre à jour le statut localement
              reservation.status = "payé";
                }
              } catch (error) {
                console.error(`Erreur lors de la mise à jour de la réservation ${reservation.id}:`, error);
              }
            }

            // Créer les notifications pour les réservations actives
            const daysRemaining = Math.ceil((dateReturn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysRemaining >= 0 && daysRemaining <= 7 && reservation.status !== "payé") {
              activeNotifications.push({
                id: `notification-${reservation.id}`,
                type: daysRemaining <= 3 ? 'warning' : 'info',
                title: daysRemaining <= 1 ? 'Urgent: Fin de séjour' : 'Fin de séjour proche',
                message: daysRemaining <= 0 
                  ? `Le séjour de ${reservation.clientName} se termine aujourd'hui!`
                  : daysRemaining === 1
                  ? `Le séjour de ${reservation.clientName} se termine demain!`
                  : `Le séjour de ${reservation.clientName} se termine dans ${daysRemaining} jours.`,
                reservationId: reservation.id,
                clientName: reservation.clientName,
                daysRemaining,
                dateReturn: reservation.dateReturn,
              });
            }
          }

          setNotifications(activeNotifications);

          // Remplir les stats
          setStats({
            totalClients: new Set(sortedReservations.map((r) => r.clientId)).size,
            totalReservations: sortedReservations.length,
            totalRevenue: sortedReservations.reduce((sum, r) => sum + r.totalPrice, 0),
            monthlyRevenue: 0,
            popularDestinations,
            recentReservations: sortedReservations,
          });

          // Log des mises à jour effectuées
          if (updatedReservations.length > 0) {
            console.log(`Statut mis à jour pour ${updatedReservations.length} réservation(s):`, updatedReservations);
          }
        }
      } catch (error) {
        console.error("Erreur API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">Chargement...</div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Erreur lors du chargement des données
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

      {/* Notifications pour réservations proches de la fin */}
      {notifications.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-madagascar-500" />
            <h2 className="text-lg font-semibold">Alertes Réservations</h2>
            <Badge variant="secondary">{notifications.length}</Badge>
          </div>
          
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 ${
                notification.type === 'warning'
                  ? 'bg-orange-50 border-orange-400 text-orange-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {notification.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <Badge
                      variant={notification.type === 'warning' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {notification.daysRemaining <= 0 ? 'Aujourd\'hui' : 
                       notification.daysRemaining === 1 ? 'Demain' : 
                       `Dans ${notification.daysRemaining} jours`}
                    </Badge>
                  </div>
                  
                  <p className="text-sm mt-1">{notification.message}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <Link to={`/reservations/${notification.reservationId}`}>
                        Voir la réservation
                      </Link>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      asChild
                    >
                      <Link to={`/clients`}>
                        Contacter {notification.clientName}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions Rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <FileText className="h-4 w-4 mr-2" />
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

        {/* Modules de Gestion */}
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
                  <Activity className="h-5 w-5" />
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

        {/* Destinations Populaires */}
        <Card>
          <CardHeader>
            <CardTitle>Destinations Populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularDestinations.map((destination) => (
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

      {/* Réservations Récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Réservations Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{reservation.clientName}</p>
                
                  <p className="text-sm text-muted-foreground">
                    Destinations : {reservation.clientDestinations}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Voyage : {reservation.dateTravel.toLocaleDateString()} - {reservation.dateReturn.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <p className="font-medium">
                    {reservation.currency} {reservation.totalPrice.toLocaleString()}
                  </p>
                  <Badge
                    variant={
                      reservation.status === "confirmé"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {reservation.status}
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
