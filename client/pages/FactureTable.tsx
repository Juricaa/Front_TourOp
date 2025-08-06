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
import { Client, Invoice, SingleReservation, TravelPlan } from '@shared/types';
import { API_BASE_URL } from '@/services/apiConfig';
import { TravelPlanView } from '@/components/reservation/TravelPlanView';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "../components/ui/dialog";
import { toast } from '@/hooks/use-toast';
// Définir les couleurs et labels
const statusColors = {
    'confirmé': 'bg-green-100 text-green-800',
    'annulé': 'bg-red-100 text-red-800',
    'en attente': 'bg-yellow-100 text-yellow-800',
    'en_cours': 'bg-blue-100 text-blue-800',

};

const statusLabels = {
    'confirmé': 'Confirmé',
    'annulé': 'Annulé',
    'en_cours': 'En cours',
    'en_attente': 'En attente',
};

export function FactureTable() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('confirmé');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reservation, setReservation] = useState<SingleReservation | null>(null);
    const [isTravelPlanOpen, setIsTravelPlanOpen] = useState(false);
    const [client, setClient] = useState<Client | null>(null);
    const [factureId, setFactureId] = useState<string | null>(null);

    useEffect(() => {

        fetchInvoices();

    }, []);


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
    const fetchReservation = async (reservationId: string, date_debut: Date, date_fin: Date) => {
        try {
            const url = new URL(`${API_BASE_URL}/reservations/client/${reservationId}/`);
            if (date_debut) url.searchParams.append('date_debut', date_debut);
            if (date_fin) url.searchParams.append('date_fin', date_fin);

            const response = await fetch(url.toString());
            const data = await response.json();
            if (response.ok && data.success) {
                console.log("donnée vierge:", data.data)
                const aggregatedReservation = transformBackendDataToReservation(data.data);
                setReservation(aggregatedReservation);
                console.log("data traité:", aggregatedReservation)
                if (reservationId) {
                    fetchClient(reservationId);
                }
            } else {
                setError("Réservation non trouvée");
            }
        } catch (error) {
            console.log("error", error)
            console.error("Error fetching reservation:", error);
            setError("Erreur lors du chargement de la réservation");
        } finally {
            setLoading(false);
        }
    };



    const transformBackendDataToReservation = (backendData: any[]): SingleReservation => {

        const aggregatedReservation: SingleReservation = {
            id: "AGG_" + Date.now().toString(),
            clientId: "",
            status: "",
            totalPrice: 0,
            currency: "",
            dateCreated: new Date(),
            dateTravel: new Date(8640000000000000),
            dateReturn: new Date(-8640000000000000),
            notes: "",
            hebergements: [],
            voitures: [],
            activites: [],
            vols: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        backendData.forEach(item => {
            const price = parseFloat(item.montant);
            const startDate = new Date(item.date_debut);
            const endDate = item.date_fin ? new Date(item.date_fin) : startDate;

            if (startDate < aggregatedReservation.dateTravel) {
                aggregatedReservation.dateTravel = startDate;
            }
            if (endDate > aggregatedReservation.dateReturn) {
                aggregatedReservation.dateReturn = endDate;
            }

            aggregatedReservation.totalPrice += price;

            switch (item.item.type) {
                case "hebergement":
                    aggregatedReservation.hebergements.push({
                        id: item.item.id,
                        checkIn: startDate,
                        checkOut: endDate,
                        rooms: 1,
                        guests: item.quantite,
                        price: price,
                        name: item.item.name,
                        location: item.item.location,
                        capacity: item.item.capacity
                    });
                    break;

                case "voiture":
                    aggregatedReservation.voitures.push({
                        id: item.item.id,
                        startDate: startDate,
                        endDate: endDate,
                        pickupLocation: item.lieu_depart || "Non spécifié",
                        dropoffLocation: item.lieu_arrivee || "Non spécifié",
                        price: price,
                        brand: item.item.brand,
                        model: item.item.model,
                        pricePerDay: parseFloat(item.item.pricePerDay),
                        vehicleType: item.item.vehicleType
                    });
                    break;

                case "activite":
                    aggregatedReservation.activites.push({
                        id: item.item.id,
                        date: startDate,
                        participants: item.quantite,
                        price: price,
                        name: item.item.name,
                        category: item.item.category,
                        priceAdult: parseFloat(item.item.priceAdult),
                        duration: item.item.duration
                    });
                    break;

                case "vol":
                    aggregatedReservation.vols.push({
                        id: item.item.id,
                        passengers: item.quantite,
                        price: price,
                        airline: item.item.airline,
                        flightNumber: item.item.flightNumber,
                        departure: item.lieu_depart,
                        arrival: item.lieu_arrivee,
                        date_debut : item.date_debut,
                        date_fin : item.date_fin,
                        
                    });
                    break;
            }
        });

        return aggregatedReservation;
    };


    const fetchClient = async (clientId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/clients/${clientId}`);
            const data = await response.json();
            if (data.success) {
                setClient(data.data);
            }
        } catch (error) {
            console.error("Error fetching client:", error);
        }
    };



    const getTravelPlanData = (): TravelPlan | null => {
        if (!reservation || !client) {
            console.error("Données manquantes - Client:", client, "Reservation:", reservation);
            return null;
        }

        return {
            factureId: factureId,
            clientName: client.name,
            nbPersonne: client.nbpersonnes,
            date_debut: reservation.dateTravel,
            date_fin: reservation.dateReturn,
            vols: reservation.vols?.map(vol => ({
                airline: vol.airline,
                departure: vol.departure,
                arrival: vol.arrival,
                passengers: vol.passengers,
                date_debut : vol.date_debut,
                date_fin : vol.date_fin,
            })),
            hebergements: reservation.hebergements?.map(heb => ({
                name: heb.name,
                location: heb.location,
                checkIn: heb.checkIn,
                checkOut: heb.checkOut,
                guests: heb.guests,
                capacity: heb.capacity
            })),
            voitures: reservation.voitures?.map(voiture => ({
                brand: voiture.brand,
                model: voiture.model,
                pickupLocation: voiture.pickupLocation,
                dropoffLocation: voiture.dropoffLocation,
                startDate: voiture.startDate,
                endDate: voiture.endDate,
                vehicleType: voiture.vehicleType,
            })),
            activites: reservation.activites?.map(act => ({
                name: act.name,
                date: act.date,
                participants: act.participants,
                duration: act.duration,
                
            }))
        };
    };

    const handleView = (invoice: Invoice) => {
       fetchReservation(invoice.clientId.idClient, invoice.dateTravel, invoice.dateReturn);
        setFactureId(invoice.idFacture);
        setIsTravelPlanOpen(true)

    }



    const handlePrint = (invoice: Invoice) => console.log('Imprimer', invoice);
    const handleDownload = (invoice: Invoice) => console.log('Télécharger', invoice);
    const handleSend = (id: string) => console.log('Envoyer', id);

    const handleActive = async (id: string, idclient: string ) => {
        console.log('Payée', id)
        try {
                
            const updatedData = {
              clientId: idclient,
              status: "en_cours",
            };
      
            const response = await factureService.updateFacture(id, updatedData);
            fetchInvoices();
      
            toast({
              title: "Succès",
              description: `Statut mis à jour: ${status}`,
            });
          } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            toast({
              title: "Erreur",
              description: `Impossible de mettre à jour le statut: ${error instanceof Error ? error.message : "Erreur inconnue"
                }`,
              variant: "destructive",
            });
          }
    };
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
                        <SelectItem value="confirmé">Confirmé</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="en attente">En attente</SelectItem>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                                                
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
                                                <DropdownMenuItem onClick={() => handleView(invoice)}><Eye className="h-4 w-4 mr-2" />
                                                    Voir
                                                </DropdownMenuItem>
                                                
                                                {/* <DropdownMenuItem onClick={() => handleDownload(invoice)}><Download className="h-4 w-4 mr-2" /> Télécharger</DropdownMenuItem> */}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleSend(invoice.idFacture)}><Send className="h-4 w-4 mr-2" /> Envoyer</DropdownMenuItem>
                                                {invoice.status === "confirmé"  && (
                                                    <DropdownMenuItem onClick={() => handleActive(invoice.idFacture , invoice.clientId.idClient)}><CheckCircle className="h-4 w-4 mr-2" /> Activer</DropdownMenuItem>
                                                  )

                                                }
                                                <DropdownMenuSeparator />
                                                {(invoice.status === "en_attente" || invoice.status === "confirmé") && (
                                                    
                                                    <DropdownMenuItem onClick={() => handleDelete(invoice.idFacture)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isTravelPlanOpen} onOpenChange={setIsTravelPlanOpen}>
                <DialogContent className="max-w-4xl">
                    <div>
                        {getTravelPlanData() && <TravelPlanView plan={getTravelPlanData()!} />}
                    </div>

                </DialogContent>
            </Dialog>

        </>
    );
}
