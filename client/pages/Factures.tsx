import React, { useState } from "react";
import { useInvoices } from "../hooks/useInvoices";
import type { Invoice } from "../hooks/useInvoices";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  FileText,
  Euro,
  Calendar,
  AlertTriangle,
  Download,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "../lib/utils";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

const statusLabels: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

const statusColors: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-muted text-muted-foreground",
};

export const Factures: React.FC = () => {
  const {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid,
    sendInvoice,
    getInvoiceStats,
    filterInvoices,
  } = useInvoices();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">(
    "all",
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredInvoices = filterInvoices(searchTerm, filterStatus);
  const stats = getInvoiceStats();

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (invoiceId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      await deleteInvoice(invoiceId);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    await markAsPaid(invoiceId);
  };

  const handleSendInvoice = async (invoiceId: string) => {
    await sendInvoice(invoiceId);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // Simuler l'impression
    alert(`Impression de la facture ${invoice.number}`);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simuler le téléchargement
    alert(`Téléchargement de la facture ${invoice.number}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Factures</h1>
          <p className="text-muted-foreground">
            Gérez et suivez toutes vos factures
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Facture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <InvoiceForm
              onSubmit={async (data) => {
                await createInvoice(data);
                setIsCreateDialogOpen(false);
              }}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Factures
                </p>
                <p className="text-2xl font-bold">{stats.totalInvoices}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Montant Total
                </p>
                <p className="text-2xl font-bold">
                  €{stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Montant Payé
                </p>
                <p className="text-2xl font-bold">
                  €{stats.paidAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  En Retard
                </p>
                <p className="text-2xl font-bold">{stats.overdueCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro, client ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(value) =>
            setFilterStatus(value as InvoiceStatus | "all")
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="sent">Envoyée</SelectItem>
            <SelectItem value="paid">Payée</SelectItem>
            <SelectItem value="overdue">En retard</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card className="border-0 shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date d'émission</TableHead>
              <TableHead>Date d'échéance</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              : filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.clientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.clientEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.issueDate), "dd/MM/yyyy", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "font-medium",
                          invoice.status === "overdue" && "text-red-600",
                        )}
                      >
                        {format(new Date(invoice.dueDate), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      €{invoice.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]}>
                        {statusLabels[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleView(invoice)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePrintInvoice(invoice)}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {invoice.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() => handleSendInvoice(invoice.id)}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Envoyer
                            </DropdownMenuItem>
                          )}
                          {["sent", "overdue"].includes(invoice.status) && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marquer comme payée
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(invoice.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInvoice
                ? `Facture ${selectedInvoice.number}`
                : "Détails de la facture"}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && <InvoiceView invoice={selectedInvoice} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface InvoiceFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    clientEmail: "",
    dueDate: "",
    taxRate: 20,
    currency: "EUR",
    notes: "",
    items: [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      clientId: formData.clientId,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      dueDate: new Date(formData.dueDate),
      taxRate: formData.taxRate,
      currency: formData.currency,
      notes: formData.notes || undefined,
      items: formData.items.filter((item) => item.description.trim()),
    };

    await onSubmit(submitData);
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Nouvelle Facture</DialogTitle>
        <DialogDescription>
          Créez une nouvelle facture pour un client
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nom du client</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, clientName: e.target.value }))
              }
              placeholder="Nom du client"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email du client</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  clientEmail: e.target.value,
                }))
              }
              placeholder="email@exemple.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Devise</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, currency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="Ar">Ariary (Ar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Taux de taxe (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              value={formData.taxRate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  taxRate: parseInt(e.target.value),
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Articles</Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un article
            </Button>
          </div>
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 items-end border rounded-lg p-3"
            >
              <div className="col-span-5 space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  placeholder="Description de l'article"
                  required
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", parseInt(e.target.value))
                  }
                  required
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Prix unitaire</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateItem(index, "unitPrice", parseFloat(e.target.value))
                  }
                  required
                />
              </div>
              <div className="col-span-1 space-y-1">
                <Label className="text-xs">Total</Label>
                <p className="text-sm font-medium">
                  €{(item.quantity * item.unitPrice).toFixed(2)}
                </p>
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Notes sur la facture..."
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Création..." : "Créer la facture"}
          </Button>
        </div>
      </form>
    </>
  );
};

interface InvoiceViewProps {
  invoice: Invoice;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Facture {invoice.number}</DialogTitle>
        <DialogDescription>
          Détails de la facture pour {invoice.clientName}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        {/* Invoice Header */}
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

        {/* Invoice Details */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y">
          <div>
            <p className="text-sm text-muted-foreground">Date d'émission</p>
            <p className="font-medium">
              {format(new Date(invoice.issueDate), "dd/MM/yyyy", {
                locale: fr,
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date d'échéance</p>
            <p className="font-medium">
              {format(new Date(invoice.dueDate), "dd/MM/yyyy", { locale: fr })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Statut</p>
            <Badge className={statusColors[invoice.status]}>
              {statusLabels[invoice.status]}
            </Badge>
          </div>
        </div>

        {/* Items */}
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
                    €{item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    €{item.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="space-y-2 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Sous-total:</span>
            <span>€{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxe ({invoice.taxRate}%):</span>
            <span>€{invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>€{invoice.total.toFixed(2)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div>
            <h4 className="font-medium mb-2">Notes:</h4>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Factures;
