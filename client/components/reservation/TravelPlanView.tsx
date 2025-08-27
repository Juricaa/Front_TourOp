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
    date_debut: Date;
    date_fin: Date;
    class: string;
  }[];
  hebergements?: {
    name: string;
    location: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    capacity: number;
    phone: string;
    form: string;
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
    driverIncluded: boolean,
    driverName:string,
    driverPhone:number
  }[];
  activites?: {
    name: string;
    category: string;
    date: Date;
    participants: number;
    duration: string;
    guideRequired: boolean,
    guideName: string,
    guidePhone: number
  }[];
}

export const TravelPlanView = ({ plan }: { plan: TravelPlan }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const generateTravelPlanDocument = (plan: TravelPlan) => {
    const content = `
      <html>
        <head>
          <title>Plan de voyage - ${plan.factureId}</title>
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
            .item-section {
              margin-bottom: 30px;
            }
            .item-card {
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 1px dashed #ccc;
            }
            .item-title {
              font-size: 18px;
              font-weight: 600;
              color: #2c7a3e;
              margin-bottom: 5px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .item-content {
              margin-left: 28px;
              margin-top: 8px;
            }
            .route {
              font-size: 16px;
              margin: 8px 0;
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .details {
              font-size: 14px;
              color: #666;
              margin-top: 5px;
            }
            .divider {
              height: 1px;
              background-color: #eee;
              margin: 15px 0;
            }
            .icon {
              width: 20px;
              height: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Plan de Voyage - Réservation ${plan.factureId}</h1>
            <p>Itinéraire pour ${plan.clientName}</p>

 <p class="info-value"> Période 
                ${new Date(plan.date_debut).toLocaleDateString("fr-FR")}
                ${plan.date_fin ? ` - ${new Date(plan.date_fin).toLocaleDateString("fr-FR")}` : ''}
              </p>            </div>
  
          <div class="item-section">
  <h2>✈️ Vols</h2>
  ${plan.vols?.map((vol, index) => `
    <div class="item-card">
      <div class="item-title">
        ${index + 1}. ${vol.airline} (${vol.class})
      </div>
      <div class="item-content">
        <div class="route">
          🛫 ${vol.departure} 
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          🛬 ${vol.arrival}
        </div>
        <div class="details">
          👥 ${vol.passengers} passager(s)
        </div>
        <div class="details">
          📅 Départ : ${new Date(vol.date_debut).toLocaleDateString("fr-FR")}  
          • Retour : ${new Date(vol.date_fin).toLocaleDateString("fr-FR")}
        </div>
      </div>
    </div>
  `).join('')}
</div>

  
          <div class="item-section">
  <h2>🏡 Hébergements</h2>
  ${plan.hebergements?.map((hebergement, index) => `
    <div class="item-card">
      <div class="item-title">
        ${index + 1}. ${hebergement.name} (${hebergement.form})
      </div>
      <div class="item-content">
        <div class="route">
          🛎️ Check-in : ${new Date(hebergement.checkIn).toLocaleDateString("fr-FR")} 
          → 🏁 Check-out : ${new Date(hebergement.checkOut).toLocaleDateString("fr-FR")}
        </div>
        <div class="details">
          📍 ${hebergement.location} 
        </div>
        <div class="details">
          📞 ${hebergement.phone}
        </div>
        <div class="details">
          🛏️ Capacité : ${hebergement.capacity} personne(s)
        </div>
      </div>
    </div>
  `).join('')}
</div>

  
          ${plan.voitures?.length > 0 ? `
            <div class="item-section">
              <h2>🚐 Locations de voiture</h2>
              ${plan.voitures?.map((voiture, index) => `
                <div class="item-card">
                  <div class="item-title">
                    ${index + 1}. ${voiture.brand} ${voiture.model}
                  </div>
                  <div class="item-content">
                    <div class="route">
                      ${new Date(voiture.startDate).toLocaleDateString("fr-FR")} → ${new Date(voiture.endDate).toLocaleDateString("fr-FR")}
                    </div>
                    <div class="details">
                      ${voiture.vehicleType} • ${voiture.pickupLocation} → ${voiture.dropoffLocation}
                    </div>
          
                    ${voiture.driverIncluded ? `
                      <div class="driver-info">
                        👨‍✈️ Chauffeur : ${voiture.driverName}
                        📞 ${voiture.driverPhone}
                      </div>
                    ` : ''}
          
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
  
          ${plan.activites?.length > 0 ? `
            <div class="item-section">
              <h2>🎯 Activités</h2>
              ${plan.activites?.map((activite, index) => `
                <div class="item-card">
                  <div class="item-title">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    ${index + 1}. ${activite.name}
                  </div>
                  <div class="item-content">
                    <div class="route">
                      ${new Date(activite.date).toLocaleDateString("fr-FR")}
                    </div>
                    <div class="details">
                      Catégorie: ${activite.category} • ${activite.participants} participant(s)
                    </div>
                    <div class="details">
                      Durée: ${activite.duration} 
                    </div>
          
                    ${activite.guideRequired ? `
                      <div class="guide-info">
                        🧑‍🏫 Guide : ${activite.guideName}
                        📞 ${activite.guidePhone}
                      </div>
                    ` : ''}
          
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
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
                  {vol.passengers} passager(s) . Depart le {new Date(vol.date_debut).toLocaleDateString("fr-FR")} - retour : {new Date(vol.date_fin).toLocaleDateString("fr-FR")}
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
                  Durée: {activite.duration} 
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};