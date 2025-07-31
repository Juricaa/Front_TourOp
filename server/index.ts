import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getClients,
  getClient,
  client_list,
  client_detail,
  createClient,
  updateClient,
  deleteClient,
  getHebergements,
  getHebergement,
  createHebergement,
  updateHebergement,
  deleteHebergement,
  getVoitures,
  getVoiture,
  createVoiture,
  updateVoiture,
  deleteVoiture,
  getActivites,
  getActivite,
  createActivite,
  updateActivite,
  deleteActivite,
  getVols,
  getVol,
  createVol,
  updateVol,
  deleteVol,
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  deleteReservation,
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid,
  getTravelPlans,
  getTravelPlan,
  createTravelPlan,
  updateTravelPlan,
  deleteTravelPlan,
  getDashboardStats,
  searchClients,
} from "./routes/tourOperator";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Tour Operator API routes
  app.get("/api/dashboard/stats", getDashboardStats);

  // Client API (Django-style endpoints)
  app.get("/api/client", client_list);
  app.post("/api/client", createClient);
  app.get("/api/client/:pk", client_detail);
  app.put("/api/client/:pk", updateClient);
  app.patch("/api/client/:pk", updateClient);
  app.delete("/api/client/:pk", deleteClient);

  // Legacy clients endpoints for backwards compatibility
  app.get("/api/clients", getClients);
  app.get("/api/clients/search", searchClients);
  app.get("/api/clients/:id", getClient);

  // Hebergements - CRUD
  app.get("/api/hebergements", getHebergements);
  app.post("/api/hebergements", createHebergement);
  app.get("/api/hebergements/:id", getHebergement);
  app.put("/api/hebergements/:id", updateHebergement);
  app.patch("/api/hebergements/:id", updateHebergement);
  app.delete("/api/hebergements/:id", deleteHebergement);

  // Voitures - CRUD
  app.get("/api/voitures", getVoitures);
  app.post("/api/voitures", createVoiture);
  app.get("/api/voitures/:id", getVoiture);
  app.put("/api/voitures/:id", updateVoiture);
  app.patch("/api/voitures/:id", updateVoiture);
  app.delete("/api/voitures/:id", deleteVoiture);

  // Activites - CRUD
  app.get("/api/activites", getActivites);
  app.post("/api/activites", createActivite);
  app.get("/api/activites/:id", getActivite);
  app.put("/api/activites/:id", updateActivite);
  app.patch("/api/activites/:id", updateActivite);
  app.delete("/api/activites/:id", deleteActivite);

  // Vols - CRUD
  app.get("/api/vols", getVols);
  app.post("/api/vols", createVol);
  app.get("/api/vols/:id", getVol);
  app.put("/api/vols/:id", updateVol);
  app.patch("/api/vols/:id", updateVol);
  app.delete("/api/vols/:id", deleteVol);

  // Reservations - CRUD
  app.get("/api/reservations", getReservations);
  app.post("/api/reservations", createReservation);
  app.get("/api/reservations/:id", getReservation);
  app.put("/api/reservations/:id", updateReservation);
  app.patch("/api/reservations/:id", updateReservation);
  app.delete("/api/reservations/:id", deleteReservation);

  // Factures (Invoices) - CRUD
  app.get("/api/factures", getInvoices);
  app.post("/api/factures", createInvoice);
  app.get("/api/factures/:id", getInvoice);
  app.put("/api/factures/:id", updateInvoice);
  app.patch("/api/factures/:id", updateInvoice);
  app.delete("/api/factures/:id", deleteInvoice);
  app.post("/api/factures/:id/pay", markInvoiceAsPaid);

  // Plans de Voyage (Travel Plans) - CRUD
  app.get("/api/plans-voyage", getTravelPlans);
  app.post("/api/plans-voyage", createTravelPlan);
  app.get("/api/plans-voyage/:id", getTravelPlan);
  app.put("/api/plans-voyage/:id", updateTravelPlan);
  app.patch("/api/plans-voyage/:id", updateTravelPlan);
  app.delete("/api/plans-voyage/:id", deleteTravelPlan);

  return app;
}
