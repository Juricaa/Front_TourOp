import { API_BASE_URL } from "@/services/apiConfig";
import { toast } from "@/components/ui/use-toast";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type UserRole = "admin" | "secretary";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_verified : number;
  is_active : number;
  is_staff : number;
  last_login: Date;
  phone : string;
  
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: "read" | "write" | "delete") => boolean;
  canAccessRoute: (route: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data - in real app this would come from backend


// Routes accessible by role
const rolePermissions = {
  admin: {
    routes: ["/", "/destinations", "/settings", "/hebergements", "/clients", "/reservations", "/factures", "/plans-voyage", "/voitures", "/activites", "/vols", "/users","/bilan"], // All routes for admin
    permissions: ["read", "write", "delete"] as const,
  },
  secretary: {
    routes: [
      "/",
      "/clients",
      "/reservations",
      "/hebergements",
      "/voitures",
      "/activites",
      "/vols",
      "/destinations",
      "/factures",
      "/plans-voyage",
      "/settings",
    ], // All routes
    permissions: ["read", "write","delete"] as const,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  let inactivityTimer: NodeJS.Timeout | null = null;

  // Durée d'inactivité avant expiration (3 heures)
  const INACTIVITY_LIMIT = 3 *60 * 60 * 1000; // 3 heures en millisecondes

  // Fonction pour réinitialiser le minuteur d'inactivité
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    // Définir un nouveau minuteur
    inactivityTimer = setTimeout(() => {
      handleSessionExpiry();
    }, INACTIVITY_LIMIT);
  };

  // Fonction pour gérer l'expiration de la session
  const handleSessionExpiry = () => {
    toast({
      title: "Session Expirée",
      description: "Votre session a expiré après 3 heures d'inactivité. Veuillez vous reconnecter.",
      variant: "destructive",
    });

    logout();
  };

  // Ajouter des écouteurs d'événements pour détecter l'activité de l'utilisateur
  useEffect(() => {
    if (isAuthenticated) {
      const activityEvents = ["click", "mousemove", "keydown", "scroll", "touchstart"];

      // Réinitialiser le minuteur à chaque activité
      activityEvents.forEach((event) => {
        window.addEventListener(event, resetInactivityTimer);
      });

      // Démarrer le minuteur d'inactivité
      resetInactivityTimer();

      // Nettoyer les écouteurs d'événements lors du démontage
      return () => {
        activityEvents.forEach((event) => {
          window.removeEventListener(event, resetInactivityTimer);
        });

        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
        }
      };
    }
  }, [isAuthenticated]);

  // useEffect(() => {
  //   const savedUser = localStorage.getItem('user');
  //   const savedAccessToken = localStorage.getItem('accessToken');
  //   const expiry = sessionStorage.getItem('sessionExpiry');

  //   if (expiry && Date.now() > Number(expiry)) {
  //     logout();
  //     return;
  //   }
  
  //   if (savedUser && savedAccessToken) {
  //     try {
  //       const userData = JSON.parse(savedUser);
  //       setUser(userData);
  //       setIsAuthenticated(true);
  //     } catch {
  //       localStorage.clear();
  //     }
  //   }
  // }, []);

  // Session expiry timer
  // useEffect(() => {
  //   if (!isAuthenticated) return;

  //   const checkSessionExpiry = () => {
  //     const expiry = sessionStorage.getItem('sessionExpiry');
  //     if (expiry && Date.now() > Number(expiry)) {
  //       // Session expired - trigger logout with toast
        
        
  //       toast({
  //         title: "Session Expirée",
  //         description: "Votre session a expiré. Veuillez vous reconnecter.",
  //         variant: "destructive",
  //       });
        
  //       // Perform logout without page reload
  //       setUser(null);
  //       setIsAuthenticated(false);
  //       localStorage.removeItem("user");
  //       localStorage.removeItem("accessToken");
  //       localStorage.removeItem("refreshToken");
  //       sessionStorage.removeItem('sessionExpiry');
  //     }
  //   };

  //   // Check immediately and then every 30 seconds
  //   checkSessionExpiry();
  //   const interval = setInterval(checkSessionExpiry, 30000);

  //   return () => clearInterval(interval);
  // }, [isAuthenticated]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
            console.log("error:", errorData);
            return { success: false, message: errorData.error };
      }
  
      const data = await response.json();
  
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
  
      setUser(data.user);
      setIsAuthenticated(true);
      
      // const expiryTime = Date.now() +  120 * 60 * 1000;
      // sessionStorage.setItem('sessionExpiry', expiryTime.toString());
  
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem('sessionExpiry');
  };

  const hasPermission = (permission: "read" | "write" | "delete"): boolean => {
    if (!user) return false;
    return rolePermissions[user.role].permissions.includes(permission as any);
  };

  const canAccessRoute = (route: string): boolean => {
  if (!user || !user.role || !rolePermissions[user.role]) {
    return false;
  }

  const userRoutes = rolePermissions[user.role].routes;

  if (userRoutes.includes(route)) {
    return true;
  }

  return userRoutes.some((allowedRoute) => {
    return route.startsWith(allowedRoute + "/") || route === allowedRoute;
  });
};


  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    canAccessRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
