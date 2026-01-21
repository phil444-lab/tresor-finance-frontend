import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { revenuesApi } from '../../lib/api';
import { toast } from 'sonner';

export function CreateRevenue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fileNumber: '',
    beneficiary: '',
    serviceType: '',
    montant: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fileNumber || !formData.beneficiary || !formData.serviceType || !formData.montant || parseFloat(formData.montant) <= 0) {
      toast.error('Veuillez remplir tous les champs correctement');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        supplierNumber: formData.fileNumber,
        fullName: formData.beneficiary,
        serviceType: formData.serviceType,
        montant: Number(formData.montant)
      };
      
      const res = await revenuesApi.create(payload);
      
      toast.success('Recette créée avec succès', {
        description: res.message
      });
      navigate('/revenues');
    } catch (error: any) {
      toast.error('Erreur : ' + (error.message || 'Impossible de créer la recette'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 min-h-[calc(100vh-8rem)] px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/revenues">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1>Créer une Recette</h1>
          <p className="text-muted-foreground mt-1">
            Enregistrez une nouvelle recette de prestation dans le système
          </p>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fileNumber">
                Numéro de Dossier <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fileNumber"
                placeholder="Ex: DOSS-2025-001"
                value={formData.fileNumber}
                onChange={(e) => handleChange('fileNumber', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Identifiant unique de la transaction (ex: PASS-2025-001)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary">
                Bénéficiaire <span className="text-destructive">*</span>
              </Label>
              <Input
                id="beneficiary"
                placeholder="Ex: Jean Dupont"
                value={formData.beneficiary}
                onChange={(e) => handleChange('beneficiary', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Citoyen/client qui paie pour le service
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">
                Type de prestation <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.serviceType} onValueChange={(value: string) => handleChange('serviceType', value)} required>
                <SelectTrigger className="w-full border border-gray-300 rounded-md">
                  <SelectValue placeholder="Sélectionnez le type de prestation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Délivrance passeport">Délivrance passeport</SelectItem>
                  <SelectItem value="Carte d'identité">Carte d'identité</SelectItem>
                  <SelectItem value="Extrait d'acte">Extrait d'acte</SelectItem>
                  <SelectItem value="Légalisation document">Légalisation document</SelectItem>
                  <SelectItem value="Certification">Certification</SelectItem>
                  <SelectItem value="Frais de dossier">Frais de dossier</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Catégorie de la prestation fournie
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant">
                Montant (F CFA) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="montant"
                type="number"
                step="1"
                placeholder="50000"
                value={formData.montant}
                onChange={(e) => handleChange('montant', e.target.value)}
                required
              />
            </div>

            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <h4 className="mb-2 text-accent-foreground">Information</h4>
              <p className="text-sm text-muted-foreground">
                Cette recette sera enregistrée sur la blockchain Hyperledger Fabric 
                et nécessitera une validation avant traitement.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Link to="/revenues" className="flex-1">
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
                {loading ? 'Enregistrement...' : 'Créer la recette'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
