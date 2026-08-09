import { Transaction, SavingsGoal } from '../types';

export const INITIAL_BASE_SAVINGS = 85000; // Starting account base balance before transactions
export const INITIAL_TOTAL_BUDGET = 160000; // Total monthly budget target

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  // --- JUNE 2026 (Past Month 2) ---
  {
    id: 'tx_june_1',
    type: 'income',
    amount: 220000,
    category: 'cat_salary',
    description: 'Monthly Salary Deposit',
    date: '2026-06-01',
    paymentMethod: 'bank_account',
    notes: 'Direct deposit'
  },
  {
    id: 'tx_june_2',
    type: 'income',
    amount: 35000,
    category: 'cat_freelance',
    description: 'UI Design Freelance Project',
    date: '2026-06-12',
    paymentMethod: 'digital_wallet',
    notes: 'Client payment'
  },
  {
    id: 'tx_june_3',
    type: 'expense',
    amount: 65000,
    category: 'cat_housing',
    description: 'House Rent Payment',
    date: '2026-06-02',
    paymentMethod: 'bank_account'
  },
  {
    id: 'tx_june_4',
    type: 'expense',
    amount: 28000,
    category: 'cat_groceries',
    description: 'Imtiaz Super Market',
    date: '2026-06-08',
    paymentMethod: 'credit_card'
  },
  {
    id: 'tx_june_5',
    type: 'expense',
    amount: 14000,
    category: 'cat_food',
    description: 'Family Dining & Cafe',
    date: '2026-06-15',
    paymentMethod: 'credit_card'
  },
  {
    id: 'tx_june_6',
    type: 'expense',
    amount: 18500,
    category: 'cat_utilities',
    description: 'K-Electric & Nayatel Fiber',
    date: '2026-06-20',
    paymentMethod: 'bank_account'
  },
  {
    id: 'tx_june_7',
    type: 'expense',
    amount: 12000,
    category: 'cat_transport',
    description: 'Fuel & Car Maintenance',
    date: '2026-06-22',
    paymentMethod: 'cash'
  },

  // --- JULY 2026 (Past Month 1) ---
  {
    id: 'tx_july_1',
    type: 'income',
    amount: 220000,
    category: 'cat_salary',
    description: 'Monthly Salary Deposit',
    date: '2026-07-01',
    paymentMethod: 'bank_account'
  },
  {
    id: 'tx_july_2',
    type: 'income',
    amount: 40000,
    category: 'cat_freelance',
    description: 'Web Development Gig',
    date: '2026-07-15',
    paymentMethod: 'digital_wallet'
  },
  {
    id: 'tx_july_3',
    type: 'expense',
    amount: 65000,
    category: 'cat_housing',
    description: 'House Rent Payment',
    date: '2026-07-02',
    paymentMethod: 'bank_account'
  },
  {
    id: 'tx_july_4',
    type: 'expense',
    amount: 32000,
    category: 'cat_groceries',
    description: 'Monthly Grocery Stock',
    date: '2026-07-07',
    paymentMethod: 'credit_card'
  },
  {
    id: 'tx_july_5',
    type: 'expense',
    amount: 18000,
    category: 'cat_food',
    description: 'Weekend Dinners & Foodpanda',
    date: '2026-07-14',
    paymentMethod: 'credit_card'
  },
  {
    id: 'tx_july_6',
    type: 'expense',
    amount: 15000,
    category: 'cat_transport',
    description: 'Petrol & Toll Expenses',
    date: '2026-07-18',
    paymentMethod: 'cash'
  },
  {
    id: 'tx_july_7',
    type: 'expense',
    amount: 21000,
    category: 'cat_utilities',
    description: 'Electricity & Gas Bills',
    date: '2026-07-21',
    paymentMethod: 'bank_account'
  },

  // --- AUGUST 2026 (CURRENT MONTH) ---
  {
    id: 'tx_aug_1',
    type: 'income',
    amount: 220000,
    category: 'cat_salary',
    description: 'August Salary Deposit',
    date: '2026-08-01',
    paymentMethod: 'bank_account',
    notes: 'Received on 1st'
  },
  {
    id: 'tx_aug_2',
    type: 'income',
    amount: 25000,
    category: 'cat_freelance',
    description: 'Consulting Honorarium',
    date: '2026-08-05',
    paymentMethod: 'digital_wallet'
  },
  {
    id: 'tx_aug_3',
    type: 'expense',
    amount: 65000,
    category: 'cat_housing',
    description: 'August House Rent',
    date: '2026-08-02',
    paymentMethod: 'bank_account'
  },
  {
    id: 'tx_aug_4',
    type: 'expense',
    amount: 28500,
    category: 'cat_food',
    description: 'Restaurants & Coffee Shops',
    date: '2026-08-04',
    paymentMethod: 'credit_card',
    notes: 'Approaching food limit!'
  },
  {
    id: 'tx_aug_5',
    type: 'expense',
    amount: 34000,
    category: 'cat_groceries',
    description: 'Weekly Supermarket Shopping',
    date: '2026-08-06',
    paymentMethod: 'credit_card'
  },
  {
    id: 'tx_aug_6',
    type: 'expense',
    amount: 14000,
    category: 'cat_transport',
    description: 'Fuel Refill & Parking',
    date: '2026-08-07',
    paymentMethod: 'cash'
  },
  {
    id: 'tx_aug_7',
    type: 'expense',
    amount: 6500,
    category: 'cat_subscriptions',
    description: 'Netflix, Spotify & Cloud',
    date: '2026-08-08',
    paymentMethod: 'credit_card',
    notes: 'Autopay recurring'
  }
];

export const SAMPLE_GOALS: SavingsGoal[] = [
  {
    id: 'goal_1',
    title: 'Emergency Rainy Day Fund',
    targetAmount: 500000,
    currentAmount: 280000,
    targetDate: '2026-12-31',
    categoryColor: '#10b981'
  },
  {
    id: 'goal_2',
    title: 'New Laptop Upgrade',
    targetAmount: 250000,
    currentAmount: 180000,
    targetDate: '2026-10-15',
    categoryColor: '#3b82f6'
  },
  {
    id: 'goal_3',
    title: 'Northern Areas Trip',
    targetAmount: 150000,
    currentAmount: 85000,
    targetDate: '2026-11-20',
    categoryColor: '#ec4899'
  }
];
