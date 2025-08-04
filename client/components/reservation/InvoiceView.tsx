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
    items: InvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes?: string;
    travelStartDate: string;  
    travelEndDate?: string;  
    date_created : string; 
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
  
  export const InvoiceView: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
    const currencySymbol = invoice.currency === 'MGA' ? 'Ar' : invoice.currency === 'EUR' ? '€' : '$';
    console.log("data facture", invoice);
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    };
  
    return (
      
      <>
        <DialogHeader className="mb-3">
          <DialogTitle className="mb-2"> 
            Facture {invoice.number} <br /> 
          </DialogTitle>
          <DialogDescription >
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
      </>
    );
  };