import React from 'react';
import { LayoutDashboard, ReceiptText, Tags, BarChart3, Settings } from 'lucide-react';
import { cn } from '../utils';

export type ViewType = 'dashboard' | 'transactions' | 'master' | 'reports' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const menuItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'transactions', label: 'Transaksi', icon: <ReceiptText size={20} /> },
    { id: 'master', label: 'Master Data', icon: <Tags size={20} /> },
    { id: 'reports', label: 'Laporan', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <span className="font-bold text-xl">M</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">Manajemen Keuangan</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              currentView === item.id
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
        &copy; {new Date().getFullYear()} Manajemen Keuangan
      </div>
    </div>
  );
}
