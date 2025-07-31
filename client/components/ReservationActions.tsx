import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Receipt, Route, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { useInvoices } from "@/hooks/useInvoices";
import { useTravelPlans } from "@/hooks/useTravelPlans";
import type { Reservation } from "@shared/types";
import type { Invoice } from "@/hooks/useInvoices";
import type { TravelPlan } from "@/hooks/useTravelPlans";

interface ReservationActionsProps {
  reservation: Reservation;
  onEdit?: (reservation: Reservation) => void;
  compact?: boolean;
}

export function ReservationActions({
  reservation,
  onEdit,
  compact = false,
}: ReservationActionsProps) {
  const navigate = useNavigate();
  const { generateInvoiceFromReservation } = useInvoices();
  const { generateTravelPlanFromReservation } = useTravelPlans();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [travelPlanDialogOpen, setTravelPlanDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedTravelPlan, setSelectedTravelPlan] =
    useState<TravelPlan | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const handleEditReservation = () => {
    if (onEdit) {
      onEdit(reservation);
    } else {
      // Default edit handling
      const editData = {
        reservationId: reservation.id,
        client: {
          id: reservation.clientId,
          name: reservation.clientId,
          email: "",
          phone: "",
          nationality: "",
          address: "",
          nbpersonnes: 1,
        },
        flights: reservation.vols || [],
        accommodations: reservation.hebergements || [],
        vehicles: reservation.voitures || [],
        activities: reservation.activites || [],
        travelDates: {
          start: new Date(reservation.dateTravel),
          end: reservation.dateReturn
            ? new Date(reservation.dateReturn)
            : new Date(),
        },
        totalPrice: reservation.totalPrice,
        currency: reservation.currency,
        notes: reservation.notes,
        status: reservation.status,
      };

      localStorage.setItem("editReservation", JSON.stringify(editData));
      navigate("/reservations/new?mode=edit");
    }
  };

  const handleViewInvoice = async () => {
    try {
      // Générer une facture depuis la réservation ou trouver une existante
      const result = await generateInvoiceFromReservation(reservation.id);
      if (result.success && result.data) {
        setSelectedInvoice(result.data);
        setInvoiceDialogOpen(true);
      } else {
        // Créer une facture temporaire pour l'aperçu
        const mockInvoice: Invoice = {
          id: `temp-${Date.now()}`,
          number: `FAC-TEMP-${reservation.id}`,
          reservationId: reservation.id,
          clientId: reservation.clientId,
          clientName: reservation.clientId,
          clientEmail: "",
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "draft",
          subtotal: reservation.totalPrice,
          taxRate: 10,
          taxAmount: reservation.totalPrice * 0.1,
          total: reservation.totalPrice * 1.1,
          currency: reservation.currency,
          items: [
            {
              id: "1",
              description: `Voyage - Réservation ${reservation.id}`,
              quantity: 1,
              unitPrice: reservation.totalPrice,
              total: reservation.totalPrice,
            },
          ],
          notes: reservation.notes,
        };
        setSelectedInvoice(mockInvoice);
        setInvoiceDialogOpen(true);
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
    }
  };

  const handleViewTravelPlan = async () => {
    try {
      // Générer un plan de voyage depuis la réservation ou trouver un existant
      const result = await generateTravelPlanFromReservation(reservation.id);
      if (result.success && result.data) {
        setSelectedTravelPlan(result.data);
        setTravelPlanDialogOpen(true);
      } else {
        // Créer un plan temporaire pour l'aperçu
        const startDate = new Date(reservation.dateTravel);
        const endDate = reservation.dateReturn
          ? new Date(reservation.dateReturn)
          : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const duration = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
        );

        const mockPlan: TravelPlan = {
          id: `temp-${Date.now()}`,
          planNumber: `PLAN-TEMP-${reservation.id}`,
          title: `Voyage - Réservation ${reservation.id}`,
          clientId: reservation.clientId,
          clientName: reservation.clientId,
          reservationId: reservation.id,
          destination: "Madagascar",
          startDate: startDate,
          endDate: endDate,
          duration: duration,
          participants: 2,
          travelStyle: "comfort",
          pricePerPerson: reservation.totalPrice / 2,
          totalPrice: reservation.totalPrice,
          currency: reservation.currency,
          includes: ["Hébergement selon réservation", "Transport", "Activités"],
          excludes: ["Vols internationaux", "Assurance voyage"],
          difficulty: "easy",
          bestSeason: ["Avril", "Mai", "Septembre", "Octobre"],
          status: "draft",
          days: [],
          notes: reservation.notes,
          createdAt: new Date(),
        };
        setSelectedTravelPlan(mockPlan);
        setTravelPlanDialogOpen(true);
      }
    } catch (error) {
      console.error("Error generating travel plan:", error);
    }
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={`/reservation/${reservation.idReservation}`}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détail
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditReservation}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewInvoice}>
            <Receipt className="h-4 w-4 mr-2" />
            Voir facture
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewTravelPlan}>
            <Route className="h-4 w-4 mr-2" />
            Plan de voyage
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" asChild title="Voir détail">
          <Link to={`/reservation/${reservation.idReservation}`}>
            <Eye className="h-3 w-3" />
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditReservation}
          title="Modifier"
        >
          <Edit className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewInvoice}
          title="Voir facture"
        >
          <Receipt className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewTravelPlan}
          title="Voir plan de voyage"
        >
          <Route className="h-3 w-3" />
        </Button>
      </div>

      {/* Modales pour les aperçus */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInvoice
                ? `Facture ${selectedInvoice.number}`
                : "Aperçu Facture"}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && <InvoiceView invoice={selectedInvoice} />}
        </DialogContent>
      </Dialog>

      <Dialog
        open={travelPlanDialogOpen}
        onOpenChange={setTravelPlanDialogOpen}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTravelPlan
                ? selectedTravelPlan.title
                : "Aperçu Plan de Voyage"}
            </DialogTitle>
          </DialogHeader>
          {selectedTravelPlan && <TravelPlanView plan={selectedTravelPlan} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Composant pour afficher les détails d'une facture
interface InvoiceViewProps {
  invoice: Invoice;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice }) => {
  const statusLabels = {
    draft: "Brouillon",
    sent: "Envoyée",
    paid: "Payée",
    overdue: "En retard",
    cancelled: "Annulée",
  };

  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-green-600">TourOp Madagascar</h2>
        <p className="text-sm text-muted-foreground">
          123 Avenue des Baobabs, Antananarivo
        </p>
        <p className="text-sm text-muted-foreground">Tél: +261 20 12 345 67</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Facturé à:</h3>
          <p className="text-sm">
            {invoice.clientName}
            <br />
            {invoice.clientEmail}
            {invoice.clientAddress && (
              <>
                <br />
                {invoice.clientAddress}
              </>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="space-y-1">
            <p className="text-sm">
              <strong>Facture N°:</strong> {invoice.number}
            </p>
            <p className="text-sm">
              <strong>Date:</strong>{" "}
              {new Date(invoice.issueDate).toLocaleDateString("fr-FR")}
            </p>
            <p className="text-sm">
              <strong>Échéance:</strong>{" "}
              {new Date(invoice.dueDate).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium">Description</th>
              <th className="text-right p-3 font-medium">Quantité</th>
              <th className="text-right p-3 font-medium">Prix unitaire</th>
              <th className="text-right p-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.description}</td>
                <td className="text-right p-3">{item.quantity}</td>
                <td className="text-right p-3">€{item.unitPrice.toFixed(2)}</td>
                <td className="text-right p-3">€{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Sous-total:</span>
            <span>€{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>TVA ({invoice.taxRate}%):</span>
            <span>€{invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>€{invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Notes:</h4>
          <p className="text-sm text-muted-foreground">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher les détails d'un plan de voyage
interface TravelPlanViewProps {
  plan: TravelPlan;
}

const TravelPlanView: React.FC<TravelPlanViewProps> = ({ plan }) => {
  const currencySymbols = { EUR: "€", USD: "$", Ar: "Ar" };

  const difficultyLabels = {
    easy: "Facile",
    moderate: "Modéré",
    challenging: "Difficile",
  };

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-green-600">{plan.title}</h2>
        <p className="text-lg text-muted-foreground">{plan.destination}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-green-600">
              Informations client
            </h3>
            <p className="text-sm">{plan.clientName}</p>
          </div>

          <div>
            <h3 className="font-semibold text-green-600">Détails du voyage</h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>Période:</strong>{" "}
                {new Date(plan.startDate).toLocaleDateString("fr-FR")} -{" "}
                {new Date(plan.endDate).toLocaleDateString("fr-FR")}
              </p>
              <p>
                <strong>Durée:</strong> {plan.duration} jours
              </p>
              <p>
                <strong>Participants:</strong> {plan.participants} personne(s)
              </p>
              <p>
                <strong>Style:</strong> {plan.travelStyle}
              </p>
              <p>
                <strong>Difficulté:</strong> {difficultyLabels[plan.difficulty]}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">
            {currencySymbols[plan.currency as keyof typeof currencySymbols]}
            {plan.totalPrice.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {currencySymbols[plan.currency as keyof typeof currencySymbols]}
            {plan.pricePerPerson.toLocaleString()} par personne
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-green-600 mb-2">Services inclus</h3>
          <ul className="text-sm space-y-1">
            {plan.includes.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-red-600 mb-2">
            Services non inclus
          </h3>
          <ul className="text-sm space-y-1">
            {plan.excludes.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-red-600">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {plan.days.length > 0 && (
        <div>
          <h3 className="font-semibold text-green-600 mb-3">
            Programme jour par jour
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {plan.days.slice(0, 3).map((day) => (
              <div key={day.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">
                    Jour {day.day} - {day.title}
                  </h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {day.location}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {day.description}
                </p>

                {day.activities.slice(0, 2).map((activity, index) => (
                  <div
                    key={index}
                    className="text-xs bg-gray-50 p-2 rounded mb-1"
                  >
                    <strong>{activity.time}:</strong> {activity.activity}
                  </div>
                ))}

                {day.activities.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    ... et {day.activities.length - 2} autres activités
                  </p>
                )}
              </div>
            ))}

            {plan.days.length > 3 && (
              <div className="text-center text-sm text-muted-foreground">
                ... et {plan.days.length - 3} autres jours
              </div>
            )}
          </div>
        </div>
      )}

      {(plan.guide || plan.notes) && (
        <div className="border-t pt-4 space-y-3">
          {plan.guide && (
            <div>
              <h3 className="font-semibold text-green-600">Guide</h3>
              <p className="text-sm">
                {plan.guide.name} - {plan.guide.phone}
                <br />
                Langues: {plan.guide.languages.join(", ")}
              </p>
            </div>
          )}

          {plan.notes && (
            <div>
              <h3 className="font-semibold text-green-600">Notes</h3>
              <p className="text-sm text-muted-foreground">{plan.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
