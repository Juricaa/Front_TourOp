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
import type { Hebergement } from "@shared/types";
import { Plus } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";

interface HebergementFormProps {
  hebergement?: Hebergement;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  isEdit?: boolean;
}

const accommodationTypes = [""];

const locations = [ ""];

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
  "petit-déjeuner inclus",
];


const HebergementForm: React.FC<HebergementFormProps> = ({
  hebergement,
  onSubmit,
  loading,
  isEdit = false,
}) => {
  const { state } = useBooking();
  const [formData, setFormData] = useState({
    name: hebergement?.name || "",
    type: hebergement?.type || accommodationTypes[0],
    location: hebergement?.location || locations[0],
    address: hebergement?.address || "",
    priceRange: hebergement?.priceRange || 100000,
    rating: hebergement?.rating || 5,
    capacity: hebergement?.capacity || state.client?.nbpersonnes,
    rooms: hebergement?.rooms || 1,
    description: hebergement?.description || "",
    phone: hebergement?.phone || "",
    email: hebergement?.email || "",
    amenities: hebergement?.amenities || [],
    numberOfGuests: state.client?.nbpersonnes,
    checkIn: "",       // <--- ajouté
    checkOut: "",      // <--- ajouté
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
          {isEdit ? "Modifier l'hébergement" : "Ajouter hébergement"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Modifiez les informations de l'hébergement"
            : "Ajouter hébergement avec ses équipements"}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Informations séjour */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informations Séjour</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Date d'arrivée</Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, checkIn: e.target.value }))
                }
                min={state.client?.dateTravel?.toString()}
                max={state.client?.dateReturn?.toString()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Date de départ</Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, checkOut: e.target.value }))
                }
                min={state.client?.dateTravel?.toString()}
                max={state.client?.dateReturn?.toString()}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guests">Nombre d'invités</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max={formData.capacity || 10}
              value={formData.numberOfGuests}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, numberOfGuests: parseInt(e.target.value) || 1 }))
              }
            />
          </div>
        </div>

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
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Route principale, Andasibe"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pricePerNight">Prix par nuit (Ar)</Label>
            <Input
              id="pricePerNight"
              type="number"
              value={formData.priceRange}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priceRange: parseInt(e.target.value) || 0,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacité</Label>
            <Input
              id="capacity"
              type="number"
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
            <Label htmlFor="rooms">Chambres</Label>
            <Input
              id="rooms"
              type="number"
              value={formData.rooms}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  rooms: parseInt(e.target.value),
                }))
              }
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
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Un lodge écologique au cœur de la forêt d'Andasibe..."
            rows={3}
          />
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
              placeholder="contact@lodge.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Équipements</Label>
          <div className="grid grid-cols-3 gap-2">
            {availableAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <label
                  htmlFor={amenity}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="submit"  className="w-full" disabled={
                          !formData.checkIn||
                          !formData.checkOut ||
                          formData.numberOfGuests > formData.capacity
                        }>
                          <Plus className="w-4 h-4 mr-2" />
                    {formData.numberOfGuests > formData.capacity
                      ? "Capacité insuffisante"
                      : !formData.checkIn || !formData.checkOut
                        ? "Sélectionner les dates"
                        : `Ajouter l'hébergement`}
            {loading ? " En cours..." : isEdit ? " Modifier" : ""}
            
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default HebergementForm;
