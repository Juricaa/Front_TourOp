import { Client, Hebergement, Voiture, Activite, Vol } from "./types";

export interface BookingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  data?: any;
}

export interface BookingClient {
  id?: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  address: string;
  nbpersonnes: number;
  notes?: string;
  dateTravel: string; // Format ISO (YYYY-MM-DD)
  dateReturn: String;
}

export interface BookingFlight {
  id: string;
  type: "outbound" | "return" | "domestic";
  passengers: number;
  class: "economy" | "business" | "first";
  price: number;
  date: Date;
}
export interface BookingAccommodation {
  id: string;
  checkIn: String;
  checkOut: String;
  rooms: number;
  guests: number;
  price: number;
  nights: number;
}

export interface BookingVehicle {
  id: string;
  startDate: Date;
  endDate: Date;
  pickupLocation: string;
  dropoffLocation: string;
  price: number;
  days: number;
}

export interface BookingActivity {
  id: string;
  date: Date;
  participants: number;
  price: number;
  totalPrice: number;
}

export interface BookingData {
  // Current step
  currentStep: number;

  // Step data
  client?: BookingClient;
  flights: BookingFlight[];
  accommodations: BookingAccommodation[];
  vehicles: BookingVehicle[];
  activities: BookingActivity[];

  // Pricing
  subtotals: {
    flights: number;
    accommodations: number;
    vehicles: number;
    activities: number;
  };
  totalPrice: number;
  currency: "Ar" | "EUR" | "USD";

  // Metadata
  travelDates: {
    start: Date;
    end: Date;
  };
  notes?: string;
}

export interface BookingStepConfig {
  step: number;
  title: string;
  description: string;
  icon: string;
  component: string;
}

export const BOOKING_STEPS: BookingStepConfig[] = [
  {
    step: 1,
    title: "Client",
    description: "Informations du client",
    icon: "Users",
    component: "ClientStep",
  },
  {
    step: 2,
    title: "Vols",
    description: "Sélection des vols",
    icon: "Plane",
    component: "FlightsStep",
  },
  {
    step: 3,
    title: "Hébergement",
    description: "Choix de l'hébergement",
    icon: "Building",
    component: "AccommodationStep",
  },
  {
    step: 4,
    title: "Véhicule",
    description: "Location de véhicule",
    icon: "Car",
    component: "VehicleStep",
  },
  {
    step: 5,
    title: "Activités",
    description: "Activités et excursions",
    icon: "MapPin",
    component: "ActivitiesStep",
  },
  {
    step: 6,
    title: "Récapitulatif",
    description: "Confirmation et facture",
    icon: "FileText",
    component: "SummaryStep",
  },
];
