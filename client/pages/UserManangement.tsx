import { useState, useEffect } from "react";
import { userService } from "@/services/userService";
import type { User } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      console.log("donne reçoit:", response);
      
      // Handle new API response format
      if (response.success && response.data) {
        // Filtrer l'admin connecté de la liste
        const currentUser = localStorage.getItem('user');
        if (currentUser) {
          const currentUserData = JSON.parse(currentUser);
          const filteredUsers = response.data.filter(
            (user: User) => user.email !== currentUserData.email
          );
          setUsers(filteredUsers);
        } else {
          setUsers(response.data);
        }
      } else {
        console.error('Invalid API response format:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        title: "Mode Hors Ligne",
        description: "Utilisation des données locales pour la gestion des utilisateurs",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: number, updates: Partial<User>) => {
    try {
      const response = await userService.updateUser(userId, updates);
      if (response.success && response.data) {
        setUsers(prev =>
          prev.map(user =>
            user.id === userId ? response.data! : user
          )
        );
        toast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès",
        });
        loadUsers();
      } else {
        throw new Error(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'utilisateur",
        variant: "destructive",
      });
    }
  };


  const handleVerifyUser = async (userId: number) => {
    try {
      const response = await userService.verifyUser(userId);
      if (response.success && response.data) {
        setUsers(prev =>
          prev.map(user =>
            user.id === userId ? response.data! : user
          )
        );
        toast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès",
        });
        loadUsers();
      } else {
        throw new Error(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await userService.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    console.log(editingUser)

    try {
      await userService.updateUser(editingUser.id, editingUser);
      setUsers(prev => 
        prev.map(user => 
          user.id === editingUser.id ? editingUser : user
        )
      );
      setIsEditDialogOpen(false);
      setEditingUser(null);
      toast({
        title: "Succès",
        description: "Utilisateur modifié avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "Administrateur", variant: "destructive" as const },
      secretary: { label: "Secrétaire", variant: "default" as const },
      secretaire: { label: "Secrétaire", variant: "default" as const },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (user: User) => {
    if (!user.is_verified) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    if (!user.is_active) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des utilisateurs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Info className="w-3 h-3 mr-1" />
              Mode Local
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs, validez les accès et autorisations (stockage local)
          </p>
        </div>
      
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vérifiés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.is_verified).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => !u.is_verified).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statut</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
             
                <TableHead>Dernière Connexion</TableHead>
                <TableHead>Actions Rapides</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user)}
                      <div className="flex flex-col gap-1">
                        {user.is_verified && (
                          <Badge variant="outline" className="text-xs">Vérifié</Badge>
                        )}
                        {user.is_active && (
                          <Badge variant="outline" className="text-xs">Actif</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  
                  {/* <TableCell>
                    <div className="flex gap-1">
                      {user.is_staff && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Staff
                        </Badge>
                      )}
                      {user.is_superuser && (
                        <Badge variant="outline" className="text-xs">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Super
                        </Badge>
                      )}
                    </div>
                  </TableCell> */}
                  
                  <TableCell>
                    {user.last_login ? (
                      <div className="text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.last_login).toLocaleDateString('fr-FR')} à  {new Date(user.last_login).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} 
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Jamais</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-2">
                      
                      
                     {user.is_verified===false && (
                      <Button
                        size="sm"
                        variant={user.is_verified ? "outline" : "default"}
                        onClick={() => handleVerifyUser(user.id)}
                      >
                        {user.is_verified ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      </Button>
                      
                     )} 
                      
                      <Button
                        size="sm"
                        variant={user.is_active ? "outline" : "default"}
                        onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
                      >
                        {user.is_active ? "Désactiver" : "Activer"}
                      </Button>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations et permissions de l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Rôle
                </Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: 'admin' | 'secretary') => 
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="secretary">Secrétaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="verified" className="text-right">
                  Vérifié
                </Label>
                <Switch
                  id="verified"
                  checked={editingUser.is_verified}
                  onCheckedChange={(checked) => 
                    setEditingUser({ ...editingUser, is_verified: checked })
                  }
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Actif
                </Label>
                <Switch
                  id="active"
                  checked={editingUser.is_active}
                  onCheckedChange={(checked) => 
                    setEditingUser({ ...editingUser, is_active: checked })
                  }
                />
              </div>
              
              {/* <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="staff" className="text-right">
                  Staff
                </Label>
                <Switch
                  id="staff"
                  checked={editingUser.is_staff}
                  onCheckedChange={(checked) => 
                    setEditingUser({ ...editingUser, is_staff: checked })
                  }
                />
              </div> */}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditUser}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{userToDelete?.name}" ? 
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
