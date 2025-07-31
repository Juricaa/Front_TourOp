import React, { useState, useEffect } from "react";
import { Vol, normalizeVol } from "@shared/types";
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
  Plane,
  Clock,
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Luggage,
  Shield,
  Euro,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { volService } from "@/services/volService";

const airlines = [
  "Air Madagascar",
  "Air France",
  "Turkish Airlines",
  "Emirates",
  "Kenya Airways",
  "Ethiopian Airlines",
];

const airports = [
  "Antananarivo (TNR)",
  "Nosy Be (NOS)",
  "Toamasina (TMM)",
  "Mahajanga (MJN)",
  "Antsiranana (DIE)",
  "Toliara (TLE)",
  "Paris (CDG)",
  "Nairobi (NBO)",
  "Addis Abeba (ADD)",
];

const flightClasses = ["economy", "business", "first"];

const availabilityColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  limited: "bg-yellow-100 text-yellow-800 border-yellow-200",
  full: "bg-red-100 text-red-800 border-red-200",
};

const availabilityLabels = {
  available: "Disponible",
  limited: "Places limitées",
  full: "Complet",
};

const classLabels = {
  economy: "Économique",
  business: "Affaires",
  first: "Première",
};

export default function VolsCrud() {
  const [vols, setVols] = useState<Vol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAirline, setFilterAirline] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVol, setEditingVol] = useState<Vol | null>(null);

  useEffect(() => {
    fetchVols()
    .then(setVols)
    .catch((err) => console.error("Erreur lors du chargement des vols :", err));
  }, []);

  const fetchVols = async () => {
    try {
      const response = await volService.getVols();
      if (response.success) {
        const vols : Vol[] = response.data.map(normalizeVol);
        console.log("Fetched vols:", vols);
        // setVols(response.data);
        return vols
      }
    } catch (error) {
      console.error("Error fetching vols:", error);
    } finally {
      setLoading(false);
    }
  };

  const unlockBody = () => {
    document.body.style.pointerEvents = "auto";
  };

  const handleCreate = async (data: Omit<Vol, "id">) => {
    try {
      const response = await volService.createVol(data);
      if (response.success) {
        await fetchVols().then(setVols);
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

  const handleUpdate = async (data: Partial<Vol>) => {
    if (!editingVol) {
      unlockBody();
      return;
    }

    try {
      const response = await volService.updateVol(editingVol.idVol, data);
      if (response.success) {
        await fetchVols().then(setVols);
        setIsEditDialogOpen(false);
        setEditingVol(null);
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
    if (confirm("Êtes-vous sûr de vouloir supprimer ce vol ?")) {
      try {
        const response = await volService.deleteVol(id);
        if (response.success) {
          await fetchVols().then(setVols);
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

  const filteredVols = vols.filter((vol) => {
    const matchesSearch =
      vol.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.route.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAirline =
      filterAirline === "all" || vol.airline === filterAirline;
    const matchesClass = filterClass === "all" || vol.class === filterClass;
    const matchesAvailability =
      filterAvailability === "all" || vol.availability === filterAvailability;
    return (
      matchesSearch && matchesAirline && matchesClass && matchesAvailability
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
        className={`w-4 h-4 ${
          i < Math.floor(rating)
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
          <h1 className="text-3xl font-bold text-sky-900">
            ✈️ Gestion des Vols
          </h1>
          <p className="text-muted-foreground">
            Gérez les vols et leurs disponibilités
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
            <Button className="gap-2 bg-sky-600 hover:bg-sky-700">
              <Plus className="h-4 w-4" />
              Nouveau Vol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <VolForm onSubmit={handleCreate} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par compagnie, numéro de vol ou destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterAirline} onValueChange={setFilterAirline}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Compagnie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les compagnies</SelectItem>
            {airlines.map((airline) => (
              <SelectItem key={airline} value={airline}>
                {airline}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Classe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {flightClasses.map((flightClass) => (
              <SelectItem key={flightClass} value={flightClass}>
                {classLabels[flightClass as keyof typeof classLabels]}
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
            <SelectItem value="limited">Places limitées</SelectItem>
            <SelectItem value="full">Complet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flight Grid */}
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
          {filteredVols.map((vol) => (
            <Card
              key={vol.idVol}
              className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-sky-50 to-white"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-sky-900 flex items-center gap-2">
                      <Plane className="w-5 h-5" />
                      {vol.airline}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs border-sky-200"
                      >
                        {vol.flightNumber}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-sky-200"
                      >
                        {classLabels[vol.class]}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-xs",
                          availabilityColors[vol.availability],
                        )}
                      >
                        {availabilityLabels[vol.availability]}
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
                          setEditingVol(vol);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(vol.idVol)}
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
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {vol.route.from} → {vol.route.to}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {vol.route.fromCode} → {vol.route.toCode}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{vol.schedule.departure}</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{vol.schedule.arrival}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Durée: {vol.schedule.duration}
                    </span>
                    <span>•</span>
                    <span className="text-muted-foreground">
                      {vol.aircraft}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-600" />
                      <span className="text-sm">
                        {vol.seats.available}/{vol.seats.total} places
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(vol.rating)}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({vol.reviews})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-sky-800">
                    
                    <span>{formatCurrency(vol.price)} Ar</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {vol.services.slice(0, 3).map((service) => (
                      <div
                        key={service}
                        className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-md"
                      >
                        {service}
                      </div>
                    ))}
                    {vol.services.length > 3 && (
                      <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                        +{vol.services.length - 3} services
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Luggage className="h-3 w-3" />
                      <span>
                        Bagage: {vol.baggage.carry}/{vol.baggage.checked}
                      </span>
                    </div>
                    {vol.cancellation.flexible && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>Annulation flexible</span>
                      </div>
                    )}
                  </div>
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
            setEditingVol(null);
            unlockBody();
          }
        }}
      >
        {isEditDialogOpen && editingVol && (
          <DialogContent
            key={editingVol.idVol}
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <VolForm
              vol={editingVol}
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

interface VolFormProps {
  vol?: Vol;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  isEdit?: boolean;
}

const VolForm: React.FC<VolFormProps> = ({
  vol,
  onSubmit,
  loading,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    airline: vol?.airline || "",
    flightNumber: vol?.flightNumber || "",
    route: vol?.route || { from: "", to: "", fromCode: "", toCode: "" },
    schedule: vol?.schedule || { departure: "", arrival: "", duration: "" },
    aircraft: vol?.aircraft || "",
    class: vol?.class || "economy",
    price: vol?.price || 500000,
    availability: vol?.availability || "available",
    seats: vol?.seats || { total: 150, available: 150 },
    services: vol?.services || [],
    baggage: vol?.baggage || { carry: "7kg", checked: "23kg" },
    cancellation: vol?.cancellation || { flexible: false, fee: 0 },
    contact: vol?.contact || { phone: "", email: "", website: "" },
    rating: vol?.rating || 5,
    reviews: vol?.reviews || 0,
    popularity: vol?.popularity || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleServicesChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      services: value ? value.split(",").map((item) => item.trim()) : [],
    }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Modifier le vol" : "Nouveau vol"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Modifiez les informations du vol"
            : "Ajoutez un nouveau vol à votre catalogue"}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="airline">Compagnie aérienne</Label>
            <Select
              value={formData.airline}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, airline: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une compagnie" />
              </SelectTrigger>
              <SelectContent>
                {airlines.map((airline) => (
                  <SelectItem key={airline} value={airline}>
                    {airline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="flightNumber">Numéro de vol</Label>
            <Input
              id="flightNumber"
              value={formData.flightNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  flightNumber: e.target.value,
                }))
              }
              placeholder="MD123"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="routeFrom">De</Label>
            <Input
              id="routeFrom"
              value={formData.route.from}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  route: { ...prev.route, from: e.target.value },
                }))
              }
              placeholder="Antananarivo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routeTo">Vers</Label>
            <Input
              id="routeTo"
              value={formData.route.to}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  route: { ...prev.route, to: e.target.value },
                }))
              }
              placeholder="Nosy Be"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="routeFromCode">Code aéroport départ</Label>
            <Input
              id="routeFromCode"
              value={formData.route.fromCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  route: { ...prev.route, fromCode: e.target.value },
                }))
              }
              placeholder="TNR"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routeToCode">Code aéroport arrivée</Label>
            <Input
              id="routeToCode"
              value={formData.route.toCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  route: { ...prev.route, toCode: e.target.value },
                }))
              }
              placeholder="NOS"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departure">Départ</Label>
            <Input
              id="departure"
              value={formData.schedule.departure}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  schedule: { ...prev.schedule, departure: e.target.value },
                }))
              }
              placeholder="08:00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arrival">Arrivée</Label>
            <Input
              id="arrival"
              value={formData.schedule.arrival}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  schedule: { ...prev.schedule, arrival: e.target.value },
                }))
              }
              placeholder="10:30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Durée</Label>
            <Input
              id="duration"
              value={formData.schedule.duration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  schedule: { ...prev.schedule, duration: e.target.value },
                }))
              }
              placeholder="2h30"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="aircraft">Avion</Label>
            <Input
              id="aircraft"
              value={formData.aircraft}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, aircraft: e.target.value }))
              }
              placeholder="Boeing 737"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class">Classe</Label>
            <Select
              value={formData.class}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, class: value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flightClasses.map((flightClass) => (
                  <SelectItem key={flightClass} value={flightClass}>
                    {classLabels[flightClass as keyof typeof classLabels]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Prix (Ar)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1000"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: parseInt(e.target.value),
                }))
              }
              required
            />
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
                <SelectItem value="limited">Places limitées</SelectItem>
                <SelectItem value="full">Complet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seatsTotal">Places totales</Label>
            <Input
              id="seatsTotal"
              type="number"
              min="1"
              value={formData.seats.total}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seats: { ...prev.seats, total: parseInt(e.target.value) },
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seatsAvailable">Places disponibles</Label>
            <Input
              id="seatsAvailable"
              type="number"
              min="0"
              value={formData.seats.available}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seats: { ...prev.seats, available: parseInt(e.target.value) },
                }))
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="services">Services (séparés par des virgules)</Label>
          <Textarea
            id="services"
            value={formData.services.join(", ")}
            onChange={(e) => handleServicesChange(e.target.value)}
            placeholder="Repas, Divertissement, Wi-Fi..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="baggageCarry">Bagage cabine</Label>
            <Input
              id="baggageCarry"
              value={formData.baggage.carry}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  baggage: { ...prev.baggage, carry: e.target.value },
                }))
              }
              placeholder="7kg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baggageChecked">Bagage en soute</Label>
            <Input
              id="baggageChecked"
              value={formData.baggage.checked}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  baggage: { ...prev.baggage, checked: e.target.value },
                }))
              }
              placeholder="23kg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cancellationFlexible"
              checked={formData.cancellation.flexible}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  cancellation: { ...prev.cancellation, flexible: !!checked },
                }))
              }
            />
            <Label htmlFor="cancellationFlexible">Annulation flexible</Label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Téléphone</Label>
            <Input
              id="contactPhone"
              value={formData.contact.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value },
                }))
              }
              placeholder="+261 20 22 123 45"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contact.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value },
                }))
              }
              placeholder="contact@airline.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactWebsite">Site web</Label>
            <Input
              id="contactWebsite"
              value={formData.contact.website}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, website: e.target.value },
                }))
              }
              placeholder="www.airline.com"
            />
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
