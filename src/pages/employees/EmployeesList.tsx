import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../components/ui/dialog';
import { Plus, Search, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { mockEmployees } from '../../lib/mockData';
import { Employee } from '../../types';

export function EmployeesList() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    matricule: '',
    fullName: '',
    fonction: '',
    direction: '',
    email: '',
    phone: ''
  });

  const filteredEmployees = employees.filter(emp => 
    emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.fonction.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.direction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    // Mock add employee
    const newEmployee: Employee = {
      id: String(Date.now()),
      ...formData
    };
    setEmployees([...employees, newEmployee]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingEmployee) return;
    setEmployees(employees.map(emp => 
      emp.id === editingEmployee.id ? { ...emp, ...formData } : emp
    ));
    setEditingEmployee(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      matricule: employee.matricule,
      fullName: employee.fullName,
      fonction: employee.fonction,
      direction: employee.direction,
      email: employee.email || '',
      phone: employee.phone || ''
    });
  };

  const resetForm = () => {
    setFormData({
      matricule: '',
      fullName: '',
      fonction: '',
      direction: '',
      email: '',
      phone: ''
    });
  };

  const EmployeeFormDialog = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    title 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: () => void;
    title: string;
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations de l'employé
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="matricule">Matricule *</Label>
            <Input
              id="matricule"
              value={formData.matricule}
              onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
              placeholder="MAT001234"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nom Complet *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Jean Dupont"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fonction">Fonction *</Label>
            <Input
              id="fonction"
              value={formData.fonction}
              onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
              placeholder="Inspecteur des Finances"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction">Direction *</Label>
            <Input
              id="direction"
              value={formData.direction}
              onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
              placeholder="Direction Générale du Trésor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jean.dupont@tresor.gov"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+33 1 23 45 67 89"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={onSubmit}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Employés</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les informations des employés du Trésor Public
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Ajouter un employé
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par matricule, nom, fonction ou direction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.length === 0 ? (
          <Card className="p-12 col-span-full text-center">
            <p className="text-muted-foreground">Aucun employé trouvé</p>
          </Card>
        ) : (
          filteredEmployees.map((employee) => (
            <Card key={employee.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-lg">
                    {employee.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(employee)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(employee.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h4 className="mb-1">{employee.fullName}</h4>
              <p className="text-sm text-muted-foreground mb-3">{employee.fonction}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {employee.matricule}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{employee.direction}</p>
                
                {employee.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span className="text-xs truncate">{employee.email}</span>
                  </div>
                )}
                
                {employee.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span className="text-xs">{employee.phone}</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      <Card className="p-4">
        <p className="text-sm text-center text-muted-foreground">
          {filteredEmployees.length} employé{filteredEmployees.length > 1 ? 's' : ''} 
          {searchTerm && ' trouvé'}(s) sur {employees.length} au total
        </p>
      </Card>

      {/* Add Dialog */}
      <EmployeeFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          resetForm();
        }}
        onSubmit={handleAdd}
        title="Ajouter un Employé"
      />

      {/* Edit Dialog */}
      <EmployeeFormDialog
        isOpen={!!editingEmployee}
        onClose={() => {
          setEditingEmployee(null);
          resetForm();
        }}
        onSubmit={handleUpdate}
        title="Modifier l'Employé"
      />
    </div>
  );
}
