import { StringifyOptions } from "querystring";

// Client types
export interface Client {
  idClient: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  address: string;
  nbpersonnes: number;
  lastVisit?: string;
  notes?: string;
  destinations: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Hebergement (Accommodation) types
export interface Hebergement {
  idHebergement: string;
  name: string;
  type: string;
  location: string;
  address: string;
  priceRange: number;
  rating: number;
  amenities: string[];
  capacity: number;
  description: string;
  phone: string;
  email: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Voiture (Vehicle) types
export interface Voiture {
  idVoiture: string;
  vehicleType: string;
  brand: string;
  model: string;
  capacity: number;
  pricePerDay: number;
  availability: "available" | "unavailable" | "maintenance";
  driverIncluded: boolean;
  driverName?: string;
  driverPhone?: string;
  features: string[];
  location: string;
  description: string;
  lastUsed?: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Activite types
export interface Activite {
  idActivite: string;
  name: string;
  category: string;
  location: string;
  duration: string;
  difficulty: "facile" | "modéré" | "difficile";
  priceAdult: number;
  priceChild?: number;
  groupSizeMin: number;
  groupSizeMax: number;
  description: string;
  includes: string[];
  requirements: string[];
  guideRequired: boolean;
  guideName?: string;
  guidePhone?: string;
  rating: number;
  reviews: number;
  seasons: string[];
  favorite: boolean;
  lastUsed?: string;
  popularity: number;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Vol (Flight) types
export interface Vol {
  idVol: string;
  airline: string;
  flightNumber: string;
  route: {
    from: string;
    to: string;
    fromCode: string;
    toCode: string;
  };
  schedule: {
    departure: string;
    arrival: string;
    duration: string;
  };
  aircraft: string;
  class: "economy" | "business" | "first";
  price: number;
  availability: "available" | "limited" | "full";
  seats: {
    total: number;
    available: number;
  };
  services: string[];
  baggage: {
    carry: string;
    checked: string;
  };
  cancellation: {
    flexible: boolean;
    fee: number;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  rating: number;
  reviews: number;
  lastUsed?: string;
  popularity: number;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  departure: string;
  arrival: string;
  date_debut: Date;
  date_fin: Date;
}


export const normalizeVol = (vol: any): Vol => ({
  idVol: vol.idVol,
  airline: vol.airline,
  flightNumber: vol.flightNumber,
  route: {
    from: vol.route_from,
    to: vol.route_to,
    fromCode: vol.route_fromCode,
    toCode: vol.route_toCode,
  },
  schedule: {
    departure: vol.schedule_departure,
    arrival: vol.schedule_arrival,
    duration: vol.schedule_duration,
  },
  aircraft: vol.aircraft,
  class: vol.flight_class,
  price: parseFloat(vol.price),
  availability: vol.availability,
  seats: {
    total: vol.seats_total,
    available: vol.seats_available,
  },
  services: Array.isArray(vol.services)
    ? vol.services
    : typeof vol.services === 'string'
      ? vol.services.split(',').map(s => s.trim())
      : [],
  baggage: {
    carry: vol.baggage_carry,
    checked: vol.baggage_checked,
  },
  cancellation: {
    flexible: vol.cancellation_flexible,
    fee: parseFloat(vol.cancellation_fee),
  },
  contact: {
    phone: vol.contact_phone,
    email: vol.contact_email,
    website: vol.contact_website,
  },
  rating: vol.rating,
  reviews: vol.reviews,
  lastUsed: vol.lastUsed ?? undefined,
  popularity: vol.popularity,
  images: vol.images ?? undefined,
  createdAt: new Date(vol.createdAt),
  updatedAt: new Date(vol.updatedAt),
  departure: vol.departure,
  arrival: vol.arrival,
  date_debut: new Date(vol.date_debut),
  date_fin: new Date(vol.date_fin),
});


// Reservation types
export interface Reservation {
  id: string;
  clientId: string;
  status: "en_attente" | "confirmé" | "cancelled" | "completed";
  totalPrice: number;
  currency: "Ar" | "EUR" | "USD";
  dateCreated: Date;
  dateTravel: Date;
  dateReturn?: Date;
  notes?: string;

  // Associated services
  hebergements?: {
    id: string;
    checkIn: Date;
    checkOut: Date;
    rooms: number;
    guests: number;
    price: number;
  }[];

  voitures?: {
    id: string;
    startDate: Date;
    endDate: Date;
    pickupLocation: string;
    dropoffLocation: string;
    price: number;
  }[];

  activites?: {
    id: string;
    date: Date;
    participants: number;
    price: number;
  }[];

  vols?: {
    id: string;
    passengers: number;
    price: number;
  }[];

  createdAt?: Date;
  updatedAt?: Date;
}


// Pour une réservation individuelle
export interface SingleReservation {
  id: string;
  clientId: string;
  status: "en_attente" | "confirmé" | "cancelled" | "completed";
  totalPrice: number;
  currency: "Ar" | "EUR" | "USD";
  dateCreated: Date;
  dateTravel: Date;
  dateReturn?: Date;
  notes?: string;

  hebergements: {
    id: string;
    checkIn: Date;
    checkOut: Date;
    rooms: number;
    guests: number;
    price: number;
    name: string;
    location: string;
    capacity: string
  }[];

  voitures: {
    id: string;
    startDate: Date;
    endDate: Date;
    pickupLocation: string;
    dropoffLocation: string;
    price: number;
    brand: string;
    model: string;
    pricePerDay: number;
    vehicleType: string;
  }[];

  activites: {
    id: string;
    date: Date;
    participants: number;
    price: number;
    name: string;
    category: string;
    priceAdult: number;
    duration: String
  }[];

  vols: {
    id: string;
    passengers: number;
    price: number;
    airline: string;
    flightNumber: string;
    departure: string;
    arrival: string;
    date_debut: Date;
    date_fin: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

// Pour un tableau de réservations
export type ReservationList = SingleReservation[];

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Invoice types
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: "accommodation" | "vehicle" | "activity" | "flight" | "service" | "tax";
}

export interface Invoice {
  id: string;
  idFacture: string;
  invoiceNumber: string;
  reservationId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone: string;
  paymentStatus : string;
  // Invoice details
  issueDate: Date;
  dueDate: Date;
  travelDate: Date;
  returnDate?: Date;
  dateTravel : Date;
  dateReturn : Date;


  // Financial
  currency: "Ar" | "EUR" | "USD";
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  totalPrice : string;
  paidAmount: number;
  status: "confirmé" | "sent" | "paid" | "en_attente" | "annulé";
  paymentMethod?: "cash" | "card" | "transfer" | "mobile";
  paymentDate?: Date;

  // Items
  items: InvoiceItem[];

  // Company details
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo?: string;
  companyRegistration?: string;

  // Additional
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt?: Date;
  dateCreated : Date;
}

// Travel Plan types
export interface TravelPlanDay {
  id: string;
  day: number;
  date: Date;
  location: string;
  title: string;
  description: string;
  activities: {
    time: string;
    activity: string;
    description: string;
    duration: string;
    included: boolean;
  }[];
  accommodation?: {
    name: string;
    type: string;
    location: string;
  };
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  transport?: {
    type: string;
    description: string;
  };
  notes?: string;
}

export interface TravelPlan {
  id: string;
  planNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  reservationId?: string;

  // Trip details
  destination: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  participants: number;
  travelStyle: "budget" | "comfort" | "luxury" | "adventure" | "cultural";

  // Itinerary
  days: TravelPlanDay[];

  // Pricing
  pricePerPerson: number;
  totalPrice: number;
  currency: "Ar" | "EUR" | "USD";

  // Includes/Excludes
  includes: string[];
  excludes: string[];

  // Additional info
  difficulty: "easy" | "moderate" | "challenging";
  bestSeason: string[];
  groupSize: {
    min: number;
    max: number;
  };

  // Booking info
  status:
    | "draft"
    | "proposal"
    | "confirmed"
    | "active"
    | "completed"
    | "cancelled";
  guide?: {
    name: string;
    phone: string;
    languages: string[];
  };

  // Metadata
  template: boolean;
  category: string;
  tags: string[];
  rating?: number;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Dashboard statistics
export interface DashboardStats {
  totalClients: number;
  totalReservations: number;
  totalRevenue: number;
  monthlyRevenue: number;
  popularDestinations: { name: string; count: number }[];
  recentReservations: Reservation[];
}

