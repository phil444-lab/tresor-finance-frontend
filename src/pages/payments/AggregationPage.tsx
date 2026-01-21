import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { InputDate } from '../../components/ui/input-date';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { aggregationApi, cpeApi, PendingPayment } from '../../lib/api';
import { CheckCircle, XCircle, Clock, Loader2, Search } from 'lucide-react';
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
  const [searchPayments, setSearchPayments] = useState('');
  const [searchRevenues, setSearchRevenues] = useState('');
  const [dateFilterPayments, setDateFilterPayments] = useState('');
  const [dateFilterRevenues, setDateFilterRevenues] = useState('');
  const [treasurerFilterPayments, setTreasurerFilterPayments] = useState('all');
  const [treasurerFilterRevenues, setTreasurerFilterRevenues] = useState('all');
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [selectedRevenues, setSelectedRevenues] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approved' | 'rejected' | 'cpe_approved' | 'cpe_rejected'>('approved');
  const [bulkType, setBulkType] = useState<'payment' | 'revenue'>('payment');
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

  const handleBulkAction = async () => {
    setBulkDialogOpen(false);
    try {
      setProcessing(true);
      const items = bulkType === 'payment' ? Array.from(selectedPayments) : Array.from(selectedRevenues);
      
      for (const id of items) {
        if (bulkType === 'payment') {
          if (isCpe) {
            await cpeApi.validatePayment(id, bulkAction as 'cpe_approved' | 'cpe_rejected');
          } else {
            await aggregationApi.approvePayment(id, bulkAction as 'approved' | 'rejected');
          }
        } else {
          if (isCpe) {
            await cpeApi.validateRevenue(id, bulkAction as 'cpe_approved' | 'cpe_rejected');
          } else {
            await aggregationApi.approveRevenue(id, bulkAction as 'approved' | 'rejected');
          }
        }
      }
      
      toast.success(`${items.length} ${bulkType === 'payment' ? 'paiement(s)' : 'recette(s)'} ${bulkAction.includes('approved') ? 'validé(s)' : 'rejeté(s)'}`);
      
      if (bulkType === 'payment') {
        setSelectedPayments(new Set());
        await loadPendingPayments();
      } else {
        setSelectedRevenues(new Set());
        await loadPendingRevenues();
      }
    } catch (error) {
      console.error('Erreur action groupée:', error);
      toast.error('Erreur lors de l\'action groupée');
    } finally {
      setProcessing(false);
    }
  };

  const toggleSelection = (id: string, type: 'payment' | 'revenue') => {
    if (type === 'payment') {
      setSelectedPayments(prev => {
        const newSet = new Set(prev);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        return newSet;
      });
    } else {
      setSelectedRevenues(prev => {
        const newSet = new Set(prev);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        return newSet;
      });
    }
  };

  const toggleSelectAll = (type: 'payment' | 'revenue') => {
    if (type === 'payment') {
      if (selectedPayments.size === paginatedPayments.length) {
        setSelectedPayments(new Set());
      } else {
        setSelectedPayments(new Set(paginatedPayments.map(p => p.id)));
      }
    } else {
      if (selectedRevenues.size === paginatedRevenues.length) {
        setSelectedRevenues(new Set());
      } else {
        setSelectedRevenues(new Set(paginatedRevenues.map(r => r.id)));
      }
    }
  };

  // Pagination pour les paiements
  const filteredPayments = pendingPayments.filter(p => {
    const matchesSearch = p.matricule.toLowerCase().includes(searchPayments.toLowerCase()) ||
                         p.fullName.toLowerCase().includes(searchPayments.toLowerCase());
    const matchesDate = !dateFilterPayments || p.createdAt.startsWith(dateFilterPayments);
    const matchesTreasurer = treasurerFilterPayments === 'all' || 
                            (isCpe ? p.aggregator?.id === treasurerFilterPayments : p.user.id === treasurerFilterPayments);
    return matchesSearch && matchesDate && matchesTreasurer;
  });
  const totalPagesPayments = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPagePayments - 1) * itemsPerPage,
    currentPagePayments * itemsPerPage
  );

  // Pagination pour les recettes
  const filteredRevenues = pendingRevenues.filter(r => {
    const matchesSearch = r.supplierNumber.toLowerCase().includes(searchRevenues.toLowerCase()) ||
                         r.fullName.toLowerCase().includes(searchRevenues.toLowerCase());
    const matchesDate = !dateFilterRevenues || r.createdAt.startsWith(dateFilterRevenues);
    const matchesTreasurer = treasurerFilterRevenues === 'all' || 
                            (isCpe ? r.aggregator?.id === treasurerFilterRevenues : r.user.id === treasurerFilterRevenues);
    return matchesSearch && matchesDate && matchesTreasurer;
  });
  const totalPagesRevenues = Math.ceil(filteredRevenues.length / itemsPerPage);
  const paginatedRevenues = filteredRevenues.slice(
    (currentPageRevenues - 1) * itemsPerPage,
    currentPageRevenues * itemsPerPage
  );

  // Listes uniques de trésoriers
  const uniqueTreasurersPayments = Array.from(new Set(pendingPayments.map(p => 
    isCpe ? p.aggregator?.id : p.user.id
  ))).map(id => {
    const item = pendingPayments.find(p => (isCpe ? p.aggregator?.id : p.user.id) === id);
    return { id, name: isCpe ? item?.aggregator?.fullName : item?.user.fullName };
  }).filter(t => t.id);

  const uniqueTreasurersRevenues = Array.from(new Set(pendingRevenues.map(r => 
    isCpe ? r.aggregator?.id : r.user.id
  ))).map(id => {
    const item = pendingRevenues.find(r => (isCpe ? r.aggregator?.id : r.user.id) === id);
    return { id, name: isCpe ? item?.aggregator?.fullName : item?.user.fullName };
  }).filter(t => t.id);

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
        
        {/* Filtres Paiements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm mb-2 block">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Code ou nom"
                value={searchPayments}
                onChange={(e) => setSearchPayments(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="text-sm mb-2 block">{isCpe ? 'Trésorier Régional' : 'Trésorier'}</label>
            <Select value={treasurerFilterPayments} onValueChange={setTreasurerFilterPayments}>
              <SelectTrigger className="w-full border border-gray-300 rounded-md">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {uniqueTreasurersPayments.map(t => (
                  <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm mb-2 block">Date</label>
            <InputDate
              value={dateFilterPayments}
              onChange={(e) => setDateFilterPayments(e.target.value)}
            />
          </div>
        </div>

        {/* Actions groupées Paiements */}
        {selectedPayments.size > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedPayments.size} paiement(s) sélectionné(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedPayments(new Set())}>
                  Désélectionner
                </Button>
                <Button size="sm" onClick={() => { setBulkAction(isCpe ? 'cpe_approved' : 'approved'); setBulkType('payment'); setBulkDialogOpen(true); }} className="bg-primary">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Valider
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { setBulkAction(isCpe ? 'cpe_rejected' : 'rejected'); setBulkType('payment'); setBulkDialogOpen(true); }}>
                  <XCircle className="w-4 h-4 mr-1" />
                  Rejeter
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isCpe ? 'Aucun paiement agrégé en attente de validation' : 'Aucun paiement en attente d\'approbation'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedPayments.size === paginatedPayments.length && paginatedPayments.length > 0}
                    onChange={() => toggleSelectAll('payment')}
                    className="w-4 h-4 cursor-pointer"
                  />
                </TableHead>
                <TableHead>Code Bénéficiaire</TableHead>
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
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPayments.has(payment.id)}
                      onChange={() => toggleSelection(payment.id, 'payment')}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </TableCell>
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
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => openDialog(payment, isCpe ? 'cpe_approved' : 'approved', 'payment')}
                        disabled={processing}
                        className="bg-primary hover:bg-primary/90 text-white w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDialog(payment, isCpe ? 'cpe_rejected' : 'rejected', 'payment')}
                        disabled={processing}
                        className="w-full"
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
        {filteredPayments.length > itemsPerPage && (
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
        
        {/* Filtres Recettes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm mb-2 block">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="N° dossier ou nom"
                value={searchRevenues}
                onChange={(e) => setSearchRevenues(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="text-sm mb-2 block">{isCpe ? 'Trésorier Régional' : 'Trésorier'}</label>
            <Select value={treasurerFilterRevenues} onValueChange={setTreasurerFilterRevenues}>
              <SelectTrigger className="w-full border border-gray-300 rounded-md">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {uniqueTreasurersRevenues.map(t => (
                  <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm mb-2 block">Date</label>
            <InputDate
              value={dateFilterRevenues}
              onChange={(e) => setDateFilterRevenues(e.target.value)}
            />
          </div>
        </div>

        {/* Actions groupées Recettes */}
        {selectedRevenues.size > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedRevenues.size} recette(s) sélectionnée(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedRevenues(new Set())}>
                  Désélectionner
                </Button>
                <Button size="sm" onClick={() => { setBulkAction(isCpe ? 'cpe_approved' : 'approved'); setBulkType('revenue'); setBulkDialogOpen(true); }} className="bg-primary">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Valider
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { setBulkAction(isCpe ? 'cpe_rejected' : 'rejected'); setBulkType('revenue'); setBulkDialogOpen(true); }}>
                  <XCircle className="w-4 h-4 mr-1" />
                  Rejeter
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRevenues.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isCpe ? 'Aucune recette agrégée en attente de validation' : 'Aucune recette en attente d\'approbation'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRevenues.size === paginatedRevenues.length && paginatedRevenues.length > 0}
                    onChange={() => toggleSelectAll('revenue')}
                    className="w-4 h-4 cursor-pointer"
                  />
                </TableHead>
                <TableHead>N° Dossier</TableHead>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead>Type de prestation</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>{isCpe ? 'Trésorier Régional' : 'Trésorier'}</TableHead>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRevenues.map((revenue) => (
                <TableRow key={revenue.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRevenues.has(revenue.id)}
                      onChange={() => toggleSelection(revenue.id, 'revenue')}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>{revenue.supplierNumber}</TableCell>
                  <TableCell>{revenue.fullName}</TableCell>
                  <TableCell>{revenue.serviceType}</TableCell>
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
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => openDialog(revenue, isCpe ? 'cpe_approved' : 'approved', 'revenue')}
                        disabled={processing}
                        className="bg-primary hover:bg-primary/90 text-white w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDialog(revenue, isCpe ? 'cpe_rejected' : 'rejected', 'revenue')}
                        disabled={processing}
                        className="w-full"
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
        {filteredRevenues.length > itemsPerPage && (
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

      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-sm w-full mx-auto">
          <DialogHeader className="gap-4">
            <DialogTitle>
              {bulkAction.includes('approved') ? 'Valider' : 'Rejeter'} {bulkType === 'payment' ? 'les paiements' : 'les recettes'}
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment {bulkAction.includes('approved') ? 'valider' : 'rejeter'} {bulkType === 'payment' ? selectedPayments.size : selectedRevenues.size} {bulkType === 'payment' ? 'paiement(s)' : 'recette(s)'} ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex-1"
              onClick={() => setBulkDialogOpen(false)}
              disabled={processing}
            >
              Annuler
            </Button>

            <Button
              variant={bulkAction.includes('approved') ? 'default' : 'destructive'}
              className="w-full sm:w-auto flex-1"
              onClick={handleBulkAction}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (bulkAction.includes('approved') ? 'Valider' : 'Rejeter')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
