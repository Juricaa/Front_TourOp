import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { UserPlus, ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import type { Client, ApiResponse } from "@shared/types";
import { clientService } from "@/services/clientService";

export default function NewClient() {
  const navigate = useNavigate();
  const { idClient } = useParams<{ idClient?: string }>(); // Récupérer l'ID du client depuis l'URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEdit, setIsEdit] = useState(false); // Mode édition
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    address: "",
    nbpersonnes: 1,
    notes: "",
    destinations: "",
  });

  // Charger les données du client si en mode édition
  useEffect(() => {
    console.log("Loading client data for ID:", idClient);
    if (idClient) {
      setIsEdit(true);
      setLoading(true);
      clientService
        .getClient(idClient)
        .then((response) => {
          if (response.success && response.data) {
            setFormData({
              name: response.data.name,
              email: response.data.email,
              phone: response.data.phone,
              nationality: response.data.nationality,
              address: response.data.address,
              nbpersonnes: response.data.nbpersonnes,
              notes: response.data.notes || "",
              destinations: response.data.destinations.join(", "),
            });
          } else {
            setError("Impossible de charger les données du client.");
          }
        })
        .catch(() => setError("Erreur réseau : impossible de charger le client."))
        .finally(() => setLoading(false));
    }
  }, [idClient]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "nbpersonnes" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const clientData: Omit<Client, "idClient"> = {
        ...formData,
        destinations: formData.destinations
          .split(",")
          .map((dest) => dest.trim())
          .filter(Boolean),
      };

      const response: ApiResponse<Client> = isEdit
        ? await clientService.updateClient(idClient!, clientData)
        : await clientService.createClient(clientData);

      if (response.success && response.data) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/clients");
        }, 1500);
      } else {
        setError(response.error || "Échec de l'opération.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      setError("Erreur réseau : impossible de soumettre le formulaire.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isEdit ? "Client modifié avec succès!" : "Client créé avec succès!"}
            </h2>
            <p className="text-muted-foreground">
              Redirection vers la liste des clients...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-madagascar-500" />
            {isEdit ? "Modifier Client" : "Nouveau Client"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Modifier les informations du client existant"
              : "Ajouter un nouveau client à votre base de données"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationalité *</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  placeholder="Française"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jean.dupont@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+33 1 23 45 67 89"
                  required
                />
              </div>
            </div>

            {/* Address and Group Size */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Rue de la Paix, 75001 Paris, France"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nbpersonnes">Nombre de personnes *</Label>
              <Input
                id="nbpersonnes"
                name="nbpersonnes"
                type="number"
                min="1"
                value={formData.nbpersonnes}
                onChange={handleInputChange}
                required
              />
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="destinations">
                Destinations d'intérêt (séparées par des virgules)
              </Label>
              <Input
                id="destinations"
                name="destinations"
                value={formData.destinations}
                onChange={handleInputChange}
                placeholder="Antananarivo, Andasibe, Morondava"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Notes supplémentaires sur le client..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/clients">Annuler</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  "En cours..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Modifier le Client" : "Créer le Client"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
