// components/reservation/TravelPlanView.tsx
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plane, Building, Car, MapPin, Calendar } from "lucide-react";
import { DialogHeader } from "../ui/dialog";
import { useRef } from "react";
import { Printer } from "lucide-react";
import { Button } from "../ui/button";


interface TravelPlan {
  factureId: string;
  clientName: string;
  date_debut: string;
  date_fin?: string;
  nbPersonne: String;
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
  console.log(plan);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Clone the content to avoid affecting the original
    const content = printRef.current.cloneNode(true) as HTMLDivElement;

    // Add print-specific styles
    const style = document.createElement('style');
    style.innerHTML = `
    @media print {
      body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4; }
      .print-header { display: block; margin-bottom: 20px; }
      .activity-item { page-break-inside: avoid; margin-bottom: 15px; }
      .no-print { display: none; }
    }
  `;

    // Create the print document
    const printDocument = `
    <html>
      <head>
        <title>Plan de Voyage - ${plan.factureId}</title>
      </head>
      <body>
        <div class="print-header">
          <h1>Plan de Voyage - Réservation ${plan.factureId}</h1>
          <p>Client: ${plan.clientName}</p>
          <p>Période: ${new Date(plan.date_debut).toLocaleDateString("fr-FR")} 
            ${plan.date_fin ? ` - ${new Date(plan.date_fin).toLocaleDateString("fr-FR")}` : ''}
          </p>
          <p>Participants: ${plan.nbPersonne} personne(s)</p>
        </div>
        ${content.innerHTML}
      </body>
    </html>
  `;

    printWindow.document.write(printDocument);
    printWindow.document.head.appendChild(style);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (


    <div className="space-y-6">
      <div className="flex justify-end no-print">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
      </div>

      <div ref={printRef}>
        <div className="travel-plan-content space-y-6 max-h-[80vh] overflow-y-auto pr-2">
          <DialogHeader>
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

          {/* Itinéraire détaillé */}
          <div className="space-y-4">
            <h3 className="font-semibold">Itinéraire</h3>
            {plan.vols?.map((vol, index) => (
              <div key={`vol-${index}`} className="p-4 border rounded-lg">
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
              <div key={`hebergement-${index}`} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Hébergement: {hebergement.name}</span>
                </div>
                <div className="mt-2 ml-7">
                  <p>
                    {new Date(hebergement.checkIn).toLocaleDateString("fr-FR")} →  {new Date(hebergement.checkOut).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hebergement.location} • {hebergement.capacity} personne(s)
                  </p>
                </div>
              </div>

            ))}


            {/* Voitures */}
            {plan.voitures?.map((voiture, index) => (
              <div key={`voiture-${index}`} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">
                    Voiture {index + 1} : {voiture.brand} {voiture.model}
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

            {/* Activités */}
            {plan.activites?.map((activite, index) => (
              <div key={`activite-${index}`} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">
                    Activité {index + 1} : {activite.name}
                  </span>
                </div>
                <div className="mt-2 ml-7">
                  <p>
                    <Calendar className="inline w-4 h-4 mr-1 text-muted-foreground" />
                    {new Date(activite.date).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Catégorie : {activite.category} • {activite.participants} participant(s)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Durée : {activite.duration} heure(s)
                  </p>
                </div>
              </div>
            ))}
            {/* Ajoutez des sections similaires pour les voitures et activités si nécessaire */}
          </div>
        </div>
      </div>

    </div>



  );
};