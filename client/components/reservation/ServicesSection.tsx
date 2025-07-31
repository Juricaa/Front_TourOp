// components/reservations/ServicesSection.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Building, Car, MapPin } from "lucide-react";
import type { SingleReservation } from "@shared/types";

interface ServicesSectionProps {
  reservation: SingleReservation;
  formatCurrency: (amount: number, currency?: 'MGA' | 'EUR' | 'USD') => string;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ 
  reservation, 
  formatCurrency 
}) => {
  return (
    <div className="space-y-4">
      {reservation.vols && reservation.vols.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Vols ({reservation.vols.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservation.vols.map((vol, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <div className="text-lg text-sky-900 flex items-center gap-2">
                      <span>{vol.airline}</span>
                    </div>
                    <div className="font-medium">Vol {index + 1}</div>
                    <div className="text-sm text-muted-foreground">
                      {vol.departure} → {vol.arrival}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vol.passengers} passager(s)
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(vol.price)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reservation.hebergements && reservation.hebergements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Hébergements ({reservation.hebergements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservation.hebergements.map((hebergement, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <span className="text-lg text-sky-900 flex items-center gap-2">
                      {hebergement.name}, 
                    </span>
                    Adresse {hebergement.location} 
                    <div className="font-medium">
                      {new Date(hebergement.checkIn).toLocaleDateString("fr-FR")}{" "}
                      -{" "}
                      {new Date(hebergement.checkOut).toLocaleDateString("fr-FR")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        ({hebergement.capacity} personnes)
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(hebergement.price)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reservation.voitures && reservation.voitures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Véhicules ({reservation.voitures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservation.voitures.map((voiture, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <span className="text-lg text-blue-900">
                      {voiture.brand} {voiture.model} ({voiture.vehicleType})
                    </span>
                  
                    <div className="font-medium">
                      {new Date(voiture.startDate).toLocaleDateString("fr-FR")}{" "}
                      -{" "}
                      {new Date(voiture.endDate).toLocaleDateString("fr-FR")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {voiture.pickupLocation} → {voiture.dropoffLocation}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(voiture.price)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reservation.activites && reservation.activites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Activités ({reservation.activites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservation.activites.map((activite, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <span className="text-lg text-green-900 flex items-center gap-2">
                      {activite.name} ({activite.duration})
                    </span>
                    <div className="font-medium">
                      {new Date(activite.date).toLocaleDateString("fr-FR")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activite.participants} participant(s)
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(activite.price)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};