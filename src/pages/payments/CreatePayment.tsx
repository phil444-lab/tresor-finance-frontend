import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { employeesApi, paymentsApi } from '../../lib/api';
import { toast } from 'sonner';

export function CreatePayment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    matricule: '',
    fullName: '',
    bankInfo: '',
    montant: ''
  });

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employeesApi.getAll() as any;
        
        setEmployees(res.data || []);
      } catch (error: any) {
        toast.error("Erreur lors du chargement des employés");
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleMatriculeChange = async (matricule: string) => {
    if (!matricule) return;

    try {
      const res = await employeesApi.getByMatricule(matricule) as any;
      const employee = res.data;

      setFormData({
        matricule: employee.matricule,
        fullName: employee.fullName,
        bankInfo: employee.bankInfo,
        montant: '',
      });
    } catch (error) {
      toast.error("Employé introuvable pour ce matricule");
      setFormData({
        matricule,
        fullName: '',
        bankInfo: '',
        montant: '',
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Vérification côté client
    if (
      !formData.matricule ||
      !formData.fullName ||
      !formData.bankInfo ||
      !formData.montant ||
      parseFloat(formData.montant) <= 0
    ) {
      toast.error("Veuillez remplir tous les champs correctement.");
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        matricule: formData.matricule,
        fullName: formData.fullName,
        bankInfo: formData.bankInfo,
        montant: Number(formData.montant),
      };

      const res = await paymentsApi.create(payload);

      toast.success("Paiement créé avec succès", {
        description: res.message
      });

      navigate('/payments');
    } catch (error: any) {
      toast.error("Erreur : " + (error.message || "Impossible de créer le paiement"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 min-h-[calc(100vh-8rem)] px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/payments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1>Créer un Paiement</h1>
          <p className="text-muted-foreground mt-1">
            Enregistrez un nouveau paiement dans le système
          </p>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Matricule Select */}
            <div className="space-y-2">
              <Label htmlFor="matricule">
                Matricule <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.matricule} onValueChange={handleMatriculeChange} required>
                <SelectTrigger className="w-full border border-gray-300 rounded-md">
                  <SelectValue placeholder="Sélectionnez un matricule" />
                </SelectTrigger>

                <SelectContent>
                  {loadingEmployees ? (
                    <div className="p-2 text-sm text-muted-foreground">Chargement...</div>
                  ) : employees.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">Aucun employé trouvé</div>
                  ) : (
                    employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.matricule}>
                        {emp.matricule} - {emp.fullName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Sélectionnez le matricule de l'employé bénéficiaire
              </p>
            </div>

            {/* Full Name (auto-filled) */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Nom Complet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Sélectionnez d'abord un matricule"
                value={formData.fullName}
                readOnly
                className="bg-muted/50"
                required
              />
            </div>

            {/* Bank Info (auto-filled) */}
            <div className="space-y-2">
              <Label htmlFor="bankInfo">
                Informations Bancaires <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bankInfo"
                placeholder="Sélectionnez d'abord un matricule"
                value={formData.bankInfo}
                readOnly
                className="bg-muted/50"
                required
              />
              <p className="text-sm text-muted-foreground">
                Informations bancaires automatiquement remplies
              </p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="montant">
                Montant (F CFA) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="montant"
                type="number"
                step="1"
                placeholder="100000"
                value={formData.montant}
                onChange={(e) => handleChange('montant', e.target.value)}
                required
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <h4 className="mb-2 text-accent-foreground">Information</h4>
              <p className="text-sm text-muted-foreground">
                Ce paiement sera enregistré sur la blockchain Hyperledger Fabric 
                et nécessitera une validation avant traitement.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link to="/payments" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>

              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                {loading ? 'Enregistrement...' : 'Créer le paiement'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}