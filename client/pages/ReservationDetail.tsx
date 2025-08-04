// pages/reservations/[id].tsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { usePDF } from 'react-to-pdf';
import { toast } from 'sonner';
import { API_BASE_URL } from "@/services/apiConfig";
import type { Client, Invoice, SingleReservation, TravelPlan } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceView } from "../components/reservation/InvoiceView";
import { ReservationHeader } from "../components/reservation/ReservationHeader";
import { ClientInfoCard } from "../components/reservation/ClientInfoCard";
import { TravelDatesCard } from "../components/reservation/TravelDatesCard";
import { ServicesSection } from "../components/reservation/ServicesSection";
import { SummaryCard } from "../components/reservation/SummaryCard";
import { NotesCard } from "../components/reservation/NotesCard";
import { ArrowLeft, Download, CheckCircle, Clock, XCircle, Building, Plane } from "lucide-react";
// import { TravelPlanModal } from "@/components/reservation/TravelPlanModal";
import { TravelPlanView } from "@/components/reservation/TravelPlanView";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { date_debut, date_fin, date_created, factureId, total, status } = location.state || {};
  const [reservation, setReservation] = useState<SingleReservation | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isTravelPlanOpen, setIsTravelPlanOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'MGA' | 'EUR' | 'USD'>('MGA');
  const [exchangeRates, setExchangeRates] = useState({
    EUR: 0.00022,
    USD: 0.00024,
    MGA: 1
  });
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  const { toPDF, targetRef } = usePDF({
    filename: `facture-${factureId}.pdf`,
    page: { margin: 20 }
  });

  const { toPDF: toPDFPlan, targetRef: planRef } = usePDF({
    filename: `plan-voyage-${factureId}.pdf`,
    page: { margin: 20 }
  });


  const formatNumberWithSeparators = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/MGA');
      const data = await response.json();
      return {
        EUR: data.rates.EUR || 0.00022,
        USD: data.rates.USD || 0.00024,
        MGA: 1
      };
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      return {
        EUR: 0.00022,
        USD: 0.00024,
        MGA: 1
      };
    }
  };

  const formatCurrency = (amount: number, currency: 'MGA' | 'EUR' | 'USD' = selectedCurrency) => {
    const convertedAmount = amount * exchangeRates[currency];

    if (currency === 'MGA') {
      return `${formatNumberWithSeparators(Math.round(convertedAmount))} Ar`;
    } else {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(convertedAmount);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (id) {
        await fetchReservation(id);
      }

      setIsLoadingRates(true);
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
      setIsLoadingRates(false);
    };

    loadInitialData();
  }, [id]);

  const fetchReservation = async (reservationId: string) => {
    try {
      const url = new URL(`${API_BASE_URL}/reservations/client/${reservationId}/`);
      if (date_debut) url.searchParams.append('date_debut', date_debut);
      if (date_fin) url.searchParams.append('date_fin', date_fin);

      const response = await fetch(url.toString());
      const data = await response.json();
      if (response.ok && data.success) {
        console.log("donnée vierge:", data.data)
        const aggregatedReservation = transformBackendDataToReservation(data.data);
        setReservation(aggregatedReservation);
        console.log("data traité:", aggregatedReservation)
        if (reservationId) {
          fetchClient(reservationId);
        }
      } else {
        setError("Réservation non trouvée");
      }
    } catch (error) {
      console.error("Error fetching reservation:", error);
      setError("Erreur lors du chargement de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (type: 'invoice' | 'plan') => {
    if (type === 'invoice') {
      setIsInvoiceOpen(true);
    } else if (type === 'plan') {
      setIsTravelPlanOpen(true);
    }
  };

  const fetchClient = async (clientId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`);
      const data = await response.json();
      if (data.success) {
        setClient(data.data);
      }
    } catch (error) {
      console.error("Error fetching client:", error);
    }
  };

  const transformBackendDataToReservation = (backendData: any[]): SingleReservation => {
    
    const aggregatedReservation: SingleReservation = {
      id: "AGG_" + Date.now().toString(),
      clientId: "",
      status: "",
      totalPrice: 0,
      currency: "",
      dateCreated: new Date(),
      dateTravel: new Date(8640000000000000),
      dateReturn: new Date(-8640000000000000),
      notes: "",
      hebergements: [],
      voitures: [],
      activites: [],
      vols: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    backendData.forEach(item => {
      const price = parseFloat(item.montant);
      const startDate = new Date(item.date_debut);
      const endDate = item.date_fin ? new Date(item.date_fin) : startDate;

      if (startDate < aggregatedReservation.dateTravel) {
        aggregatedReservation.dateTravel = startDate;
      }
      if (endDate > aggregatedReservation.dateReturn) {
        aggregatedReservation.dateReturn = endDate;
      }

      aggregatedReservation.totalPrice += price;

      switch (item.item.type) {
        case "hebergement":
          aggregatedReservation.hebergements.push({
            id: item.item.id,
            checkIn: startDate,
            checkOut: endDate,
            rooms: 1,
            guests: item.quantite,
            price: price,
            name: item.item.name,
            location: item.item.location,
            capacity: item.item.capacity
          });
          break;

        case "voiture":
          aggregatedReservation.voitures.push({
            id: item.item.id,
            startDate: startDate,
            endDate: endDate,
            pickupLocation: item.lieu_depart || "Non spécifié",
            dropoffLocation: item.lieu_arrivee || "Non spécifié",
            price: price,
            brand: item.item.brand,
            model: item.item.model,
            pricePerDay: parseFloat(item.item.pricePerDay),
            vehicleType: item.item.vehicleType
          });
          break;

        case "activite":
          aggregatedReservation.activites.push({
            id: item.item.id,
            date: startDate,
            participants: item.quantite,
            price: price,
            name: item.item.name,
            category: item.item.category,
            priceAdult: parseFloat(item.item.priceAdult),
            duration: item.item.duration
          });
          break;

        case "vol":
          aggregatedReservation.vols.push({
            id: item.item.id,
            passengers: item.quantite,
            price: price,
            airline: item.item.airline,
            flightNumber: item.item.flightNumber,
            departure: item.lieu_depart,
            arrival: item.lieu_arrivee
          });
          break;
      }
    });

    return aggregatedReservation;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmé":
        return CheckCircle;
      case "en_attente":
        return Clock;
      case "cancelled":
        return XCircle;
      case "completed":
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const handleDelete = async () => {
    if (!reservation) return;

    if (confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      try {
        navigate("/reservations");
      } catch (error) {
        console.error("Error deleting reservation:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleExportPDF = () => {
    const toastId = toast.loading('Génération du PDF en cours...');

    setTimeout(() => {
      toPDF()
        .then(() => {
          toast.success('PDF généré avec succès !', { id: toastId });
        })
        .catch(err => {
          console.error("Erreur lors de la génération PDF", err);
          toast.error('Échec de la génération du PDF', {
            id: toastId,
            description: err.message
          });
        });
    }, 100);
  };

  const handleExportPlanPDF = () => {
    const toastId = toast.loading('Génération du plan de voyage...');

    setTimeout(() => {
      toPDFPlan()
        .then(() => {
          toast.success('Plan de voyage généré !', { id: toastId });
        })
        .catch(err => {
          console.error("Erreur génération plan", err);
          toast.error('Échec de la génération du plan', {
            id: toastId,
            description: err.message
          });
        });
    }, 100);
  };

  const getInvoiceData = (): Invoice | null => {
    if (!reservation || !client) return null;

    const invoiceNumber = `${factureId.slice(0, 8).toUpperCase()}-${new Date().getFullYear()}`;

    const convertPrice = (price: number) => price * exchangeRates[selectedCurrency];

    const items = [
      ...(reservation.vols?.map(v => ({
        id: v.id,
        description: `Vol: ${v.airline} (${v.departure} ⇆ ${v.arrival})`,
        quantity: v.passengers,
        unitPrice: convertPrice(v.price / v.passengers),
        total: convertPrice(v.price)
      })) || []),
      ...(reservation.hebergements?.map(h => ({
        id: h.id,
        description: `Hébergement: ${h.name}, (${h.location})`,
        quantity: Math.ceil((h.checkOut.getTime() - h.checkIn.getTime()) / (1000 * 60 * 60 * 24)),
        unitPrice: convertPrice(h.price / Math.ceil((h.checkOut.getTime() - h.checkIn.getTime()) / (1000 * 60 * 60 * 24))),
        total: convertPrice(h.price)
      })) || []),
      ...(reservation.voitures?.map(v => ({
        id: v.id,
        description: `Véhicule: ${v.brand} ${v.model} (${v.vehicleType})`,
        quantity: Math.ceil((v.endDate.getTime() - v.startDate.getTime()) / (1000 * 60 * 60 * 24)),
        unitPrice: convertPrice(v.price / Math.ceil((v.endDate.getTime() - v.startDate.getTime()) / (1000 * 60 * 60 * 24))),
        total: convertPrice(v.price)
      })) || []),
      ...(reservation.activites?.map(a => ({
        id: a.id,
        description: `Activité: ${a.name}`,
        quantity: a.participants,
        unitPrice: convertPrice(a.price / a.participants),
        total: convertPrice(a.price)
      })) || [])

    ];

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.20;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return {
      number: invoiceNumber,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address,
      items,
      subtotal,
      taxRate: taxRate * 100,
      taxAmount,
      total,
      notes: reservation.notes || "Merci pour votre réservation avec TourOp Madagascar",
      currency: selectedCurrency,
      travelStartDate: date_debut,  // Ajouté
      travelEndDate: date_fin,
      date_created: date_created
    };
  };

  const getTravelPlanData = (): TravelPlan | null => {
    if (!reservation || !client) {
      console.error("Données manquantes - Client:", client, "Reservation:", reservation);
      return null;
    }

    return {
      factureId,
      clientName: client.name,
      nbPersonne: client.nbpersonnes,
      date_debut,
      date_fin,
      vols: reservation.vols?.map(vol => ({
        airline: vol.airline,
        departure: vol.departure,
        arrival: vol.arrival,
        passengers: vol.passengers
      })),
      hebergements: reservation.hebergements?.map(heb => ({
        name: heb.name,
        location: heb.location,
        checkIn: heb.checkIn,
        checkOut: heb.checkOut,
        guests: heb.guests
      })),
      voitures: reservation.voitures?.map(voiture => ({
        brand: voiture.brand,
        model: voiture.model,
        pickupLocation: voiture.pickupLocation,
        dropoffLocation: voiture.dropoffLocation,
        startDate: voiture.startDate,
        endDate: voiture.endDate,
        vehicleType: voiture.vehicleType,
        price: voiture.price,
      })),
      activites: reservation.activites?.map(act => ({
        name: act.name,
        date: act.date,
        participants: act.participants
      }))
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">
            Réservation non trouvée
          </h2>
          <p className="mt-2 text-muted-foreground">
            {error || "Cette réservation n'existe pas ou a été supprimée."}
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/reservations">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux réservations
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(status);
  console.log (reservation.status)

  return (
    <div className="p-6 space-y-6">
      <ReservationHeader
        factureId={factureId}
        date_created={date_created}
        status={status}
        StatusIcon={StatusIcon}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        onView={handleView}
        date_debut={date_debut}
        date_fin={date_fin}
        onInvoiceOpen={() => setIsInvoiceOpen(true)}
        onEdit={() => navigate(`/reservations/${reservation.id}/edit`)}
        onDelete={handleDelete}
      // onView={function (type: "invoice" | "plan"): void {
      //   throw new Error("Function not implemented.");

      // }} 
      />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClientInfoCard client={client} />

          <TravelDatesCard
            date_debut={date_debut}
            date_fin={date_fin}
          />

          <ServicesSection
            reservation={reservation}
            formatCurrency={formatCurrency}
          />
        </div>

        <div className="space-y-6">
          <SummaryCard
            total={total}
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
            exchangeRates={exchangeRates}
            isLoadingRates={isLoadingRates}
            fetchExchangeRates={fetchExchangeRates}
            formatNumberWithSeparators={formatNumberWithSeparators}
            formatCurrency={formatCurrency}
            status={status}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            reservation={reservation}
          />

          {reservation.notes && (
            <NotesCard notes={reservation.notes} />
          )}
        </div>
      </div>

      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter en PDF
            </Button>
          </div>

          <div ref={targetRef}>
            {getInvoiceData() && <InvoiceView invoice={getInvoiceData()!} />}
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={isTravelPlanOpen} onOpenChange={setIsTravelPlanOpen}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-end">
            <Button onClick={handleExportPlanPDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter en PDF
            </Button>
          </div>



          <div  ref={planRef}> 
            {getTravelPlanData() && <TravelPlanView plan={getTravelPlanData()!} />}
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}