import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { revenuesApi, usersApi } from '../../lib/api';
import { toast } from 'sonner';
import CryptoJS from "crypto-js";

export function RevenueDetails() {
  const { id } = useParams<{ id: string }>();
  const [revenue, setRevenue] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aggregatedByUser, setAggregatedByUser] = useState<any | null>(null);
  const [cpeValidatedByUser, setCpeValidatedByUser] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const fetchRevenue = async () => {
      try {
        const response = await revenuesApi.getById(id);
        setRevenue(response.data);

        if (response.data.aggregatedBy) {
          try {
            const userResponse = await usersApi.getById(response.data.aggregatedBy);
            setAggregatedByUser(userResponse.data);
          } catch (err) {
            console.error('Erreur récupération utilisateur:', err);
          }
        }

        if (response.data.cpeValidatedBy) {
          try {
            const cpeResponse = await usersApi.getById(response.data.cpeValidatedBy);
            setCpeValidatedByUser(cpeResponse.data);
          } catch (err) {
            console.error('Erreur récupération CPE:', err);
          }
        }

        await new Promise(res => setTimeout(res, 1000));
        
        const historyData = await revenuesApi.getHistory(response.data.chainId);
        setHistory(historyData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement de la recette');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [id]);

  const handleVerifyIntegrity = () => {
    if (!history || history.length === 0) {
      toast.error("Aucun historique disponible pour la vérification");
      return;
    }

    const entry = history[0];
    const record = entry.Record;

    const ledgerData = {
      taxpayerNumber: record.taxpayerNumber,
      fullName: record.fullName,
      taxType: record.taxType,
      montant: record.montant
    };

    const ledgerHash = CryptoJS.SHA256(JSON.stringify(ledgerData)).toString();

    const dbData = {
      taxpayerNumber: revenue.taxpayerNumber,
      fullName: revenue.fullName,
      taxType: revenue.taxType,
      montant: revenue.montant
    };
    const dbHash = CryptoJS.SHA256(JSON.stringify(dbData)).toString();

    if (ledgerHash === dbHash) {
      toast.success("Les données sont intactes : aucun signe de modification.");
    } else {
      toast.error("ALTÉRATION détectée : les données en base ont été modifiées.");
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
          <Link to="/revenues">
            <Button>Retour aux recettes</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!revenue) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="mb-2">Recette introuvable</h2>
          <p className="text-destructive mb-6">
            La recette demandée n'existe pas ou a été supprimée.
          </p>
          <Link to="/revenues">
            <Button>Retour aux recettes</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/revenues">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1>Détails de la Recette</h1>
          <p className="text-muted-foreground mt-1">
            Informations complètes et historique blockchain
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Informations de la Recette</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Numéro Contribuable</p>
              <p className="mt-1 font-medium text-base">{revenue.taxpayerNumber}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Nom Complet</p>
              <p className="mt-1 font-medium">{revenue.fullName}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Type d'impôt</p>
              <p className="mt-1 text-sm">{revenue.taxType}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Montant</p>
              <p className="mt-1 text-4xl font-medium text-primary">
                {revenue.montant.toLocaleString('fr-FR')} F CFA
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Date de création</p>
              <p className="mt-1">
                {new Date(revenue.createdAt).toLocaleDateString('fr-FR', {
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
              <p className="mt-1 font-medium">{revenue.user?.fullName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Soumission Blockchain</p>
              <p className="mt-1">
                {revenue.submit === "success" && (
                  <span className="text-primary text-lg font-semibold">Validé</span>
                )}
                {revenue.submit === "pending" && (
                  <span className="text-accent font-semibold">En attente</span>
                )}
                {revenue.submit === "failed" && (
                  <span className="text-destructive font-semibold">Échec</span>
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Informations d'Agrégation</h3>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Statut d'agrégation</p>
              <p className="mt-1">
                {revenue.aggregationStatus === "cpe_approved" && (
                  <span className="text-primary text-lg font-semibold">Validé par CPE</span>
                )}
                {revenue.aggregationStatus === "approved" && (
                  <span className="text-primary text-lg font-semibold">Agrégé par TR</span>
                )}
                {revenue.aggregationStatus === "waiting_approval" && (
                  <span className="text-accent font-semibold">En attente d'approbation</span>
                )}
                {revenue.aggregationStatus === "rejected" && (
                  <span className="text-destructive font-semibold">Rejeté par TR</span>
                )}
                {revenue.aggregationStatus === "cpe_rejected" && (
                  <span className="text-destructive font-semibold">Rejeté par CPE</span>
                )}
                {!revenue.aggregationStatus && (
                  <span className="text-muted-foreground">Non soumis</span>
                )}
              </p>
            </div>

            {aggregatedByUser && (
              <div>
                <p className="text-sm text-muted-foreground">Agrégé par :</p>
                <p className="mt-1 font-medium">{aggregatedByUser.fullName}</p>
                {revenue.aggregatedAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(revenue.aggregatedAt).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            )}

            {cpeValidatedByUser && (
              <div>
                <p className="text-sm text-muted-foreground">Agrégé par :</p>
                <p className="mt-1 font-medium">{cpeValidatedByUser.fullName}</p>
                {revenue.cpeValidatedAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(revenue.cpeValidatedAt).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <h3 className="mb-2 text-lg font-semibold">Informations Blockchain</h3>

          {revenue.submit === 'success' ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Block Number</p>
                <p className="font-mono text-sm">{revenue.blockNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono text-sm break-all">{revenue.txId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Block Hash</p>
                <p className="font-mono text-sm break-all">{revenue.blockHash}</p>
              </div>
              {revenue.aggregationTxId && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Aggregation Transaction ID (Trésorier Régional)</p>
                  <p className="font-mono text-sm break-all">{revenue.aggregationTxId}</p>
                </div>
              )}
              {revenue.cpeValidationTxId && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Validation Transaction ID (Comptable Principal d'Etat)</p>
                  <p className="font-mono text-sm break-all">{revenue.cpeValidationTxId}</p>
                </div>
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
                revenue.submit === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
              }`}
            >
              {revenue.submit === 'pending' && (
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-accent font-medium">
                    La transaction est en attente de validation sur la blockchain.
                  </p>
                </div>
              )}

              {revenue.submit === 'failed' && (
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
