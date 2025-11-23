import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  FileText, 
  Database, 
  CheckSquare, 
  Link2, 
  Archive,
  ArrowRight,
  CircleDot,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';
import { mockPayments } from '../lib/mockData';
import { 
  mockAccountingEntries, 
  getEntriesByPaymentId, 
  getTotalDebit, 
  getTotalCredit, 
  getBalance 
} from '../lib/accountingData';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export function AccountingSchema() {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(mockPayments[0]?.id || '');

  const steps = [
    {
      id: 1,
      title: 'Initiation',
      icon: FileText,
      color: 'text-accent bg-accent/10',
      description: 'Création de la demande de paiement',
      details: [
        'Saisie des informations employé',
        'Validation du matricule',
        'Vérification des informations bancaires',
        'Calcul du montant à verser'
      ]
    },
    {
      id: 2,
      title: 'Enregistrement',
      icon: Database,
      color: 'text-primary bg-primary/10',
      description: 'Stockage dans la base de données',
      details: [
        'Création de l\'enregistrement Prisma',
        'Attribution d\'un identifiant unique',
        'Horodatage de la transaction',
        'Association à l\'utilisateur créateur'
      ]
    },
    {
      id: 3,
      title: 'Validation',
      icon: CheckSquare,
      color: 'text-primary bg-primary/10',
      description: 'Contrôle et approbation',
      details: [
        'Vérification par le contrôleur',
        'Validation des montants',
        'Approbation hiérarchique',
        'Marquage comme "validé"'
      ]
    },
    {
      id: 4,
      title: 'Blockchain',
      icon: Link2,
      color: 'text-accent bg-accent/10',
      description: 'Enregistrement sur Hyperledger Fabric',
      details: [
        'Création de la transaction blockchain',
        'Attribution du Transaction ID',
        'Inclusion dans un bloc',
        'Génération du Block Hash'
      ]
    },
    {
      id: 5,
      title: 'Archivage',
      icon: Archive,
      color: 'text-primary bg-primary/10',
      description: 'Conservation immuable',
      details: [
        'Traçabilité complète garantie',
        'Historique des modifications',
        'Preuve cryptographique',
        'Audit trail permanent'
      ]
    }
  ];

  const selectedPayment = mockPayments.find(p => p.id === selectedPaymentId);
  const entries = getEntriesByPaymentId(selectedPaymentId);
  const totalDebit = getTotalDebit(entries);
  const totalCredit = getTotalCredit(entries);
  const balance = getBalance(entries);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Schéma Comptable des Transactions</h1>
        <p className="text-muted-foreground mt-1">
          Processus complet de traitement d'une transaction de paiement
        </p>
      </div>

      {/* Introduction Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <h3 className="mb-3">Vue d'ensemble du processus</h3>
        <p className="text-muted-foreground">
          Chaque paiement du Trésor Public suit un processus rigoureux en 5 étapes, 
          garantissant la traçabilité, la sécurité et la conformité. 
          L'utilisation de la blockchain Hyperledger Fabric assure l'immuabilité 
          et la transparence des opérations.
        </p>
      </Card>

      {/* Flow Diagram */}
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden lg:block" />

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Step Card */}
              <Card className={`p-6 lg:w-[calc(50%-3rem)] ${
                index % 2 === 0 ? 'lg:mr-auto' : 'lg:ml-auto'
              }`}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm">{step.id}</span>
                      </div>
                      <h3>{step.title}</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {step.description}
                    </p>

                    <div className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CircleDot className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Step Number Badge (Desktop) */}
              <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-10">
                {step.id}
              </div>

              {/* Arrow (Mobile) */}
              {index < steps.length - 1 && (
                <div className="lg:hidden flex justify-center my-4">
                  <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Journal Comptable Section */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2>Journal Comptable</h2>
            <p className="text-muted-foreground">
              Écritures comptables et balance pour chaque paiement
            </p>
          </div>
        </div>

        {/* Payment Selector */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm min-w-[150px]">Sélectionner un paiement :</label>
            <Select value={selectedPaymentId} onValueChange={setSelectedPaymentId}>
              <SelectTrigger className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockPayments.map(payment => (
                  <SelectItem key={payment.id} value={payment.id}>
                    {payment.matricule} - {payment.fullName} ({payment.montant.toLocaleString('fr-FR')} €)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Payment Details */}
        {selectedPayment && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bénéficiaire</p>
                <p>{selectedPayment.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Matricule</p>
                <p>{selectedPayment.matricule}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Montant Total</p>
                <p className="text-lg text-primary">
                  {selectedPayment.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Accounting Entries Table */}
        <Card className="p-6">
          <h3 className="mb-4">Écritures Comptables</h3>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune écriture comptable disponible pour ce paiement
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>N° Écriture</TableHead>
                    <TableHead className="text-right">Débit (€)</TableHead>
                    <TableHead className="text-right">Crédit (€)</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Agent Responsable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.date).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{entry.entryNumber}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.debit > 0 ? (
                          <span className="text-primary">
                            {entry.debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.credit > 0 ? (
                          <span className="text-accent">
                            {entry.credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.agent}</TableCell>
                    </TableRow>
                  ))}
                  {/* Balance Row */}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={2}>
                      <strong>Total / Balance</strong>
                    </TableCell>
                    <TableCell className="text-right">
                      <strong className="text-primary">
                        {totalDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                      </strong>
                    </TableCell>
                    <TableCell className="text-right">
                      <strong className="text-accent">
                        {totalCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                      </strong>
                    </TableCell>
                    <TableCell colSpan={2}>
                      <strong>
                        Solde : {Math.abs(balance).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        {balance === 0 && ' (Équilibré)'}
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Balance Info */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note pédagogique :</strong> Le journal comptable présente l'ensemble des écritures 
                  liées à ce paiement. Chaque opération est enregistrée en partie double (débit/crédit) 
                  garantissant l'équilibre comptable. Les écritures tracent le flux complet depuis 
                  l'engagement jusqu'à l'ordonnancement final.
                </p>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card className="p-6">
          <h4 className="mb-3">Technologies Utilisées</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span><strong>Node.js :</strong> Backend API REST</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span><strong>Prisma :</strong> ORM pour base de données</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span><strong>Hyperledger Fabric :</strong> Blockchain privée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span><strong>PostgreSQL :</strong> Base de données relationnelle</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="mb-3">Avantages du Système</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span><strong>Immuabilité :</strong> Impossible de modifier l'historique</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span><strong>Traçabilité :</strong> Audit complet des opérations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span><strong>Sécurité :</strong> Chiffrement cryptographique</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span><strong>Conformité :</strong> Standards du secteur public</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Legend */}
      <Card className="p-6 bg-muted/30">
        <h4 className="mb-4">Légende des Statuts</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <CircleDot className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm">En attente</p>
              <p className="text-xs text-muted-foreground">En cours de traitement</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm">Validé</p>
              <p className="text-xs text-muted-foreground">Approuvé et enregistré</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <CircleDot className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm">Échoué</p>
              <p className="text-xs text-muted-foreground">Erreur de traitement</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}