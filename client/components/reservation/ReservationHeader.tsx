import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Edit, Trash2, FileText, Eye } from "lucide-react";

interface ReservationHeaderProps {
  factureId: string;
  date_created: string;
  status: string;
  StatusIcon: React.ComponentType<{ className?: string }>;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onView: (type: 'invoice' | 'plan') => void; // Déclaration correcte de la prop
  onEdit: () => void;
  onDelete: () => void;
}

export const ReservationHeader: React.FC<ReservationHeaderProps> = ({
  factureId,
  date_created,
  status,
  StatusIcon,
  getStatusColor,
  getStatusText,
  onView, // Maintenant correctement inclus dans les props
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/reservations">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Réservation {factureId}
          </h1>
          <p className="text-muted-foreground">
            Créée le {new Date(date_created).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={getStatusColor(status)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {getStatusText(status)}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Voir
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onView('invoice')}>
              <FileText className="w-4 h-4 mr-2" />
              Facture
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView('plan')}>
              <FileText className="w-4 h-4 mr-2" />
              Plan de voyage
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};