import { Plane, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Vols() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Plane className="h-6 w-6 text-madagascar-500" />
            Gestion des Vols
          </h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue de vols et compagnies aériennes
          </p>
        </div>
        <Button asChild>
          <Link to="/vols/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Vol
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vols Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Plane className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              Section en cours de développement
            </h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              La gestion des vols sera bientôt disponible. Vous pourrez ajouter
              et gérer les vols de différentes compagnies aériennes.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/vols/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un Vol
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
