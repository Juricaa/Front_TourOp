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
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "admin@madagascar-tours.mg",
    password: "admin123",
    name: "Administrateur",
    role: "admin",
  },
  {
    id: "2",
    email: "secretaire@madagascar-tours.mg",
    password: "secret123",
    name: "Secrétaire",
    role: "secretary",
  },
];

// Routes accessible by role
const rolePermissions = {
  admin: {
    routes: ["/", "/destinations", "/settings"], // Dashboard, destinations and settings for viewing
    permissions: ["read"] as const,
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
    permissions: ["read", "write", "delete"] as const,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const foundUser = mockUsers.find(
        (u) => u.email === email && u.password === password,
      );

      if (foundUser) {
        const { password: _, ...userData } = foundUser;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
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
