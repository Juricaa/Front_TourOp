import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Calendar,
  Users,
  MapPin,
  Receipt,
  Route,
  FileText,
  MoreHorizontal,
  Trash2,
  Printer,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Invoice } from "@shared/types";
import { factureService } from "@/services/factureService";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function Reservations() {
  const [reservations, setReservations] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(null);

  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<{
    id: string;
    start: Date;
    end: Date;
    factureId: string;
  } | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await factureService.getFactures();

      if (response.success && response.data) {
        setReservations(response.data);
        console.log(reservations);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
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
      case "confirmé":
        return "bg-forest-100 text-forest-800 border-forest-200";
      case "en_attente":
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
      case "confirmé":
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

  const filteredReservations = reservations.filter((reservation) =>
    reservation.idFacture.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDelete = async (
    id: string,
    start: Date,
    end: Date,
    factureId: string
  ) => {
    try {
      let response;

      if (id) {
        response = await factureService.deleteFacture(id, {
          date_debut: start,
          date_fin: end,
          factureId,
        });
      } else {
        response = await factureService.deleteFacture(id);
      }

      if (response.success) {
        toast({
          title: "Succès",
          description: "Réservation supprimée avec succès",
        });
        await fetchReservations();
      } else {
        throw new Error(response.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: `Impossible de supprimer: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleConfirm = async (invoiceId: string, id: string) => {
    try {
      const updatedData = {
        clientId: id,
        status: "confirmé",
      };

      const response = await factureService.updateFacture(invoiceId, updatedData);
      fetchReservations();

      toast({
        title: "Succès",
        description: "Reservation confirmée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
      toast({
        title: "Erreur",
        description: `Impossible de confirmer la reservation: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const statusMap: { [key: string]: "paid" | "sent" | "draft" | "cancelled" | "overdue" } = {
        "active": "paid",
        "confirmé": "paid",
        "en_attente": "sent"
      };

      const updatedData = {
        status: statusMap[newStatus] || "sent",
      };

      const response = await factureService.updateFacture(invoiceId, updatedData);
      fetchReservations();

      toast({
        title: "Succès",
        description: `Statut mis à jour: ${newStatus}`,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le statut: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-madagascar-500" />
            Gestion des Réservations
          </h1>
          <p className="text-muted-foreground">
            Suivez et gérez toutes vos réservations
          </p>
        </div>
        <Button asChild>
          <Link to="/reservations/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Réservation
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Réservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {reservations.length}
            </div>
            <p className="text-xs text-muted-foreground">Cette année</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-forest-600">
              {reservations.filter((r) => r.status === "confirmé").length}
            </div>
            <p className="text-xs text-muted-foreground">Prêtes à partir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sunset-600">
              {reservations.filter((r) => r.status === "en_attente").length}
            </div>
            <p className="text-xs text-muted-foreground">À confirmer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chiffre d'Affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(
                reservations.reduce(
                  (sum, r) => sum + parseFloat(r.totalPrice),
                  0
                )
              )}{" "}
              Ar
            </div>
            <p className="text-xs text-muted-foreground">Total réservations</p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des Réservations</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher par ID..."
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
                  <TableHead>Réservation</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Dates</TableHead>

                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {reservation.idFacture}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Créée le{" "}
                          {new Date(reservation.dateCreated).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.clientId.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.clientId.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {new Date(
                              reservation.dateTravel
                            ).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        {reservation.dateReturn && (
                          <div className="text-sm text-muted-foreground">
                            au{" "}
                            {new Date(
                              reservation.dateReturn
                            ).toLocaleDateString("fr-FR")}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(reservation.status)}
                      >
                        {getStatusText(reservation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          {formatCurrency(reservation.totalPrice)} Ar
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {reservation.currency}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {reservation.status === "en_attente" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleConfirm(
                                  reservation.idFacture,
                                  reservation.clientId.idClient
                                )
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmer
                            </DropdownMenuItem>
                          )}
                          {reservation.status === "confirmé" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(
                                  reservation.idFacture,
                                  "active"
                                )
                              }
                            >
                              <Route className="h-4 w-4 mr-2" />
                              Activer
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => {
                              navigate(`/reservations/${reservation.clientId.idClient}`, {
                                state: {
                                  date_debut: reservation.dateTravel,
                                  date_fin: reservation.dateReturn,
                                  date_created: reservation.dateCreated,
                                  factureId: reservation.idFacture,
                                  total: reservation.totalPrice,
                                  status: reservation.status,
                                },
                              });
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détail
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setReservationToDelete({
                                id: reservation.clientId.idClient,
                                start: reservation.dateTravel,
                                end: reservation.dateReturn,
                                factureId: reservation.idFacture,
                              });
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReservations.length === 0 && (
            <div className="text-center py-8">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-sm font-medium text-foreground">
                Aucune réservation trouvée
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery
                  ? "Essayez de modifier votre recherche"
                  : "Commencez par créer une nouvelle réservation"}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button asChild>
                    <Link to="/reservations/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle Réservation
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Action</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir valider cette suppression
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setReservationToDelete(null);
              }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (reservationToDelete) {
                  handleDelete(
                    reservationToDelete.id,
                    reservationToDelete.start,
                    reservationToDelete.end,
                    reservationToDelete.factureId
                  );
                }
                setIsDeleteDialogOpen(false);
                setReservationToDelete(null);
              }}
            >
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
