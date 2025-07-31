import { Car, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Voitures() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Car className="h-6 w-6 text-madagascar-500" />
            Gestion des Véhicules
          </h1>
          <p className="text-muted-foreground">
            Gérez votre flotte de véhicules
          </p>
        </div>
        <Button asChild>
          <Link to="/voitures/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Véhicule
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flotte de Véhicules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Car className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              Section en cours de développement
            </h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              La gestion des véhicules sera bientôt disponible. Vous pourrez
              ajouter et gérer vos 4x4, minibus et autres véhicules.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/voitures/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un Véhicule
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
