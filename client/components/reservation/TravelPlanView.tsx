// components/reservation/TravelPlanView.tsx
import { useRef } from "react";
import { Printer, Download, Plane, Building, Car, MapPin, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { toast } from "sonner";

interface TravelPlan {
  factureId: string;
  clientName: string;
  date_debut: string;
  date_fin?: string;
  nbPersonne: string;
  vols?: {
    airline: string;
    departure: string;
    arrival: string;
    passengers: number;
  }[];
  hebergements?: {
    name: string;
    location: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    capacity: number;
  }[];
  voitures?: {
    brand: string;
    model: string;
    pickupLocation: string;
    dropoffLocation: string;
    startDate: Date;
    endDate: Date;
    vehicleType: string;
    price: number;
  }[];
  activites?: {
    name: string;
    category: string;
    date: Date;
    participants: number;
    duration: string;
  }[];
}

export const TravelPlanView = ({ plan }: { plan: TravelPlan }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const generateTravelPlanDocument = (plan: TravelPlan) => {
    const content = `
      <html>
        <head>
          <title>Plan de voyage - Réservation ${plan.factureId}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6;
              padding: 20px;
              color: #333;
            }
            h1, h2, h3 { 
              color: #2c7a3e;
              margin-top: 20px;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 20px; 
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              padding: 16px 0;
              border-top: 1px solid #eee;
              border-bottom: 1px solid #eee;
            }
            .info-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 4px;
            }
            .info-value {
              font-weight: 500;
            }
            .item-card {
              padding: 16px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background-color: #f9f9f9;
              margin-bottom: 12px;
            }
            .item-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
            }
            .item-icon {
              width: 20px;
              height: 20px;
            }
            .item-details {
              margin-left: 28px;
            }
            .text-muted {
              font-size: 14px;
              color: #666;
            }
            .blue { color: #3b82f6; }
            .green { color: #10b981; }
            .orange { color: #f97316; }
            .purple { color: #8b5cf6; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Plan de voyage - Réservation ${plan.factureId}</h1>
              <p>Itinéraire détaillé pour ${plan.clientName}</p>
            </div>
          </div>
          
          <div class="info-grid">
            <div>
              <p class="info-label">Période</p>
              <p class="info-value">
                ${new Date(plan.date_debut).toLocaleDateString("fr-FR")}
                ${plan.date_fin ? ` - ${new Date(plan.date_fin).toLocaleDateString("fr-FR")}` : ''}
              </p>
            </div>
            <div>
              <p class="info-label">Client</p>
              <p class="info-value">${plan.clientName}</p>
            </div>
            <div>
              <p class="info-label">Participants</p>
              <p class="info-value">${plan.nbPersonne} personne(s)</p>
            </div>
          </div>
  
          <div class="content-section">
            <h2>Itinéraire</h2>
            
            ${plan.vols?.map((vol, index) => `
              <div class="item-card">
                <div class="item-header">
                  <svg class="item-icon blue" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span class="font-medium">Vol ${index + 1}: ${vol.airline}</span>
                </div>
                <div class="item-details">
                  <p>${vol.departure} ⇆ ${vol.arrival}</p>
                  <p class="text-muted">
                    ${vol.passengers} passager(s)
                  </p>
                </div>
              </div>
            `).join('')}
  
            ${plan.hebergements?.map((hebergement, index) => `
              <div class="item-card">
                <div class="item-header">
                  <svg class="item-icon green" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span class="font-medium">Hébergement ${index + 1}: ${hebergement.name}</span>
                </div>
                <div class="item-details">
                  <p>
                    ${new Date(hebergement.checkIn).toLocaleDateString("fr-FR")} → ${new Date(hebergement.checkOut).toLocaleDateString("fr-FR")}
                  </p>
                  <p class="text-muted">
                    ${hebergement.location} • Capacité: ${hebergement.capacity} personne(s)
                  </p>
                </div>
              </div>
            `).join('')}
  
            ${plan.voitures?.map((voiture, index) => `
              <div class="item-card">
                <div class="item-header">
                  <svg class="item-icon orange" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span class="font-medium">
                    Voiture ${index + 1}: ${voiture.brand} ${voiture.model}
                  </span>
                </div>
                <div class="item-details">
                  <p>
                    ${new Date(voiture.startDate).toLocaleDateString("fr-FR")} → ${new Date(voiture.endDate).toLocaleDateString("fr-FR")}
                  </p>
                  <p class="text-muted">
                    ${voiture.vehicleType} • ${voiture.pickupLocation} ⇆ ${voiture.dropoffLocation}
                  </p>
                </div>
              </div>
            `).join('')}
  
            ${plan.activites?.map((activite, index) => `
              <div class="item-card">
                <div class="item-header">
                  <svg class="item-icon purple" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="font-medium">
                    Activité ${index + 1}: ${activite.name}
                  </span>
                </div>
                <div class="item-details">
                  <p>
                    ${new Date(activite.date).toLocaleDateString("fr-FR")}
                  </p>
                  <p class="text-muted">
                    Catégorie: ${activite.category} • ${activite.participants} participant(s)
                  </p>
                  <p class="text-muted">
                    Durée: ${activite.duration} heure(s)
                  </p>
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
  
    return content;
  };

 

  function handlePrintPlan(plan: TravelPlan): void {
    // Générer le contenu HTML
    const content = generateTravelPlanDocument(plan);
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      console.error("Impossible d'ouvrir la fenêtre d'impression");
      return;
    }
  
    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // printWindow.close(); // Optionnel - fermer après impression
      }, 500);
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 no-print">
        <Button onClick={() => handlePrintPlan(plan)} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
        
      </div>

      <div ref={printRef} 
      className="travel-plan-content flex-1 overflow-y-auto pr-4"
      style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <DialogHeader className="no-print">
          <DialogTitle>Plan de voyage - Réservation {plan.factureId}</DialogTitle>
          <DialogDescription>
            Itinéraire détaillé pour {plan.clientName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4 border-y">
          <div>
            <p className="text-sm text-muted-foreground">Période</p>
            <p className="font-medium">
              {new Date(plan.date_debut).toLocaleDateString("fr-FR")}
              {plan.date_fin && ` - ${new Date(plan.date_fin).toLocaleDateString("fr-FR")}`}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-medium">{plan.clientName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Participants</p>
            <p className="font-medium">{plan.nbPersonne} personne(s)</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Itinéraire</h3>
          
          {plan.vols?.map((vol, index) => (
            <div key={`vol-${index}`} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Vol {index + 1}: {vol.airline}</span>
              </div>
              <div className="mt-2 ml-7">
                <p>{vol.departure} ⇆ {vol.arrival}</p>
                <p className="text-sm text-muted-foreground">
                  {vol.passengers} passager(s)
                </p>
              </div>
            </div>
          ))}

          {plan.hebergements?.map((hebergement, index) => (
            <div key={`hebergement-${index}`} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-green-500" />
                <span className="font-medium">Hébergement {index + 1}: {hebergement.name}</span>
              </div>
              <div className="mt-2 ml-7">
                <p>
                  {new Date(hebergement.checkIn).toLocaleDateString("fr-FR")} → {new Date(hebergement.checkOut).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hebergement.location} • Capacité: {hebergement.capacity} personne(s)
                </p>
              </div>
            </div>
          ))}

          {plan.voitures?.map((voiture, index) => (
            <div key={`voiture-${index}`} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-orange-500" />
                <span className="font-medium">
                  Voiture {index + 1}: {voiture.brand} {voiture.model}
                </span>
              </div>
              <div className="mt-2 ml-7">
                <p>
                  {new Date(voiture.startDate).toLocaleDateString("fr-FR")} →{" "}
                  {new Date(voiture.endDate).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {voiture.vehicleType} • {voiture.pickupLocation} ⇆ {voiture.dropoffLocation}
                </p>
              </div>
            </div>
          ))}

          {plan.activites?.map((activite, index) => (
            <div key={`activite-${index}`} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-500" />
                <span className="font-medium">
                  Activité {index + 1}: {activite.name}
                </span>
              </div>
              <div className="mt-2 ml-7">
                <p>
                  <Calendar className="inline w-4 h-4 mr-1 text-muted-foreground" />
                  {new Date(activite.date).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Catégorie: {activite.category} • {activite.participants} participant(s)
                </p>
                <p className="text-sm text-muted-foreground">
                  Durée: {activite.duration} heure(s)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};