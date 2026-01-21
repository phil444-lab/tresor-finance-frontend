import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

import { ArrowLeft, AlertCircle } from 'lucide-react';
import { paymentsApi, usersApi } from '../../lib/api';
import { toast } from 'sonner';
import CryptoJS from "crypto-js";

export function PaymentDetails() {
  const { id } = useParams<{ id: string }>();

  const [payment, setPayment] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aggregatedByUser, setAggregatedByUser] = useState<any | null>(null);
  const [cpeValidatedByUser, setCpeValidatedByUser] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const fetchPayment = async () => {
      try {
        const response = await paymentsApi.getById(id);
        setPayment(response.data);

        // Récupérer les infos du trésorier régional qui a agrégé
        if (response.data.aggregatedBy) {
          try {
            const userResponse = await usersApi.getById(response.data.aggregatedBy);
            setAggregatedByUser(userResponse.data);
          } catch (err) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', err);
          }
        }

        // Récupérer les infos du CPE qui a validé
        if (response.data.cpeValidatedBy) {
          try {
            const cpeResponse = await usersApi.getById(response.data.cpeValidatedBy);
            setCpeValidatedByUser(cpeResponse.data);
          } catch (err) {
            console.error('Erreur lors de la récupération du CPE:', err);
          }
        }

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

    let allValid = true;
    const issues = [];

    // 1. Vérifier la transaction initiale
    const initialEntry = history[0];
    const initialRecord = initialEntry.Record;

    const initialLedgerData = {
      matricule: initialRecord.matricule,
      fullName: initialRecord.fullName,
      bankInfo: initialRecord.bankInfo,
      montant: initialRecord.montant
    };
    const initialLedgerHash = CryptoJS.SHA256(JSON.stringify(initialLedgerData)).toString();

    const initialDbData = {
      matricule: payment.matricule,
      fullName: payment.fullName,
      bankInfo: payment.bankInfo,
      montant: payment.montant
    };
    const initialDbHash = CryptoJS.SHA256(JSON.stringify(initialDbData)).toString();

    if (initialLedgerHash !== initialDbHash) {
      allValid = false;
      issues.push("Données initiales");
    }

    // 2. Vérifier l'agrégation TR
    const trAggregation = history.find(entry => 
      entry.Record.aggregationStatus === 'approved' || entry.Record.aggregationStatus === 'rejected'
    );

    if (trAggregation && payment.aggregatedBy) {
      const trLedgerData = {
        aggregationStatus: trAggregation.Record.aggregationStatus,
        aggregatedBy: trAggregation.Record.aggregatedBy
      };
      const trLedgerHash = CryptoJS.SHA256(JSON.stringify(trLedgerData)).toString();

      const trDbData = {
        aggregationStatus: payment.aggregationStatus === 'cpe_approved' || payment.aggregationStatus === 'cpe_rejected' 
          ? 'approved' 
          : payment.aggregationStatus,
        aggregatedBy: payment.aggregatedBy
      };
      const trDbHash = CryptoJS.SHA256(JSON.stringify(trDbData)).toString();

      if (trLedgerHash !== trDbHash) {
        allValid = false;
        issues.push("Agrégation TR");
      }
    }

    // 3. Vérifier la validation CPE
    const cpeValidation = history.find(entry => 
      entry.Record.aggregationStatus === 'cpe_approved' || entry.Record.aggregationStatus === 'cpe_rejected'
    );

    if (cpeValidation && payment.cpeValidatedBy) {
      const cpeLedgerData = {
        aggregationStatus: cpeValidation.Record.aggregationStatus,
        cpeValidatedBy: cpeValidation.Record.cpeValidatedBy
      };
      const cpeLedgerHash = CryptoJS.SHA256(JSON.stringify(cpeLedgerData)).toString();

      const cpeDbData = {
        aggregationStatus: payment.aggregationStatus,
        cpeValidatedBy: payment.cpeValidatedBy
      };
      const cpeDbHash = CryptoJS.SHA256(JSON.stringify(cpeDbData)).toString();

      if (cpeLedgerHash !== cpeDbHash) {
        allValid = false;
        issues.push("Validation CPE");
      }
    }

    if (allValid) {
      toast.success("Toutes les données sont intactes : aucun signe de modification.");
    } else {
      toast.error(`ALTÉRATION détectée : ${issues.join(', ')} modifié(es)`);
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
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Information */}
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Informations du Paiement</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-muted-foreground">Code Bénéficiaire</p>
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

        {/* Aggregation Information */}
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Informations d'Agrégation</h3>

          <div className="grid grid-cols-1 gap-6">

            <div>
              <p className="text-sm text-muted-foreground">Statut d'agrégation</p>
              <p className="mt-1">
                {payment.aggregationStatus === "cpe_approved" && (
                  <span className="text-primary text-lg font-semibold">Validé par CPE</span>
                )}
                {payment.aggregationStatus === "approved" && (
                  <span className="text-primary text-lg font-semibold">Agrégé par TR</span>
                )}
                {payment.aggregationStatus === "waiting_approval" && (
                  <span className="text-accent font-semibold">En attente d'approbation</span>
                )}
                {payment.aggregationStatus === "rejected" && (
                  <span className="text-destructive font-semibold">Rejeté par TR</span>
                )}
                {payment.aggregationStatus === "cpe_rejected" && (
                  <span className="text-destructive font-semibold">Rejeté par CPE</span>
                )}
                {!payment.aggregationStatus && (
                  <span className="text-muted-foreground">Non soumis</span>
                )}
              </p>
            </div>

            {aggregatedByUser && (
              <div>
                <p className="text-sm text-muted-foreground">Agrégé par :</p>
                <p className="mt-1 font-medium">{aggregatedByUser.fullName}</p>
                {payment.aggregatedAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(payment.aggregatedAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            )}

            {cpeValidatedByUser && (
              <div>
                <p className="text-sm text-muted-foreground">Agrégé par :</p>
                <p className="mt-1 font-medium">{cpeValidatedByUser.fullName}</p>
                {payment.cpeValidatedAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(payment.cpeValidatedAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            )}

          </div>
        </Card>
      </div>

      {/* Blockchain Information */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <h3 className="mb-2 text-lg font-semibold">Informations Blockchain</h3>

          {payment.submit === 'success' ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Block Number</p>
                <p className="font-mono text-sm">{payment.blockNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono text-sm break-all">{payment.txId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Block Hash</p>
                <p className="font-mono text-sm break-all">{payment.blockHash}</p>
              </div>
              {payment.aggregationTxId && (
                <>
                  {payment.aggregationBlockNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Aggregation Block Number</p>
                      <p className="font-mono text-sm">{payment.aggregationBlockNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Aggregation Transaction ID (Trésorier Régional)</p>
                    <p className="font-mono text-sm break-all">{payment.aggregationTxId}</p>
                  </div>
                  {payment.aggregationBlockHash && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Aggregation Block Hash</p>
                      <p className="font-mono text-sm break-all">{payment.aggregationBlockHash}</p>
                    </div>
                  )}
                </>
              )}
              {payment.cpeValidationTxId && (
                <>
                  {payment.cpeValidationBlockNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Validation Block Number</p>
                      <p className="font-mono text-sm">{payment.cpeValidationBlockNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Validation Transaction ID (Comptable Principal d'Etat)</p>
                    <p className="font-mono text-sm break-all">{payment.cpeValidationTxId}</p>
                  </div>
                  {payment.cpeValidationBlockHash && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Validation Block Hash</p>
                      <p className="font-mono text-sm break-all">{payment.cpeValidationBlockHash}</p>
                    </div>
                  )}
                </>
              )}

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
  );
}
