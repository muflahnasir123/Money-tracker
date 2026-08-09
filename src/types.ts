export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'credit_card' | 'bank_account' | 'digital_wallet';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  iconName: string;
  color: string;
  budgetLimit?: number; // Optional category budget
}

export interface MonthlyBudget {
  monthKey: string; // YYYY-MM
  totalBudget: number;
  categoryBudgets: Record<string, number>; // categoryId -> limit
}

export interface MonthSummary {
  monthKey: string; // YYYY-MM
  label: string; // e.g., "August 2026"
  openingBalance: number; // Rollover from previous month + initial base
  totalIncome: number;
  totalExpenses: number;
  netSavings: number; // Income - Expenses
  closingBalance: number; // openingBalance + netSavings
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  categoryColor: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type AlertLevel = 'info' | 'warning' | 'danger' | 'success';

export interface BudgetAlert {
  id: string;
  type: 'total' | 'category';
  categoryId?: string;
  categoryName?: string;
  spent: number;
  limit: number;
  percentage: number;
  level: AlertLevel;
  message: string;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'rollover';
