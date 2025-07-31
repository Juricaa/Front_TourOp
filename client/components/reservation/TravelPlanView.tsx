// components/reservation/TravelPlanView.tsx
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plane, Building, Car, MapPin, Calendar } from "lucide-react";
import { DialogHeader } from "../ui/dialog";

interface TravelPlan {
  factureId: string;
  clientName: string;
  date_debut: string;
  date_fin?: string;
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
  }[];
  activites?: {
    name: string;
    date: Date;
    participants: number;
  }[];
}

export const TravelPlanView = ({ plan }: { plan: TravelPlan }) => {
  return (

    <div className="space-y-6">
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
        <p className="font-medium">{} personne(s)</p>
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
            <p>{vol.departure} → {vol.arrival}</p>
            <p className="text-sm text-muted-foreground">
              {vol.passengers} passager(s)
            </p>
          </div>
        </div>
      ))}

      {plan.  hebergements?.map((hebergement, index) => (
        <div key={`hebergement-${index}`} className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-green-500" />
            <span className="font-medium">Hébergement: {hebergement.name}</span>
          </div>
          <div className="mt-2 ml-7">
            <p>
              {new Date(hebergement.checkIn).toLocaleDateString("fr-FR")} -
              {new Date(hebergement.checkOut).toLocaleDateString("fr-FR")}
            </p>
            <p className="text-sm text-muted-foreground">
              {hebergement.location} • {hebergement.guests} personne(s)
            </p>
          </div>
        </div>
      ))}

      {/* Ajoutez des sections similaires pour les voitures et activités si nécessaire */}
    </div>
    </div>


    // <div className="space-y-6">
    //   <div className="grid grid-cols-2 gap-6">
    //     <div>
    //       <h3 className="font-semibold mb-2">TourOp Madagascar</h3>
    //       <p className="text-sm text-muted-foreground">
    //         123 Avenue des Baobabs, 101 Antananarivo
    //       </p>
    //     </div>
    //     <div className="text-right">
    //       <h3 className="font-semibold mb-2">Plan pour:</h3>
    //       <p className="text-sm">
    //         {plan.clientName}
    //         <br />
    //         Réservation: {plan.factureId}
    //       </p>
    //     </div>
    //   </div>

    //   <div className="grid grid-cols-3 gap-4 py-4 border-y">
    //     <div>
    //       <p className="text-sm text-muted-foreground">Date de début</p>
    //       <p className="font-medium">
    //         {format(new Date(plan.date_debut), "dd/MM/yyyy", { locale: fr })}
    //       </p>
    //     </div>
    //     <div>
    //       <p className="text-sm text-muted-foreground">Date de fin</p>
    //       <p className="font-medium">
    //         {plan.date_fin 
    //           ? format(new Date(plan.date_fin), "dd/MM/yyyy", { locale: fr })
    //           : "Non spécifié"}
    //       </p>
    //     </div>
    //     <div>
    //       <p className="text-sm text-muted-foreground">Référence</p>
    //       <p className="font-medium">{plan.factureId}</p>
    //     </div>
    //   </div>

    //   {/* Section Vols */}
    //   {plan.vols?.length > 0 && (
    //     <div className="space-y-4">
    //       <h3 className="font-semibold flex items-center gap-2">
    //         <Plane className="w-5 h-5" />
    //         Vols ({plan.vols.length})
    //       </h3>
    //       <div className="space-y-3">
    //         {plan.vols.map((vol, index) => (
    //           <div key={index} className="p-4 border rounded-lg">
    //             <div className="flex justify-between items-center">
    //               <div>
    //                 <p className="font-medium">{vol.airline}</p>
    //                 <p className="text-sm text-muted-foreground">
    //                   {vol.departure} → {vol.arrival}
    //                 </p>
    //               </div>
    //               <p>{vol.passengers} passager(s)</p>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   )}

    //   {/* Section Hébergements */}
    //   {plan.hebergements?.length > 0 && (
    //     <div className="space-y-4">
    //       <h3 className="font-semibold flex items-center gap-2">
    //         <Building className="w-5 h-5" />
    //         Hébergements ({plan.hebergements.length})
    //       </h3>
    //       <div className="space-y-3">
    //         {plan.hebergements.map((heb, index) => (
    //           <div key={index} className="p-4 border rounded-lg">
    //             <div className="flex justify-between">
    //               <div>
    //                 <p className="font-medium">{heb.name}</p>
    //                 <p className="text-sm text-muted-foreground">
    //                   {heb.location}
    //                 </p>
    //                 <p className="text-sm">
    //                   {format(heb.checkIn, "dd/MM/yyyy", { locale: fr })} -{" "}
    //                   {format(heb.checkOut, "dd/MM/yyyy", { locale: fr })}
    //                 </p>
    //               </div>
    //               <p>{heb.guests} personne(s)</p>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   )}

    //   {/* Section Activités */}
    //   {plan.activites?.length > 0 && (
    //     <div className="space-y-4">
    //       <h3 className="font-semibold flex items-center gap-2">
    //         <MapPin className="w-5 h-5" />
    //         Activités ({plan.activites.length})
    //       </h3>
    //       <div className="space-y-3">
    //         {plan.activites.map((act, index) => (
    //           <div key={index} className="p-4 border rounded-lg">
    //             <div className="flex justify-between">
    //               <div>
    //                 <p className="font-medium">{act.name}</p>
    //                 <p className="text-sm">
    //                   {format(act.date, "dd/MM/yyyy", { locale: fr })}
    //                 </p>
    //               </div>
    //               <p>{act.participants} participant(s)</p>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   )}
    // </div>
  );
};