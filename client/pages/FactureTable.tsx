// FactureTable.tsx
import { useEffect, useState } from "react";
import { Invoice, ApiResponse } from "../../shared/types"
import { factureService } from "@/services/factureService";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, Eye, Printer, Download, Mail, Check, X } from "lucide-react";
import { Button } from "react-day-picker";

export const FactureTable = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response: ApiResponse<Invoice[]> = await factureService.getFactures();
        if (response.success && response.data) {
          setInvoices(response.data);
          console.log('data facture', response.data)
        } else {
          setError(response.error || "Erreur lors de la récupération des factures");
        }
      } catch (err) {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

   // Fonctions pour les actions
   const handlePrint = (invoiceId: string) => {
    console.log("Imprimer la facture:", invoiceId);
    // Implémentez la logique d'impression ici
  };

  const handleDownload = (invoiceId: string) => {
    console.log("Télécharger la facture:", invoiceId);
    // Implémentez la logique de téléchargement ici
  };

  const handleSendEmail = (email: string, invoiceId: string) => {
    console.log("Envoyer la facture par email à:", email, "Facture:", invoiceId);
    // Implémentez la logique d'envoi d'email ici
  };

  const handleView = (invoice: Invoice) => {
    console.log("Voir les détails de la facture:", invoice);
    // Implémentez la logique de visualisation ici
  };

  const handleConfirm = (invoiceId: string) => {
    console.log("Confirmer la facture:", invoiceId);
    // Implémentez la logique de confirmation ici
  };

  const handleCancel = (invoiceId: string) => {
    console.log("Annuler la facture:", invoiceId);
    // Implémentez la logique d'annulation ici
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facture</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinations</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.idFacture}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{invoice.idFacture}</div>
                <div className="text-sm text-gray-500">Créée le: {invoice.dateCreated}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{invoice.clientId.name}</div>
                <div className="text-sm text-gray-500">{invoice.clientId.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {invoice.clientId.destinations.join(", ")}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  Du {invoice.dateTravel} au {invoice.dateReturn}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {invoice.clientId.nbpersonnes} personnes
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {parseFloat(invoice.totalPrice).toLocaleString('fr-FR')} MGA
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${invoice.status === 'confirmé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {invoice.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  {/* Bouton d'actions déroulant */}
                  
                  
                </div>
              </td>
            </tr>
           
          ))}
        </tbody>
      </table>
    </div>
  );
};