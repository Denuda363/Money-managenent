import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { FileText, FileSpreadsheet, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function ReportsView() {
  const { transactions, categories, companyProfile } = useStore();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const filteredTransactions = transactions.filter(t => t.date.startsWith(month)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const cashIncome = filteredTransactions.filter(t => t.type === 'income' && (t.paymentMethod === 'cash' || !t.paymentMethod)).reduce((sum, t) => sum + t.amount, 0);
  const transferIncome = filteredTransactions.filter(t => t.type === 'income' && t.paymentMethod === 'transfer').reduce((sum, t) => sum + t.amount, 0);
  
  const cashExpense = filteredTransactions.filter(t => t.type === 'expense' && (t.paymentMethod === 'cash' || !t.paymentMethod)).reduce((sum, t) => sum + t.amount, 0);
  const transferExpense = filteredTransactions.filter(t => t.type === 'expense' && t.paymentMethod === 'transfer').reduce((sum, t) => sum + t.amount, 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(companyProfile.name, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(companyProfile.address, 14, 26);
    doc.text(`${companyProfile.phone} | ${companyProfile.email}`, 14, 32);
    
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text(`Laporan Keuangan - ${month}`, 14, 44);

    const tableData = filteredTransactions.map(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
      const method = t.paymentMethod === 'transfer' ? 'Transfer' : 'Cash';
      return [
        formatDate(t.date),
        t.description,
        cat,
        method,
        t.type === 'income' ? formatCurrency(t.amount) : '-',
        t.type === 'expense' ? formatCurrency(t.amount) : '-'
      ];
    });

    autoTable(doc, {
      startY: 50,
      head: [['Tanggal', 'Keterangan', 'Kategori', 'Metode', 'Pemasukan', 'Pengeluaran']],
      body: tableData,
      foot: [
        ['', '', '', 'TOTAL CASH', formatCurrency(cashIncome), formatCurrency(cashExpense)],
        ['', '', '', 'TOTAL TRANSFER', formatCurrency(transferIncome), formatCurrency(transferExpense)],
        ['', '', '', 'TOTAL', formatCurrency(totalIncome), formatCurrency(totalExpense)],
        ['', '', '', 'TOTAL BERSIH', { content: formatCurrency(totalIncome - totalExpense), colSpan: 2, styles: { halign: 'center' } }]
      ],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 50;
    const currentDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('Mengetahui,', 40, finalY + 20, { align: 'center' });
    doc.text(`( ${companyProfile.ownerName || 'Pimpinan'} )`, 40, finalY + 45, { align: 'center' });
    
    doc.text(`....................., ${currentDate}`, 170, finalY + 20, { align: 'center' });
    doc.text(`( ${companyProfile.reporterName || 'Pembuat Laporan'} )`, 170, finalY + 45, { align: 'center' });

    doc.save(`Laporan_Keuangan_${month}.pdf`);
  };

  const exportExcel = () => {
    const currentDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const exportData = [
      [companyProfile.name],
      [companyProfile.address],
      [`${companyProfile.phone} | ${companyProfile.email}`],
      [],
      [`Laporan Keuangan - ${month}`],
      [],
      ['Tanggal', 'Keterangan', 'Kategori', 'Metode', 'Pemasukan', 'Pengeluaran'],
      ...filteredTransactions.map(t => [
        formatDate(t.date),
        t.description,
        categories.find(c => c.id === t.categoryId)?.name || 'Unknown',
        t.paymentMethod === 'transfer' ? 'Transfer' : 'Cash',
        t.type === 'income' ? t.amount : 0,
        t.type === 'expense' ? t.amount : 0
      ]),
      ['', '', '', 'TOTAL CASH', cashIncome, cashExpense],
      ['', '', '', 'TOTAL TRANSFER', transferIncome, transferExpense],
      ['', '', '', 'TOTAL', totalIncome, totalExpense],
      ['', '', '', 'TOTAL BERSIH', totalIncome - totalExpense, ''],
      [],
      [],
      ['', 'Mengetahui,', '', '', `....................., ${currentDate}`],
      [],
      [],
      [],
      ['', `( ${companyProfile.ownerName || 'Pimpinan'} )`, '', '', `( ${companyProfile.reporterName || 'Pembuat Laporan'} )`]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    
    XLSX.writeFile(workbook, `Laporan_Keuangan_${month}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{companyProfile.name}</h1>
        <p className="text-sm text-gray-600 mt-1">{companyProfile.address}</p>
        <p className="text-sm text-gray-600">{companyProfile.phone} | {companyProfile.email}</p>
        <h2 className="text-lg font-semibold text-gray-800 mt-4">Laporan Keuangan - {month}</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors print:hidden">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Laporan & Ekspor Data</h2>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-end">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bulan</label>
            <input 
              type="month" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={exportPDF}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FileText size={18} />
              <span>Ekspor PDF</span>
            </button>
            <button 
              onClick={exportExcel}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FileSpreadsheet size={18} />
              <span>Ekspor Excel</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Printer size={18} />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pemasukan Cash ({month})</h3>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(cashIncome)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pemasukan Transfer ({month})</h3>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(transferIncome)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pengeluaran Cash ({month})</h3>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(cashExpense)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pengeluaran Transfer ({month})</h3>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(transferExpense)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800 transition-colors">
          <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Total Pemasukan ({month})</h3>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-800 transition-colors">
          <h3 className="text-sm font-medium text-rose-700 dark:text-rose-400 mb-1">Total Pengeluaran ({month})</h3>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-gray-900 dark:text-white">Daftar Transaksi ({filteredTransactions.length} Transaksi)</h3>
        </div>

        {/* Mobile View: List */}
        <div className="block md:hidden print:hidden">
          {filteredTransactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              Tidak ada transaksi pada bulan ini
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTransactions.map((t) => {
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
                    <div className="mt-2 flex gap-2">
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block print:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Keterangan</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Metode</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTransactions.map(t => {
                const category = categories.find(c => c.id === t.categoryId);
                const isIncome = t.type === 'income';
                return (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-100">{formatDate(t.date)}</td>
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-100">{t.description}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{category?.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{t.paymentMethod === 'transfer' ? 'Transfer' : 'Cash'}</td>
                    <td className={`px-6 py-3 text-sm font-medium text-right ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada transaksi pada bulan ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature Section - Only visible when printing */}
      <div className="hidden print:flex justify-between mt-16 pt-8 px-8">
        <div className="text-center">
          <p className="text-gray-900 mb-20">Mengetahui,</p>
          <p className="font-semibold text-gray-900 underline underline-offset-4">( {companyProfile.ownerName || 'Pimpinan'} )</p>
        </div>
        <div className="text-center">
          <p className="text-gray-900 mb-20">....................., {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="font-semibold text-gray-900 underline underline-offset-4">( {companyProfile.reporterName || 'Pembuat Laporan'} )</p>
        </div>
      </div>
    </div>
  );
}
