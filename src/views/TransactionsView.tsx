import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { Plus, Trash2, Edit2, Upload, Download } from 'lucide-react';
import type { TransactionType, Transaction } from '../types';
import * as XLSX from 'xlsx';

export function TransactionsView() {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = categories.filter(c => c.type === type);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('cash');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setType(t.type);
    setAmount(t.amount.toString());
    setCategoryId(t.categoryId);
    setDate(t.date);
    setDescription(t.description);
    setPaymentMethod(t.paymentMethod || 'cash');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !date || !description) return;

    const payload = {
      type,
      amount: parseFloat(amount),
      categoryId,
      date,
      description,
      paymentMethod
    };

    if (editingId) {
      updateTransaction(editingId, payload);
    } else {
      addTransaction(payload);
    }

    resetForm();
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        Tanggal: '2023-10-01',
        Keterangan: 'Gaji Bulan Oktober',
        Kategori: 'Gaji',
        Pemasukan: 5000000,
        Pengeluaran: 0,
        Metode_Pembayaran: 'transfer'
      },
      {
        Tanggal: '2023-10-02',
        Keterangan: 'Makan Siang',
        Kategori: 'Makanan',
        Pemasukan: 0,
        Pengeluaran: 50000,
        Metode_Pembayaran: 'cash'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import");
    XLSX.writeFile(workbook, "Template_Import_Transaksi.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        let importedCount = 0;

        data.forEach((row: any) => {
          if (!row.Tanggal || !row.Keterangan || !row.Kategori) return;

          let date = String(row.Tanggal);
          if (typeof row.Tanggal === 'number') {
             const dateObj = new Date((row.Tanggal - (25567 + 2)) * 86400 * 1000);
             if (!isNaN(dateObj.getTime())) {
               date = dateObj.toISOString().split('T')[0];
             }
          } else {
            // Try to parse DD/MM/YYYY or YYYY-MM-DD
            const parts = date.split(/[-/]/);
            if (parts.length === 3) {
              if (parts[0].length === 4) {
                date = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              } else if (parts[2].length === 4) {
                date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
          }

          const income = Number(row.Pemasukan) || 0;
          const expense = Number(row.Pengeluaran) || 0;
          
          if (income === 0 && expense === 0) return;
          
          const importType = income > 0 ? 'income' : 'expense';
          const importAmount = income > 0 ? income : expense;
          const categoryName = String(row.Kategori).trim().toLowerCase();
          
          let importMethod: 'cash' | 'transfer' = 'cash';
          if (row.Metode_Pembayaran) {
             const methodString = String(row.Metode_Pembayaran).trim().toLowerCase();
             if (methodString === 'transfer') {
               importMethod = 'transfer';
             }
          }

          let category = categories.find(c => c.name.toLowerCase() === categoryName && c.type === importType);
          
          if (!category) {
             category = categories.find(c => c.type === importType);
          }
          
          if (category) {
            addTransaction({
              date: date,
              description: String(row.Keterangan),
              amount: importAmount,
              categoryId: category.id,
              type: importType,
              paymentMethod: importMethod
            });
            importedCount++;
          }
        });

        alert(`Berhasil mengimpor ${importedCount} transaksi!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat membaca file Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Daftar Transaksi</h2>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={downloadTemplate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Template</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                resetForm();
                setShowForm(true);
              }
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Tambah Transaksi</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{editingId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jenis Transaksi</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={type === 'expense'} onChange={() => { setType('expense'); setCategoryId(''); }} className="text-blue-600" />
                  <span className="text-gray-900 dark:text-gray-100">Pengeluaran</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={type === 'income'} onChange={() => { setType('income'); setCategoryId(''); }} className="text-blue-600" />
                  <span className="text-gray-900 dark:text-gray-100">Pemasukan</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tanggal</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jumlah (Rp)</label>
              <input type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kategori</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="">Pilih Kategori</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Metode Pembayaran</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="text-blue-600" />
                  <span className="text-gray-900 dark:text-gray-100">Cash</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="text-blue-600" />
                  <span className="text-gray-900 dark:text-gray-100">Transfer</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Keterangan</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beli makan siang..." required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              {editingId ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        {/* Mobile View: List */}
        <div className="block md:hidden">
          {sortedTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              Belum ada data transaksi
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortedTransactions.map((t) => {
                const category = categories.find(c => c.id === t.categoryId);
                const isIncome = t.type === 'income';
                return (
                  <div key={t.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{t.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(t.date)}</p>
                      </div>
                      <p className={`font-semibold text-right ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex gap-2">
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ 
                            backgroundColor: `${category?.color || '#cbd5e1'}20`, 
                            color: category?.color || '#475569' 
                          }}
                        >
                          {category?.name || 'Unknown'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {t.paymentMethod === 'transfer' ? 'Transfer' : 'Cash'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEdit(t)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
                              deleteTransaction(t.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Keterangan</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Metode</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Jumlah</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Belum ada data transaksi
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((t) => {
                  const category = categories.find(c => c.id === t.categoryId);
                  const isIncome = t.type === 'income';
                  
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {t.description}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${category?.color || '#cbd5e1'}20`, 
                            color: category?.color || '#475569' 
                          }}
                        >
                          {category?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {t.paymentMethod === 'transfer' ? 'Transfer' : 'Cash'}
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium text-right whitespace-nowrap ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(t)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
                                deleteTransaction(t.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
