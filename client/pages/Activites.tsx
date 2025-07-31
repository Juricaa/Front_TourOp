import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Activites() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-madagascar-500" />
            Gestion des Activités
          </h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue d'activités et excursions
          </p>
        </div>
        <Button asChild>
          <Link to="/activites/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Activité
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activités et Excursions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MapPin className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              Section en cours de développement
            </h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              La gestion des activités sera bientôt disponible. Vous pourrez
              ajouter et gérer vos excursions, visites guidées et activités.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/activites/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une Activité
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
