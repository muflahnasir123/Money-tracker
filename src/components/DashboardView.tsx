import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  Repeat, 
  Calendar,
  Wallet,
  ChevronRight,
  ShieldCheck,
  Zap,
  CreditCard,
  Building2,
  Banknote
} from 'lucide-react';
import { MonthSummary, Transaction, Category, BudgetAlert } from '../types';
import { formatCurrency, getDaysRemainingInMonth } from '../utils/finance';

interface DashboardViewProps {
  summary: MonthSummary;
  transactions: Transaction[];
  categories: Category[];
  totalMonthlyBudget: number;
  alerts: BudgetAlert[];
  currencySymbol: string;
  selectedMonth: string;
  onOpenAddModal: () => void;
  onNavigateToTab: (tab: 'transactions' | 'budgets' | 'analytics' | 'rollover') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  transactions,
  categories,
  totalMonthlyBudget,
  alerts,
  currencySymbol,
  selectedMonth,
  onOpenAddModal,
  onNavigateToTab
}) => {
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const recentTransactions = [...monthTransactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Category expense breakdown
  const categoryMap = new Map<string, Category>(categories.map(c => [c.id, c]));
  const categoryExpenses: Record<string, number> = {};
  
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + (Number(t.amount) || 0);
    });

  const topExpenseCategories = Object.entries(categoryExpenses)
    .map(([catId, amount]) => ({
      category: categoryMap.get(catId),
      amount
    }))
    .filter((item): item is { category: Category; amount: number } => Boolean(item.category))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  // Budget calculations
  const budgetSpent = summary.totalExpenses;
  const budgetPercent = totalMonthlyBudget > 0 ? Math.round((budgetSpent / totalMonthlyBudget) * 100) : 0;
  const budgetRemaining = Math.max(0, totalMonthlyBudget - budgetSpent);
  const daysInfo = getDaysRemainingInMonth(selectedMonth);
  const dailyVelocity = daysInfo.remaining > 0 ? budgetRemaining / daysInfo.remaining : 0;

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Main Wallet Card with Rollover Savings */}
      <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-[32px] p-4 sm:p-6 shadow-2xl text-white">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 sm:space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Total Balance
              </span>
            </div>

            <button
              onClick={() => onNavigateToTab('rollover')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-emerald-400 text-[11px] sm:text-xs font-mono font-bold hover:bg-zinc-700 transition ml-auto sm:ml-0"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Rollover: {formatCurrency(summary.openingBalance, currencySymbol)}</span>
            </button>
          </div>

          <div>
            <div className="text-2xl sm:text-4xl font-mono font-bold tracking-tight text-white leading-tight break-words">
              {formatCurrency(summary.closingBalance, currencySymbol)}
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Opening ({formatCurrency(summary.openingBalance, currencySymbol)})</span>
              <span className="text-zinc-600">+</span>
              <span className={`font-mono font-bold ${summary.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Savings ({formatCurrency(summary.netSavings, currencySymbol)})
              </span>
            </p>
          </div>

          {/* Income vs Expense Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
            {/* Income Box */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 sm:p-3.5 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 w-fit">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Income</p>
                <p className="text-xs sm:text-base font-mono font-bold text-emerald-400 truncate">
                  {formatCurrency(summary.totalIncome, currencySymbol)}
                </p>
              </div>
            </div>

            {/* Expense Box */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 sm:p-3.5 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 w-fit">
                <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Expenses</p>
                <p className="text-xs sm:text-base font-mono font-bold text-rose-400 truncate">
                  {formatCurrency(summary.totalExpenses, currencySymbol)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monthly Budget Alert & Spending Velocity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-4 sm:p-6 shadow-xl text-zinc-100 space-y-4">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Sliders className="w-4 h-4 text-blue-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">Monthly Budget Limit</h3>
          </div>
          <button
            onClick={() => onNavigateToTab('budgets')}
            className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1 shrink-0 ml-auto"
          >
            <span>Edit Limit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-xs">
            <span className="font-medium text-zinc-400">
              Spent <span className="font-mono font-bold text-white">{formatCurrency(budgetSpent, currencySymbol)}</span> of <span className="font-mono">{formatCurrency(totalMonthlyBudget, currencySymbol)}</span>
            </span>
            <span className={`font-mono font-bold ${
              budgetPercent >= 100 ? 'text-rose-400' : budgetPercent >= 80 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {budgetPercent}% Used
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercent >= 100 
                  ? 'bg-rose-500 shadow-lg shadow-rose-500/50' 
                  : budgetPercent >= 80 
                    ? 'bg-amber-500' 
                    : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, budgetPercent)}%` }}
            />
          </div>

          {/* Velocity Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 pt-1 gap-1">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Daily velocity cap:
            </span>
            <span className="font-mono font-bold text-zinc-200">
              {formatCurrency(dailyVelocity, currencySymbol)} <span className="text-zinc-400 font-normal">/ day ({daysInfo.remaining}d left)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Top Spending Categories & Quick Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Expense Categories Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-xl text-zinc-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Expenses</h3>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Charts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topExpenseCategories.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-4 text-center">No expenses recorded for this month yet.</p>
          ) : (
            <div className="space-y-3">
              {topExpenseCategories.map(({ category, amount }) => {
                if (!category) return null;
                const catPercent = summary.totalExpenses > 0 ? Math.round((amount / summary.totalExpenses) * 100) : 0;

                return (
                  <div key={category.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: category.color }} 
                        />
                        <span className="font-semibold text-zinc-300">{category.name}</span>
                      </div>
                      <span className="font-mono font-bold text-zinc-100">
                        {formatCurrency(amount, currencySymbol)} ({catPercent}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300" 
                        style={{ width: `${catPercent}%`, backgroundColor: category.color }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Add Floating Action Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>FinTrack Guard</span>
            </div>
            <h4 className="text-lg font-bold text-white">Log Income or Expense</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Record new income or expense items instantly. Rollover savings & limits auto-update.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 4. Recent Transactions Feed */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-xl text-zinc-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity</h3>
          <button
            onClick={() => onNavigateToTab('transactions')}
            className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>See All ({monthTransactions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 space-y-2">
            <p className="text-xs">No transactions in this month.</p>
            <button
              onClick={onOpenAddModal}
              className="text-xs text-blue-400 font-bold hover:underline"
            >
              + Add your first transaction
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map(tx => {
              const cat = categoryMap.get(tx.category);
              const isIncome = tx.type === 'income';

              return (
                <div key={tx.id} className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: cat?.color || '#3f3f46' }}
                    >
                      {isIncome ? <TrendingUp className="w-4.5 h-4.5 text-emerald-400" /> : <TrendingDown className="w-4.5 h-4.5 text-rose-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-100 truncate">{tx.description}</p>
                      <p className="text-[10px] font-medium text-zinc-400 truncate mt-0.5">
                        {cat?.name || 'General'} • {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`text-xs font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-zinc-100'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currencySymbol)}
                    </p>
                    <span className="text-[9px] text-zinc-400 capitalize px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 inline-block mt-0.5 font-mono">
                      {tx.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
