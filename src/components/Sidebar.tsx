import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  BookOpenText, 
  LogOut,
  Menu,
  GitMerge,
  TrendingUp
} from 'lucide-react';
import { logout, getCurrentUser } from '../lib/auth';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface SidebarProps {
  onNavigate?: () => void;
}

const getRoleLabel = (role: string) => {
  const org = role.split('_')[0];
  switch (org) {
    case 'TMSP': return 'Trésorier';
    case 'TrRegionMSP': return 'Trésorier Régional';
    case 'CpeMSP': return 'Comptable Principal d\'État';
    default: return org;
  }
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Déconnexion réussie', {
        description: 'À bientôt !'
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion', {
        description: 'Veuillez réessayer'
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const org = user?.role.split('_')[0];
  const isTrRegional = org === 'TrRegionMSP';
  const isCpe = org === 'CpeMSP';

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/payments', icon: CreditCard, label: 'Op. dépense' },
    { path: '/revenues', icon: TrendingUp, label: 'Op. recettes' },
    ...((isTrRegional || isCpe) ? [{ path: '/aggregation', icon: GitMerge, label: 'Agrégation' }] : []),
    { path: '/accounting-schema', icon: BookOpenText, label: 'Écriture Comptable' },
    { path: '/employees', icon: Users, label: 'Salariés' },
  ];

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-center">Tresor Finance</h2>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-foreground">
              {user?.fullName?.split(" ").filter(Boolean).slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("")}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate">{user?.fullName}</p>
            <p className="text-sm text-sidebar-foreground/70">{user?.role && getRoleLabel(user.role)}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="destructive"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
        </Button>
      </div>
    </div>
  );
}

export function MobileSidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="w-6 h-6" />
    </Button>
  );
}