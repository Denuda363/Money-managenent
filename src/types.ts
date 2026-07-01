export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
  description: string;
  paymentMethod?: 'cash' | 'transfer';
}

export interface CompanyProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  ownerName: string;
  reporterName: string;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  theme: 'light' | 'dark';
  companyProfile: CompanyProfile;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setCompanyProfile: (profile: CompanyProfile) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  
  resetData: () => void;
}
