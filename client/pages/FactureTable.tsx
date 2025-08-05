import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoreHorizontal, Eye, Printer, Download, CheckCircle, Trash2, Send, Search, Star, Compass, Route } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { factureService } from '@/services/factureService';
import { Invoice } from '@shared/types';

// Définir les couleurs et labels
const statusColors = {
  'confirmé': 'bg-green-100 text-green-800',
  'annulé': 'bg-red-100 text-red-800',
  'en attente': 'bg-yellow-100 text-yellow-800',
};

const statusLabels = {
  'confirmé': 'Confirmé',
  'annulé': 'Annulé',
  'en attente': 'En attente',
};

export function FactureTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await factureService.getFactures();
        if (response.success && response.data) {
          setInvoices(response.data);
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

  // 🎯 Statistiques
  const stats = useMemo(() => {
    const total = invoices.length;
    const confirmed = invoices.filter(i => i.status === 'confirmé').length;
    const cancelled = invoices.filter(i => i.status === 'annulé').length;
    const totalRevenue = invoices.reduce((sum, i) => sum + parseFloat(i.totalPrice), 0);
    return {
      total,
      confirmed,
      cancelled,
      totalRevenue,
    };
  }, [invoices]);

  // 🔍 Recherche et filtre
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.idFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.clientId?.destinations || []).some((d) =>
          d.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus =
        filterStatus === 'all' || invoice.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, filterStatus]);

  // 🧾 Actions
  const handleView = (invoice: Invoice) => console.log('Voir', invoice);
  const handlePrint = (invoice: Invoice) => console.log('Imprimer', invoice);
  const handleDownload = (invoice: Invoice) => console.log('Télécharger', invoice);
  const handleSend = (id: string) => console.log('Envoyer', id);
  const handleMarkAsPaid = (id: string) => console.log('Payée', id);
  const handleDelete = (id: string) => console.log('Supprimer', id);

  if (error) {
    return <div className="text-red-600 p-4">Erreur : {error}</div>;
  }

  return (
    <>
      {/* 📊 Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Factures</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Route className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmées</p>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Annulées</p>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">
                  {stats.totalRevenue.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'MGA',
                  })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔍 Barre de recherche + filtre */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro, client, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="confirmé">Confirmé</SelectItem>
            <SelectItem value="en attente">En attente</SelectItem>
            <SelectItem value="annulé">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 📄 Table des factures */}
      <Card className="border-0 shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Destinations</TableHead>
              <TableHead>Création</TableHead>
              <TableHead>Départ</TableHead>
              <TableHead>Retour</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9}>Chargement...</TableCell></TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-4 text-muted-foreground">Aucune facture trouvée.</TableCell></TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.idFacture}>
                  <TableCell>{invoice.idFacture}</TableCell>
                  <TableCell>{invoice.clientId?.name || 'N/A'}</TableCell>
                  <TableCell>{invoice.clientId?.destinations?.join(', ') || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(invoice.dateCreated), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                  <TableCell>{format(new Date(invoice.dateTravel), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                  <TableCell>{format(new Date(invoice.dateReturn), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                  <TableCell>
                    {parseFloat(invoice.totalPrice).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'MGA',
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
                        <DropdownMenuItem onClick={() => handleView(invoice)}><Eye className="h-4 w-4 mr-2" /> Voir</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrint(invoice)}><Printer className="h-4 w-4 mr-2" /> Imprimer</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(invoice)}><Download className="h-4 w-4 mr-2" /> Télécharger</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSend(invoice.idFacture)}><Send className="h-4 w-4 mr-2" /> Envoyer</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.idFacture)}><CheckCircle className="h-4 w-4 mr-2" /> Marquer Payée</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(invoice.idFacture)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
