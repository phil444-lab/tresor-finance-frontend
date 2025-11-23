import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { mockPayments, mockPaymentHistory } from '../../lib/mockData';
import { PaymentStatus } from '../../types';

export function PaymentDetails() {
  const { id } = useParams<{ id: string }>();
  const payment = mockPayments.find(p => p.id === id);
  const history = mockPaymentHistory[id || ''] || [];

  if (!payment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="mb-2">Paiement introuvable</h2>
          <p className="text-muted-foreground mb-6">
            Le paiement demandé n'existe pas ou a été supprimé.
          </p>
          <Link to="/payments">
            <Button>Retour aux paiements</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-accent text-accent-foreground text-lg px-4 py-1">En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-lg px-4 py-1">Échoué</Badge>;
    }
  };

  const getHistoryIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'validated':
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-accent" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/payments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1>Détails du Paiement</h1>
          <p className="text-muted-foreground mt-1">
            Informations complètes et historique blockchain
          </p>
        </div>
        {getStatusBadge(payment.status)}
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Information */}
        <Card className="p-6">
          <h3 className="mb-4">Informations du Paiement</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Matricule</p>
              <p>{payment.matricule}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nom Complet</p>
              <p>{payment.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Informations Bancaires</p>
              <p className="text-sm">{payment.bankInfo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Montant</p>
              <p className="text-2xl text-primary">
                {payment.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date de création</p>
              <p>
                {new Date(payment.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Créé par</p>
              <p>{payment.createdBy}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Soumis</p>
              <p>{payment.submit ? 'Oui' : 'Non'}</p>
            </div>
          </div>
        </Card>

        {/* Blockchain Information */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <h3 className="mb-4">Informations Blockchain</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Chain ID</p>
              <p className="font-mono text-sm break-all">{payment.chainId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
              <p className="font-mono text-sm break-all">{payment.txId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Block Number</p>
              <p className="font-mono text-sm">{payment.blockNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Block Hash</p>
              <p className="font-mono text-sm break-all">{payment.blockHash}</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Cette transaction est enregistrée de manière immuable sur Hyperledger Fabric,
              garantissant sa traçabilité et son intégrité.
            </p>
          </div>
        </Card>
      </div>

      {/* History Timeline */}
      <Card className="p-6">
        <h3 className="mb-6">Historique de la Transaction</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun historique disponible pour cette transaction
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((entry, index) => (
              <div key={entry.id} className="relative">
                {/* Timeline connector */}
                {index < history.length - 1 && (
                  <div className="absolute left-[14px] top-8 bottom-0 w-0.5 bg-border" />
                )}
                
                {/* Timeline entry */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-background border-2 border-border flex items-center justify-center">
                    {getHistoryIcon(entry.status)}
                  </div>
                  
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-1">
                      <h4>{entry.action}</h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Par : {entry.user}
                    </p>
                    <p className="text-sm">{entry.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
