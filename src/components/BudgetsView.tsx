import React from 'react';
import { 
  Sliders, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Zap, 
  Plus, 
  Edit3, 
  TrendingUp, 
  PieChart 
} from 'lucide-react';
import { Category, BudgetAlert, Transaction } from '../types';
import { formatCurrency, getDaysRemainingInMonth } from '../utils/finance';

interface BudgetsViewProps {
  totalMonthlyBudget: number;
  categories: Category[];
  transactions: Transaction[];
  alerts: BudgetAlert[];
  currencySymbol: string;
  selectedMonth: string;
  onOpenEditTotalBudget: () => void;
  onOpenCategoryBudgetModal: (category: Category) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  totalMonthlyBudget,
  categories,
  transactions,
  alerts,
  currencySymbol,
  selectedMonth,
  onOpenEditTotalBudget,
  onOpenCategoryBudgetModal
}) => {
  const monthExpenseTx = transactions.filter(t => t.date.startsWith(selectedMonth) && t.type === 'expense');
  
  // Expenses per category
  const categorySpentMap: Record<string, number> = {};
  let totalSpent = 0;

  monthExpenseTx.forEach(t => {
    const amt = Number(t.amount) || 0;
    categorySpentMap[t.category] = (categorySpentMap[t.category] || 0) + amt;
    totalSpent += amt;
  });

  const totalPercent = totalMonthlyBudget > 0 ? Math.round((totalSpent / totalMonthlyBudget) * 100) : 0;
  const totalRemaining = Math.max(0, totalMonthlyBudget - totalSpent);
  const daysInfo = getDaysRemainingInMonth(selectedMonth);
  const dailyLimit = daysInfo.remaining > 0 ? totalRemaining / daysInfo.remaining : 0;

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6 pb-20">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Budget Limits & Guards</h2>
          <p className="text-xs text-zinc-400">Set spending caps & track daily limits</p>
        </div>

        <button
          onClick={onOpenEditTotalBudget}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition active:scale-95 shrink-0"
        >
          <Sliders className="w-4 h-4" />
          <span>Edit Overall Limit</span>
        </button>
      </div>

      {/* 1. Overall Monthly Budget Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 shadow-2xl text-zinc-100 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest truncate">
            Monthly Target Cap ({selectedMonth})
          </span>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 sm:py-1 rounded-full border shrink-0 ${
            totalPercent >= 100
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : totalPercent >= 80
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            {totalPercent}% Spent
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-2xl">
          <div className="min-w-0">
            <span className="text-xl sm:text-3xl font-mono font-bold text-white break-words">
              {formatCurrency(totalSpent, currencySymbol)}
            </span>
            <span className="text-xs sm:text-sm font-mono text-zinc-400"> / {formatCurrency(totalMonthlyBudget, currencySymbol)}</span>
          </div>
          <div className="sm:text-right shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-zinc-800/60">
            <p className="text-[10px] sm:text-xs text-zinc-400">Remaining</p>
            <p className={`text-sm sm:text-base font-mono font-bold ${totalRemaining > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(totalRemaining, currencySymbol)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalPercent >= 100 
                ? 'bg-rose-500 shadow-md shadow-rose-500/50' 
                : totalPercent >= 80 
                  ? 'bg-amber-500' 
                  : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, totalPercent)}%` }}
          />
        </div>

        {/* Daily Velocity Tracker */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-zinc-300 font-medium">Daily Velocity Cap:</span>
          </div>
          <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
            {formatCurrency(dailyLimit, currencySymbol)} <span className="text-zinc-400 font-normal">/ day ({daysInfo.remaining}d left)</span>
          </span>
        </div>
      </div>

      {/* 2. Active Alerts List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Active Alerts ({alerts.length})</span>
        </h3>

        {alerts.length === 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>All budgets are healthy! No warnings or breaches detected.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(a => (
              <div
                key={a.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
                  a.level === 'danger'
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                    : 'bg-amber-950/60 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {a.level === 'danger' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-white">{a.message}</p>
                    <p className="text-[11px] font-mono opacity-80 mt-0.5">
                      Spent {formatCurrency(a.spent, currencySymbol)} of {formatCurrency(a.limit, currencySymbol)}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                  a.level === 'danger' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'
                }`}>
                  {a.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Category Budgets Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Category Limits</h3>
          <span className="text-xs text-zinc-500">Tap category to edit cap</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {expenseCategories.map(cat => {
            const spent = categorySpentMap[cat.id] || 0;
            const limit = cat.budgetLimit || 0;
            const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

            return (
              <div
                key={cat.id}
                onClick={() => onOpenCategoryBudgetModal(cat)}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-blue-400 transition">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      percent >= 100
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : percent >= 80
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {limit > 0 ? `${percent}%` : 'Unset'}
                    </span>
                    <Edit3 className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                  </div>
                </div>

                <div className="flex justify-between items-baseline text-xs text-zinc-400">
                  <span>Spent: <strong className="text-zinc-200 font-mono">{formatCurrency(spent, currencySymbol)}</strong></span>
                  <span>Cap: <strong className="text-zinc-200 font-mono">{limit > 0 ? formatCurrency(limit, currencySymbol) : 'Unset'}</strong></span>
                </div>

                {/* Progress bar */}
                {limit > 0 && (
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
