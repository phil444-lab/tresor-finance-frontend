import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { InputDate } from '../../components/ui/input-date';
import { Badge } from '../../components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Plus, Search, Eye, Send } from 'lucide-react';
import { paymentsApi } from '../../lib/api';
import { Payment, PaymentStatus } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import { getCurrentUser } from '../../lib/auth';
import { toast } from 'sonner';

export function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isBulkConfirmDialogOpen, setIsBulkConfirmDialogOpen] = useState(false);
  const [paymentToSubmit, setPaymentToSubmit] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const user = getCurrentUser();
  const org = user?.role.split('_')[0];
  const isTrRegional = org === 'TrRegionMSP';
  const isCpe = org === 'CpeMSP';

  const [searchMatricule, setSearchMatricule] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.getAll(); 
      setPayments(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des paiements.");
    } finally {
      setLoading(false);
    }
  };

  // Charger les paiements API
  useEffect(() => {
    loadPayments();
  }, []);

  const handleSubmitToBlockchain = async () => {
    if (!paymentToSubmit) return;
    try {
      setSubmitting(paymentToSubmit);
      await paymentsApi.submitToBlockchain(paymentToSubmit);
      await loadPayments();
      setIsConfirmDialogOpen(false);
      toast.success('Transaction envoyée à la blockchain avec succès');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'envoi à la blockchain");
    } finally {
      setSubmitting(null);
      setPaymentToSubmit(null);
    }
  };

  const handleBulkSubmit = async () => {
    if (selectedPayments.size === 0) return;
    setIsBulkConfirmDialogOpen(false);
    try {
      setIsBulkSubmitting(true);
      const promises = Array.from(selectedPayments).map(id => 
        paymentsApi.submitToBlockchain(id)
      );
      await Promise.all(promises);
      await loadPayments();
      const count = selectedPayments.size;
      setSelectedPayments(new Set());
      toast.success(`${count} transaction(s) envoyée(s) avec succès`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'envoi groupé");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPayments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  // Filtres dynamiques
  const filteredPayments = payments.filter((payment) => {
    const matchesMatricule =
      payment.matricule.toLowerCase().includes(searchMatricule.toLowerCase()) ||
      payment.fullName.toLowerCase().includes(searchMatricule.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter;

    const matchesDate =
      !dateFilter || payment.createdAt.startsWith(dateFilter);

    return matchesMatricule && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    const pendingPayments = paginatedPayments.filter(p => p.submit === 'pending');
    if (selectedPayments.size === pendingPayments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(pendingPayments.map(p => p.id)));
    }
  };

  const pendingCount = paginatedPayments.filter(p => p.submit === 'pending').length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchMatricule, statusFilter, dateFilter]);

  // Badge Statut
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-primary text-primary-foreground">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-accent text-accent-foreground">En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
    }
  };

  const getAggregationBadge = (status: string) => {
    switch (status) {
      case 'cpe_approved':
        return <Badge className="bg-primary text-primary-foreground">Validé</Badge>;
      case 'approved':
        return <Badge className="bg-primary text-primary-foreground">Agrégé</Badge>;
      case 'waiting_approval':
        return <Badge className="bg-accent text-accent-foreground">En attente</Badge>;
      case 'rejected':
      case 'cpe_rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Loading / Erreur
  if (loading) {
    return <p className="text-center py-32">Chargement des données...</p>;
  }

  if (error) {
    return (
      <div className="text-center py-32">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Opérations de dépense</h1>
          <p className="text-muted-foreground mt-1">
            Consultez et gérez tous les paiements de salaires effectués via la blockchain.
          </p>
        </div>
        {!isTrRegional && !isCpe && (
          <Link to="/payments/create">
            <Button className="gap-2 text-md">
              <Plus className="w-4 h-4" />
              Créer une transaction
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="text-sm mb-2 block">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Insérer un mot clé"
                value={searchMatricule}
                onChange={(e) => setSearchMatricule(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm mb-2 block">Statut</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full border border-gray-300 rounded-md">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="success">Validé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm mb-2 block">Date</label>
            <InputDate
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedPayments.size > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedPayments.size} transaction(s) sélectionnée(s)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPayments(new Set())}
              >
                Désélectionner tout
              </Button>
              <Button
                size="sm"
                onClick={() => setIsBulkConfirmDialogOpen(true)}
                disabled={isBulkSubmitting}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {isBulkSubmitting ? 'Envoi en cours...' : 'Envoyer à la blockchain'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Payments Table */}
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                {pendingCount > 0 && (
                  <input
                    type="checkbox"
                    checked={selectedPayments.size === pendingCount && pendingCount > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                )}
              </TableHead>
              <TableHead>Code Bénéficiaire</TableHead>
              <TableHead>Nom Complet</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Blockchain</TableHead>
              <TableHead>Agrégation</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Créé par</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8 text-muted-foreground" colSpan={9}>
                  Aucun paiement trouvé
                </TableCell>
              </TableRow>
            ) : (
              paginatedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.submit === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedPayments.has(payment.id)}
                        onChange={() => togglePaymentSelection(payment.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    )}
                  </TableCell>
                  <TableCell>{payment.matricule}</TableCell>
                  <TableCell>{payment.fullName}</TableCell>
                  <TableCell>
                    { payment.montant.toLocaleString('fr-FR') } F CFA
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.submit)}</TableCell>
                  <TableCell>{getAggregationBadge(payment.aggregationStatus)}</TableCell>
                  <TableCell>
                    {new Date(payment.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }).replace(' ', ' à ')}
                  </TableCell>
                  
                  <TableCell>{payment.user?.fullName || "—"}</TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Link to={`/payments/${payment.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2 w-full">
                          <Eye className="w-4 h-4" />
                          Détails
                        </Button>
                      </Link>
                      {payment.submit === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 w-full"
                          onClick={() => {
                            setPaymentToSubmit(payment.id);
                            setIsConfirmDialogOpen(true);
                          }}
                          disabled={submitting === payment.id}
                        >
                          <Send className="w-4 h-4" />
                          {submitting === payment.id ? 'Envoi...' : 'Envoyer Blockchain'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Précédent
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Suivant
          </Button>
        </div>

      </Card>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-sm w-full mx-auto">
          <DialogHeader className='gap-4'>
            <DialogTitle>Confirmer l'envoi</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir envoyer cette transaction à la blockchain ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex-1"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Annuler
            </Button>

            <Button
              className="w-full sm:w-auto flex-1"
              onClick={handleSubmitToBlockchain}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkConfirmDialogOpen} onOpenChange={setIsBulkConfirmDialogOpen}>
        <DialogContent className="sm:max-w-sm w-full mx-auto">
          <DialogHeader className='gap-4'>
            <DialogTitle>Confirmer l'envoi groupé</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir envoyer {selectedPayments.size} transaction(s) à la blockchain ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex-1"
              onClick={() => setIsBulkConfirmDialogOpen(false)}
            >
              Annuler
            </Button>

            <Button
              className="w-full sm:w-auto flex-1"
              onClick={handleBulkSubmit}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
