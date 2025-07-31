import React, { useState, useEffect } from "react";
import { Activite } from "@shared/types";
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
  MapPin,
  Clock,
  Users,
  Star,
  Heart,
  Trophy,
  User,
  Phone,
  TreePine,
  Mountain,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { activiteService } from "@/services/activiteService";

const categories = [
  "Nature",
  "Aventure",
  "Culture",
  "Détente",
  "Observation",
  "Sport",
];

const locations = [
  "Andasibe",
  "Mantadia",
  "Nosy Be",
  "Sainte-Marie",
  "Isalo",
  "Tsingy",
  "Morondava",
  "Diego Suarez",
];

const difficulties = ["facile", "modéré", "difficile"];

const seasons = ["Été", "Hiver", "Saison sèche", "Saison des pluies"];

const difficultyColors = {
  facile: "bg-green-100 text-green-800 border-green-200",
  modéré: "bg-yellow-100 text-yellow-800 border-yellow-200",
  difficile: "bg-red-100 text-red-800 border-red-200",
};

const categoryIcons: Record<string, any> = {
  Nature: TreePine,
  Aventure: Mountain,
  Culture: Trophy,
  Détente: Waves,
  Observation: Star,
  Sport: Trophy,
};

export default function ActivitesCrud() {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingActivite, setEditingActivite] = useState<Activite | null>(null);

  useEffect(() => {
    fetchActivites();
  }, []);

  const fetchActivites = async () => {
    try {
      const response = await activiteService.getActivites();
      if (response.success) {
        setActivites(response.data);
      }
    } catch (error) {
      console.error("Error fetching activites:", error);
    } finally {
      setLoading(false);
    }
  };

  const unlockBody = () => {
    document.body.style.pointerEvents = "auto";
  };

  const handleCreate = async (data: Omit<Activite, "id">) => {
    try {
      console.log("Creating activity with data:", data);
      const response = await activiteService.createActivite(data);
      if (response.success) {
        await fetchActivites();
        setIsCreateDialogOpen(false);
        unlockBody();
      } else {
        alert(`Erreur: ${response.error}`);
        unlockBody();
      }
    } catch (error) {
      console.error("Error:", error);
      unlockBody();
    }
  };

  const handleUpdate = async (data: Partial<Activite>) => {
    if (!editingActivite) {
      unlockBody();
      return;
    }

    try {
      const response = await activiteService.updateActivite(
        editingActivite.idActivite,
        data,
      );
      if (response.success) {
        await fetchActivites();
        setIsEditDialogOpen(false);
        setEditingActivite(null);
        unlockBody();
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
    if (confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) {
      try {
        const response = await activiteService.deleteActivite(id);
        if (response.success) {
          await fetchActivites();
          unlockBody();
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

  const filteredActivites = activites.filter((activite) => {
    const matchesSearch =
      activite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activite.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || activite.category === filterCategory;
    const matchesLocation =
      filterLocation === "all" || activite.location === filterLocation;
    const matchesDifficulty =
      filterDifficulty === "all" || activite.difficulty === filterDifficulty;
    return (
      matchesSearch && matchesCategory && matchesLocation && matchesDifficulty
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-900">
            🏃‍♂️ Gestion des Activités
          </h1>
          <p className="text-muted-foreground">
            Gérez vos activités touristiques et excursions
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
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Nouvelle Activité
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <ActiviteForm onSubmit={handleCreate} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
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
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulté" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les difficultés</SelectItem>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activity Grid */}
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
          {filteredActivites.map((activite) => {
            const CategoryIcon = categoryIcons[activite.category] || TreePine;
            return (
              <Card
                key={activite.idActivite}
                className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                        <CategoryIcon className="w-5 h-5" />
                        {activite.name}
                        {activite.favorite && (
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs border-green-200"
                        >
                          {activite.category}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-xs",
                            difficultyColors[activite.difficulty],
                          )}
                        >
                          {activite.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {renderStars(activite.rating)}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({activite.reviews})
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
                            setEditingActivite(activite);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(activite.idActivite)}
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
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{activite.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{activite.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {activite.groupSizeMin}-{activite.groupSizeMax}{" "}
                          personnes
                        </span>
                      </div>
                      <div className="font-semibold text-green-800">
                        {formatCurrency(activite.priceAdult)} Ar/pers
                      </div>
                    </div>
                    {activite.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activite.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {activite.includes.slice(0, 3).map((item) => (
                        <div
                          key={item}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md"
                        >
                          {item}
                        </div>
                      ))}
                      {activite.includes.length > 3 && (
                        <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                          +{activite.includes.length - 3} autres
                        </div>
                      )}
                    </div>
                    {activite.guideRequired && activite.guideName && (
                      <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                        <User className="h-3 w-3" />
                        <span>Guide: {activite.guideName}</span>
                        {activite.guidePhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {activite.guidePhone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingActivite(null);
            unlockBody();
          }
        }}
      >
        {isEditDialogOpen && editingActivite && (
          <DialogContent
            key={editingActivite.idActivite}
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <ActiviteForm
              activite={editingActivite}
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

interface ActiviteFormProps {
  activite?: Activite;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  isEdit?: boolean;
}

const ActiviteForm: React.FC<ActiviteFormProps> = ({
  activite,
  onSubmit,
  loading,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: activite?.name || "",
    category: activite?.category || categories[0],
    location: activite?.location || locations[0],
    duration: activite?.duration || "",
    difficulty: activite?.difficulty || "facile",
    priceAdult: activite?.priceAdult || 50000,
    priceChild: activite?.priceChild || 0,
    groupSizeMin: activite?.groupSizeMin,
    groupSizeMax: activite?.groupSizeMax,
    description: activite?.description || "",
    includes: activite?.includes || [],
    requirements: activite?.requirements || [],
    guideRequired: activite?.guideRequired || false,
    guideName: activite?.guideName || "",
    guidePhone: activite?.guidePhone || "",
    rating: activite?.rating || 5,
    reviews: activite?.reviews || 0,
    seasons: activite?.seasons || [],
    favorite: activite?.favorite || false,
    popularity: activite?.popularity || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleArrayChange = (
    field: "includes" | "requirements" | "seasons",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ? value.split(",").map((item) => item.trim()) : [],
    }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Modifier l'activité" : "Nouvelle activité"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Modifiez les informations de l'activité"
            : "Ajoutez une nouvelle activité à votre catalogue"}
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
              placeholder="Randonnée dans les Tsingy"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div className="space-y-2">
            <Label htmlFor="duration">Durée</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, duration: e.target.value }))
              }
              placeholder="2 heures"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulté</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, difficulty: value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceAdult">Prix adulte (Ar)</Label>
            <Input
              id="priceAdult"
              type="number"
              min="0"
              step="1000"
              value={formData.priceAdult}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priceAdult: parseInt(e.target.value),
                }))
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priceChild">Prix enfant (Ar)</Label>
            <Input
              id="priceChild"
              type="number"
              min="0"
              step="1000"
              value={formData.priceChild}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priceChild: parseInt(e.target.value),
                }))
              }
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
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="groupSizeMin">Taille groupe min</Label>
            <Input
              id="groupSizeMin"
              type="number"
              min="1"
              value={formData.groupSizeMin}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  groupSizeMin: parseInt(e.target.value),

                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupSizeMax">Taille groupe max</Label>
            <Input
              id="groupSizeMax"
              type="number"
              min="1"
              value={formData.groupSizeMax}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  groupSizeMax: parseInt(e.target.value),

                }))
              }
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
            placeholder="Description détaillée de l'activité..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="includes">Inclus (séparés par des virgules)</Label>
          <Textarea
            id="includes"
            value={formData.includes.join(", ")}
            onChange={(e) => handleArrayChange("includes", e.target.value)}
            placeholder="Guide, Transport, Repas..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">
            Prérequis (séparés par des virgules)
          </Label>
          <Textarea
            id="requirements"
            value={formData.requirements.join(", ")}
            onChange={(e) => handleArrayChange("requirements", e.target.value)}
            placeholder="Bonne condition physique, Chaussures de marche..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="guideRequired"
              checked={formData.guideRequired}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, guideRequired: !!checked }))
              }
            />
            <Label htmlFor="guideRequired">Guide requis</Label>
          </div>
        </div>

        {formData.guideRequired && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guideName">Nom du guide</Label>
              <Input
                id="guideName"
                value={formData.guideName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    guideName: e.target.value,
                  }))
                }
                placeholder="Nom du guide"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guidePhone">Téléphone du guide</Label>
              <Input
                id="guidePhone"
                value={formData.guidePhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    guidePhone: e.target.value,
                  }))
                }
                placeholder="+261 34 12 345 67"
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="favorite"
            checked={formData.favorite}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, favorite: !!checked }))
            }
          />
          <Label htmlFor="favorite">Activité favorite</Label>
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
