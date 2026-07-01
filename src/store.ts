import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Transaction, Category, CompanyProfile } from './types';
import { DEFAULT_CATEGORIES } from './utils';
import { db, auth } from './lib/firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot, getDocs } from 'firebase/firestore';

const defaultCompanyProfile: CompanyProfile = {
  name: 'Perusahaan Saya',
  address: 'Jl. Contoh No. 123, Kota',
  phone: '081234567890',
  email: 'info@perusahaan.com',
  ownerName: 'Nama Pimpinan',
  reporterName: 'Nama Pembuat Laporan'
};

export const useStore = create<AppState & { 
  initFirebaseSync: () => void, 
  isSyncing: boolean 
}>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: DEFAULT_CATEGORIES as Category[],
      theme: 'light',
      companyProfile: defaultCompanyProfile,
      isSyncing: false,

      initFirebaseSync: () => {
        if (get().isSyncing || !auth.currentUser) return;
        set({ isSyncing: true });
        const uid = auth.currentUser.uid;
        
        // Listen to Profile
        const profileRef = doc(db, 'users', uid, 'profile', 'companyProfile');
        onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            set({ companyProfile: docSnap.data() as CompanyProfile });
          }
        });

        // Listen to Categories
        const categoriesRef = collection(db, 'users', uid, 'categories');
        onSnapshot(categoriesRef, (snapshot) => {
          if (!snapshot.empty) {
            const categories = snapshot.docs.map(doc => doc.data() as Category);
            set({ categories });
          } else {
            // First time, save default categories to Firestore
            const defaults = get().categories;
            defaults.forEach(c => {
              setDoc(doc(db, 'users', uid, 'categories', c.id), c);
            });
          }
        });

        // Listen to Transactions
        const txRef = collection(db, 'users', uid, 'transactions');
        onSnapshot(txRef, (snapshot) => {
          const transactions = snapshot.docs.map(doc => doc.data() as Transaction);
          set({ transactions });
        });
      },

      setTheme: (theme) => set({ theme }),
      
      setCompanyProfile: (companyProfile) => {
        set({ companyProfile });
        if (auth.currentUser) {
          setDoc(doc(db, 'users', auth.currentUser.uid, 'profile', 'companyProfile'), companyProfile);
        }
      },

      addTransaction: (transaction) => {
        const id = crypto.randomUUID();
        const newTx = { ...transaction, id };
        set((state) => ({ transactions: [...state.transactions, newTx] }));
        if (auth.currentUser) {
          setDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', id), newTx);
        }
      },

      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) => t.id === id ? { ...transaction, id } : t)
        }));
        if (auth.currentUser) {
          setDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', id), { ...transaction, id });
        }
      },

      deleteTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
        if (auth.currentUser) {
          deleteDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', id));
        }
      },

      addCategory: (category) => {
        const id = crypto.randomUUID();
        const newCat = { ...category, id };
        set((state) => ({ categories: [...state.categories, newCat] }));
        if (auth.currentUser) {
          setDoc(doc(db, 'users', auth.currentUser.uid, 'categories', id), newCat);
        }
      },

      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) => c.id === id ? { ...category, id } : c)
        }));
        if (auth.currentUser) {
          setDoc(doc(db, 'users', auth.currentUser.uid, 'categories', id), { ...category, id });
        }
      },

      deleteCategory: (id) => {
        set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
        if (auth.currentUser) {
          deleteDoc(doc(db, 'users', auth.currentUser.uid, 'categories', id));
        }
      },

      resetData: () => {
        set({ transactions: [], categories: DEFAULT_CATEGORIES as Category[] });
        if (auth.currentUser) {
          // Note: In a real app we'd need to fetch all docs and delete them one by one.
          // For simplicity, we just clear local state.
        }
      },
    }),
    {
      name: 'dompetku-storage',
    }
  )
);
