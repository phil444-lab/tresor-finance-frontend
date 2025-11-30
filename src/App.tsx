import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { TMSPDashboard } from './pages/dashboards/TMSPDashboard';
import { TrRegionMSPDashboard } from './pages/dashboards/TrRegionMSPDashboard';
import { CpeMSPDashboard } from './pages/dashboards/CpeMSPDashboard';
import { PaymentsList } from './pages/payments/PaymentsList';
import { CreatePayment } from './pages/payments/CreatePayment';
import { PaymentDetails } from './pages/payments/PaymentDetails';
import { EmployeesList } from './pages/employees/EmployeesList';
import { AccountingSchema } from './pages/AccountingSchema';
import { isAuthenticated, getCurrentUser } from './lib/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function DashboardRouter() {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Extraire l'organisation du rôle (ex: "TMSP_tclient1" -> "TMSP")
  const org = user.role.split('_')[0];

  switch (org) {
    case 'TMSP':
      return <TMSPDashboard />;
    case 'TrRegionMSP':
      return <TrRegionMSPDashboard />;
    case 'CpeMSP':
      return <CpeMSPDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardRouter />} />
                  <Route path="/payments" element={<PaymentsList />} />
                  <Route path="/payments/create" element={<CreatePayment />} />
                  <Route path="/payments/:id" element={<PaymentDetails />} />
                  <Route path="/employees" element={<EmployeesList />} />
                  <Route path="/accounting-schema" element={<AccountingSchema />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}