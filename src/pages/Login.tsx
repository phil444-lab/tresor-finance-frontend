import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = login(fullName, password);
      
      if (user) {
        toast.success('Connexion réussie', {
          description: `Bienvenue ${user.fullName}`
        });
        // Redirect based on role
        navigate('/dashboard');
      } else {
        setError('Nom complet ou mot de passe incorrect');
        toast.error('Échec de connexion', {
          description: 'Vérifiez vos identifiants'
        });
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      toast.error('Erreur', {
        description: 'Une erreur est survenue'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="mb-2">Trésor Public</h1>
            <p className="text-muted-foreground">
              Gestion Sécurisée des Paiements
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom Complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-center text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm">
            <p className="mb-2">Comptes de démonstration :</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Jean Dupont (TMSP)</li>
              <li>• Marie Martin (TrRegionMSP)</li>
              <li>• Pierre Durand (CpeMSP)</li>
              <li className="mt-2">Mot de passe : password123</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1430276084627-789fe55a6da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cmUlMjBwYXltZW50JTIwdGVjaG5vbG9neSUyMGFic3RyYWN0fGVufDF8fHx8MTc2MzkyOTQzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Security"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center text-white p-8 max-w-lg">
          <h2 className="mb-4">Plateforme Sécurisée</h2>
          <p className="text-lg opacity-90">
            Gestion des paiements du Trésor Public avec traçabilité blockchain via Hyperledger Fabric
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-sm">Sécurisé</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-1">⛓️</div>
              <p className="text-sm">Blockchain</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-1">✓</div>
              <p className="text-sm">Traçable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}