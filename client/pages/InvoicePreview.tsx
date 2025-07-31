import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Printer, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { usePreview } from "@/contexts/PreviewContext";

export default function InvoicePreview() {
  const { previewData, hasInvoicePreview } = usePreview();

  const downloadInvoice = () => {
    if (!previewData.invoice) return;

    const blob = new Blob([previewData.invoice.content], {
      type: "text/plain; charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facture-${previewData.invoice.client.replace(/\s+/g, "-")}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printInvoice = () => {
    if (!previewData.invoice) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Facture - ${previewData.invoice.client}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${previewData.invoice.content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!hasInvoicePreview || !previewData.invoice) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            Aucun aperçu de facture disponible. Veuillez d'abord générer un
            aperçu depuis une réservation en cours.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link to="/reservations/new">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Créer une réservation
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const invoice = previewData.invoice;
  const currencySymbols = { EUR: "€", USD: "$", Ar: "Ar" };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Aperçu de la Facture
          </h1>
          <p className="text-muted-foreground">
            Client: {invoice.client} -{" "}
            {currencySymbols[invoice.currency as keyof typeof currencySymbols]}
            {invoice.amount.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={printInvoice}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" onClick={downloadInvoice}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Envoyer
          </Button>
        </div>
      </div>

      {/* Invoice Status */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary">
          Aperçu généré le {invoice.createdAt.toLocaleString("fr-FR")}
        </Badge>
        <Badge className="bg-blue-100 text-blue-800">Brouillon</Badge>
      </div>

      {/* Invoice Content */}
      <Card>
        <CardHeader>
          <CardTitle>Contenu de la Facture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {invoice.content}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to="/reservations/new">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la réservation
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/factures">Voir toutes les factures</Link>
          </Button>
          <Button onClick={downloadInvoice}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
