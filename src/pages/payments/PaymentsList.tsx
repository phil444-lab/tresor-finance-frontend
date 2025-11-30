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
import { Plus, Search, Eye } from 'lucide-react';
import { paymentsApi } from '../../lib/api';
import { Payment, PaymentStatus } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';

export function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchMatricule, setSearchMatricule] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Charger les paiements API
  useEffect(() => {
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

    loadPayments();
  }, []);

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
        <Link to="/payments/create">
          <Button className="gap-2 text-md">
            <Plus className="w-4 h-4" />
            Créer une transaction
          </Button>
        </Link>
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

      {/* Payments Table */}
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matricule</TableHead>
              <TableHead>Nom Complet</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Blockchain</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Créé par</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8 text-muted-foreground" colSpan={8}>
                  Aucun paiement trouvé
                </TableCell>
              </TableRow>
            ) : (
              paginatedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.matricule}</TableCell>
                  <TableCell>{payment.fullName}</TableCell>
                  <TableCell>
                    { payment.montant.toLocaleString('fr-FR') } F CFA
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>{getStatusBadge(payment.submit)}</TableCell>
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
                    <Link to={`/payments/${payment.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Détails
                      </Button>
                    </Link>
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
    </div>
  );
}
