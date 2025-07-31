import { useState, useEffect } from "react";
import { reservationService } from "@/services/reservationService";

export interface InvoiceStatus {
  draft: "Brouillon";
  sent: "Envoyée";
  paid: "Payée";
  overdue: "En retard";
  cancelled: "Annulée";
}

export interface Invoice {
  id: string;
  number: string;
  reservationId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  issueDate: Date;
  dueDate: Date;
  status: keyof InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: "Ar" | "EUR" | "USD";
  items: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  overdueCount: number;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const generateMockInvoices = () => {
    return [
      {
        id: "inv-001",
        number: "FAC-2024-001",
        reservationId: "RES-001",
        clientId: "CLIENT-001",
        clientName: "Jean Dupont",
        clientEmail: "jean.dupont@email.com",
        clientAddress: "123 Rue de la Paix, Paris",
        issueDate: new Date("2024-01-15"),
        dueDate: new Date("2024-02-15"),
        status: "paid" as keyof InvoiceStatus,
        subtotal: 1500,
        taxRate: 10,
        taxAmount: 150,
        total: 1650,
        currency: "EUR" as const,
        items: [
          {
            id: "item-1",
            description: "Séjour 5 jours à Madagascar",
            quantity: 2,
            unitPrice: 750,
            total: 1500,
          },
        ],
        notes: "Voyage organisé pour 2 personnes",
      },
      {
        id: "inv-002",
        number: "FAC-2024-002",
        reservationId: "RES-002",
        clientId: "CLIENT-002",
        clientName: "Marie Martin",
        clientEmail: "marie.martin@email.com",
        issueDate: new Date("2024-01-20"),
        dueDate: new Date("2024-02-20"),
        status: "sent" as keyof InvoiceStatus,
        subtotal: 2200,
        taxRate: 10,
        taxAmount: 220,
        total: 2420,
        currency: "EUR" as const,
        items: [
          {
            id: "item-2",
            description: "Circuit découverte 7 jours",
            quantity: 1,
            unitPrice: 2200,
            total: 2200,
          },
        ],
      },
    ] as Invoice[];
  };

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Simuler l'appel API avec des données mockées
      await new Promise((resolve) => setTimeout(resolve, 500));
      setInvoices(generateMockInvoices());
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (data: any) => {
    setLoading(true);
    try {
      // Simuler la création
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        number: `FAC-2024-${String(invoices.length + 1).padStart(3, "0")}`,
        reservationId: data.reservationId || "",
        clientId: data.clientId,
        clientName: data.clientName || "Client",
        clientEmail: data.clientEmail || "",
        clientAddress: data.clientAddress,
        issueDate: new Date(),
        dueDate: new Date(data.dueDate),
        status: "draft",
        subtotal: data.items.reduce(
          (sum: number, item: any) => sum + item.quantity * item.unitPrice,
          0,
        ),
        taxRate: data.taxRate || 10,
        taxAmount: 0,
        total: 0,
        currency: data.currency || "EUR",
        items: data.items,
        notes: data.notes,
      };

      newInvoice.taxAmount = (newInvoice.subtotal * newInvoice.taxRate) / 100;
      newInvoice.total = newInvoice.subtotal + newInvoice.taxAmount;

      setInvoices((prev) => [newInvoice, ...prev]);
      return { success: true, data: newInvoice };
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (id: string, data: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, ...data } : invoice,
      ),
    );
  };

  const deleteInvoice = async (id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
  };

  const markAsPaid = async (id: string) => {
    await updateInvoice(id, { status: "paid", paymentDate: new Date() });
  };

  const sendInvoice = async (id: string) => {
    await updateInvoice(id, { status: "sent" });
  };

  const getInvoiceStats = (): InvoiceStats => {
    return {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
      paidAmount: invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.total, 0),
      overdueCount: invoices.filter((inv) => inv.status === "overdue").length,
    };
  };

  const filterInvoices = (searchTerm: string, status: string) => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = status === "all" || invoice.status === status;

      return matchesSearch && matchesStatus;
    });
  };

  const generateInvoiceFromReservation = async (reservationId: string) => {
    setLoading(true);
    try {
      const response = await reservationService.getReservation(reservationId);
      if (response.success && response.data) {
        const reservation = response.data;

        const invoiceItems: InvoiceItem[] = [];
        let itemId = 1;

        // Ajouter les vols
        if (reservation.vols) {
          reservation.vols.forEach((vol) => {
            invoiceItems.push({
              id: `item-${itemId++}`,
              description: `Vol - ${vol.passengers} passager(s)`,
              quantity: 1,
              unitPrice: vol.price,
              total: vol.price,
            });
          });
        }

        // Ajouter les hébergements
        if (reservation.hebergements) {
          reservation.hebergements.forEach((heb) => {
            invoiceItems.push({
              id: `item-${itemId++}`,
              description: `Hébergement - ${heb.rooms} chambre(s)`,
              quantity: heb.rooms,
              unitPrice: heb.price / heb.rooms,
              total: heb.price,
            });
          });
        }

        // Ajouter les véhicules
        if (reservation.voitures) {
          reservation.voitures.forEach((voiture) => {
            invoiceItems.push({
              id: `item-${itemId++}`,
              description: "Location de véhicule",
              quantity: 1,
              unitPrice: voiture.price,
              total: voiture.price,
            });
          });
        }

        // Ajouter les activités
        if (reservation.activites) {
          reservation.activites.forEach((activite) => {
            invoiceItems.push({
              id: `item-${itemId++}`,
              description: `Activité - ${activite.participants} participant(s)`,
              quantity: 1,
              unitPrice: activite.price,
              total: activite.price,
            });
          });
        }

        const invoiceData = {
          reservationId: reservation.id,
          clientId: reservation.clientId,
          clientName: reservation.clientId,
          clientEmail: "",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          taxRate: 10,
          currency: reservation.currency,
          items: invoiceItems,
          notes: reservation.notes,
        };

        await createInvoice(invoiceData);
        return { success: true };
      }
      return { success: false, error: "Réservation non trouvée" };
    } catch (error) {
      console.error("Error generating invoice:", error);
      return { success: false, error: "Erreur lors de la génération" };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid,
    sendInvoice,
    getInvoiceStats,
    filterInvoices,
    generateInvoiceFromReservation,
  };
};
