import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  FileText, 
  LogOut,
  Menu
} from 'lucide-react';
import { logout, getCurrentUser } from '../lib/auth';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    toast.info('Déconnexion réussie', {
      description: 'À bientôt !'
    });
    window.location.href = '/login';
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/payments', icon: CreditCard, label: 'Paiements' },
    { path: '/employees', icon: Users, label: 'Employés' },
    { path: '/accounting-schema', icon: FileText, label: 'Schéma Comptable' },
  ];

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-center">Trésor Public</h2>
        <p className="text-center text-sm text-sidebar-foreground/70 mt-1">
          Gestion des Paiements
        </p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-foreground">
              {user?.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate">{user?.fullName}</p>
            <p className="text-sm text-sidebar-foreground/70">{user?.role}</p>
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
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Déconnexion
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