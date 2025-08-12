import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Client, ApiResponse } from "@shared/types";
import { clientService } from "@/services/clientService";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setError(null);
      const response: ApiResponse<Client[]> = await clientService.getClients();
      console.log("Fetched clients:", response);
      if (response.success && response.data) {
        setClients(response.data);
      } else {
        setError(response.error || "Failed to fetch clientsS");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Network error: Unable to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.nationality.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
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
            Gestion des Clients
          </h1>
          <p className="text-muted-foreground">
            Gérez votre base de données client
          </p>
        </div>
        <Button asChild>
          <Link to="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Client
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {clients.length}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {clients.filter((c) => c.lastVisit).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Avec réservations récentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nationalités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Set(clients.map((c) => c.nationality)).size}
            </div>
            <p className="text-xs text-muted-foreground">Pays représentés</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des Clients</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher un client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Nationalité</TableHead>
                  <TableHead>Personnes</TableHead>
                  <TableHead>Dernière Visite</TableHead>
                  <TableHead>Destinations d'intérêt </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.idClient} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {client.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {client.idClient}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {client.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {client.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {client.nationality}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span className="text-sm font-medium">
                          {client.nbpersonnes}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.lastVisit ? (
                        <span className="text-sm text-muted-foreground">
                          {client.lastVisit}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Jamais
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.destinations.slice(0, 2).map((dest) => (
                          <Badge
                            key={dest}
                            variant="secondary"
                            className="text-xs bg-green-50 text-green-700 border-green-200" // Couleurs de succès
                          >
                            {dest}
                          </Badge>
                        ))}
                        {client.destinations.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-50 text-green-700 border-green-200" // Même style pour le badge "+X"
                          >
                            +{client.destinations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/clients/${client.idClient}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/clients/${client.idClient}/edit`}>
                            <Edit className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-sm font-medium text-foreground">
                Aucun client trouvé
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery
                  ? "Essayez de modifier votre recherche"
                  : "Commencez par ajouter un nouveau client"}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button asChild>
                    <Link to="/clients/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau Client
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
