import { Card } from '../../components/ui/card';
import { Construction } from 'lucide-react';

export function TrRegionMSPDashboard() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-12 text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <Construction className="w-10 h-10 text-accent" />
        </div>
        <h2 className="mb-3">Dashboard TrRegionMSP</h2>
        <p className="text-muted-foreground">
          Les fonctionnalités spécifiques pour ce rôle sont en cours de développement.
        </p>
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">Fonctionnalités à venir :</p>
          <ul className="mt-2 text-sm text-muted-foreground space-y-1">
            <li>• Gestion régionale des paiements</li>
            <li>• Rapports régionaux</li>
            <li>• Validation des transactions</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
