import {
  LayoutDashboard,
  Package,
  Wrench,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  Smartphone,
  ShoppingCart,
  Receipt,
  Menu,
  X
} from 'lucide-react';
import type { Screen, ShopSettings, User } from '../types';

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isOpen: boolean;
  onToggle: () => void;
  shopSettings?: ShopSettings;
  currentUser?: User | null;
}

export function Sidebar({ currentScreen, onNavigate, isOpen, onToggle, shopSettings, currentUser }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as Screen, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'pos' as Screen, label: 'Point de vente', icon: ShoppingCart },
    { id: 'inventory' as Screen, label: 'Inventaire', icon: Package },
    { id: 'phones' as Screen, label: 'Téléphones', icon: Smartphone },
    { id: 'repairs' as Screen, label: 'Réparations', icon: Wrench },
    { id: 'customers' as Screen, label: 'Clients', icon: Users },
    { id: 'sales-history' as Screen, label: 'Historique ventes', icon: Receipt },
    { id: 'reports' as Screen, label: 'Rapports', icon: BarChart3 },
    { id: 'settings' as Screen, label: 'Paramètres', icon: Settings },
  ].filter(item => {
    // Technician restrict: Only Repairs and Inventory
    if (currentUser?.role === 'Technicien') {
      return item.id === 'repairs' || item.id === 'inventory';
    }

    // Admin & Manager: Sales History
    if (item.id === 'sales-history') {
      return currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
    }

    // Admin restrict: Reports & Settings
    if (item.id === 'reports' || item.id === 'settings') {
      return currentUser?.role === 'Admin';
    }

    // Vendeur restrict: Hide Dashboard
    if (currentUser?.role === 'Vendeur' && item.id === 'dashboard') {
      return false;
    }

    return true;
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-lg border border-gray-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-40
          w-64 bg-white border-r border-gray-200 h-screen flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {shopSettings?.logoUrl ? (
              <img src={shopSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-gray-900">{shopSettings?.nom || 'Dr.Phone'}</h1>
              <p className="text-sm text-gray-500">Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm font-semibold">
                {currentUser?.role === 'Admin' ? 'AD' : 'TM'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{currentUser?.username || 'Utilisateur'}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.email || currentUser?.role || 'Technicien'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}