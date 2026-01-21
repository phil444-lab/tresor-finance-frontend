import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { paymentsApi, revenuesApi } from '../../lib/api';
import { useState, useEffect } from 'react';
import { Payment, DashboardStats } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';

interface GenericDashboardProps {
  title: string;
  subtitle: string;
}

export function GenericDashboard({ title, subtitle }: GenericDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    paymentsToday: 0,
    paymentsPending: 0,
    paymentsValidated: 0,
    paymentsFailed: 0,
    totalAmount: 0
  });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [paymentsByMonth, setPaymentsByMonth] = useState<any[]>([]);
  const [paymentsByStatus, setPaymentsByStatus] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [recentRevenues, setRecentRevenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = (payments: Payment[]): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    const paymentsToday = payments.filter(p =>
      p.createdAt && p.createdAt.startsWith(today)
    ).length;

    const paymentsPending = payments.filter(p => p.submit === 'pending').length;
    const paymentsValidated = payments.filter(p => p.submit === 'success').length;
    const paymentsFailed = payments.filter(p => p.submit === 'failed').length;

    const totalAmount = payments
      .filter(p => p.submit === 'success')
      .reduce((sum, p) => sum + p.montant, 0);

    return {
      paymentsToday,
      paymentsPending,
      paymentsValidated,
      paymentsFailed,
      totalAmount
    };
  };

  const calculatePaymentsByMonth = (payments: Payment[], year: number) => {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'
    ];

    const data = Array(12).fill(0).map((_, i) => ({
      month: months[i],
      count: 0,
    }));

    payments.forEach(p => {
      if (!p.createdAt) return;
      const date = new Date(p.createdAt);
      if (date.getFullYear() === year) {
        data[date.getMonth()].count += 1;
      }
    });

    return data;
  };

  const calculatePaymentsByStatus = (payments: Payment[]) => {
    return [
      { name: 'Validés', value: payments.filter(p => p.submit === 'success').length, color: '#1A3C34' },
      { name: 'En attente', value: payments.filter(p => p.submit === 'pending').length, color: '#C5A557' },
      { name: 'Échoués', value: payments.filter(p => p.submit === 'failed').length, color: '#DC2626' }
    ];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [paymentsResponse, revenuesResponse] = await Promise.all([
          paymentsApi.getAll(),
          revenuesApi.getAll()
        ]);
        
        const payments: Payment[] = paymentsResponse.data || (paymentsResponse as any);
        const revenues: any[] = revenuesResponse.data || (revenuesResponse as any);

        await new Promise(res => setTimeout(res, 1000));
        
        setStats(calculateStats(payments));
        setPaymentsByMonth(calculatePaymentsByMonth(payments, selectedYear));
        setPaymentsByStatus(calculatePaymentsByStatus(payments));
        setRecentPayments(payments.slice(0, 6));
        setRecentRevenues(revenues.slice(0, 6));
        setAllPayments(payments);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!allPayments) return;
    setPaymentsByMonth(calculatePaymentsByMonth(allPayments, selectedYear));
  }, [selectedYear]);

  const statCards = [
    {
      title: "Aujourd'hui",
      value: stats.paymentsToday,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'En attente',
      value: stats.paymentsPending,
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Validés',
      value: stats.paymentsValidated,
      icon: CheckCircle2,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Échoués',
      value: stats.paymentsFailed,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    }
  ];

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1>{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1>{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="mt-4 text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-md text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Opérations effectuées par Mois ({selectedYear})</h3>
            <Select
              value={String(selectedYear)}
              onValueChange={(value: string) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-[150px] font-semibold border border-gray-300 rounded-md">
                <SelectValue placeholder="Choisir l'année" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1A3C34" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Transactions validées dans la Blockchain</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className='text-lg font-semibold'>Récentes opérations de dépense</h3>
          <Link to="/payments">
            <Button className="font-semibold" variant="outline" size="sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code Bénéficiaire</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Validation</TableHead>
              <TableHead>Date & Heure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.matricule}</TableCell>
                <TableCell>{payment.fullName}</TableCell>
                <TableCell>{ payment.montant.toLocaleString('fr-FR') } F CFA</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className='text-lg font-semibold'>Récentes opérations de recette</h3>
          <Link to="/revenues">
            <Button className="font-semibold" variant="outline" size="sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Dossier</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type de prestation</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Validation</TableHead>
              <TableHead>Date & Heure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentRevenues.map((revenue) => (
              <TableRow key={revenue.id}>
                <TableCell>{revenue.supplierNumber}</TableCell>
                <TableCell>{revenue.fullName}</TableCell>
                <TableCell>{revenue.serviceType}</TableCell>
                <TableCell>{ revenue.montant.toLocaleString('fr-FR') } F CFA</TableCell>
                <TableCell>{getStatusBadge(revenue.submit)}</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
