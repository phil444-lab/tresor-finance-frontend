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
    taxpayerNumber: '',
    fullName: '',
    taxType: '',
    montant: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taxpayerNumber || !formData.fullName || !formData.taxType || !formData.montant || parseFloat(formData.montant) <= 0) {
      toast.error('Veuillez remplir tous les champs correctement');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        taxpayerNumber: formData.taxpayerNumber,
        fullName: formData.fullName,
        taxType: formData.taxType,
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
            Enregistrez une nouvelle recette d'impôt dans le système
          </p>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="taxpayerNumber">
                Numéro Contribuable <span className="text-destructive">*</span>
              </Label>
              <Input
                id="taxpayerNumber"
                placeholder="Ex: CONT001"
                value={formData.taxpayerNumber}
                onChange={(e) => handleChange('taxpayerNumber', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Numéro d'identification du contribuable
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Nom Complet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Ex: Jean Dupont"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxType">
                Type d'impôt <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.taxType} onValueChange={(value: string) => handleChange('taxType', value)} required>
                <SelectTrigger className="w-full border border-gray-300 rounded-md">
                  <SelectValue placeholder="Sélectionnez le type d'impôt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Impôt sur le revenu">Impôt sur le revenu</SelectItem>
                  <SelectItem value="Impôt foncier">Impôt foncier</SelectItem>
                  <SelectItem value="TVA">TVA</SelectItem>
                  <SelectItem value="Taxe professionnelle">Taxe professionnelle</SelectItem>
                  <SelectItem value="Impôt sur les sociétés">Impôt sur les sociétés</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Catégorie de l'impôt perçu
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
