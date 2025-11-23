import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Plus,
  Search,
  Users,
  FileText,
  Euro
} from 'lucide-react';
import { 
  getMockDashboardStats, 
  getPaymentsByDay, 
  getPaymentsByStatus,
  mockPayments 
} from '../../lib/mockData';
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
  Cell,
  Legend
} from 'recharts';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';

export function TMSPDashboard() {
  const stats = getMockDashboardStats();
  const paymentsByDay = getPaymentsByDay();
  const paymentsByStatus = getPaymentsByStatus();

  const recentPayments = mockPayments.slice(0, 5);

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

  const quickActions = [
    {
      title: 'Créer un paiement',
      icon: Plus,
      path: '/payments/create',
      color: 'bg-primary text-primary-foreground hover:bg-primary/90'
    },
    {
      title: 'Rechercher',
      icon: Search,
      path: '/payments',
      color: 'bg-accent text-accent-foreground hover:bg-accent/90'
    },
    {
      title: 'Employés',
      icon: Users,
      path: '/employees',
      color: 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
    },
    {
      title: 'Schéma Comptable',
      icon: FileText,
      path: '/accounting-schema',
      color: 'bg-muted text-muted-foreground hover:bg-muted/80'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-primary text-primary-foreground">Validé</Badge>;
      case 'pending':
        return <Badge className="bg-accent text-accent-foreground">En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Dashboard TMSP</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de la gestion des paiements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <h3>{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Total Amount Card */}
      <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Montant Total Validé</p>
            <h2>{stats.totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</h2>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <Euro className="w-8 h-8" />
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <Button
                className={`w-full h-24 flex flex-col gap-2 ${action.color}`}
                variant="default"
              >
                <action.icon className="w-6 h-6" />
                <span>{action.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="p-6">
          <h3 className="mb-4">Paiements par Jour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #CCCCCC',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#1A3C34" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="mb-4">Répartition par Statut</h3>
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

      {/* Recent Payments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Paiements Récents</h3>
          <Link to="/payments">
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matricule</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.matricule}</TableCell>
                <TableCell>{payment.fullName}</TableCell>
                <TableCell>{payment.montant.toLocaleString('fr-FR')} €</TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell>
                  {new Date(payment.date).toLocaleDateString('fr-FR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}