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
import { revenuesApi } from '../../lib/api';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import { getCurrentUser } from '../../lib/auth';
import { toast } from 'sonner';

export function RevenuesList() {
  const [revenues, setRevenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isBulkConfirmDialogOpen, setIsBulkConfirmDialogOpen] = useState(false);
  const [revenueToSubmit, setRevenueToSubmit] = useState<string | null>(null);
  const [selectedRevenues, setSelectedRevenues] = useState<Set<string>>(new Set());
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const user = getCurrentUser();
  const org = user?.role.split('_')[0];
  const isTrRegional = org === 'TrRegionMSP';
  const isCpe = org === 'CpeMSP';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadRevenues = async () => {
    try {
      setLoading(true);
      const res = await revenuesApi.getAll(); 
      setRevenues(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des recettes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenues();
  }, []);

  const handleSubmitToBlockchain = async () => {
    if (!revenueToSubmit) return;
    try {
      setSubmitting(revenueToSubmit);
      await revenuesApi.submitToBlockchain(revenueToSubmit);
      await loadRevenues();
      setIsConfirmDialogOpen(false);
      toast.success('Recette envoyée à la blockchain avec succès');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'envoi à la blockchain");
    } finally {
      setSubmitting(null);
      setRevenueToSubmit(null);
    }
  };

  const handleBulkSubmit = async () => {
    if (selectedRevenues.size === 0) return;
    setIsBulkConfirmDialogOpen(false);
    try {
      setIsBulkSubmitting(true);
      const promises = Array.from(selectedRevenues).map(id => 
        revenuesApi.submitToBlockchain(id)
      );
      await Promise.all(promises);
      await loadRevenues();
      const count = selectedRevenues.size;
      setSelectedRevenues(new Set());
      toast.success(`${count} recette(s) envoyée(s) avec succès`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'envoi groupé");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const toggleRevenueSelection = (revenueId: string) => {
    setSelectedRevenues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(revenueId)) {
        newSet.delete(revenueId);
      } else {
        newSet.add(revenueId);
      }
      return newSet;
    });
  };

  const filteredRevenues = revenues.filter((revenue) => {
    const matchesSearch =
      revenue.supplierNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      revenue.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || revenue.status === statusFilter;

    const matchesDate =
      !dateFilter || revenue.createdAt.startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredRevenues.length / itemsPerPage);

  const paginatedRevenues = filteredRevenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    const pendingRevenues = paginatedRevenues.filter(r => r.submit === 'pending');
    if (selectedRevenues.size === pendingRevenues.length) {
      setSelectedRevenues(new Set());
    } else {
      setSelectedRevenues(new Set(pendingRevenues.map(r => r.id)));
    }
  };

  const pendingCount = paginatedRevenues.filter(r => r.submit === 'pending').length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-primary text-primary-foreground">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-accent text-accent-foreground">En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Opérations de recettes</h1>
          <p className="text-muted-foreground mt-1">
            Consultez et gérez toutes les recettes de prestations de services.
          </p>
        </div>
        {!isTrRegional && !isCpe && (
          <Link to="/revenues/create">
            <Button className="gap-2 text-md">
              <Plus className="w-4 h-4" />
              Créer une recette
            </Button>
          </Link>
        )}
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm mb-2 block">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="N° dossier ou client"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

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
      {selectedRevenues.size > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedRevenues.size} recette(s) sélectionnée(s)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRevenues(new Set())}
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

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                {pendingCount > 0 && (
                  <input
                    type="checkbox"
                    checked={selectedRevenues.size === pendingCount && pendingCount > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                )}
              </TableHead>
              <TableHead>N° Dossier</TableHead>
              <TableHead>Bénéficiaire</TableHead>
              <TableHead>Type de prestation</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Blockchain</TableHead>
              <TableHead>Agrégation</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Créé par</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRevenues.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8 text-muted-foreground" colSpan={10}>
                  Aucune recette trouvée
                </TableCell>
              </TableRow>
            ) : (
              paginatedRevenues.map((revenue) => (
                <TableRow key={revenue.id}>
                  <TableCell>
                    {revenue.submit === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedRevenues.has(revenue.id)}
                        onChange={() => toggleRevenueSelection(revenue.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    )}
                  </TableCell>
                  <TableCell>{revenue.supplierNumber}</TableCell>
                  <TableCell>{revenue.fullName}</TableCell>
                  <TableCell>{revenue.serviceType}</TableCell>
                  <TableCell>
                    {revenue.montant.toLocaleString('fr-FR')} F CFA
                  </TableCell>
                  <TableCell>{getStatusBadge(revenue.submit)}</TableCell>
                  <TableCell>{getAggregationBadge(revenue.aggregationStatus)}</TableCell>
                  <TableCell>
                    {new Date(revenue.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }).replace(' ', ' à ')}
                  </TableCell>
                  
                  <TableCell>{revenue.user?.fullName || "—"}</TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Link to={`/revenues/${revenue.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2 w-full">
                          <Eye className="w-4 h-4" />
                          Détails
                        </Button>
                      </Link>
                      {revenue.submit === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 w-full"
                          onClick={() => {
                            setRevenueToSubmit(revenue.id);
                            setIsConfirmDialogOpen(true);
                          }}
                          disabled={submitting === revenue.id}
                        >
                          <Send className="w-4 h-4" />
                          {submitting === revenue.id ? 'Envoi...' : 'Envoyer Blockchain'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
              Êtes-vous sûr de vouloir envoyer cette recette à la blockchain ? Cette action est irréversible.
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
              Êtes-vous sûr de vouloir envoyer {selectedRevenues.size} recette(s) à la blockchain ? Cette action est irréversible.
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
