import React, { useState } from "react";
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
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Vol } from "@shared/types";

interface VolFormProps {
  vol?: Vol;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  isEdit?: boolean;
}

const airlines = [
  "Madagascar Airlines",
  "Air France",
  "Ethiopian Airlines",
  "Turkish Airlines",
  "Emirates",
  "Air Mauritius",
  "Corsair",
];

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
            <Label htmlFor="aircraft">Appareil</Label>
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
                setFormData((prev) => ({ ...prev, class: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Économique</SelectItem>
                <SelectItem value="business">Affaires</SelectItem>
                <SelectItem value="first">Première</SelectItem>
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
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: parseInt(e.target.value) || 0,
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
                setFormData((prev) => ({ ...prev, availability: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="limited">Limité</SelectItem>
                <SelectItem value="sold_out">Complet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalSeats">Sièges total</Label>
            <Input
              id="totalSeats"
              type="number"
              value={formData.seats.total}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seats: { ...prev.seats, total: parseInt(e.target.value) || 0 },
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availableSeats">Sièges disponibles</Label>
            <Input
              id="availableSeats"
              type="number"
              value={formData.seats.available}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seats: { ...prev.seats, available: parseInt(e.target.value) || 0 },
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
            placeholder="WiFi gratuit, Repas inclus, Divertissement"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="carryBaggage">Bagage cabine</Label>
            <Input
              id="carryBaggage"
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
            <Label htmlFor="checkedBaggage">Bagage en soute</Label>
            <Input
              id="checkedBaggage"
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

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.contact.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value },
                }))
              }
              placeholder="+261 34 12 345 67"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
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
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
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

        <DialogFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "En cours..." : isEdit ? "Modifier" : "Créer"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default VolForm;
