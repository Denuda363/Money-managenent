import { useState, useEffect } from 'react';
import { Sidebar, type ViewType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { MasterDataView } from './views/MasterDataView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { useStore } from './store';
import { subscribeToAuthChanges, signInWithGoogle, signOut } from './lib/firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const theme = useStore((state) => state.theme);
  const initFirebaseSync = useStore((state) => state.initFirebaseSync);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync theme with document class for Tailwind dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Firebase auth & sync
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setIsInitializing(false);
      if (user) {
        setIsAuthenticated(true);
        initFirebaseSync();
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, [initFirebaseSync]);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="font-bold text-3xl text-blue-600 dark:text-blue-400">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manajemen Keuangan</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Masuk untuk mengelola keuangan Anda</p>
          <button 
            onClick={() => signInWithGoogle().catch(console.error)}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 52.749 L -8.284 52.749 C -8.574 53.879 -9.224 54.819 -10.154 55.439 L -10.154 57.699 L -6.284 57.699 C -4.024 55.609 -2.764 52.549 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.154 57.699 C -11.224 58.419 -12.584 58.859 -14.754 58.859 C -18.934 58.859 -22.454 56.039 -23.714 52.239 L -27.724 52.239 L -27.724 55.339 C -25.744 59.279 -20.574 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -23.714 52.239 C -24.034 51.309 -24.224 50.299 -24.224 49.239 C -24.224 48.179 -24.034 47.169 -23.714 46.239 L -23.714 43.139 L -27.724 43.139 C -28.534 44.759 -29.004 46.549 -29.004 48.439 C -29.004 50.329 -28.534 52.119 -27.724 53.739 L -23.714 52.239 Z"/>
                <path fill="#EA4335" d="M -14.754 39.239 C -11.514 39.239 -8.804 40.359 -6.824 42.189 L -3.264 38.629 C -6.284 35.809 -10.454 34.239 -14.754 34.239 C -20.574 34.239 -25.744 38.199 -27.724 42.139 L -23.714 45.239 C -22.454 41.439 -18.934 38.619 -14.754 39.239 Z"/>
              </g>
            </svg>
            Lanjutkan dengan Google
          </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'transactions': return <TransactionsView />;
      case 'master': return <MasterDataView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView onSignOut={signOut} />;
      default: return <DashboardView />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'transactions': return 'Transaksi';
      case 'master': return 'Master Data';
      case 'reports': return 'Laporan';
      case 'settings': return 'Pengaturan';
      default: return 'DompetKu';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transform lg:static lg:translate-x-0 transition-transform duration-200 ease-in-out print:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          currentView={currentView} 
          onChangeView={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          title={getTitle()} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

