import React, { useState } from "react";
import { useTravelPlans } from "../hooks/useTravelPlans";
import type { TravelPlan } from "../hooks/useTravelPlans";
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
  Route,
  MapPin,
  Calendar,
  Users,
  Clock,
  Download,
  Printer,
  Star,
  Compass,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "../lib/utils";
import html2pdf from 'html2pdf.js';
import { FactureTable } from "./FactureTable";

type TravelPlanStatus =
  | "draft"
  | "proposal"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

const statusLabels: Record<TravelPlanStatus, string> = {
  draft: "Brouillon",
  proposal: "Proposition",
  confirmed: "Confirmé",
  active: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

const statusColors: Record<TravelPlanStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  proposal: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  active: "bg-orange-100 text-orange-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

const difficultyLabels = {
  easy: "Facile",
  moderate: "Modéré",
  challenging: "Difficile",
};

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  challenging: "bg-red-100 text-red-800",
};

const travelStyleLabels = {
  budget: "Économique",
  comfort: "Confort",
  luxury: "Luxe",
  adventure: "Aventure",
  cultural: "Culturel",
};

export const PlansVoyage: React.FC = () => {
  const {
    travelPlans,
    loading,
    createTravelPlan,
    updateTravelPlan,
    deleteTravelPlan,
    getTravelPlanStats,
    filterTravelPlans,
  } = useTravelPlans();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TravelPlanStatus | "all">(
    "all",
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredPlans = filterTravelPlans(searchTerm, filterStatus);
  const stats = getTravelPlanStats();

  const handleView = (plan: TravelPlan) => {
    setSelectedPlan(plan);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce plan de voyage ?")) {
      await deleteTravelPlan(planId);
    }
  };

  const handleUpdateStatus = async (
    planId: string,
    status: TravelPlanStatus,
  ) => {
    await updateTravelPlan(planId, { status });
  };

  const handlePrintPlan = (plan: TravelPlan) => {
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
  
    // Générer le contenu HTML
    const content = generateTravelPlanDocument(plan);
  
    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.write(content);
    printWindow.document.close();
  
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Optionnel : fermer la fenêtre après impression
        // printWindow.close();
      }, 500);
    };
  };

  

  // const handleDownloadPlan = (plan: TravelPlan) => {
  //   alert(`Téléchargement du plan ${plan.planNumber}`);
  // };

  const handleSendPlan = (plan: TravelPlan) => {
    alert(`Envoi du plan ${plan.planNumber} à ${plan.clientName}`);
  };

  const generateTravelPlanDocument = (plan: TravelPlan) => {
    // Créer un contenu HTML pour le document
    const content = `
      <html>
        <head>
          <title>${plan.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            h1 { color: #2c7a3e; }
            h2 { color: #2c7a3e; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-block { margin-bottom: 15px; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
            .included { color: green; }
            .excluded { color: red; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${plan.title}</h1>
              <p>Pour: ${plan.clientName}</p>
            </div>
            <div>
              <p>Plan N°: ${plan.planNumber}</p>
              <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
  
          <div class="info-block">
            <h2>Informations générales</h2>
            <p><strong>Destination:</strong> ${plan.destination}</p>
            <p><strong>Dates:</strong> ${format(new Date(plan.startDate), "dd/MM/yyyy", { locale: fr })} au ${format(new Date(plan.endDate), "dd/MM/yyyy", { locale: fr })} (${plan.duration} jours)</p>
            <p><strong>Participants:</strong> ${plan.participants} personnes</p>
            <p><strong>Style:</strong> ${travelStyleLabels[plan.travelStyle as keyof typeof travelStyleLabels]}</p>
            <p><strong>Difficulté:</strong> ${difficultyLabels[plan.difficulty]}</p>
            <p><strong>Prix total:</strong> ${plan.totalPrice.toLocaleString()} ${plan.currency}</p>
            <p><strong>Prix par personne:</strong> ${plan.pricePerPerson.toLocaleString()} ${plan.currency}</p>
          </div>
  
          <div class="info-block">
            <h2>Services inclus</h2>
            <ul>
              ${plan.includes.map(item => `<li class="included">✓ ${item}</li>`).join('')}
            </ul>
  
            <h2>Services non inclus</h2>
            <ul>
              ${plan.excludes.map(item => `<li class="excluded">✗ ${item}</li>`).join('')}
            </ul>
          </div>
  
          <div class="info-block">
            <h2>Programme détaillé</h2>
            ${plan.days.map(day => `
              <div style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3>Jour ${day.day} - ${day.title}</h3>
                <p><em>${day.location} - ${format(new Date(day.date), "dd/MM", { locale: fr })}</em></p>
                <p>${day.description}</p>
                
                <table>
                  <thead>
                    <tr>
                      <th>Heure</th>
                      <th>Activité</th>
                      <th>Description</th>
                      <th>Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${day.activities.map(activity => `
                      <tr>
                        <td>${activity.time}</td>
                        <td>${activity.activity}</td>
                        <td>${activity.description}</td>
                        <td>${activity.duration}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
  
                ${day.accommodation ? `
                  <p><strong>Hébergement:</strong> ${day.accommodation.name} (${day.accommodation.type})</p>
                ` : ''}
  
                <p><strong>Repas inclus:</strong> 
                  ${[
                    day.meals.breakfast ? 'Petit-déjeuner' : '',
                    day.meals.lunch ? 'Déjeuner' : '',
                    day.meals.dinner ? 'Dîner' : ''
                  ].filter(Boolean).join(', ')}
                </p>
  
                ${day.notes ? `<p><strong>Notes:</strong> ${day.notes}</p>` : ''}
              </div>
            `).join('')}
          </div>
  
          ${plan.notes ? `
            <div class="info-block">
              <h2>Notes supplémentaires</h2>
              <p>${plan.notes}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;
  
    return content;
  };


  const handleDownloadPlan = async (plan: TravelPlan) => {
    try {
      // Générer le contenu HTML
      const content = generateTravelPlanDocument(plan);
      
      // Créer un élément div temporaire pour contenir le HTML
      const element = document.createElement('div');
      element.innerHTML = content;
      
      // Options de configuration du PDF
      const opt = {
        margin: 10,
        filename: `Plan_Voyage_${plan.planNumber}_${plan.clientName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
  
      // Générer et télécharger le PDF
      await html2pdf().set(opt).from(element).save();
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Plans de Voyage</h1>
          <p className="text-muted-foreground">
            Créez et gérez tous vos itinéraires de voyage
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <TravelPlanForm
              onSubmit={async (data) => {
                await createTravelPlan(data);
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
                  Total Plans
                </p>
                <p className="text-2xl font-bold">{stats.totalPlans}</p>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Plans Actifs
                </p>
                <p className="text-2xl font-bold">{stats.activePlans}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Compass className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Plans Terminés
                </p>
                <p className="text-2xl font-bold">{stats.completedPlans}</p>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Chiffre d'Affaires
                </p>
                <p className="text-2xl font-bold">
                  €{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Star className="h-6 w-6 text-purple-600" />
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
            placeholder="Rechercher par numéro, client, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(value) =>
            setFilterStatus(value as TravelPlanStatus | "all")
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="proposal">Proposition</SelectItem>
            <SelectItem value="confirmed">Confirmé</SelectItem>
            <SelectItem value="active">En cours</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Travel Plans Table */}
      {/* <Card className="border-0 shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.planNumber}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-40">
                          {plan.title}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{plan.clientName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{plan.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(plan.startDate), "dd/MM/yyyy", {
                            locale: fr,
                          })}
                        </div>
                        <div className="text-muted-foreground">
                          {plan.duration} jour{plan.duration > 1 ? "s" : ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{plan.participants}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className="font-semibold">
                          €{plan.totalPrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          €{plan.pricePerPerson.toLocaleString()}/pers
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={statusColors[plan.status]}>
                          {statusLabels[plan.status]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${difficultyColors[plan.difficulty]}`}
                        >
                          {difficultyLabels[plan.difficulty]}
                        </Badge>
                      </div>
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
                          <DropdownMenuItem onClick={() => handleView(plan)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                         <DropdownMenuItem
  onClick={() => handlePrintPlan(plan)}
  className="font-medium"
>
  <Printer className="h-4 w-4 mr-2" />
  Imprimer
</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownloadPlan(plan)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {plan.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(plan.id, "proposal")
                              }
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Proposer au client
                            </DropdownMenuItem>
                          )}
                          {plan.status === "proposal" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(plan.id, "confirmed")
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmer
                            </DropdownMenuItem>
                          )}
                          {plan.status === "confirmed" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(plan.id, "active")
                              }
                            >
                              <Route className="h-4 w-4 mr-2" />
                              Activer
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(plan.id)}
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
      </Card> */}
       <FactureTable />

      {/* View Travel Plan Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? selectedPlan.title : "Détails du plan de voyage"}
            </DialogTitle>
          </DialogHeader>
          {selectedPlan && <TravelPlanView plan={selectedPlan} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TravelPlanFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const TravelPlanForm: React.FC<TravelPlanFormProps> = ({
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    destination: "",
    startDate: "",
    endDate: "",
    participants: 2,
    travelStyle: "comfort",
    difficulty: "easy",
    pricePerPerson: 0,
    currency: "EUR",
    notes: "",
    includes: ["Hébergement", "Petit-déjeuner", "Transport"],
    excludes: ["Vols internationaux", "Assurance voyage"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const duration = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
    );

    const submitData = {
      title: formData.title,
      clientName: formData.clientName,
      destination: formData.destination,
      startDate: startDate,
      endDate: endDate,
      duration: duration,
      participants: formData.participants,
      travelStyle: formData.travelStyle,
      difficulty: formData.difficulty,
      pricePerPerson: formData.pricePerPerson,
      totalPrice: formData.pricePerPerson * formData.participants,
      currency: formData.currency,
      includes: formData.includes,
      excludes: formData.excludes,
      bestSeason: ["Avril", "Mai", "Septembre", "Octobre"],
      notes: formData.notes,
      days: [], // Sera généré automatiquement
    };

    await onSubmit(submitData);
  };

  const updateIncludesExcludes = (
    type: "includes" | "excludes",
    value: string,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: checked
        ? [...prev[type], value]
        : prev[type].filter((item) => item !== value),
    }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Nouveau Plan de Voyage</DialogTitle>
        <DialogDescription>
          Créez un nouveau plan de voyage personnalisé
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du voyage</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Découverte de Madagascar..."
              required
            />
          </div>
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
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  destination: e.target.value,
                }))
              }
              placeholder="Madagascar"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Date de départ</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Date de retour</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="participants">Participants</Label>
            <Input
              id="participants"
              type="number"
              min="1"
              value={formData.participants}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  participants: parseInt(e.target.value),
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="travelStyle">Style</Label>
            <Select
              value={formData.travelStyle}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, travelStyle: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Économique</SelectItem>
                <SelectItem value="comfort">Confort</SelectItem>
                <SelectItem value="luxury">Luxe</SelectItem>
                <SelectItem value="adventure">Aventure</SelectItem>
                <SelectItem value="cultural">Culturel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulté</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Facile</SelectItem>
                <SelectItem value="moderate">Modéré</SelectItem>
                <SelectItem value="challenging">Difficile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerPerson">Prix/personne</Label>
            <Input
              id="pricePerPerson"
              type="number"
              min="0"
              value={formData.pricePerPerson}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pricePerPerson: parseFloat(e.target.value),
                }))
              }
              placeholder="1200"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes et remarques</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Informations spéciales sur le voyage..."
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Création..." : "Créer le plan"}
          </Button>
        </div>
      </form>
    </>
  );
};

interface TravelPlanViewProps {
  plan: TravelPlan;
}

const TravelPlanView: React.FC<TravelPlanViewProps> = ({ plan }) => {
  const currencySymbols = { EUR: "€", USD: "$", Ar: "Ar" };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{plan.title}</DialogTitle>
        <DialogDescription>
          Plan de voyage détaillé pour {plan.clientName}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        {/* Plan Overview */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-600 text-lg mb-2">
                {plan.destination}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(plan.startDate), "dd/MM/yyyy", {
                    locale: fr,
                  })}{" "}
                  -
                  {format(new Date(plan.endDate), "dd/MM/yyyy", { locale: fr })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {plan.duration} jours
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {plan.participants} personnes
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge className={statusColors[plan.status]}>
                {statusLabels[plan.status]}
              </Badge>
              <Badge
                className={difficultyColors[plan.difficulty]}
                variant="outline"
              >
                {difficultyLabels[plan.difficulty]}
              </Badge>
              <Badge variant="outline">
                {
                  travelStyleLabels[
                    plan.travelStyle as keyof typeof travelStyleLabels
                  ]
                }
              </Badge>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              {currencySymbols[plan.currency as keyof typeof currencySymbols]}
              {plan.totalPrice.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {currencySymbols[plan.currency as keyof typeof currencySymbols]}
              {plan.pricePerPerson.toLocaleString()} par personne
            </div>
          </div>
        </div>

        {/* Services inclus/exclus */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-green-600 text-base">
                Services inclus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {plan.includes.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-red-600 text-base">
                Services non inclus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {plan.excludes.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full border border-red-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Programme jour par jour */}
        <Card>
          <CardHeader>
            <CardTitle>Programme jour par jour </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {plan.days.map((day) => (
                <div key={day.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-green-600">
                        Jour {day.day} -{" "}
                        {format(new Date(day.date), "dd/MM", { locale: fr })}
                      </h4>
                      <h5 className="font-medium">{day.title}</h5>
                      <p className="text-sm text-muted-foreground">
                        {day.description}
                      </p>
                    </div>
                    <Badge variant="outline">{day.location}</Badge>
                  </div>

                  <div className="space-y-2">
                    {day.activities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-2 bg-gray-50 rounded text-sm"
                      >
                        <div className="font-medium text-green-600 min-w-16">
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.activity}</div>
                          <div className="text-muted-foreground">
                            {activity.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Durée: {activity.duration}
                          </div>
                        </div>
                        {activity.included && (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {day.accommodation && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Hébergement:</span>
                        <span>
                          {day.accommodation.name} ({day.accommodation.type})
                        </span>
                      </div>
                    </div>
                  )}

                  {(day.meals.breakfast ||
                    day.meals.lunch ||
                    day.meals.dinner) && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Repas inclus:{" "}
                      {[
                        day.meals.breakfast && "Petit-déjeuner",
                        day.meals.lunch && "Déjeuner",
                        day.meals.dinner && "Dîner",
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}

                  {day.notes && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Note: {day.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Informations complémentaires */}
        {(plan.guide || plan.notes || plan.bestSeason.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Informations complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.guide && (
                <div>
                  <h4 className="font-medium">Guide</h4>
                  <p className="text-sm text-muted-foreground">
                    {plan.guide.name} - {plan.guide.phone}
                    <br />
                    Langues: {plan.guide.languages.join(", ")}
                  </p>
                </div>
              )}

              {plan.bestSeason.length > 0 && (
                <div>
                  <h4 className="font-medium">Meilleure saison</h4>
                  <p className="text-sm text-muted-foreground">
                    {plan.bestSeason.join(", ")}
                  </p>
                </div>
              )}

              {plan.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">{plan.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default PlansVoyage;
