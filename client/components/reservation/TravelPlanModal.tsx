import { Plane, Building, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const TravelPlanModal = ({
  isOpen,
  onOpenChange,
  factureId,
  client,
  date_debut,
  date_fin,
  reservation,
  toPDF
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  factureId: string;
  client: any;
  date_debut: string;
  date_fin?: string;
  reservation: any;
  toPDF: any;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <div>
          <DialogHeader>
            <DialogTitle>Plan de Voyage - {factureId}</DialogTitle>
            <DialogDescription>
              Itinéraire pour {client?.name}
            </DialogDescription>
          </DialogHeader>
          
          {/* Contenu du plan de voyage */}
          <div className="mt-4 space-y-4">
            {/* Ajoutez le contenu comme dans l'exemple précédent */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};