import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { paymentsApi } from '../../lib/api';
import { PaymentStatus } from '../../types';
import { toast } from 'sonner';
import CryptoJS from "crypto-js";

export function PaymentDetails() {
  const { id } = useParams<{ id: string }>();

  const [payment, setPayment] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const fetchPayment = async () => {
      try {
        const response = await paymentsApi.getById(id);
        setPayment(response.data);

        await new Promise(res => setTimeout(res, 1000));
        
        const historyData = await paymentsApi.getHistory(response.data.chainId);
        setHistory(historyData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du paiement');
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id]);

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-accent text-accent-foreground text-lg px-4 py-1">En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-lg px-4 py-1">Échoué</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="mb-2">Erreur</h2>
          <p className="text-destructive mb-6">{error}</p>
          <Link to="/payments">
            <Button>Retour aux paiements</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="mb-2">Paiement introuvable</h2>
          <p className="text-destructive mb-6">
            Le paiement demandé n'existe pas ou a été supprimé.
          </p>
          <Link to="/payments">
            <Button>Retour aux paiements</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleVerifyIntegrity = () => {
    if (!history || history.length === 0) {
      toast.error("Aucun historique disponible pour la vérification");
      return;
    }

    const entry = history[0];
    const record = entry.Record;

    const ledgerData = {
      matricule: record.matricule,
      fullName: record.fullName,
      bankInfo: record.bankInfo,
      montant: record.montant
    };

    const ledgerHash = CryptoJS.SHA256(JSON.stringify(ledgerData)).toString();

    const dbData = {
      matricule: payment.matricule,
      fullName: payment.fullName,
      bankInfo: payment.bankInfo,
      montant: payment.montant
    };
    const dbHash = CryptoJS.SHA256(JSON.stringify(dbData)).toString();

    if (ledgerHash === dbHash) {
      toast.success("Les données sont intactes : aucun signe de modification.");
    } else {
      toast.error("ALTÉRATION détectée : les données en base ont été modifiées.");
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
          <h3 className="mb-4 text-xl font-semibold">Informations du Paiement</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-muted-foreground">Matricule</p>
              <p className="mt-1 font-medium text-base">{payment.matricule}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Nom Complet</p>
              <p className="mt-1 font-medium">{payment.fullName}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Informations Bancaires</p>
              <p className="mt-1 text-sm">{payment.bankInfo}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Montant</p>
              <p className="mt-1 text-4xl font-medium text-primary">
                { payment.montant.toLocaleString('fr-FR') } F CFA
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Date de création</p>
              <p className="mt-1">
                {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Créé par</p>
              <p className="mt-1 font-medium">{payment.user?.fullName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Soumission Blockchain</p>
              <p className="mt-1">
                {payment.submit === "success" && (
                  <span className="text-primary text-lg font-semibold">Validé</span>
                )}
                {payment.submit === "pending" && (
                  <span className="text-accent font-semibold">En attente</span>
                )}
                {payment.submit === "failed" && (
                  <span className="text-destructive font-semibold">Échec</span>
                )}
              </p>
            </div>

          </div>
        </Card>

        {/* Blockchain Information */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <h3 className="mb-2 text-lg font-semibold">Informations Blockchain</h3>

          {payment.submit === 'success' ? (
            <div className="space-y-4">
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

              <Button className="w-full text-lg p-6" onClick={handleVerifyIntegrity}>
                Vérifier l'intégrité des données
              </Button>

              <div className="mt-2 p-4 bg-white/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Cette transaction est enregistrée de manière immuable sur Hyperledger Fabric,
                  garantissant sa traçabilité et son intégrité.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`m-8 p-8 ${
                payment.submit === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
              }`}
            >
              {payment.submit === 'pending' && (
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-accent font-medium">
                    La transaction est en attente de validation sur la blockchain.
                  </p>
                </div>
              )}

              {payment.submit === 'failed' && (
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <p className="text-destructive font-medium">
                    La transaction a échoué lors de la soumission sur la blockchain.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
