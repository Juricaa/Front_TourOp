import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoreHorizontal, Eye, Printer, Download, CheckCircle, Trash2, Send } from 'lucide-react';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { factureService } from '@/services/factureService';
import { Invoice } from '@shared/types';

const statusColors = {
  confirmé: 'bg-green-100 text-green-800',
  annulé: 'bg-red-100 text-red-800',
  'en attente': 'bg-yellow-100 text-yellow-800',
};

const statusLabels = {
  confirmé: 'Confirmé',
  annulé: 'Annulé',
  'en attente': 'En attente',
};

export function FactureTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await factureService.getFactures();
        if (response.success && response.data) {
          setInvoices(response.data);
          console.log('Factures chargées:', response.data);
        } else {
          setError(response.error || 'Erreur lors du chargement des factures');
        }
      } catch (err) {
        setError('Erreur réseau');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleView = (invoice: Invoice) => {
    console.log('Voir la facture:', invoice);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    console.log('Imprimer la facture:', invoice);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    console.log('Télécharger la facture:', invoice);
  };

  const handleSendInvoice = (id: string) => {
    console.log('Envoyer la facture:', id);
  };

  const handleMarkAsPaid = (id: string) => {
    console.log('Marquer comme payée:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Supprimer la facture:', id);
  };

  if (error) {
    return <div className="text-red-600 p-4">Erreur : {error}</div>;
  }

  return (
    <Card className="border-0 shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Destinations</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Date de voyage</TableHead>
            <TableHead>Date de retour</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 9 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                Aucune facture trouvée.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.idFacture}>
                <TableCell className="font-medium">{invoice.idFacture}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {invoice.clientId?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.clientId?.email || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {invoice.clientId?.nbpersonnes || 0} personnes
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {(invoice.clientId?.destinations || []).join(', ')}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(invoice.dateCreated), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell>
                  {format(new Date(invoice.dateTravel), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell>
                  {format(new Date(invoice.dateReturn), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell className="font-semibold">
                  {parseFloat(invoice.totalPrice).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'MGA',
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[invoice.status]}>
                    {statusLabels[invoice.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleView(invoice)}>
                        <Eye className="w-4 h-4 mr-2" /> Voir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrintInvoice(invoice)}>
                        <Printer className="w-4 h-4 mr-2" /> Imprimer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                        <Download className="w-4 h-4 mr-2" /> Télécharger
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSendInvoice(invoice.idFacture)}>
                        <Send className="w-4 h-4 mr-2" /> Envoyer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.idFacture)}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Marquer payée
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(invoice.idFacture)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
