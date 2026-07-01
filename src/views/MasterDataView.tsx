import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2 } from 'lucide-react';
import type { TransactionType } from '../types';

export function MasterDataView() {
  const { categories, addCategory, deleteCategory, transactions } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addCategory({ name, type, color });
    setName('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    // Check if in use
    const inUse = transactions.some(t => t.categoryId === id);
    if (inUse) {
      alert("Kategori ini sedang digunakan pada transaksi dan tidak dapat dihapus.");
      return;
    }
    deleteCategory(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Master Kategori</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jenis</label>
              <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Kategori</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Contoh: Pendidikan" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Warna Label</label>
              <div className="flex gap-3">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 rounded cursor-pointer border border-gray-300 dark:border-gray-600 p-0.5" />
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white uppercase" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Simpan
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">Pengeluaran</h3>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {categories.filter(c => c.type === 'expense').map(c => (
              <li key={c.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{c.name}</span>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Income Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">Pemasukan</h3>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {categories.filter(c => c.type === 'income').map(c => (
              <li key={c.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{c.name}</span>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
