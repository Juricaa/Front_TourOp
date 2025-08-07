import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import type { Client } from "@shared/types";
import type { BookingClient } from "@shared/booking";

export default function ClientStep() {
  const { state, setClient } = useBooking();
  const [existingClients, setExistingClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  // Utilisez directement state.client comme source de vérité
  const clientForm = state.client || {
    name: "",
    email: "",
    phone: "",
    nationality: "",
    address: "",
    nbpersonnes: 2,
    notes: "",
    dateTravel: "",
    dateReturn: "",
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/clients");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        setExistingClients(data.data);
      } else {
        setExistingClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setExistingClients([]);
    }
  };

  const filteredClients = existingClients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.nationality.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectExistingClient = (client: Client) => {
    const bookingClient: BookingClient = {
      id: client.idClient || client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      nationality: client.nationality,
      address: client.address,
      nbpersonnes: typeof client.nbpersonnes === "string"
        ? parseInt(client.nbpersonnes)
        : client.nbpersonnes || 2,
      notes: client.notes,
      dateTravel: clientForm.dateTravel ,
      dateReturn: clientForm.dateReturn,
    };
    setClient(bookingClient);
    setShowNewClientForm(false);
  };

  const handleNewClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      clientForm.name &&
      clientForm.email &&
      clientForm.phone &&
      clientForm.nationality &&
      clientForm.dateTravel &&
      clientForm.dateReturn
    ) {
      // Validate that return date is after travel date
      const travelDate = new Date(clientForm.dateTravel);
      const returnDate = new Date(clientForm.dateReturn);
      
      if (returnDate <= travelDate) {
        alert("La date de retour doit être après la date de voyage");
        return;
      }
      
      setClient(clientForm);
    } else {
      alert("Veuillez remplir tous les champs obligatoires, y compris les dates de voyage");
    }
  };

  const handleInputChange = (field: keyof BookingClient, value: any) => {
    const updatedForm = { ...clientForm, [field]: value };
    setClient(updatedForm);
  };

  const resetClient = () => {
    setClient(null);
    setShowNewClientForm(false);
  };

  return (
    <div className="space-y-6">
      {!state.client && !showNewClientForm && (
        <>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">
              Sélectionner un client existant
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un client par nom, email ou nationalité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredClients.map((client, index) => (
                <Card
                  key={client.idClient || client.id || `client-${index}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectExistingClient(client)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">
                        {client.name}
                      </h4>
                      <Badge variant="outline">{client.nationality}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {typeof client.nbpersonnes === "string"
                          ? parseInt(client.nbpersonnes)
                          : client.nbpersonnes}{" "}
                        personne(s)
                      </div>
                      {client.lastVisit && (
                        <div className="text-xs text-forest-600">
                          Dernière reservation: {client.lastVisit}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setShowNewClientForm(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un nouveau client
            </Button>
          </div>
        </>
      )}

      {(showNewClientForm || state.client) && (
        <form onSubmit={handleNewClientSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">
              {state.client ? "Informations du client" : "Nouveau client"}
            </h3>
            {state.client && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetClient}
              >
                Changer de client
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={clientForm.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nom et prénom du client"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateTravel">Date de Voyage du *</Label>
                  <Input
                    id="dateTravel"
                    type="date"
                    value={clientForm.dateTravel}
                    onChange={(e) => handleInputChange("dateTravel", e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateReturn">Date de retour *</Label>
                  <Input
                    id="dateReturn"
                    type="date"
                    value={clientForm.dateReturn}
                    onChange={(e) => handleInputChange("dateReturn", e.target.value)}
                    required
                    min={clientForm.dateTravel || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={clientForm.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="adresse@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={clientForm.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+261 XX XX XXX XX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationalité *</Label>
              <Select
                value={clientForm.nationality}
                onValueChange={(value) =>
                  handleInputChange("nationality", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la nationalité" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "France",
                    "Allemagne",
                    "États-Unis",
                    "Royaume-Uni",
                    "Italie",
                    "Espagne",
                    "Suisse",
                    "Canada",
                    "Australie",
                    "Madagascar",
                    "Autre",
                  ].map((nationality) => (
                    <SelectItem key={nationality} value={nationality}>
                      {nationality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nbpersonnes">Nombre de personnes *</Label>
              <Select
                value={clientForm.nbpersonnes.toString()}
                onValueChange={(value) =>
                  handleInputChange("nbpersonnes", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(20)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} personne{i > 0 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={clientForm.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Adresse complète du client"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes et préférences</Label>
              <Textarea
                id="notes"
                value={clientForm.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Préférences alimentaires, besoins spéciaux, notes importantes..."
                rows={3}
              />
            </div>
          </div>

          {state.client && (
            <div className="bg-forest-50 border border-forest-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-forest-700">
                <Users className="w-4 h-4" />
                <span className="font-medium">Client sélectionné</span>
              </div>
              <div className="mt-2 text-sm text-forest-600">
                {state.client.name} - {state.client.nbpersonnes} personne(s)
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}