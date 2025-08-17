import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Calendar,
  Users,
  MapPin,
  CreditCard,
  AlertCircle,
  Edit3,
  Settings,
  Plane,
  Building,
  Car,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { reservationService } from "@/services/reservationService";
import { clientService } from "@/services/clientService";
import { volService } from "@/services/volService";
import { hebergementService } from "@/services/hebergementService";
import { voitureService } from "@/services/voitureService";
import { activiteService } from "@/services/activiteService";
import FullReservationEditor from "@/components/FullReservationEditor";
import type { Reservation, Client, Vol, Hebergement, Voiture, Activite } from "@shared/types";
import { API_BASE_URL } from "@/services/apiConfig";
import {  useLocation } from "react-router-dom";
import { factureService } from "@/services/factureService";

const statusOptions = [
  {
    value: "en_attente",
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "confirmé",
    label: "Confirmée",
    color: "bg-green-100 text-green-800",
  },
  { value: "en_cours", label: "En cours", color: "bg-red-100 text-red-800" },
  { value: "terminé", label: "Terminée", color: "bg-blue-100 text-blue-800" },
];

const paymentStatusOptions = [
  {
    value: "en_attente",
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "partial",
    label: "Partiel",
    color: "bg-orange-100 text-orange-800",
  },
  { value: "payé", label: "Payé", color: "bg-green-100 text-green-800" },
  { value: "remboursé", label: "Remboursé", color: "bg-gray-100 text-gray-800" },
];

export default function EditReservationComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("quick");
  const location = useLocation();
  const reservationData = location.state?.reservation;
  
  // Data for full editor
  const [clients, setClients] = useState<Client[]>([]);
  const [vols, setVols] = useState<Vol[]>([]);
  const [hebergements, setHebergements] = useState<Hebergement[]>([]);
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [activites, setActivites] = useState<Activite[]>([]);
  const [selectedServices, setSelectedServices] = useState({
    flights: [] as string[],
    accommodations: [] as string[],
    vehicles: [] as string[],
    activities: [] as string[],
  });
 
  const [formData, setFormData] = useState({
    status: "",
    notes: "",
    totalPrice: "",
    paymentStatus: "",
    deposit: 0,
    dateTravel: "",
    dateReturn: "",
    participants: 1,
    clientId: "",
    destination:"",
    dateCreated: new Date(""),
  });

  useEffect(() => {
    
    if (id) {
      console.log("Received reservation:", reservationData);
      fetchReservation(id);
      fetchServiceData();
    
    }

    const handleKeyDown = (event) => {
      // Vérifie si Alt est pressé + flèche gauche
      if (event.altKey && event.key === "ArrowLeft") {
        navigate(-1); // Va à la page précédente dans l'historique
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [id, navigate]);

  const fetchReservation = async (reservationId: string) => {
    try {  
      
      const response = await factureService.getFacture(reservationId );
      console.log(response)
      if (response.success && response.data) {
        setReservation(reservationData);
        fetchClient (reservationData.clientId);
        
        setFormData({
          status: response.data.status,
          notes: response.data.notes || "",
          totalPrice: response.data.totalPrice,
          paymentStatus: response.data.paymentStatus || "pending",
          deposit: response.data.deposit || 0,
          dateTravel: response.data.dateTravel.split('T')[0],
          dateReturn: response.data.dateReturn.split('T')[0],
          participants: response.data.clientId.nbpersonnes || 1,
          clientId: response.data.clientId,
          dateCreated: response.data.dateCreated,
          destination: response.data.destination

        });
        
        // Initialize selected services
        setSelectedServices({
          flights: (reservationData.vols || []).map((v: any) => v.id || v),
          accommodations: (reservationData.hebergements || []).map((h: any) => h.id || h),
          vehicles: (reservationData.voitures || []).map((v: any) => v.id || v),
          activities: (reservationData.activites || []).map((a: any) => a.id || a),
        });
      } else {
        setError(response.error || "Réservation non trouvée");
      }
    } catch (error) {
      console.error("Error fetching reservation:", error);
      setError("Erreur lors du chargement de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const fetchClient = async (clientId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`);
      const data = await response.json();
      if (data.success) {
        setClients(data.data);
        console.log (data.data)
      }
    } catch (error) {
      console.error("Error fetching client:", error);
    }
  };

  const fetchServiceData = async () => {
    setServicesLoading(true);
    try {
      const requests = [
        fetch(`${API_BASE_URL}/clients`).catch(err => ({ ok: false, error: err })),
        fetch(`${API_BASE_URL}/vols`).catch(err => ({ ok: false, error: err })),
        fetch(`${API_BASE_URL}/hebergements`).catch(err => ({ ok: false, error: err })),
        fetch(`${API_BASE_URL}/voitures`).catch(err => ({ ok: false, error: err })),
        fetch(`${API_BASE_URL}/activites`).catch(err => ({ ok: false, error: err }))
      ];

      const [clientsRes, volsRes, hebergementsRes, voituresRes, activitesRes] = await Promise.all(requests);

      // Process each response safely
      if (clientsRes.ok) {
        try {
          const clientsData = await clientsRes.json();
          if (clientsData.success && Array.isArray(clientsData.data)) {
            setClients(clientsData.data);
          }
        } catch (err) {
          console.error('Error parsing clients data:', err);
        }
      }

      if (volsRes.ok) {
        try {
          const volsData = await volsRes.json();
          if (volsData.success && Array.isArray(volsData.data)) {
            setVols(volsData.data);
          }
        } catch (err) {
          console.error('Error parsing vols data:', err);
        }
      }

      if (hebergementsRes.ok) {
        try {
          const hebergementsData = await hebergementsRes.json();
          if (hebergementsData.success && Array.isArray(hebergementsData.data)) {
            setHebergements(hebergementsData.data);
          }
        } catch (err) {
          console.error('Error parsing hebergements data:', err);
        }
      }

      if (voituresRes.ok) {
        try {
          const voituresData = await voituresRes.json();
          if (voituresData.success && Array.isArray(voituresData.data)) {
            setVoitures(voituresData.data);
          }
        } catch (err) {
          console.error('Error parsing voitures data:', err);
        }
      }

      if (activitesRes.ok) {
        try {
          const activitesData = await activitesRes.json();
          if (activitesData.success && Array.isArray(activitesData.data)) {
            setActivites(activitesData.data);
          }
        } catch (err) {
          console.error('Error parsing activites data:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching service data:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données des services. Certaines fonctionnalités peuvent être limitées.",
        variant: "destructive",
      });
    } finally {
      setServicesLoading(false);
    }
  };

  const handleServiceToggle = (serviceType: 'flights' | 'accommodations' | 'vehicles' | 'activities', serviceId: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceType]: prev[serviceType].includes(serviceId)
        ? prev[serviceType].filter(id => id !== serviceId)
        : [...prev[serviceType], serviceId]
    }));
  };

  const calculateTotalFromServices = () => {
    let total = 0;

    (selectedServices.flights || []).forEach(id => {
      const vol = (vols || []).find(v => v.idVol === id);
      if (vol) total += (vol.price || 0) * (formData.participants || 1);
    });

    (selectedServices.accommodations || []).forEach(id => {
      const hebergement = (hebergements || []).find(h => h.idHebergement === id);
      if (hebergement) total += (hebergement.priceRange || 0) * 7; // Assume 7 nights
    });

    (selectedServices.vehicles || []).forEach(id => {
      const voiture = (voitures || []).find(v => v.idVoiture === id);
      if (voiture) total += (voiture.pricePerDay || 0) * 7; // Assume 7 days
    });

    (selectedServices.activities || []).forEach(id => {
      const activite = (activites || []).find(a => a.idActivite === id);
      if (activite) total += (activite.priceAdult || 0) * (formData.participants || 1);
    });

    return total;
  };

  const validateForm = () => {
    if (formData.totalPrice < 0) {
      toast({
        title: "Erreur de validation",
        description: "Le prix total ne peut pas être négatif.",
        variant: "destructive",
      });
      return true;
    }

    if (formData.deposit < 0 || formData.deposit > formData.totalPrice) {
      toast({
        title: "Erreur de validation",
        description: "L'acompte ne peut pas être négatif ou supérieur au prix total.",
        variant: "destructive",
      });
      return true;
    }

    if (formData.participants < 1) {
      toast({
        title: "Erreur de validation",
        description: "Le nombre de participants doit être au moins 1.",
        variant: "destructive",
      });
      return true;
    }

    if (formData.dateTravel && formData.dateReturn) {
      const startDate = new Date(formData.dateTravel);
      const endDate = new Date(formData.dateReturn);
      if (endDate < startDate) {
        toast({
          title: "Erreur de validation",
          description: "La date de retour ne peut pas être antérieure à la date de départ.",
          variant: "destructive",
        });
        return true;
      }
    }

    return false;
  };

  const handleSave = async () => {
    if (!reservation || !id) return;

    const validationError = validateForm();
    if (validationError) return;

    setSaving(true);
    try {
      const updateData = {
        clientId : formData.clientId.idClient,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        destination: formData.destination,
        notes: formData.notes,
        totalPrice: activeTab === 'full' ? calculateTotalFromServices() : parseInt(formData.totalPrice.toString()) || 0,
        deposit: parseInt(formData.deposit.toString()) || 0,
        participants: parseInt(formData.participants.toString()) || 1,
        // dateTravel: formData.dateTravel ? new Date(formData.dateTravel).toISOString() : reservation.dateTravel,
        // dateReturn: formData.dateReturn ? new Date(formData.dateReturn).toISOString() : reservation.dateReturn,
        // Include service selections if in full mode
        ...(activeTab === 'full' && {
          vols: selectedServices.flights,
          hebergements: selectedServices.accommodations,
          voitures: selectedServices.vehicles,
          activites: selectedServices.activities,
        }),
      };

      const response = await factureService.updateFacture(id, updateData);
      
      if (response.success) {
        toast({
          title: "Réservation modifiée",
          description: "Les modifications ont été sauvegardées avec succès.",
        });fetchReservation(id)
        // navigate(`/reservations/${id}`);
      } else {
        setError(response.error || "Erreur lors de la sauvegarde");
        toast({
          title: "Erreur",
          description: response.error || "Erreur lors de la sauvegarde",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving reservation:", error);
      setError("Erreur lors de la sauvegarde");
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string, options: typeof statusOptions) => {
    const option = options.find((opt) => opt.value === status);
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : (
      <Badge variant="outline">{status}</Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">
          {error || "Réservation non trouvée"}
        </h2>
        <Button onClick={() => navigate("/reservations")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux réservations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Edit3 className="w-6 h-6" />
              Modifier la réservation {reservation.id}
            </h1>
            <p className="text-muted-foreground">
              Client ID: {reservation.clientId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(reservation.status, statusOptions)}
        </div>
      </div>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Édition rapide
              </TabsTrigger>
              <TabsTrigger value="full" className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Éditeur complet
              </TabsTrigger>
            </TabsList>

            {/* Quick Edit Tab */}
            <TabsContent value="quick" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Informations de la réservation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Statut de la réservation</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="paymentStatus">Statut de paiement</Label>
                      <Select
                        value={formData.paymentStatus}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, paymentStatus: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateTravel">Date de départ</Label>
                      <Input
                        id="dateTravel"
                        type="date"
                        value={formData.dateTravel}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, dateTravel: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateReturn">Date de retour (optionnel)</Label>
                      <Input
                        id="dateReturn"
                        type="date"
                        value={formData.dateReturn}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, dateReturn: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="participants">Nombre de participants</Label>
                      <Input
                        id="participants"
                        type="number"
                        min="1"
                        value={formData.participants}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            participants: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Devise</Label>
                      <Select value={reservation.currency} disabled>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ar">Ariary (Ar)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="USD">Dollar ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="participants">Destinations</Label>
                      <Input
                        id="participants"
                        type="text"
                        value={formData.destination}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, destination: e.target.value }))
                        }
                      />
                    </div>
                  </div>

            

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Notes additionnelles sur la réservation..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Full Editor Tab */}
            <TabsContent value="full" className="space-y-6">
              {servicesLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement des services disponibles...</p>
                  </CardContent>
                </Card>
              ) : (
                <FullReservationEditor
                  reservation={reservation}
                  formData={formData}
                  setFormData={setFormData}
                  clients={clients}
                  vols={vols}
                  hebergements={hebergements}
                  voitures={voitures}
                  activites={activites}
                  selectedServices={selectedServices}
                  onServiceToggle={handleServiceToggle}
                  onCalculateTotal={calculateTotalFromServices}
                />
              )}
            </TabsContent>

            {/* Save Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (id) {
                    setLoading(true);
                    fetchReservation(id);
                  }
                }}
                disabled={loading}
              >
                Actualiser
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/reservations/${id}`)}
              >
                Annuler
              </Button>
            </div>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reservation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  Départ:{" "}
                  {formData.dateTravel ? new Date(formData.dateTravel).toLocaleDateString("fr-FR") : "Non défini"}
                  {formData.dateReturn && (
                    <>
                      {" "}
                      - Retour:{" "}
                      {new Date(formData.dateReturn).toLocaleDateString("fr-FR")}
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{formData.participants} participant(s)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span>Client ID: {reservation.clientId}</span>
              </div>
              <div className="pt-2 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Prix total:</span>
                  <span className="font-medium">
                    {formatCurrency(activeTab === 'full' ? calculateTotalFromServices() : formData.totalPrice)} {reservation.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Acompte versé:</span>
                  <span className="font-medium">
                    {formatCurrency(formData.deposit)} {reservation.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reste à payer:</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency((activeTab === 'full' ? calculateTotalFromServices() : formData.totalPrice) - formData.deposit)} {reservation.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>Créé le:</span>
                  <span className="font-medium">
                    {new Date(formData.dateCreated).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {reservation.lastModified && (
                  <div className="flex justify-between text-sm">
                    <span>Modifié le:</span>
                    <span className="font-medium">
                      {new Date(reservation.lastModified).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "confirmed" }))
                }
              >
                Confirmer la réservation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, paymentStatus: "paid" }))
                }
              >
                Marquer comme payé
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "completed" }))
                }
              >
                Marquer comme terminé
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-destructive"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "cancelled" }))
                }
              >
                Annuler la réservation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
