import { useEffect, useState } from 'react';
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
  DialogFooter,
} from '../../components/ui/dialog';
import { Plus, Search, Pencil, Trash2, Calendar, MapPin } from 'lucide-react';

import { employeesApi } from '../../lib/api';
import { Employee } from '../../types';
import { toast } from 'sonner';

function EmployeeFormDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title,
  formData,
  onChange,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: () => void;
  title: string;
  formData: {
    matricule: string;
    fullName: string;
    position: string;
    address: string;
    dateOfBirth: string;
    bankInfo: string;
  };
  onChange: (field: keyof typeof formData, value: string) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => {
      if (!open) onClose();    
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Renseignez les informations de l'employé</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="matricule">Matricule <span className='text-destructive'>*</span></Label>
            <Input
              id="matricule"
              value={formData.matricule}
              onChange={(e) => onChange('matricule', e.target.value)}
              placeholder="MAT00123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet <span className='text-destructive'>*</span></Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              placeholder="Jean Dupont"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Poste <span className='text-destructive'>*</span></Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => onChange('position', e.target.value)}
              placeholder="Inspecteur des Finances"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bankInfo">Informations bancaires <span className='text-destructive'>*</span></Label>
            <Input
              id="bankInfo"
              value={formData.bankInfo}
              onChange={(e) => onChange('bankInfo', e.target.value)}
              placeholder="Ex: Banque XYZ, IBAN 1234"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse <span className='text-destructive'>*</span></Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Ouagadougou, Secteur 15"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="dob">Date de naissance <span className='text-destructive'>*</span></Label>
            <Input
              id="dob"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
              required
            />
          </div>
        </div>

        <DialogFooter className="gap-6">
          <Button variant="destructive" onClick={onClose}>Annuler</Button>
          <Button onClick={onSubmit}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    matricule: '',
    fullName: '',
    position: '',
    address: '',
    dateOfBirth: '',
    bankInfo: '',
  });

  const validateForm = () => {
    return (
      formData.matricule.trim() !== "" &&
      formData.fullName.trim() !== "" &&
      formData.position.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.dateOfBirth.trim() !== "" &&
      formData.bankInfo.trim() !== ""  
    );
  };

  const formatDate = (d: string) => new Date(d).toISOString().split("T")[0];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Helper to update form data
  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // LOAD EMPLOYEES FROM API
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response: any = await employeesApi.getAll();
      const sorted = response.data.sort(
        (a: Employee, b: Employee) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setEmployees(sorted);
    } catch (err) {
      console.error('Erreur chargement employés :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // FILTERING
  const filteredEmployees = employees.filter(emp =>
    emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const displayedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ADD EMPLOYEE
  const handleAdd = async () => {
    if (!validateForm()) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    
    try {
      const response: any = await employeesApi.create(formData);
      setEmployees([...employees, response.data]);
      setIsAddDialogOpen(false);
      resetForm();

      toast.success('Création du profil', {
        description: `${response.data.fullName} a été ajouté avec succès.`
      });
    } catch (err) {
      toast.error("Erreur lors de l'ajout.");
    }
  };

  // UPDATE EMPLOYEE
  const handleUpdate = async () => {
    if (!validateForm()) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    if (!editingEmployee) return;
    try {
      await employeesApi.update(editingEmployee.id, formData);
      setEmployees(
        employees.map(emp =>
          emp.id === editingEmployee.id ? { ...emp, ...formData } : emp
        )
      );
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      resetForm();

      toast.success('Mise à jour du profil', {
        description: "Informations de l'employé mis à jour avec succès"
      });
    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  // DELETE EMPLOYEE
  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await employeesApi.delete(employeeToDelete.id);
      setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
      setIsDeleteDialogOpen(false);

      toast.success('Suppression du profil', {
        description: "Informations de l'employé supprimé avec succès"
      });
    } catch (err) {
      toast.error("Veuillez réessayer plus tard !");
    }
  };

  // OPEN EDIT DIALOG
  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditDialogOpen(true);
    setFormData({
      matricule: employee.matricule,
      fullName: employee.fullName,
      position: employee.position,
      address: employee.address,
      bankInfo: employee.bankInfo,
      dateOfBirth: formatDate(employee.dateOfBirth),
    });
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({
      matricule: '',
      fullName: '',
      position: '',
      address: '',
      bankInfo: '',
      dateOfBirth: '',
    });
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Employés</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les informations du personnel
          </p>
        </div>

        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Ajouter un employé
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un employé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* GRID */}
      {loading ? (
        <p className="text-center text-muted-foreground">Chargement...</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedEmployees.length === 0 ? (
              <Card className="p-12 col-span-full text-center">
                <p className="text-muted-foreground">Aucun employé trouvé</p>
              </Card>
            ) : (
              displayedEmployees.map((employee) => (
                <Card key={employee.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {employee?.fullName?.split(" ").filter(Boolean).slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("")}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(employee)}
                        className="border"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEmployeeToDelete(employee);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="border text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-md bg-muted px-2 py-1 rounded">
                      {employee.matricule}
                    </span>
                  </div>

                  <h4>{employee.fullName}</h4>
                  
                  <p className="text-sm text-muted-foreground">
                    {employee.position}
                  </p>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono text-md">Bank: {employee.bankInfo}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-5 h-5" />
                      <span className="text-md">{employee.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-5 h-5" />
                      <span className="text-md">
                        {new Date(employee.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>

              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}

      {/* DIALOGS */}
      <EmployeeFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          resetForm();
        }}
        onSubmit={handleAdd}
        title="Ajouter un Employé"
        formData={formData}
        onChange={handleFormChange}
      />

      <EmployeeFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingEmployee(null);
          resetForm();
        }}
        onSubmit={handleUpdate}
        title="Modifier l'Employé"
        formData={formData}
        onChange={handleFormChange}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm w-full mx-auto">
          <DialogHeader className='gap-4'>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer cet employé ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex-1"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>

            <Button
              variant="destructive"
              className="w-full sm:w-auto flex-1"
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}