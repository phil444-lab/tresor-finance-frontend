import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Search, Eye } from 'lucide-react';
import { mockPayments } from '../../lib/mockData';
import { PaymentStatus } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';

export function PaymentsList() {
  const [searchMatricule, setSearchMatricule] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  const filteredPayments = mockPayments.filter(payment => {
    const matchesMatricule = payment.matricule.toLowerCase().includes(searchMatricule.toLowerCase()) ||
                             payment.fullName.toLowerCase().includes(searchMatricule.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesDate = !dateFilter || payment.date.startsWith(dateFilter);
    
    return matchesMatricule && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-primary text-primary-foreground">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-accent text-accent-foreground">En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Paiements</h1>
          <p className="text-muted-foreground mt-1">
            Consultez et gérez tous les paiements
          </p>
        </div>
        <Link to="/payments/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Créer un paiement
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm mb-2 block">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Matricule ou nom..."
                value={searchMatricule}
                onChange={(e) => setSearchMatricule(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm mb-2 block">Statut</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="validated">Validé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm mb-2 block">Date</label>
            <Input
              type="date"
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
              <TableHead>Banque</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
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
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.matricule}</TableCell>
                  <TableCell>{payment.fullName}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground truncate block max-w-xs">
                      {payment.bankInfo.split(' - ')[0]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {payment.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    {new Date(payment.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>{payment.createdBy}</TableCell>
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

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {filteredPayments.length} paiement{filteredPayments.length > 1 ? 's' : ''} trouvé{filteredPayments.length > 1 ? 's' : ''}
          </span>
          <span className="text-muted-foreground">
            Montant total : {filteredPayments.reduce((sum, p) => sum + p.montant, 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </span>
        </div>
      </Card>
    </div>
  );
}