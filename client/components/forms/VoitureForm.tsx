import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Voiture } from "@shared/types";
import { useBooking } from "@/contexts/BookingContext";

interface VoitureFormProps {
  voiture?: Voiture;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  isEdit?: boolean;
}

const vehicleTypes = ["Berline", "SUV", "4x4", "Minibus", "Économique", "Luxe"];

const locations = [""];

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

const VoitureForm: React.FC<VoitureFormProps> = ({
  voiture,
  onSubmit,
  loading,
  isEdit = false,
}) => {
  const { state } = useBooking();
  const [formData, setFormData] = useState({
    brand: voiture?.brand || "",
    model: voiture?.model || "",
    vehicleType: voiture?.vehicleType || vehicleTypes[2],
    location: voiture?.location || locations[1],
    capacity: state.client?.nbpersonnes ,
    pricePerDay: voiture?.pricePerDay || 100000,
    availability: voiture?.availability || "available",
    driverIncluded: voiture?.driverIncluded || false,
    driverName: voiture?.driverName || "",
    driverPhone: voiture?.driverPhone || "",
    description: voiture?.description || "",
    features: voiture?.features || [],
    startDate: "",
    endDate: "",
    pickupLocation: "",
    dropoffLocation: "",
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
        {/* Section pour les détails de la location */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">Détails de la location</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                min={state.client?.dateTravel?.toString()}
                max={state.client?.dateReturn?.toString()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                min={state.client?.dateTravel?.toString()}
                max={state.client?.dateReturn?.toString()}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup">Lieu de prise en charge</Label>
              <Input
                value={formData.pickupLocation}
                onChange={(e) =>
                  setFormData({ ...formData, pickupLocation: e.target.value })
                }
                placeholder="ex : Antananarivo"
              />
                
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff">Lieu de restitution</Label>
              <Input
                value={formData.dropoffLocation}
                onChange={(e) =>
                  setFormData({ ...formData, dropoffLocation: e.target.value })
                }
                placeholder="ex : Antsirabe"
              />
               
            </div>
          </div>
        </div>

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
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Modèle</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, model: e.target.value }))
              }
              placeholder="ex : Land Cruiser"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }

              placeholder="ex : Minibus , 4x4"
            />
             
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="ex : Antananarivo"
            />
              
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacité</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  capacity: parseInt(e.target.value) || 0,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerDay">Prix par jour (Ar)</Label>
            <Input
              id="pricePerDay"
              type="number"
              value={formData.pricePerDay}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pricePerDay: parseInt(e.target.value) || 0,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">Disponibilité</Label>
            <Select
              value={formData.availability}
              // onValueChange={(value) =>
              //   setFormData((prev) => ({ ...prev, availability: value }))
              // }
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
        </div>

        <div className="space-y-4">
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

          {formData.driverIncluded && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverName">Nom du chauffeur</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, driverName: e.target.value }))
                  }
                  placeholder="Jean Rakoto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverPhone">Téléphone du chauffeur</Label>
                <Input
                  id="driverPhone"
                  value={formData.driverPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, driverPhone: e.target.value }))
                  }
                  placeholder="+261 34 12 345 67"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Véhicule tout-terrain idéal pour les excursions..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Équipements</Label>
          <div className="grid grid-cols-3 gap-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={formData.features.includes(feature)}
                  onCheckedChange={() => toggleFeature(feature)}
                />
                <label
                  htmlFor={feature}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "En cours..." : isEdit ? "Modifier" : "Créer"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default VoitureForm;
