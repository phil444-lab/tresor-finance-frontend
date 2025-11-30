import { Card } from '../components/ui/card';
import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { paymentsApi } from '../lib/api';
import { AccountingEntry } from '../types';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export function AccountingSchema() {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchEntries = async () => {
      setLoadingEntries(true);
      try {
        const res = await paymentsApi.getAccountingEntries();
        setEntries(res.data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des écritures:", err);
        setEntries([]);
      } finally {
        setLoadingEntries(false);
      }
    };
    fetchEntries();
  }, []);

  const filteredEntries = entries.filter(e => {
    const search = searchTerm.toLowerCase();
    return (
      e.pieceNumber.toLowerCase().includes(search) ||
      e.description.toLowerCase().includes(search) ||
      e.account.toLowerCase().includes(search) ||
      new Date(e.date).toLocaleDateString('fr-FR').includes(search)
    );
  });

  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <h1 className="font-medium text-2xl">Livre-Journal des Opérations</h1>
      
      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par n° pièce, libellé, compte ou date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>


        {loadingEntries ? (
          <p>Chargement des écritures...</p>
        ) : sortedEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune écriture disponible
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[120px]">N° Pièce</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead className="w-[130px]">Type d'opération</TableHead>
                  <TableHead className="w-[120px]">Compte</TableHead>
                  <TableHead className="text-right w-[120px]">Montant (F CFA)</TableHead>
                  <TableHead className="w-[100px]">Mode de règlement</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedEntries.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      {new Date(e.date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{e.pieceNumber}</TableCell>
                    <TableCell>{e.description}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-md text-sm bg-accent text-orange-800">
                        Décaissement
                      </span>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {e.debit > 0 ? `(D) ${e.account}` : `(C) ${e.account}`}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(e.debit > 0 ? e.debit : e.credit).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell>Virement Bancaire</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-8">
              <p className="text-sm font-medium">
                Page {currentPage} sur {totalPages} ({sortedEntries.length} entrées)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
