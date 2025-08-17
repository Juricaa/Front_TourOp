import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Plus,
  Eye,
} from "lucide-react";
import type { Client, ApiResponse, Reservation } from "@shared/types";
import { clientService } from "@/services/clientService";
import { API_BASE_URL } from "@/services/apiConfig";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmé":
        return "bg-forest-100 text-forest-800 border-forest-200";
      case "en_attente":
        return "bg-sunset-100 text-sunset-800 border-sunset-200";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "terminé":
        return "bg-ocean-100 text-ocean-800 border-ocean-200";
      case "en_cours":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmé":
        return "Confirmée";
      case "en_attente":
        return "En attente";
      case "cancelled":
        return "Annulée";
      case "terminé":
        return "Terminée";
      case "en_cours":
        return "En cours";
      default:
        return status;
    }
  };

  useEffect(() => {
    if (id) {
      fetchClient(id);
      fetchClientReservations(id);
    }
  }, [id]);

  const fetchClient = async (clientId: string) => {
    try {
      const response: ApiResponse<Client> =
        await clientService.getClient(clientId);
      if (response.success && response.data) {
        setClient(response.data);
      } else {
        setError(response.error || "Client not found");
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      setError("Network error: Unable to fetch client details");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientReservations = async (clientId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/client/${clientId}`);
      const data = await response.json();
      if (data.success) {
        setReservations(data.data || []);
        console.log("Client reservations:", data.data);
      } else {
        console.error("Error fetching client reservations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching client reservations:", error);
    }
  };

  const handleDelete = async () => {
    if (!client || !confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      return;
    }

    try {
      const response = await clientService.deleteClient(client.idClient);
      console.log("Delete response:", response);
      if (response.success) {
        navigate("/clients");
      } else {
        setError(response.error || "Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      setError("Network error: Unable to delete client");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error || "Client not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link to="/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux clients
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-madagascar-500" />
            {client.name}
          </h1>
          <p className="text-muted-foreground">ID: {client.idClient}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/clients/${client.idClient}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Client Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium">{client.email}</div>
                <div className="text-sm text-muted-foreground">
                  {client.phone}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{client.address}</div>
            <Badge variant="outline" className="mt-2">
              {client.nationality}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groupe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.nbpersonnes}</div>
            <div className="text-sm text-muted-foreground">
              {client.nbpersonnes > 1 ? "personnes" : "personne"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Destinations */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Destinations d'intérêt</CardTitle>
        </CardHeader>
        <CardContent>
          {client.destinations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {client.destinations.map((destination) => (
                <Badge
                  key={destination}
                  variant="secondary"
                  className="bg-madagascar-50 text-madagascar-700"
                >
                  {destination}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Aucune destination spécifiée
            </p>
          )}
        </CardContent>
      </Card> */}

      {/* Notes */}
      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Reservations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Réservations</CardTitle>
            <Button asChild>
              <Link to={`/reservations/new?clientId=${client.idClient}`}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Réservation
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    
                  <div className="flex items-center text-sm text-gray-700">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                {reservation.destination},  {new Date(reservation.dateTravel).toLocaleDateString()}
                              </div>
                    <div className="text-sm text-muted-foreground">
                     
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(reservation.status)}>
                      {getStatusText(reservation.status)}
                    </Badge>
                  
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-sm font-medium text-foreground">
                Aucune réservation
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ce client n'a pas encore de réservation
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link to={`/reservations/new?clientId=${client.idClient}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une Réservation
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Informations système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Dernière visite:</span>
              <span className="ml-2 text-muted-foreground">
                {client.lastVisit || "Jamais"}
              </span>
            </div>
            <div>
              <span className="font-medium">Date de création:</span>
              <span className="ml-2 text-muted-foreground">
                {client.createdAt
                  ? new Date(client.createdAt).toLocaleDateString()
                  : "Non disponible"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
