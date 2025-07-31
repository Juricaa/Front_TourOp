import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: "read" | "write" | "delete";
  fallbackRoute?: string;
}

function LogoutButton() {
  const { logout } = useAuth();        // On récupère la fonction logout
  const navigate = useNavigate();      // Pour rediriger après déconnexion

  const handleLogout = () => {
    logout();                // Appelle la fonction logout du contexte
    navigate("/login");      // Redirige vers la page de login
  };

  return (
    <button onClick={handleLogout} className="text-red-500 hover:underline">
      Se déconnecter
    </button>
  );
}

export function ProtectedRoute({
  children,
  requiredPermission = "read",
  fallbackRoute = "/",
}: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission, canAccessRoute, user } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  

  // Check if user can access this route
  if (!canAccessRoute(location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Accès non autorisé
            </h1>
            <p className="text-muted-foreground mt-2">
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Connecté en tant que: <strong>{user?.name}</strong> (
              {user?.role === "admin" ? "Administrateur" : "Secrétaire"})
            </p>
          </div>

          <div>
      {user ? (
        <p>
          
          Connecté en tant que : {user.name} ({user.role})
          <LogoutButton />
        </p>
      ) : (
        <p>Non connecté</p> 
      )}
    </div>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {user?.role === "admin"
                ? "En tant qu'administrateur, vous avez accès uniquement au tableau de bord et aux destinations pour consultation."
                : "Contactez votre administrateur pour plus d'informations."}
            </AlertDescription>
          </Alert>
          <button
            onClick={() => (window.location.href = fallbackRoute)}
            className="inline-flex items-center px-4 py-2 bg-madagascar-600 text-white rounded-md hover:bg-madagascar-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );


  }

  // Check specific permission if required
  if (!hasPermission(requiredPermission)) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas la permission "{requiredPermission}" pour cette
            action.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for wrapping components with permission checks
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission: "read" | "write" | "delete" = "read",
) {
  return function PermissionWrappedComponent(props: T) {
    return (
      <ProtectedRoute requiredPermission={requiredPermission}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Component to conditionally render based on permissions
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: "read" | "write" | "delete";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission } = useAuth();

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
