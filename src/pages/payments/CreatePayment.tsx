import { useState } from 'react';
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
import { mockEmployees } from '../../lib/mockData';
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

  const handleMatriculeChange = (matricule: string) => {
    const employee = mockEmployees.find(emp => emp.matricule === matricule);
    
    if (employee) {
      setFormData({
        matricule: employee.matricule,
        fullName: employee.fullName,
        bankInfo: `BNP - IBAN: FR76 ${Math.random().toString().slice(2, 18)}`,
        montant: ''
      });
    } else {
      setFormData({
        matricule,
        fullName: '',
        bankInfo: '',
        montant: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Paiement créé avec succès', {
        description: `Le paiement pour ${formData.fullName} a été enregistré.`
      });
      navigate('/payments');
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-2xl">
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

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Matricule Select */}
            <div className="space-y-2">
              <Label htmlFor="matricule">
                Matricule <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.matricule} onValueChange={handleMatriculeChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un matricule" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.matricule}>
                      {emp.matricule} - {emp.fullName}
                    </SelectItem>
                  ))}
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
                Montant (€) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="montant"
                type="number"
                step="0.01"
                placeholder="3500.50"
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
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                {loading ? 'Enregistrement...' : 'Créer le paiement'}
              </Button>
              <Link to="/payments" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}