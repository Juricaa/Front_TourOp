import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/services/apiConfig";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password-reset/request/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Une erreur est survenue");
      }

      setSuccess(true);
    } catch (error) {
      setError("Une erreur est survenue lors de l'envoi du lien de réinitialisation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-madagascar-50 to-ocean-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-madagascar-900">
            Réinitialisation du mot de passe
          </h1>
          <p className="text-muted-foreground">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-foreground">
              Mot de passe oublié
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <Alert variant="default">
                <AlertDescription>
                  Un lien de réinitialisation a été envoyé à {email} (valable 15 minutes).
                  Vérifiez votre boîte mail.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@madagascar-tours.mg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-madagascar-600 hover:bg-madagascar-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            <Link
              to="/login"
              className="font-medium text-madagascar-600 hover:text-madagascar-700"
            >
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}