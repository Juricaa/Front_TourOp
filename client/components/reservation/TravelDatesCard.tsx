// components/reservations/TravelDatesCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface TravelDatesCardProps {
  date_debut: string;
  date_fin?: string;
}

export const TravelDatesCard: React.FC<TravelDatesCardProps> = ({ 
  date_debut, 
  date_fin 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Dates de voyage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Départ</div>
            <div className="font-medium">
              {new Date(date_debut).toLocaleDateString("fr-FR")}
            </div>
          </div>
          {date_fin && (
            <>
              <div className="text-muted-foreground">→</div>
              <div>
                <div className="text-sm text-muted-foreground">Retour</div>
                <div className="font-medium">
                  {new Date(date_fin).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};