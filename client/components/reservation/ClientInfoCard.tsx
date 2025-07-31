// components/reservations/ClientInfoCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Phone } from "lucide-react";
import type { Client } from "@shared/types";

interface ClientInfoCardProps {
  client: Client | null;
}

export const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ client }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Informations Client
        </CardTitle>
      </CardHeader>
      <CardContent>
        {client ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-foreground">{client.name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {client.email}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {client.phone}
                </div>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Nationalité:</span> {client.nationality}
              </div>
              <div>
                <span className="font-medium">Personnes:</span> {client.nbpersonnes}
              </div>
              <div>
                <span className="font-medium">Adresse:</span> {client.address}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Client non trouvé</p>
        )}
      </CardContent>
    </Card>
  );
};