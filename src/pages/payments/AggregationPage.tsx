import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { aggregationApi, cpeApi, PendingPayment } from '../../lib/api';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { getCurrentUser } from '../../lib/auth';

export function AggregationPage() {
  const user = getCurrentUser();
  const isCpe = user?.role.split('_')[0] === 'CpeMSP';
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [pendingRevenues, setPendingRevenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [selectedRevenue, setSelectedRevenue] = useState<any | null>(null);
  const [selectedAction, setSelectedAction] = useState<'approved' | 'rejected' | 'cpe_approved' | 'cpe_rejected'>('approved');
  const [dialogType, setDialogType] = useState<'payment' | 'revenue'>('payment');
  const [currentPagePayments, setCurrentPagePayments] = useState(1);
  const [currentPageRevenues, setCurrentPageRevenues] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadPendingPayments();
    loadPendingRevenues();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const response = isCpe 
        ? await cpeApi.getPendingPayments()
        : await aggregationApi.getPendingPayments();
      setPendingPayments(response.data);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRevenues = async () => {
    try {
      const response = isCpe 
        ? await cpeApi.getPendingRevenues()
        : await aggregationApi.getPendingRevenues();
      setPendingRevenues(response.data);
    } catch (error) {
      console.error('Erreur chargement recettes:', error);
    }
  };

  const openDialog = (item: PendingPayment | any, action: 'approved' | 'rejected' | 'cpe_approved' | 'cpe_rejected', type: 'payment' | 'revenue') => {
    if (type === 'payment') {
      setSelectedPayment(item);
      setSelectedRevenue(null);
    } else {
      setSelectedRevenue(item);
      setSelectedPayment(null);
    }
    setSelectedAction(action);
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedPayment && !selectedRevenue) return;

    try {
      setProcessing(true);
      if (dialogType === 'payment') {
        if (isCpe) {
          await cpeApi.validatePayment(selectedPayment!.id, selectedAction as 'cpe_approved' | 'cpe_rejected');
        } else {
          await aggregationApi.approvePayment(selectedPayment!.id, selectedAction as 'approved' | 'rejected');
        }
        toast.success(
          selectedAction === 'approved' || selectedAction === 'cpe_approved' ? 'Paiement validé' : 'Paiement rejeté',
          { description: `Le paiement pour ${selectedPayment!.fullName} a été ${selectedAction === 'approved' || selectedAction === 'cpe_approved' ? 'validé' : 'rejeté'}` }
        );
        await loadPendingPayments();
      } else {
        if (isCpe) {
          await cpeApi.validateRevenue(selectedRevenue!.id, selectedAction as 'cpe_approved' | 'cpe_rejected');
        } else {
          await aggregationApi.approveRevenue(selectedRevenue!.id, selectedAction as 'approved' | 'rejected');
        }
        toast.success(
          selectedAction === 'approved' || selectedAction === 'cpe_approved' ? 'Recette validée' : 'Recette rejetée',
          { description: `La recette pour ${selectedRevenue!.fullName} a été ${selectedAction === 'approved' || selectedAction === 'cpe_approved' ? 'validée' : 'rejetée'}` }
        );
        await loadPendingRevenues();
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Erreur action:', error);
      
      let errorMessage = `Impossible de traiter ${dialogType === 'payment' ? 'le paiement' : 'la recette'}`;
      if (error instanceof Error && error.message.includes('Transaction failed')) {
        errorMessage = 'Erreur blockchain : Le réseau blockchain n\'est pas disponible';
      } else if (error instanceof Error && error.message.includes('failed to endorse')) {
        errorMessage = 'Erreur d\'endorsement blockchain : Vérifiez le réseau';
      }
      
      toast.error('Erreur', { description: errorMessage });
    } finally {
      setProcessing(false);
    }
  };

  // Pagination pour les paiements
  const totalPagesPayments = Math.ceil(pendingPayments.length / itemsPerPage);
  const paginatedPayments = pendingPayments.slice(
    (currentPagePayments - 1) * itemsPerPage,
    currentPagePayments * itemsPerPage
  );

  // Pagination pour les recettes
  const totalPagesRevenues = Math.ceil(pendingRevenues.length / itemsPerPage);
  const paginatedRevenues = pendingRevenues.slice(
    (currentPageRevenues - 1) * itemsPerPage,
    currentPageRevenues * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isCpe ? 'Validation des Agrégations' : 'Agrégation des Opérations'}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {pendingPayments.length + pendingRevenues.length} opération(s) en attente
        </div>
      </div>

      {/* Tableau des Paiements */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Paiements</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isCpe ? 'Aucun paiement agrégé en attente de validation' : 'Aucun paiement en attente d\'approbation'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Employé</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>{isCpe ? 'Trésorier Régional' : 'Trésorier'}</TableHead>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.matricule}</TableCell>
                  <TableCell>{payment.fullName}</TableCell>
                  <TableCell>{ payment.montant.toLocaleString('fr-FR') } F CFA</TableCell>
                  <TableCell>{isCpe ? payment.aggregator?.fullName : payment.user.fullName}</TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openDialog(payment, isCpe ? 'cpe_approved' : 'approved', 'payment')}
                        disabled={processing}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDialog(payment, isCpe ? 'cpe_rejected' : 'rejected', 'payment')}
                        disabled={processing}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination Paiements */}
        {pendingPayments.length > itemsPerPage && (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentPagePayments === 1}
              onClick={() => setCurrentPagePayments(prev => Math.max(prev - 1, 1))}
            >
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPagePayments} sur {totalPagesPayments}
            </span>
            <Button
              variant="outline"
              disabled={currentPagePayments === totalPagesPayments}
              onClick={() => setCurrentPagePayments(prev => Math.min(prev + 1, totalPagesPayments))}
            >
              Suivant
            </Button>
          </div>
        )}
      </Card>

      {/* Tableau des Recettes */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recettes</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : pendingRevenues.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isCpe ? 'Aucune recette agrégée en attente de validation' : 'Aucune recette en attente d\'approbation'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Contribuable</TableHead>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Type d'impôt</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>{isCpe ? 'Trésorier Régional' : 'Trésorier'}</TableHead>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRevenues.map((revenue) => (
                <TableRow key={revenue.id}>
                  <TableCell>{revenue.taxpayerNumber}</TableCell>
                  <TableCell>{revenue.fullName}</TableCell>
                  <TableCell>{revenue.taxType}</TableCell>
                  <TableCell>{ revenue.montant.toLocaleString('fr-FR') } F CFA</TableCell>
                  <TableCell>{isCpe ? revenue.aggregator?.fullName : revenue.user.fullName}</TableCell>
                  <TableCell>{new Date(revenue.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openDialog(revenue, isCpe ? 'cpe_approved' : 'approved', 'revenue')}
                        disabled={processing}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDialog(revenue, isCpe ? 'cpe_rejected' : 'rejected', 'revenue')}
                        disabled={processing}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination Recettes */}
        {pendingRevenues.length > itemsPerPage && (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentPageRevenues === 1}
              onClick={() => setCurrentPageRevenues(prev => Math.max(prev - 1, 1))}
            >
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPageRevenues} sur {totalPagesRevenues}
            </span>
            <Button
              variant="outline"
              disabled={currentPageRevenues === totalPagesRevenues}
              onClick={() => setCurrentPageRevenues(prev => Math.min(prev + 1, totalPagesRevenues))}
            >
              Suivant
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm w-full mx-auto">
          <DialogHeader className="gap-4">
            <DialogTitle>
              {(selectedAction === 'approved' || selectedAction === 'cpe_approved') ? `Valider ${dialogType === 'payment' ? 'le paiement' : 'la recette'}` : `Rejeter ${dialogType === 'payment' ? 'le paiement' : 'la recette'}`}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'payment' ? (
                (selectedAction === 'approved' || selectedAction === 'cpe_approved')
                  ? `Voulez-vous vraiment valider le paiement de ${selectedPayment?.montant.toLocaleString('fr-FR')} F CFA pour ${selectedPayment?.fullName} ?`
                  : `Voulez-vous vraiment rejeter le paiement de ${selectedPayment?.montant.toLocaleString('fr-FR')} F CFA pour ${selectedPayment?.fullName} ?`
              ) : (
                (selectedAction === 'approved' || selectedAction === 'cpe_approved')
                  ? `Voulez-vous vraiment valider la recette de ${selectedRevenue?.montant.toLocaleString('fr-FR')} F CFA pour ${selectedRevenue?.fullName} ?`
                  : `Voulez-vous vraiment rejeter la recette de ${selectedRevenue?.montant.toLocaleString('fr-FR')} F CFA pour ${selectedRevenue?.fullName} ?`
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex-1"
              onClick={() => setDialogOpen(false)}
              disabled={processing}
            >
              Annuler
            </Button>

            <Button
              variant={(selectedAction === 'approved' || selectedAction === 'cpe_approved') ? 'default' : 'destructive'}
              className="w-full sm:w-auto flex-1"
              onClick={handleConfirm}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : ((selectedAction === 'approved' || selectedAction === 'cpe_approved') ? 'Valider' : 'Rejeter')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
