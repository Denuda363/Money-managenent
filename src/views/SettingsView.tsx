import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Moon, Sun, AlertTriangle, Building2, Save, LogOut } from 'lucide-react';

export function SettingsView({ onSignOut }: { onSignOut?: () => void }) {
  const { theme, setTheme, resetData, companyProfile, setCompanyProfile } = useStore();
  const [profileForm, setProfileForm] = useState(companyProfile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setProfileForm(companyProfile);
  }, [companyProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyProfile(profileForm);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm("Peringatan! Apakah Anda yakin ingin menghapus SEMUA data transaksi dan mereset kategori ke bawaan? Aksi ini tidak dapat dibatalkan.")) {
      resetData();
      alert("Data berhasil di-reset.");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 size={18} />
            Profil Perusahaan
          </h3>
        </div>
        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Perusahaan</label>
              <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">No. Telepon</label>
              <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alamat</label>
              <textarea value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Pimpinan</label>
              <input type="text" value={profileForm.ownerName} onChange={(e) => setProfileForm({...profileForm, ownerName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Pembuat Laporan</label>
              <input type="text" value={profileForm.reporterName} onChange={(e) => setProfileForm({...profileForm, reporterName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Save size={18} />
              <span>{isSaved ? 'Tersimpan!' : 'Simpan Profil'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-gray-900 dark:text-white">Tampilan</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Mode Gelap</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ubah tema aplikasi menjadi gelap untuk mengurangi ketegangan mata.</p>
            </div>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Akun
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Keluar dari Aplikasi</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sesi Anda akan diakhiri dan harus masuk kembali untuk mengakses data.</p>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                <LogOut size={18} />
                Keluar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
          <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle size={18} />
            Zona Bahaya
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Hapus Semua Data</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Menghapus seluruh transaksi dan mengembalikan pengaturan kategori ke kondisi awal.</p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
