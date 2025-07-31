import React, { useState, useEffect } from "react";
import { Voiture } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Car,
  Users,
  MapPin,
  Settings,
  Shield,
  Fuel,
  Calendar,
  Phone,
  User,
  Euro,
  Wrench,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { voitureService } from "@/services/voitureService";
import { JSX } from "react/jsx-runtime";
import { toast } from "@/hooks/use-toast";


const vehicleTypes = ["Berline", "SUV", "4x4", "Minibus", "Économique", "Luxe"];

const locations = [
  "Antananarivo",
  "Andasibe",
  "Nosy Be",
  "Morondava",
  "Diego Suarez",
  "Fianarantsoa",
  "Sainte-Marie",
];

const features = [
  "climatisation",
  "gps",
  "siège bébé",
  "coffre spacieux",
  "bluetooth",
  "4x4",
  "boîte automatique",
  "économique",
  "wifi",
  "chargeur USB",
];

const featureIcons: Record<string, any> = {
  climatisation: Settings,
  gps: MapPin,
  "siège bébé": Shield,
  "coffre spacieux": Car,
  bluetooth: Settings,
  "4x4": Car,
  "boîte automatique": Settings,
  économique: Fuel,
  wifi: Settings,
  "chargeur USB": Settings,
};

const availabilityColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  unavailable: "bg-red-100 text-red-800 border-red-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const availabilityLabels = {
  available: "Disponible",
  unavailable: "Non disponible",
  maintenance: "En maintenance",
};

export default function VehiculesCrud() {
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVoiture, setEditingVoiture] = useState<Voiture | null>(null);

  useEffect(() => {
    fetchVoitures();
  }, []);

  const fetchVoitures = async () => {
    try {
      const response = await voitureService.getVoitures();
      if (response.success) {
        setVoitures(response.data);
      }
    } catch (error) {
      console.error("Error fetching voitures:", error);
    } finally {
      setLoading(false);
    }
  };

  const unlockBody = () => {
    document.body.style.pointerEvents = "auto";
  };

  const handleCreate = async (data: Omit<Voiture, "id">) => {
    try {
      const response = await voitureService.createVoiture(data);
      if (response.success) {
        await fetchVoitures();
        setIsCreateDialogOpen(false);
        unlockBody();
        toast({
                  title: "Succès",
                  description: (
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle className="w-5 h-5" />
                      Le vehicule a été créé avec succès.
                    </div>
                  ),
                });
      } else {
        alert(`Erreur: ${response.error}`);
        unlockBody();
      }
    } catch (error) {
      console.error("Error:", error);
      unlockBody();
    }
  };

  const handleUpdate = async (data: Partial<Voiture>) => {
    if (!editingVoiture) {
      unlockBody();
      return;
    }

    try {
      const response = await voitureService.updateVoiture(
        editingVoiture.idVoiture,
        data,
      );
      if (response.success) {
        await fetchVoitures();
        setIsEditDialogOpen(false);
        setEditingVoiture(null);
        unlockBody();
        toast({
          title: "Succès",
          description: (
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
              Vehicule modifié avec succès !
            </div>
          ),
        });
      } else {
        alert(`Erreur: ${response.error}`);
        unlockBody();
      }
    } catch (error) {
      console.error("Error:", error);
      unlockBody();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      try {
        const response = await voitureService.deleteVoiture(id);
        if (response.success) {
          await fetchVoitures();
          unlockBody();
          toast({
            title: "Succès",
            description: (
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="w-5 h-5" />
                Le Vehicule a été supprimé avec succès.
              </div>
            ),
          });
        } else {
          alert(`Erreur: ${response.error}`);
          unlockBody();
        }
      } catch (error) {
        console.error("Error:", error);
        unlockBody();
      }
    }
  };

  const filteredVoitures = voitures.filter((voiture) => {
    const matchesSearch =
      voiture.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voiture.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voiture.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || voiture.vehicleType === filterType;
    const matchesLocation =
      filterLocation === "all" || voiture.location === filterLocation;
    const matchesAvailability =
      filterAvailability === "all" ||
      voiture.availability === filterAvailability;
    return (
      matchesSearch && matchesType && matchesLocation && matchesAvailability
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            🚗 Gestion des Véhicules
          </h1>
          <p className="text-muted-foreground">
            Gérez votre flotte de véhicules et leurs disponibilités
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) unlockBody();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Nouveau Véhicule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <VoitureForm onSubmit={handleCreate} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par marque, modèle ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {vehicleTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Localisation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les localisations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterAvailability}
          onValueChange={setFilterAvailability}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Disponibilité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="available">Disponible</SelectItem>
            <SelectItem value="unavailable">Non disponible</SelectItem>
            <SelectItem value="maintenance">En maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-4 w-2/3" />
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVoitures.map((voiture) => (
            <Card
              key={voiture.idVoiture}
              className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-blue-900">
                      {voiture.brand} {voiture.model}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs border-blue-200"
                      >
                        {voiture.vehicleType}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-xs",
                          availabilityColors[voiture.availability],
                        )}
                      >
                        {voiture.availability === "available" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : voiture.availability === "maintenance" ? (
                          <Wrench className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {availabilityLabels[voiture.availability]}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingVoiture(voiture);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(voiture.idVoiture)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{voiture.location}</span>
                    <span>•</span>
                    <Users className="h-4 w-4" />
                    <span>{voiture.capacity} places</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                    
                    <span>{formatCurrency(voiture.pricePerDay)} Ar/jour</span>
                  </div>
                  {voiture.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {voiture.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {voiture.features.slice(0, 3).map((feature) => {
                      const Icon = featureIcons[feature] || Settings;
                      return (
                        <div
                          key={feature}
                          className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md"
                        >
                          <Icon className="h-3 w-3" />
                          {feature}
                        </div>
                      );
                    })}
                    {voiture.features.length > 3 && (
                      <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                        +{voiture.features.length - 3} autres
                      </div>
                    )}
                  </div>
                  {voiture.driverIncluded && voiture.driverName && (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md">
                      <User className="h-3 w-3" />
                      <span>Chauffeur: {voiture.driverName}</span>
                      {voiture.driverPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {voiture.driverPhone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingVoiture(null);
            unlockBody();
          }
        }}
      >
        {isEditDialogOpen && editingVoiture && (
          <DialogContent
            key={editingVoiture.idVoiture}
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <VoitureForm
              voiture={editingVoiture}
              onSubmit={handleUpdate}
              loading={loading}
              isEdit={true}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

interface VoitureFormProps {
  voiture?: Voiture;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  isEdit?: boolean;
}

const VoitureForm: React.FC<VoitureFormProps> = ({
  voiture,
  onSubmit,
  loading,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    brand: voiture?.brand || "",
    model: voiture?.model || "",
    vehicleType: voiture?.vehicleType || vehicleTypes[0],
    location: voiture?.location || locations[0],
    capacity: voiture?.capacity || 4,
    pricePerDay: voiture?.pricePerDay || 100000,
    availability: voiture?.availability || "available",
    driverIncluded: voiture?.driverIncluded || false,
    driverName: voiture?.driverName || "",
    driverPhone: voiture?.driverPhone || "",
    description: voiture?.description || "",
    features: voiture?.features || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Modifier le véhicule" : "Nouveau véhicule"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Modifiez les informations du véhicule"
            : "Ajoutez un nouveau véhicule à votre flotte"}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Marque</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brand: e.target.value }))
              }
              placeholder="Toyota"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Modèle</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, model: e.target.value }))
              }
              placeholder="Land Cruiser"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Type</Label>
            <Select
              value={formData.vehicleType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, vehicleType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <Select
              value={formData.location}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, location: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacité</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="50"
              value={formData.capacity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  capacity: parseInt(e.target.value),
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerDay">Prix/jour (Ar)</Label>
            <Input
              id="pricePerDay"
              type="number"
              min="0"
              step="1000"
              value={formData.pricePerDay}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pricePerDay: parseInt(e.target.value),
                }))
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">Disponibilité</Label>
          <Select
            value={formData.availability}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, availability: value as any }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="unavailable">Non disponible</SelectItem>
              <SelectItem value="maintenance">En maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="driverIncluded"
              checked={formData.driverIncluded}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, driverIncluded: !!checked }))
              }
            />
            <Label htmlFor="driverIncluded">Chauffeur inclus</Label>
          </div>
        </div>

        {formData.driverIncluded && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driverName">Nom du chauffeur</Label>
              <Input
                id="driverName"
                value={formData.driverName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    driverName: e.target.value,
                  }))
                }
                placeholder="Nom du chauffeur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverPhone">Téléphone</Label>
              <Input
                id="driverPhone"
                value={formData.driverPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    driverPhone: e.target.value,
                  }))
                }
                placeholder="+261 34 12 345 67"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Description du véhicule..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Équipements</Label>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={formData.features.includes(feature)}
                  onCheckedChange={() => toggleFeature(feature)}
                />
                <Label
                  htmlFor={`feature-${feature}`}
                  className="text-sm font-normal"
                >
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "En cours..." : isEdit ? "Modifier" : "Créer"}
          </Button>
        </div>
      </form>
    </>
  );
};
