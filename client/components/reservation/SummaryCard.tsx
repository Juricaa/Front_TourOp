// components/reservations/SummaryCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, RefreshCw } from "lucide-react";
import type { SingleReservation } from "@shared/types";

interface SummaryCardProps {
  total: number;
  selectedCurrency: 'MGA' | 'EUR' | 'USD';
  setSelectedCurrency: (currency: 'MGA' | 'EUR' | 'USD') => void;
  exchangeRates: { EUR: number; USD: number; MGA: number };
  isLoadingRates: boolean;
  fetchExchangeRates: () => Promise<{ EUR: number; USD: number; MGA: number }>;
  formatNumberWithSeparators: (num: number) => string;
  formatCurrency: (amount: number, currency?: 'MGA' | 'EUR' | 'USD') => string;
  status: string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  reservation: SingleReservation;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  total,
  selectedCurrency,
  setSelectedCurrency,
  exchangeRates,
  isLoadingRates,
  fetchExchangeRates,
  formatNumberWithSeparators,
  formatCurrency,
  status,
  getStatusColor,
  getStatusText,
  reservation,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Récapitulatif
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Devise:</span>
            <Select
              value={selectedCurrency}
              onValueChange={(value: 'MGA' | 'EUR' | 'USD') => setSelectedCurrency(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Devise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MGA">Ar (Ariary)</SelectItem>
                <SelectItem value="EUR">€ (Euro)</SelectItem>
                <SelectItem value="USD">$ (Dollar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              setIsLoadingRates(true);
              const rates = await fetchExchangeRates();
              setExchangeRates(rates);
              setIsLoadingRates(false);
            }}
            disabled={isLoadingRates}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingRates ? 'animate-spin' : ''}`} />
            {isLoadingRates ? 'Chargement...' : 'Actualiser taux'}
          </Button>
        </div>

        <div className="bg-gradient-to-r from-madagascar-50 to-ocean-50 border border-madagascar-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(total)}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Statut:</span>
            <Badge variant="outline" className={getStatusColor(status)}>
              {getStatusText(status)}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taux de change:</span>
            <span>
              1 EUR = {formatNumberWithSeparators(1 / exchangeRates.EUR)} Ar
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Services:</span>
            <span>
              {[
                reservation.vols?.length ? `${reservation.vols.length} vol(s)` : "",
                reservation.hebergements?.length ? `${reservation.hebergements.length} hébergement(s)` : "",
                reservation.voitures?.length ? `${reservation.voitures.length} véhicule(s)` : "",
                reservation.activites?.length ? `${reservation.activites.length} activité(s)` : "",
              ].filter(Boolean).join(", ") || "Aucun"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};