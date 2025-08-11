import React, { useState, useEffect } from "react";
import { Hebergement } from "@shared/types";
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
  Building,
  Users,
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  TreePine,
  Waves,
  Utensils,
  Shield,
  Phone,
  Mail,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hebergementService } from "@/services/hebergementService";
import { toast } from "@/hooks/use-toast";


const accommodationTypes = [""];

const locations = [""];

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  restaurant: Utensils,
  parking: Car,
  jardin: TreePine,
  piscine: Waves,
  spa: Star,
  "plage privée": Waves,
  bar: Coffee,
  sécurité: Shield,
};

const availableAmenities = [
  "wifi",
  "restaurant",
  "parking",
  "jardin",
  "piscine",
  "spa",
  "plage privée",
  "bar",
  "sécurité",
  "climatisation",
  "room service",
  "blanchisserie",
];

export default function GestionHebergement() {
  const [hebergements, setHebergements] = useState<Hebergement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHebergement, setEditingHebergement] =
    useState<Hebergement | null>(null);

  useEffect(() => {
    fetchHebergements();
  }, []);

  const fetchHebergements = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchTerm && { name: searchTerm }),
        ...(filterType !== "all" && { type: filterType }),
        ...(filterLocation !== "all" && { location: filterLocation }),
      };

      const response = await hebergementService.getHebergements(params);

      if (response.success) {
        setHebergements(response.data);
      } else {
        console.error("Erreur lors du chargement:", response.error);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Omit<Hebergement, "idHebergement">) => {
    try {
      const response = await hebergementService.createHebergement(data);
      if (response.success) {
        await fetchHebergements();
        setIsCreateDialogOpen(false);
        unlockBody(); // Débloquer l'interface après succès
      } else {
        console.error("Erreur de création:", response.error);
        alert(`Erreur: ${response.error}`);
        unlockBody(); // Débloquer l'interface en cas d'erreur
      }
    } catch (error) {
      console.error("Erreur:", error);
      unlockBody(); // Débloquer l'interface en cas d'exception
    }
  };

  const unlockBody = () => {
    document.body.style.pointerEvents = "auto";
  };

  const handleUpdate = async (data: Partial<Hebergement>) => {
    if (!editingHebergement) {
      unlockBody();
      return;
    }

    try {
      const response = await hebergementService.updateHebergement(
        editingHebergement.idHebergement,
        data,
      );

      if (response.success) {
        await fetchHebergements();
        setIsEditDialogOpen(false);
        setEditingHebergement(null);
        unlockBody(); // Débloquer l'interface après succès
        toast({
          title: "Succès",
          description: (
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
              Hébergement modifié avec succès !
            </div>
          ),
        });
      } else {
        console.error("Erreur de mise à jour:", response.error);
        alert(`Erreur: ${response.error}`);
        unlockBody(); // Débloquer l'interface en cas d'erreur
      }
    } catch (error) {
      console.error("Erreur:", error);
      unlockBody(); // Débloquer l'interface en cas d'exception
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet hébergement ?")) {
      try {
        const response = await hebergementService.deleteHebergement(id);
        if (response.success) {
          await fetchHebergements();
          unlockBody(); // Débloquer l'interface après succès
        } else {
          console.error("Erreur de suppression:", response.error);
          unlockBody(); // Débloquer l'interface en cas d'erreur
        }
      } catch (error) {
        console.error("Erreur:", error);
        unlockBody(); // Débloquer l'interface en cas d'exception
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
          }`}
      />
    ));
  };

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
          <h1 className="text-3xl font-bold">Gestion des Hébergements</h1>
          <p className="text-muted-foreground">
            Gérez les hébergements, leurs types et équipements
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) unlockBody(); // Débloquer l'interface quand le dialog se ferme
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel Hébergement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <HebergementForm onSubmit={handleCreate} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, localisation ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchHebergements()}
            className="pl-9"
          />
        </div>
        {/* <Select
          value={filterType}
          onValueChange={(value) => setFilterType(value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {accommodationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
        {/* <Select
          value={filterLocation}
          onValueChange={(value) => setFilterLocation(value)}
        >
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
        </Select> */}
        <Button onClick={fetchHebergements} variant="outline">
          Appliquer
        </Button>
      </div>

      {/* Liste des hébergements */}
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
          {hebergements.map((hebergement) => (
            <Card
              key={hebergement.idHebergement}
              className="border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {hebergement.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {hebergement.type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {renderStars(hebergement.rating)}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({hebergement.rating})
                        </span>
                      </div>
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
                          setEditingHebergement(hebergement);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(hebergement.idHebergement)}
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
                    <span>{hebergement.location}</span>
                    <span>•</span>
                    <Users className="h-4 w-4" />
                    <span>Capacité: {hebergement.capacity} personnes</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    <span>{formatCurrency(hebergement.priceRange)} Ar/jour</span>
                  </div>
                  {hebergement.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {hebergement.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {hebergement.amenities?.slice(0, 4).map((amenity) => {
                      const Icon = amenityIcons[amenity] || Building;
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-md"
                        >
                          <Icon className="h-3 w-3" />
                          {amenity}
                        </div>
                      );
                    })}
                    {hebergement.amenities?.length > 4 && (
                      <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                        +{hebergement.amenities.length - 4} autres
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {hebergement.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {hebergement.email}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog d'édition */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingHebergement(null);
            unlockBody(); // Débloquer l'interface quand le dialog se ferme
          }
        }}
      >
        {isEditDialogOpen && editingHebergement && (
          <DialogContent
            key={editingHebergement.idHebergement}
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <HebergementForm
              hebergement={editingHebergement}
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

interface HebergementFormProps {
  hebergement?: Hebergement;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  isEdit?: boolean;
}

const HebergementForm: React.FC<HebergementFormProps> = ({
  hebergement,
  onSubmit,
  loading,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: hebergement?.name || "",
    type: hebergement?.type || accommodationTypes[0],
    location: hebergement?.location || locations[0],
    address: hebergement?.address || "",
    priceRange: hebergement?.priceRange || "",
    rating: hebergement?.rating || 5,
    capacity: hebergement?.capacity || 2,
    description: hebergement?.description || "",
    phone: hebergement?.phone || "",
    email: hebergement?.email || "",
    amenities: hebergement?.amenities || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Modifier l'hébergement" : "Nouvel hébergement"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Modifiez les informations de l'hébergement"
            : "Créez un nouvel hébergement avec ses équipements"}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Lodge des Baobabs"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              placeholder="saisir le type Bungalow, ..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Saisir la localisation"
            />

          </div>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Route des Baobabs, Morondava"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priceRange">Prix/jour (Ar)</Label>
            <Input
              id="priceRange"
              value={formData.priceRange}
              type="number"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priceRange: e.target.value }))
              }
              placeholder="500,000 Ar"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Note (1-5)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  rating: parseFloat(e.target.value),
                }))
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+261 34 12 345 67"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="contact@lodge.mg"
              required
            />
          </div>
        </div>

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
            placeholder="Description de l'hébergement..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Équipements</Label>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {availableAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label
                  htmlFor={`amenity-${amenity}`}
                  className="text-sm font-normal"
                >
                  {amenity}
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
