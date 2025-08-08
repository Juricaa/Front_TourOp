// components/invoice/InvoiceView.tsx
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  number: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  status: string;
  paymentStatus : string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  travelStartDate: string;
  travelEndDate?: string;
  date_created: string;
  currency: 'MGA' | 'EUR' | 'USD';
}

const statusLabels: Record<string, string> = {
  paid: "Payée",
  pending: "En attente",
  overdue: "En retard",
};

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
};

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "../ui/button";

export const InvoiceView: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const currencySymbol = invoice.currency === 'MGA' ? 'Ar' : invoice.currency === 'EUR' ? '€' : '$';
  console.log("data facture", invoice);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };


  const generateInvoiceDocument = (invoice: Invoice) => {
    const currencySymbol = invoice.currency === 'MGA' ? 'Ar' : invoice.currency === 'EUR' ? '€' : '$';

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    };

    // Fonction de formatage de date simple pour la fenêtre d'impression
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
      } catch {
        return dateString; // Fallback si le parsing échoue
      }
    };

    const content = `
        <html>
          <head>
            <title>Facture ${invoice.number}</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                width: 125%;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #2c7a3e;
                padding-bottom: 15px;
              }
              .invoice-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .invoice-meta {
                font-size: 14px;
                color: #666;
                margin-bottom: 20px;
              }
              .grid-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
              }
              .company-info, .client-info {
                padding: 10px;
              }
              .client-info {
                text-align: right;
              }
              .info-title {
                font-weight: 600;
                margin-bottom: 8px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
                font-weight: 600;
              }
              .text-right {
                text-align: right;
              }
              .totals {
                max-width: 300px;
                margin-left: auto;
                margin-top: 20px;
              }
              .totals div {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
              }
              .total-final {
                font-weight: bold;
                font-size: 18px;
                border-top: 1px solid #ddd;
                padding-top: 10px;
                margin-top: 10px;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                margin-left: 10px;
              }
              .notes {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #eee;
              }
              @media print {
                body {
                  padding: 0;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="invoice-title">Facture ${invoice.number}</div>
              <div class="invoice-meta">
                Date : ${formatDate(invoice.date_created)}<br/>
                Statut: <span class="status-badge" style="background-color: ${invoice.status === 'payé' ? '#dcfce7' : invoice.status === 'en_attente' ? '#fef9c3' : '#fee2e2'}; 
                                  color: ${invoice.status === 'payé' ? '#166534' : invoice.status === 'en_attente' ? '#854d0e' : '#991b1b'};
                                  border: 1px solid ${invoice.status === 'payé' ? '#bbf7d0' : invoice.status === 'en_attente' ? '#fef08a' : '#fecaca'};">
                        ${statusLabels[invoice.paymentStatus] || invoice.paymentStatus}
                      </span>
              </div>
            </div>
    
            <div class="grid-container">
              <div class="company-info">
                <div class="info-title">TourOp Madagascar</div>
                <p>
                  123 Avenue des Baobabs<br/>
                  101 Antananarivo, Madagascar<br/>
                  +261 20 12 345 67
                </p>
              </div>
              <div class="client-info">
                <div class="info-title">Facturé à:</div>
                <p>
                  ${invoice.clientName}<br/>
                  ${invoice.clientEmail}<br/>
                  ${invoice.clientAddress || ''}
                </p>
              </div>
            </div>
    
            ${invoice.travelStartDate ? `
            <div class="travel-dates">
              <p><strong>Période du voyage:</strong> 
                ${formatDate(invoice.travelStartDate)} 
                ${invoice.travelEndDate ? `au ${formatDate(invoice.travelEndDate)}` : ''}
              </p>
            </div>
            ` : ''}
    
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Quantité</th>
                  <th class="text-right">Prix unitaire</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${currencySymbol} ${formatPrice(item.unitPrice)}</td>
                    <td class="text-right">${currencySymbol} ${formatPrice(item.total)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
    
            <div class="totals">
              <div>
                <span>Sous-total:</span>
                <span>${currencySymbol} ${formatPrice(invoice.subtotal)}</span>
              </div>
              <div>
                <span>Taxe (${invoice.taxRate}%):</span>
                <span>${currencySymbol} ${formatPrice(invoice.taxAmount)}</span>
              </div>
              <div class="total-final">
                <span>Total:</span>
                <span>${currencySymbol} ${formatPrice(invoice.total)}</span>
              </div>
            </div>
    
            ${invoice.notes ? `
              <div class="notes">
                <h4>Notes:</h4>
                <p>${invoice.notes}</p>
              </div>
            ` : ''}
    
            <div class="footer no-print" style="margin-top: 40px; text-align: center; font-size: 12px; color: #777;">
              <p>Merci pour votre confiance - TourOp Madagascar</p>
            </div>
          </body>
        </html>
      `;

    return content;
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    try {
      const content = generateInvoiceDocument(invoice);

      const printWindow = window.open('', '_blank', 'width=900,height=650');

      if (!printWindow) {
        throw new Error("La fenêtre d'impression n'a pas pu être ouverte. Vérifiez vos bloqueurs de pop-up.");
      }

      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();

      // Fallback pour l'impression si onload ne fonctionne pas
      const fallbackPrint = setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.print();
        }
      }, 1000);

      printWindow.onload = () => {
        clearTimeout(fallbackPrint);
        printWindow.print();
      };

    } catch (error) {
      console.error("Erreur lors de l'impression:", error);
      alert("Une erreur est survenue lors de la préparation de l'impression.");
    }
  };

  // const handlePrintInvoice = (invoice: Invoice) => { // Renamed parameter from `selectedInvoice` to `invoice`
  //   try {
  //     const content = generateInvoiceDocument(invoice);

  //     const printWindow = window.open('', '_blank', 'width=900,height=650');

  //     if (!printWindow) {
  //       throw new Error("La fenêtre d'impression n'a pas pu être ouverte. Vérifiez vos bloqueurs de pop-up.");
  //     }

  //     printWindow.document.open();
  //     printWindow.document.write(content);
  //     printWindow.document.close();

  //     // Attendre que le contenu soit chargé avant d'imprimer
  //     printWindow.onload = () => {
  //       setTimeout(() => {
  //         printWindow.print();
  //         // printWindow.close(); // Optionnel - fermer après impression
  //       }, 500);
  //     };

  //   } catch (error) {
  //     console.error("Erreur lors de l'impression:", error);
  //     alert("Une erreur est survenue lors de la préparation de l'impression.");
  //   }
  // };

  return (

    <>


      <div className="space-y-6">
        <div className="flex justify-end gap-2 no-print">
          <Button onClick={() => handlePrintInvoice(invoice)}>
            Imprimer la facture
          </Button>
        </div>

        <div 
      
      className="travel-plan-content flex-1 overflow-y-auto pr-4 border rounded-lg"
      style={{ 
        maxHeight: 'calc(100vh - 200px)',
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable'
      }}
    >

        <DialogHeader className="mb-3">
          <DialogTitle className="mb-2">
            Facture {invoice.number} <br />
          </DialogTitle>
          <DialogDescription >
            stauts {invoice.paymentStatus} <br />
            Date : {format(new Date(invoice.date_created), "dd/MM/yyyy", { locale: fr })}  <br />
            Détails de la facture pour {invoice.clientName} <br />
            le {format(new Date(invoice.travelStartDate), "dd/MM/yyyy", { locale: fr })} à {format(new Date(invoice.travelEndDate), "dd/MM/yyyy", { locale: fr })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">TourOp Madagascar</h3>
              <p className="text-sm text-muted-foreground">
                123 Avenue des Baobabs
                <br />
                101 Antananarivo, Madagascar
                <br />
                +261 20 12 345 67
              </p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Facturé à:</h3>
              <p className="text-sm">
                {invoice.clientName}
                <br />
                {invoice.clientEmail}
                {invoice.clientAddress && (
                  <>
                    <br />
                    {invoice.clientAddress}
                  </>
                )}
              </p>
            </div>
          </div>

          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {currencySymbol} {formatPrice(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {currencySymbol} {formatPrice(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Sous-total:</span>
              <span>{currencySymbol} {formatPrice(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxe ({invoice.taxRate}%):</span>
              <span>{currencySymbol} {formatPrice(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{currencySymbol} {formatPrice(invoice.total)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div>
              <h4 className="font-medium mb-2">{invoice.notes}</h4>
            </div>
          )}
        </div>
      </div>
      </div>

    </>
  );
};