import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { CustomersScreen } from './screens/CustomersScreen';
import { RepairsScreen } from './screens/RepairsScreen';
import { NewRepairScreen } from './screens/NewRepairScreen';
import { ImprovedPaymentScreen } from './screens/ImprovedPaymentScreen';
import { POSScreen } from './screens/POSScreen';
import { SalesHistoryScreen } from './screens/SalesHistoryScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import PhonesScreen from './screens/PhonesScreen';
import BuyPhoneScreen from './screens/BuyPhoneScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { mockShopSettings } from './mockData';
import type { Screen, Repair, TransactionData, ShopSettings, User } from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [repairForPayment, setRepairForPayment] = useState<Repair | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionData | null>(null);

  // Load settings from localStorage or use mock default
  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem('shopSettings');
    return saved ? JSON.parse(saved) : mockShopSettings;
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleSaveSettings = (newSettings: ShopSettings) => {
    setShopSettings(newSettings);
    localStorage.setItem('shopSettings', JSON.stringify(newSettings));
  };

  const handleNavigate = (screen: Screen, data?: Repair | TransactionData) => {
    setCurrentScreen(screen);

    // Handle Repair navigation
    if (screen === 'pos' && data && 'numeroTicket' in data) {
      setRepairForPayment(data as Repair);
    } else if (screen !== 'pos') {
      setRepairForPayment(null);
    }

    // Handle Payment navigation
    if (screen === 'payment' && data && 'items' in data) {
      setCurrentTransaction(data as TransactionData);
    } else {
      setCurrentTransaction(null);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(screen) => handleNavigate(screen)}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        shopSettings={shopSettings}
        currentUser={currentUser}
      />

      <main className="flex-1 overflow-y-auto">
        {currentScreen === 'dashboard' && (
          <DashboardScreen />
        )}
        {currentScreen === 'pos' && (
          <POSScreen
            shopSettings={shopSettings}
            onNavigate={handleNavigate}
            repairForPayment={repairForPayment}
          />
        )}
        {currentScreen === 'inventory' && (
          <InventoryScreen currentUser={currentUser} />
        )}
        {currentScreen === 'customers' && (
          <CustomersScreen />
        )}
        {currentScreen === 'repairs' && (
          <RepairsScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'new-repair' && (
          <NewRepairScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'payment' && (
          <ImprovedPaymentScreen
            onNavigate={handleNavigate}
            shopSettings={shopSettings}
            transaction={currentTransaction}
          />
        )}
        {currentScreen === 'sales-history' && (
          <SalesHistoryScreen />
        )}
        {currentScreen === 'reports' && (
          <ReportsScreen />
        )}
        {currentScreen === 'phones' && (
          <PhonesScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'buy-phone' && (
          <BuyPhoneScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen
            shopSettings={shopSettings}
            onSave={handleSaveSettings}
          />
        )}
      </main>
    </div>
  );
}