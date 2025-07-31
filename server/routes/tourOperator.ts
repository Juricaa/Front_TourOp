import { RequestHandler } from "express";
import {
  Client,
  Hebergement,
  Voiture,
  Activite,
  Vol,
  Reservation,
  Invoice,
  InvoiceItem,
  TravelPlan,
  TravelPlanDay,
  ApiResponse,
  DashboardStats,
} from "@shared/types";
import {
  mockClients,
  mockHebergements,
  mockVoitures,
  mockActivites,
  mockVols,
  mockReservations,
} from "../data/mockData";

// Clients - CRUD Operations
export const client_list: RequestHandler = (req, res) => {
  const response: ApiResponse<Client[]> = {
    success: true,
    data: mockClients,
  };
  res.json(response);
};

export const client_detail: RequestHandler = (req, res) => {
  const { pk } = req.params;
  const client = mockClients.find((c) => c.idClient === pk);

  if (!client) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Client not found",
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Client> = {
    success: true,
    data: client,
  };
  res.json(response);
};

export const createClient: RequestHandler = (req, res) => {
  try {
    const newClient: Client = {
      idClient: `C${String(mockClients.length + 1).padStart(3, "0")}`,
      ...req.body,
      nbpersonnes:
        typeof req.body.nbpersonnes === "string"
          ? parseInt(req.body.nbpersonnes) || 2
          : req.body.nbpersonnes || 2,
    };

    // Validation
    if (!newClient.name || !newClient.email) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Name and email are required",
      };
      return res.status(400).json(response);
    }

    mockClients.push(newClient);

    const response: ApiResponse<Client> = {
      success: true,
      data: newClient,
      message: "Client created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create client",
    };
    res.status(500).json(response);
  }
};

export const updateClient: RequestHandler = (req, res) => {
  try {
    const { pk } = req.params;
    const clientIndex = mockClients.findIndex((c) => c.idClient === pk);

    if (clientIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Client not found",
      };
      return res.status(404).json(response);
    }

    // Update client with new data, keeping the same ID
    mockClients[clientIndex] = {
      ...mockClients[clientIndex],
      ...req.body,
      idClient: pk, // Ensure ID doesn't change
    };

    const response: ApiResponse<Client> = {
      success: true,
      data: mockClients[clientIndex],
      message: "Client updated successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update client",
    };
    res.status(500).json(response);
  }
};

export const deleteClient: RequestHandler = (req, res) => {
  try {
    const { pk } = req.params;
    const clientIndex = mockClients.findIndex((c) => c.idClient === pk);

    if (clientIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Client not found",
      };
      return res.status(404).json(response);
    }

    const deletedClient = mockClients.splice(clientIndex, 1)[0];

    const response: ApiResponse<Client> = {
      success: true,
      data: deletedClient,
      message: "Client deleted successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete client",
    };
    res.status(500).json(response);
  }
};

// Legacy endpoints for backwards compatibility
export const getClients: RequestHandler = client_list;
export const getClient: RequestHandler = (req, res) => {
  req.params.pk = req.params.id;
  client_detail(req, res);
};

// Hebergements
export const getHebergements: RequestHandler = (req, res) => {
  const response: ApiResponse<Hebergement[]> = {
    success: true,
    data: mockHebergements,
  };
  res.json(response);
};

export const getHebergement: RequestHandler = (req, res) => {
  const { id } = req.params;
  const hebergement = mockHebergements.find((h) => h.idHebergement === id);

  if (!hebergement) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Hébergement not found",
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Hebergement> = {
    success: true,
    data: hebergement,
  };
  res.json(response);
};

export const createHebergement: RequestHandler = (req, res) => {
  try {
    const newHebergement: Hebergement = {
      idHebergement: `H${String(mockHebergements.length + 1).padStart(3, "0")}`,
      ...req.body,
      rating: parseFloat(req.body.rating) || 5,
      capacity: parseInt(req.body.capacity) || 2,
      amenities: req.body.amenities || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validation
    if (!newHebergement.name || !newHebergement.location) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Name and location are required",
      };
      return res.status(400).json(response);
    }

    mockHebergements.push(newHebergement);

    const response: ApiResponse<Hebergement> = {
      success: true,
      data: newHebergement,
      message: "Hébergement created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create hébergement",
    };
    res.status(500).json(response);
  }
};

export const updateHebergement: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const hebergementIndex = mockHebergements.findIndex(
      (h) => h.idHebergement === id,
    );

    if (hebergementIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Hébergement not found",
      };
      return res.status(404).json(response);
    }

    // Update hébergement with new data, keeping the same ID
    mockHebergements[hebergementIndex] = {
      ...mockHebergements[hebergementIndex],
      ...req.body,
      idHebergement: mockHebergements[hebergementIndex].idHebergement, // Keep original ID
      rating:
        parseFloat(req.body.rating) ||
        mockHebergements[hebergementIndex].rating,
      capacity:
        parseInt(req.body.capacity) ||
        mockHebergements[hebergementIndex].capacity,
      amenities:
        req.body.amenities || mockHebergements[hebergementIndex].amenities,
      updatedAt: new Date(),
    };

    const response: ApiResponse<Hebergement> = {
      success: true,
      data: mockHebergements[hebergementIndex],
      message: "Hébergement updated successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update hébergement",
    };
    res.status(500).json(response);
  }
};

export const deleteHebergement: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const hebergementIndex = mockHebergements.findIndex(
      (h) => h.idHebergement === id,
    );

    if (hebergementIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Hébergement not found",
      };
      return res.status(404).json(response);
    }

    // Remove hébergement from array
    const deletedHebergement = mockHebergements.splice(hebergementIndex, 1)[0];

    const response: ApiResponse<Hebergement> = {
      success: true,
      data: deletedHebergement,
      message: "Hébergement deleted successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete hébergement",
    };
    res.status(500).json(response);
  }
};

// Voitures - CRUD Operations
export const getVoitures: RequestHandler = (req, res) => {
  const response: ApiResponse<Voiture[]> = {
    success: true,
    data: mockVoitures,
  };
  res.json(response);
};

export const getVoiture: RequestHandler = (req, res) => {
  const { id } = req.params;
  const voiture = mockVoitures.find((v) => v.id === id);

  if (!voiture) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Voiture not found",
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Voiture> = {
    success: true,
    data: voiture,
  };
  res.json(response);
};

export const createVoiture: RequestHandler = (req, res) => {
  try {
    const newVoiture: Voiture = {
      id: `V${String(mockVoitures.length + 1).padStart(3, "0")}`,
      ...req.body,
      pricePerDay: parseInt(req.body.pricePerDay) || 100000,
      capacity: parseInt(req.body.capacity) || 4,
      features: req.body.features || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!newVoiture.brand || !newVoiture.model) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Brand and model are required",
      };
      return res.status(400).json(response);
    }

    mockVoitures.push(newVoiture);

    const response: ApiResponse<Voiture> = {
      success: true,
      data: newVoiture,
      message: "Voiture created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create voiture",
    };
    res.status(500).json(response);
  }
};

export const updateVoiture: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const voitureIndex = mockVoitures.findIndex((v) => v.id === id);

    if (voitureIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Voiture not found",
      };
      return res.status(404).json(response);
    }

    mockVoitures[voitureIndex] = {
      ...mockVoitures[voitureIndex],
      ...req.body,
      id: mockVoitures[voitureIndex].id,
      pricePerDay:
        parseInt(req.body.pricePerDay) ||
        mockVoitures[voitureIndex].pricePerDay,
      capacity:
        parseInt(req.body.capacity) || mockVoitures[voitureIndex].capacity,
      features: req.body.features || mockVoitures[voitureIndex].features,
      updatedAt: new Date(),
    };

    const response: ApiResponse<Voiture> = {
      success: true,
      data: mockVoitures[voitureIndex],
      message: "Voiture updated successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update voiture",
    };
    res.status(500).json(response);
  }
};

export const deleteVoiture: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const voitureIndex = mockVoitures.findIndex((v) => v.id === id);

    if (voitureIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Voiture not found",
      };
      return res.status(404).json(response);
    }

    const deletedVoiture = mockVoitures.splice(voitureIndex, 1)[0];

    const response: ApiResponse<Voiture> = {
      success: true,
      data: deletedVoiture,
      message: "Voiture deleted successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete voiture",
    };
    res.status(500).json(response);
  }
};

// Activites - CRUD Operations
export const getActivites: RequestHandler = (req, res) => {
  const response: ApiResponse<Activite[]> = {
    success: true,
    data: mockActivites,
  };
  res.json(response);
};

export const getActivite: RequestHandler = (req, res) => {
  const { id } = req.params;
  const activite = mockActivites.find((a) => a.id === id);

  if (!activite) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Activité not found",
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Activite> = {
    success: true,
    data: activite,
  };
  res.json(response);
};

export const createActivite: RequestHandler = (req, res) => {
  try {
    const newActivite: Activite = {
      id: `A${String(mockActivites.length + 1).padStart(3, "0")}`,
      ...req.body,
      priceAdult: parseInt(req.body.priceAdult) || 50000,
      priceChild: parseInt(req.body.priceChild) || 0,
      groupSize: req.body.groupSize || { min: 1, max: 10 },
      includes: req.body.includes || [],
      requirements: req.body.requirements || [],
      rating: parseFloat(req.body.rating) || 5,
      reviews: parseInt(req.body.reviews) || 0,
      seasons: req.body.seasons || [],
      popularity: parseInt(req.body.popularity) || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!newActivite.name || !newActivite.location) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Name and location are required",
      };
      return res.status(400).json(response);
    }

    mockActivites.push(newActivite);

    const response: ApiResponse<Activite> = {
      success: true,
      data: newActivite,
      message: "Activité created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create activité",
    };
    res.status(500).json(response);
  }
};

export const updateActivite: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const activiteIndex = mockActivites.findIndex((a) => a.id === id);

    if (activiteIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Activité not found",
      };
      return res.status(404).json(response);
    }

    mockActivites[activiteIndex] = {
      ...mockActivites[activiteIndex],
      ...req.body,
      id: mockActivites[activiteIndex].id,
      priceAdult:
        parseInt(req.body.priceAdult) ||
        mockActivites[activiteIndex].priceAdult,
      priceChild:
        parseInt(req.body.priceChild) ||
        mockActivites[activiteIndex].priceChild,
      groupSize: req.body.groupSize || mockActivites[activiteIndex].groupSize,
      includes: req.body.includes || mockActivites[activiteIndex].includes,
      requirements:
        req.body.requirements || mockActivites[activiteIndex].requirements,
      rating:
        parseFloat(req.body.rating) || mockActivites[activiteIndex].rating,
      reviews:
        parseInt(req.body.reviews) || mockActivites[activiteIndex].reviews,
      seasons: req.body.seasons || mockActivites[activiteIndex].seasons,
      popularity:
        parseInt(req.body.popularity) ||
        mockActivites[activiteIndex].popularity,
      updatedAt: new Date(),
    };

    const response: ApiResponse<Activite> = {
      success: true,
      data: mockActivites[activiteIndex],
      message: "Activité updated successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update activité",
    };
    res.status(500).json(response);
  }
};

export const deleteActivite: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const activiteIndex = mockActivites.findIndex((a) => a.id === id);

    if (activiteIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Activité not found",
      };
      return res.status(404).json(response);
    }

    const deletedActivite = mockActivites.splice(activiteIndex, 1)[0];

    const response: ApiResponse<Activite> = {
      success: true,
      data: deletedActivite,
      message: "Activité deleted successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete activité",
    };
    res.status(500).json(response);
  }
};

// Vols - CRUD Operations
export const getVols: RequestHandler = (req, res) => {
  const response: ApiResponse<Vol[]> = {
    success: true,
    data: mockVols,
  };
  res.json(response);
};

export const getVol: RequestHandler = (req, res) => {
  const { id } = req.params;
  const vol = mockVols.find((v) => v.id === id);

  if (!vol) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Vol not found",
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Vol> = {
    success: true,
    data: vol,
  };
  res.json(response);
};

export const createVol: RequestHandler = (req, res) => {
  try {
    const newVol: Vol = {
      id: `F${String(mockVols.length + 1).padStart(3, "0")}`,
      ...req.body,
      price: parseInt(req.body.price) || 500000,
      route: req.body.route || { from: "", to: "", fromCode: "", toCode: "" },
      schedule: req.body.schedule || {
        departure: "",
        arrival: "",
        duration: "",
      },
      seats: req.body.seats || { total: 150, available: 150 },
      services: req.body.services || [],
      baggage: req.body.baggage || { carry: "7kg", checked: "23kg" },
      cancellation: req.body.cancellation || { flexible: false, fee: 0 },
      contact: req.body.contact || { phone: "", email: "", website: "" },
      rating: parseFloat(req.body.rating) || 5,
      reviews: parseInt(req.body.reviews) || 0,
      popularity: parseInt(req.body.popularity) || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!newVol.airline || !newVol.flightNumber) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Airline and flight number are required",
      };
      return res.status(400).json(response);
    }

    mockVols.push(newVol);

    const response: ApiResponse<Vol> = {
      success: true,
      data: newVol,
      message: "Vol created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create vol",
    };
    res.status(500).json(response);
  }
};

export const updateVol: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const volIndex = mockVols.findIndex((v) => v.id === id);

    if (volIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Vol not found",
      };
      return res.status(404).json(response);
    }

    mockVols[volIndex] = {
      ...mockVols[volIndex],
      ...req.body,
      id: mockVols[volIndex].id,
      price: parseInt(req.body.price) || mockVols[volIndex].price,
      route: req.body.route || mockVols[volIndex].route,
      schedule: req.body.schedule || mockVols[volIndex].schedule,
      seats: req.body.seats || mockVols[volIndex].seats,
      services: req.body.services || mockVols[volIndex].services,
      baggage: req.body.baggage || mockVols[volIndex].baggage,
      cancellation: req.body.cancellation || mockVols[volIndex].cancellation,
      contact: req.body.contact || mockVols[volIndex].contact,
      rating: parseFloat(req.body.rating) || mockVols[volIndex].rating,
      reviews: parseInt(req.body.reviews) || mockVols[volIndex].reviews,
      popularity:
        parseInt(req.body.popularity) || mockVols[volIndex].popularity,
      updatedAt: new Date(),
    };

    const response: ApiResponse<Vol> = {
      success: true,
      data: mockVols[volIndex],
      message: "Vol updated successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update vol",
    };
    res.status(500).json(response);
  }
};

export const deleteVol: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const volIndex = mockVols.findIndex((v) => v.id === id);

    if (volIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Vol not found",
      };
      return res.status(404).json(response);
    }

    const deletedVol = mockVols.splice(volIndex, 1)[0];

    const response: ApiResponse<Vol> = {
      success: true,
      data: deletedVol,
      message: "Vol deleted successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete vol",
    };
    res.status(500).json(response);
  }
};

// Reservations
export const getReservations: RequestHandler = (req, res) => {
  const response: ApiResponse<Reservation[]> = {
    success: true,
    data: mockReservations,
  };
  res.json(response);
};

export const getReservation: RequestHandler = (req, res) => {
  const { id } = req.params;
  const reservation = mockReservations.find((r) => r.id === id);

  if (!reservation) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Réservation not found",
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Reservation> = {
    success: true,
    data: reservation,
  };
  res.json(response);
};

export const createReservation: RequestHandler = (req, res) => {
  try {
    console.log("Creating reservation with request body:", req.body);

    // Convert date strings to Date objects
    const requestBody = { ...req.body };
    if (requestBody.dateCreated) {
      requestBody.dateCreated = new Date(requestBody.dateCreated);
    }
    if (requestBody.dateTravel) {
      requestBody.dateTravel = new Date(requestBody.dateTravel);
    }
    if (requestBody.dateReturn) {
      requestBody.dateReturn = new Date(requestBody.dateReturn);
    }

    // Process nested objects dates
    if (requestBody.hebergements && Array.isArray(requestBody.hebergements)) {
      requestBody.hebergements = requestBody.hebergements.map((heb: any) => ({
        ...heb,
        checkIn: new Date(heb.checkIn),
        checkOut: new Date(heb.checkOut),
      }));
    }
    if (requestBody.voitures && Array.isArray(requestBody.voitures)) {
      requestBody.voitures = requestBody.voitures.map((voiture: any) => ({
        ...voiture,
        startDate: new Date(voiture.startDate),
        endDate: new Date(voiture.endDate),
      }));
    }
    if (requestBody.activites && Array.isArray(requestBody.activites)) {
      requestBody.activites = requestBody.activites.map((activite: any) => ({
        ...activite,
        date: new Date(activite.date),
      }));
    }

    const newReservation: Reservation = {
      id: `RES${String(mockReservations.length + 1).padStart(3, "0")}`,
      ...requestBody,
      dateCreated: requestBody.dateCreated || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate required fields according to Reservation type
    if (!newReservation.clientId || !newReservation.dateTravel) {
      console.error("Missing required fields:", {
        clientId: newReservation.clientId,
        dateTravel: newReservation.dateTravel,
      });
      const response: ApiResponse<null> = {
        success: false,
        error: "Client ID and travel date are required",
      };
      return res.status(400).json(response);
    }

    console.log("New reservation created:", newReservation);
    mockReservations.push(newReservation);

    const response: ApiResponse<Reservation> = {
      success: true,
      data: newReservation,
      message: "Réservation created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating reservation:", error);
    const response: ApiResponse<null> = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create réservation",
    };
    res.status(500).json(response);
  }
};

export const updateReservation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const reservationIndex = mockReservations.findIndex((r) => r.id === id);

    if (reservationIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Réservation not found",
      };
      return res.status(404).json(response);
    }

    mockReservations[reservationIndex] = {
      ...mockReservations[reservationIndex],
      ...req.body,
      id: mockReservations[reservationIndex].id,
      totalPrice:
        parseInt(req.body.totalPrice) ||
        mockReservations[reservationIndex].totalPrice,
      deposit:
        parseInt(req.body.deposit) ||
        mockReservations[reservationIndex].deposit,
      participants:
        parseInt(req.body.participants) ||
        mockReservations[reservationIndex].participants,
      lastModified: new Date(),
    };

    const response: ApiResponse<Reservation> = {
      success: true,
      data: mockReservations[reservationIndex],
      message: "Réservation updated successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update réservation",
    };
    res.status(500).json(response);
  }
};

export const deleteReservation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const reservationIndex = mockReservations.findIndex((r) => r.id === id);

    if (reservationIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Réservation not found",
      };
      return res.status(404).json(response);
    }

    const deletedReservation = mockReservations.splice(reservationIndex, 1)[0];

    const response: ApiResponse<Reservation> = {
      success: true,
      data: deletedReservation,
      message: "Réservation deleted successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete réservation",
    };
    res.status(500).json(response);
  }
};

// Dashboard statistics
export const getDashboardStats: RequestHandler = (req, res) => {
  const stats: DashboardStats = {
    totalClients: mockClients.length,
    totalReservations: mockReservations.length,
    totalRevenue: mockReservations.reduce((sum, r) => sum + r.totalPrice, 0),
    monthlyRevenue: mockReservations
      .filter((r) => {
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        return (
          r.dateCreated.getMonth() === month &&
          r.dateCreated.getFullYear() === year
        );
      })
      .reduce((sum, r) => sum + r.totalPrice, 0),
    popularDestinations: [
      { name: "Andasibe-Mantadia", count: 15 },
      { name: "Nosy Be", count: 12 },
      { name: "Tsingy de Bemaraha", count: 8 },
      { name: "Morondava", count: 6 },
    ],
    recentReservations: mockReservations.slice(0, 5),
  };

  const response: ApiResponse<DashboardStats> = {
    success: true,
    data: stats,
  };
  res.json(response);
};

// Search functionality
export const searchClients: RequestHandler = (req, res) => {
  const { q } = req.query;
  const query = typeof q === "string" ? q.toLowerCase() : "";

  const filtered = mockClients.filter(
    (client) =>
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.nationality.toLowerCase().includes(query),
  );

  const response: ApiResponse<Client[]> = {
    success: true,
    data: filtered,
  };
  res.json(response);
};

// Mock data for invoices and travel plans
const mockInvoices: Invoice[] = [
  {
    id: "INV001",
    invoiceNumber: "INV-20241201-1001",
    reservationId: "RES001",
    clientId: "CLI001",
    clientName: "Jean Dupont",
    clientEmail: "jean.dupont@email.com",
    clientAddress: "123 Rue de Paris, 75001 Paris, France",
    clientPhone: "+33 1 23 45 67 89",
    issueDate: new Date("2024-12-01"),
    dueDate: new Date("2024-12-15"),
    travelDate: new Date("2025-01-15"),
    returnDate: new Date("2025-01-22"),
    currency: "EUR",
    subtotal: 2800,
    taxRate: 20,
    taxAmount: 560,
    totalAmount: 3360,
    paidAmount: 0,
    status: "sent",
    items: [
      {
        id: "ITEM001",
        description: "Hébergement - Hôtel Relais des Plateaux (7 nuits)",
        quantity: 7,
        unitPrice: 120,
        total: 840,
        type: "accommodation",
      },
      {
        id: "ITEM002",
        description: "Véhicule - 4x4 Toyota avec chauffeur (7 jours)",
        quantity: 7,
        unitPrice: 80,
        total: 560,
        type: "vehicle",
      },
      {
        id: "ITEM003",
        description: "Activité - Visite Parc Andasibe-Mantadia",
        quantity: 2,
        unitPrice: 45,
        total: 90,
        type: "activity",
      },
      {
        id: "ITEM004",
        description: "Vol - Air Madagascar Antananarivo-Paris",
        quantity: 1,
        unitPrice: 650,
        total: 650,
        type: "flight",
      },
      {
        id: "ITEM005",
        description: "Guide accompagnateur",
        quantity: 7,
        unitPrice: 40,
        total: 280,
        type: "service",
      },
      {
        id: "ITEM006",
        description: "Frais de dossier et assurance",
        quantity: 1,
        unitPrice: 380,
        total: 380,
        type: "service",
      },
    ],
    companyName: "Madagascar Tours & Travel",
    companyAddress: "Lot 123 Antananarivo 101, Madagascar",
    companyPhone: "+261 20 22 123 45",
    companyEmail: "contact@madagascar-tours.mg",
    companyRegistration: "RC 2020 B 12345",
    notes: "Paiement par virement bancaire ou carte de crédit accepté",
    terms:
      "Paiement sous 15 jours. En cas de retard, des pénalités de 1,5% par mois de retard seront appliquées.",
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-01"),
  },
];

const mockTravelPlans: TravelPlan[] = [
  {
    id: "PLAN001",
    planNumber: "PLAN-20241201-2001",
    title: "Circuit Découverte Madagascar - 7 jours",
    clientId: "CLI001",
    clientName: "Jean Dupont",
    reservationId: "RES001",
    destination: "Madagascar - Antananarivo et Andasibe",
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-01-22"),
    duration: 7,
    participants: 2,
    travelStyle: "comfort",
    pricePerPerson: 1680,
    totalPrice: 3360,
    currency: "EUR",
    includes: [
      "Hébergement en hôtels 3-4 étoiles",
      "Transport en véhicule 4x4 avec chauffeur",
      "Guide accompagnateur francophone",
      "Entrées dans les parcs nationaux",
      "Petits déjeuners",
    ],
    excludes: [
      "Vols internationaux",
      "Déjeuners et dîners",
      "Boissons",
      "Pourboires",
      "Assurance voyage",
    ],
    difficulty: "easy",
    bestSeason: ["Avril", "Mai", "Septembre", "Octobre", "Novembre"],
    groupSize: { min: 2, max: 8 },
    status: "confirmed",
    guide: {
      name: "Ratsimba Andry",
      phone: "+261 32 12 345 67",
      languages: ["Français", "Anglais", "Malagasy"],
    },
    category: "Circuit découverte",
    tags: ["Nature", "Culture", "Famille"],
    template: false,
    days: [
      {
        id: "DAY001",
        day: 1,
        date: new Date("2025-01-15"),
        location: "Antananarivo",
        title: "Arrivée à Antananarivo",
        description: "Accueil à l'aéroport et installation à l'hôtel",
        activities: [
          {
            time: "09:00",
            activity: "Arrivée vol Air Madagascar",
            description: "Accueil à l'aéroport d'Ivato par votre guide",
            duration: "30 min",
            included: true,
          },
          {
            time: "10:00",
            activity: "Transfert à l'hôtel",
            description: "Route vers le centre-ville d'Antananarivo",
            duration: "45 min",
            included: true,
          },
          {
            time: "14:00",
            activity: "Visite du Palais de la Reine",
            description: "Découverte de l'histoire royale malgache",
            duration: "2h",
            included: true,
          },
          {
            time: "17:00",
            activity: "Marché artisanal de La Digue",
            description: "Shopping souvenirs et artisanat local",
            duration: "1h",
            included: false,
          },
        ],
        accommodation: {
          name: "Hôtel Colbert",
          type: "Hôtel 4 étoiles",
          location: "Centre-ville Antananarivo",
        },
        meals: { breakfast: false, lunch: false, dinner: false },
        transport: {
          type: "Véhicule 4x4",
          description: "Transfert aéroport et visites",
        },
        notes: "Check-in à partir de 14h",
      },
      {
        id: "DAY002",
        day: 2,
        date: new Date("2025-01-16"),
        location: "Antananarivo - Andasibe",
        title: "Route vers Andasibe",
        description: "Départ pour le parc national d'Andasibe-Mantadia",
        activities: [
          {
            time: "08:00",
            activity: "Petit déjeuner à l'hôtel",
            description: "Petit déjeuner continental",
            duration: "1h",
            included: true,
          },
          {
            time: "09:00",
            activity: "Départ pour Andasibe",
            description: "Route de 140 km vers l'est",
            duration: "3h",
            included: true,
          },
          {
            time: "13:00",
            activity: "Déjeuner à Andasibe",
            description: "Restaurant local avec spécialités malgaches",
            duration: "1h",
            included: false,
          },
          {
            time: "15:00",
            activity: "Visite Réserve de Vakona",
            description: "Rencontre avec les lémuriens en semi-liberté",
            duration: "2h",
            included: true,
          },
        ],
        accommodation: {
          name: "Hôtel Relais des Plateaux",
          type: "Hôtel 3 étoiles",
          location: "Andasibe",
        },
        meals: { breakfast: true, lunch: false, dinner: false },
        transport: {
          type: "Véhicule 4x4",
          description: "Route Antananarivo-Andasibe",
        },
      },
    ],
    rating: 4.8,
    notes: "Circuit parfait pour une première découverte de Madagascar",
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-01"),
  },
];

// Invoice CRUD Operations
export const getInvoices: RequestHandler = (req, res) => {
  const response: ApiResponse<Invoice[]> = {
    success: true,
    data: mockInvoices,
  };
  res.json(response);
};

export const getInvoice: RequestHandler = (req, res) => {
  const { id } = req.params;
  const invoice = mockInvoices.find((i) => i.id === id);

  if (!invoice) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Facture not found",
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Invoice> = {
    success: true,
    data: invoice,
  };
  res.json(response);
};

export const createInvoice: RequestHandler = (req, res) => {
  try {
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Date.now().toString().slice(-4)}`;

    const items: InvoiceItem[] = req.body.items.map(
      (item: any, index: number) => ({
        id: `ITEM${String(index + 1).padStart(3, "0")}`,
        ...item,
        total: item.quantity * item.unitPrice,
      }),
    );

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = req.body.discountAmount || 0;
    const discountedSubtotal = subtotal - discountAmount;
    const taxRate = 20; // 20% VAT
    const taxAmount = (discountedSubtotal * taxRate) / 100;
    const totalAmount = discountedSubtotal + taxAmount;

    const newInvoice: Invoice = {
      id: `INV${String(mockInvoices.length + 1).padStart(3, "0")}`,
      invoiceNumber,
      ...req.body,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      totalAmount,
      paidAmount: 0,
      status: "draft",
      companyName: "Madagascar Tours & Travel",
      companyAddress: "Lot 123 Antananarivo 101, Madagascar",
      companyPhone: "+261 20 22 123 45",
      companyEmail: "contact@madagascar-tours.mg",
      companyRegistration: "RC 2020 B 12345",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      createdAt: new Date(),
    };

    mockInvoices.push(newInvoice);

    const response: ApiResponse<Invoice> = {
      success: true,
      data: newInvoice,
      message: "Facture created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create facture",
    };
    res.status(500).json(response);
  }
};

export const updateInvoice: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const invoiceIndex = mockInvoices.findIndex((i) => i.id === id);

    if (invoiceIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Facture not found",
      };
      return res.status(404).json(response);
    }

    // Recalculate totals if items changed
    let updatedInvoice = { ...mockInvoices[invoiceIndex], ...req.body };

    if (req.body.items) {
      const items: InvoiceItem[] = req.body.items.map(
        (item: any, index: number) => ({
          ...item,
          total: item.quantity * item.unitPrice,
        }),
      );

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const discountAmount = req.body.discountAmount || 0;
      const discountedSubtotal = subtotal - discountAmount;
      const taxAmount = (discountedSubtotal * updatedInvoice.taxRate) / 100;
      const totalAmount = discountedSubtotal + taxAmount;

      updatedInvoice = {
        ...updatedInvoice,
        items,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        updatedAt: new Date(),
      };
    }

    mockInvoices[invoiceIndex] = updatedInvoice;

    const response: ApiResponse<Invoice> = {
      success: true,
      data: mockInvoices[invoiceIndex],
      message: "Facture updated successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update facture",
    };
    res.status(500).json(response);
  }
};

export const deleteInvoice: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const invoiceIndex = mockInvoices.findIndex((i) => i.id === id);

    if (invoiceIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Facture not found",
      };
      return res.status(404).json(response);
    }

    const deletedInvoice = mockInvoices.splice(invoiceIndex, 1)[0];

    const response: ApiResponse<Invoice> = {
      success: true,
      data: deletedInvoice,
      message: "Facture deleted successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete facture",
    };
    res.status(500).json(response);
  }
};

export const markInvoiceAsPaid: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paidAmount } = req.body;
    const invoiceIndex = mockInvoices.findIndex((i) => i.id === id);

    if (invoiceIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Facture not found",
      };
      return res.status(404).json(response);
    }

    mockInvoices[invoiceIndex] = {
      ...mockInvoices[invoiceIndex],
      status: "paid",
      paymentMethod,
      paidAmount,
      paymentDate: new Date(),
      updatedAt: new Date(),
    };

    const response: ApiResponse<Invoice> = {
      success: true,
      data: mockInvoices[invoiceIndex],
      message: "Facture marked as paid",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to mark facture as paid",
    };
    res.status(500).json(response);
  }
};

// Travel Plan CRUD Operations
export const getTravelPlans: RequestHandler = (req, res) => {
  const response: ApiResponse<TravelPlan[]> = {
    success: true,
    data: mockTravelPlans,
  };
  res.json(response);
};

export const getTravelPlan: RequestHandler = (req, res) => {
  const { id } = req.params;
  const plan = mockTravelPlans.find((p) => p.id === id);

  if (!plan) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Plan de voyage not found",
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<TravelPlan> = {
    success: true,
    data: plan,
  };
  res.json(response);
};

export const createTravelPlan: RequestHandler = (req, res) => {
  try {
    const planNumber = `PLAN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Date.now().toString().slice(-4)}`;

    const duration = Math.ceil(
      (new Date(req.body.endDate).getTime() -
        new Date(req.body.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const totalPrice = req.body.pricePerPerson * req.body.participants;

    const newPlan: TravelPlan = {
      id: `PLAN${String(mockTravelPlans.length + 1).padStart(3, "0")}`,
      planNumber,
      ...req.body,
      duration,
      totalPrice,
      status: "draft",
      template: false,
      days: [],
      createdAt: new Date(),
    };

    mockTravelPlans.push(newPlan);

    const response: ApiResponse<TravelPlan> = {
      success: true,
      data: newPlan,
      message: "Plan de voyage created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create plan de voyage",
    };
    res.status(500).json(response);
  }
};

export const updateTravelPlan: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const planIndex = mockTravelPlans.findIndex((p) => p.id === id);

    if (planIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Plan de voyage not found",
      };
      return res.status(404).json(response);
    }

    // Recalculate totals if price or participants changed
    let updatedPlan = { ...mockTravelPlans[planIndex], ...req.body };

    if (req.body.pricePerPerson || req.body.participants) {
      updatedPlan.totalPrice =
        (req.body.pricePerPerson || updatedPlan.pricePerPerson) *
        (req.body.participants || updatedPlan.participants);
    }

    if (req.body.startDate || req.body.endDate) {
      const startDate = new Date(req.body.startDate || updatedPlan.startDate);
      const endDate = new Date(req.body.endDate || updatedPlan.endDate);
      updatedPlan.duration = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    updatedPlan.updatedAt = new Date();
    mockTravelPlans[planIndex] = updatedPlan;

    const response: ApiResponse<TravelPlan> = {
      success: true,
      data: mockTravelPlans[planIndex],
      message: "Plan de voyage updated successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update plan de voyage",
    };
    res.status(500).json(response);
  }
};

export const deleteTravelPlan: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const planIndex = mockTravelPlans.findIndex((p) => p.id === id);

    if (planIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Plan de voyage not found",
      };
      return res.status(404).json(response);
    }

    const deletedPlan = mockTravelPlans.splice(planIndex, 1)[0];

    const response: ApiResponse<TravelPlan> = {
      success: true,
      data: deletedPlan,
      message: "Plan de voyage deleted successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete plan de voyage",
    };
    res.status(500).json(response);
  }
};
