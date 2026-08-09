import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'cat_food', name: 'Food & Dining', type: 'expense', iconName: 'Utensils', color: '#f59e0b', budgetLimit: 30000 },
  { id: 'cat_groceries', name: 'Groceries', type: 'expense', iconName: 'ShoppingBag', color: '#10b981', budgetLimit: 40000 },
  { id: 'cat_housing', name: 'Housing & Rent', type: 'expense', iconName: 'Home', color: '#6366f1', budgetLimit: 75000 },
  { id: 'cat_utilities', name: 'Utilities & Bills', type: 'expense', iconName: 'Zap', color: '#06b6d4', budgetLimit: 25000 },
  { id: 'cat_transport', name: 'Transportation', type: 'expense', iconName: 'Car', color: '#ec4899', budgetLimit: 20000 },
  { id: 'cat_shopping', name: 'Shopping & Style', type: 'expense', iconName: 'Tag', color: '#8b5cf6', budgetLimit: 25000 },
  { id: 'cat_entertainment', name: 'Entertainment', type: 'expense', iconName: 'Film', color: '#f43f5e', budgetLimit: 15000 },
  { id: 'cat_health', name: 'Health & Fitness', type: 'expense', iconName: 'HeartPulse', color: '#14b8a6', budgetLimit: 15000 },
  { id: 'cat_education', name: 'Education & Learning', type: 'expense', iconName: 'GraduationCap', color: '#3b82f6', budgetLimit: 20000 },
  { id: 'cat_subscriptions', name: 'Subscriptions', type: 'expense', iconName: 'Tv', color: '#a855f7', budgetLimit: 8000 },
  { id: 'cat_personal', name: 'Personal Care', type: 'expense', iconName: 'Smile', color: '#f97316', budgetLimit: 12000 },
  { id: 'cat_gifts', name: 'Gifts & Donations', type: 'expense', iconName: 'Gift', color: '#e11d48', budgetLimit: 10000 },
  { id: 'cat_other_exp', name: 'Miscellaneous', type: 'expense', iconName: 'MoreHorizontal', color: '#64748b', budgetLimit: 15000 },

  // Income Categories
  { id: 'cat_salary', name: 'Salary & Wage', type: 'income', iconName: 'Briefcase', color: '#10b981' },
  { id: 'cat_freelance', name: 'Freelance & Side Gig', type: 'income', iconName: 'Laptop', color: '#3b82f6' },
  { id: 'cat_investments', name: 'Investments & Dividends', type: 'income', iconName: 'TrendingUp', color: '#8b5cf6' },
  { id: 'cat_business', name: 'Business Profits', type: 'income', iconName: 'Building2', color: '#06b6d4' },
  { id: 'cat_cashback', name: 'Refunds & Cashback', type: 'income', iconName: 'RotateCcw', color: '#f59e0b' },
  { id: 'cat_gifts_in', name: 'Gifts & Bonus', type: 'income', iconName: 'Sparkles', color: '#ec4899' },
  { id: 'cat_other_inc', name: 'Other Income', type: 'income', iconName: 'PlusCircle', color: '#64748b' }
];

export const CURRENCIES = [
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee (Rs)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)' }
];
