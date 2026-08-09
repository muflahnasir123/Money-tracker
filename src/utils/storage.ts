import { Transaction, Category, SavingsGoal } from '../types';
import { SAMPLE_TRANSACTIONS, SAMPLE_GOALS, INITIAL_BASE_SAVINGS, INITIAL_TOTAL_BUDGET } from '../data/sampleData';
import { DEFAULT_CATEGORIES } from '../data/categories';

const TRANSACTIONS_KEY = 'fintrack_transactions_v3';
const CATEGORIES_KEY = 'fintrack_categories_v3';
const GOALS_KEY = 'fintrack_goals_v3';
const SETTINGS_KEY = 'fintrack_settings_v3';

export interface AppSettings {
  currencyCode: string;
  currencySymbol: string;
  totalMonthlyBudget: number;
  initialBaseSavings: number;
  autoSwitchMonth: boolean;
  theme: 'light' | 'dark';
}

export const DEFAULT_SETTINGS: AppSettings = {
  currencyCode: 'PKR',
  currencySymbol: 'Rs',
  totalMonthlyBudget: 100000,
  initialBaseSavings: 0,
  autoSwitchMonth: true,
  theme: 'dark'
};

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      saveTransactions([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load transactions:', e);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error('Failed to load categories:', e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories:', e);
  }
}

export function loadGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) {
      saveGoals([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load goals:', e);
    return [];
  }
}

export function saveGoals(goals: SavingsGoal[]): void {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals:', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function resetToSampleData(): void {
  saveTransactions(SAMPLE_TRANSACTIONS);
  saveCategories(DEFAULT_CATEGORIES);
  saveGoals(SAMPLE_GOALS);
  saveSettings(DEFAULT_SETTINGS);
}

export function clearAllStoredData(): void {
  saveTransactions([]);
  saveCategories(DEFAULT_CATEGORIES);
  saveGoals([]);
  saveSettings(DEFAULT_SETTINGS);
}
