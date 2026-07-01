import React from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { ArrowDown, ArrowUp, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function DashboardView() {
  const { transactions, categories } = useStore();

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // Group transactions by month for the chart
  const monthlyData = transactions.reduce((acc: any, curr) => {
    const month = new Date(curr.date).toLocaleString('id-ID', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { name: month, Pemasukan: 0, Pengeluaran: 0 };
    }
    if (curr.type === 'income') {
      acc[month].Pemasukan += curr.amount;
    } else {
      acc[month].Pengeluaran += curr.amount;
    }
    return acc;
  }, {});

  const chartData = Object.values(monthlyData).slice(-6); // Last 6 months

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-3 md:gap-4 mb-3 lg:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Wallet size={20} className="md:w-6 md:h-6" />
            </div>
            <p className="text-sm md:text-base font-medium text-gray-500 dark:text-gray-400">Total Saldo</p>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white truncate">{formatCurrency(balance)}</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center gap-3 mb-2 md:mb-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ArrowDown size={18} className="md:w-6 md:h-6" />
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Pemasukan</p>
          </div>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">{formatCurrency(totalIncome)}</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center gap-3 mb-2 md:mb-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <ArrowUp size={18} className="md:w-6 md:h-6" />
            </div>
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Pengeluaran</p>
          </div>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">{formatCurrency(totalExpense)}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Arus Kas (6 Bulan Terakhir)</h3>
        {chartData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `Rp ${val / 1000}k`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Belum ada data transaksi untuk ditampilkan
          </div>
        )}
      </div>
    </div>
  );
}
