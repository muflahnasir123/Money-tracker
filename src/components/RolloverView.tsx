import React, { useState } from 'react';
import { 
  Repeat, 
  Sparkles, 
  Target, 
  Plus, 
  CheckCircle2, 
  Edit3, 
  ArrowRight, 
  Wallet, 
  Award, 
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { MonthSummary, SavingsGoal } from '../types';
import { formatCurrency, formatMonthLabel } from '../utils/finance';

interface RolloverViewProps {
  monthSummaries: Record<string, MonthSummary>;
  selectedMonth: string;
  initialBaseSavings: number;
  onUpdateBaseSavings: (amount: number) => void;
  savingsGoals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoalProgress: (id: string, newAmount: number) => void;
  currencySymbol: string;
}

export const RolloverView: React.FC<RolloverViewProps> = ({
  monthSummaries,
  selectedMonth,
  initialBaseSavings,
  onUpdateBaseSavings,
  savingsGoals,
  onAddGoal,
  onUpdateGoalProgress,
  currencySymbol
}) => {
  const [isEditingBase, setIsEditingBase] = useState(false);
  const [baseInput, setBaseInput] = useState(initialBaseSavings.toString());
  
  // Goal modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');
  const [goalDate, setGoalDate] = useState('2026-12-31');

  const sortedMonthKeys = Object.keys(monthSummaries).sort();
  const currentSummary = monthSummaries[selectedMonth] || {
    openingBalance: initialBaseSavings,
    closingBalance: initialBaseSavings,
    netSavings: 0
  };

  const handleSaveBase = () => {
    const val = parseFloat(baseInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateBaseSavings(val);
      setIsEditingBase(false);
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget) return;

    onAddGoal({
      title: goalTitle,
      targetAmount: parseFloat(goalTarget) || 1000,
      currentAmount: parseFloat(goalCurrent) || 0,
      targetDate: goalDate,
      categoryColor: '#10b981'
    });

    setGoalTitle('');
    setGoalTarget('');
    setGoalCurrent('0');
    setShowGoalModal(false);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Rollover Savings & Goals</h2>
        <p className="text-xs text-zinc-400">Automated month-to-month savings roll tracker</p>
      </div>

      {/* 1. Rollover Mechanics Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-2xl text-zinc-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Automatic Savings Rollover Protocol</span>
          </div>

          {!isEditingBase ? (
            <button
              onClick={() => setIsEditingBase(true)}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Base Wallet: {formatCurrency(initialBaseSavings, currencySymbol)}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={baseInput}
                onChange={(e) => setBaseInput(e.target.value)}
                className="w-24 bg-zinc-950 border border-blue-500 rounded-xl px-2 py-1 text-xs text-white"
              />
              <button
                onClick={handleSaveBase}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Save
              </button>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-3xl font-mono font-bold text-white">
            {formatCurrency(currentSummary.closingBalance, currencySymbol)}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Current closing wallet balance for {formatMonthLabel(selectedMonth)} (Rollover Opening: {formatCurrency(currentSummary.openingBalance, currencySymbol)} + Net Savings: {formatCurrency(currentSummary.netSavings, currencySymbol)})
          </p>
        </div>

        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 text-xs space-y-2">
          <p className="font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>How Automatic Month Rollover Works:</span>
          </p>
          <p className="text-zinc-300 leading-relaxed">
            When a new calendar month starts, FinTrack automatically takes your previous month's net savings (Income minus Expenses) and rolls it into your new month's opening balance as liquid savings pool!
          </p>
        </div>
      </div>

      {/* 2. Month-by-Month Rollover Timeline */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Rollover Savings Chain History</h3>

        <div className="space-y-3">
          {sortedMonthKeys.map((mKey, idx) => {
            const sum = monthSummaries[mKey];
            const isSelected = mKey === selectedMonth;

            return (
              <div
                key={mKey}
                className={`p-4 rounded-2xl border transition ${
                  isSelected 
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-lg' 
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="text-xs font-bold text-white">{sum.label}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full">
                        Active View
                      </span>
                    )}
                  </div>

                  <span className={`text-xs font-mono font-bold ${sum.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Net: {sum.netSavings >= 0 ? '+' : ''}{formatCurrency(sum.netSavings, currencySymbol)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 font-mono">
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-sans">Opening Rollover</span>
                    <strong className="text-zinc-200">{formatCurrency(sum.openingBalance, currencySymbol)}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-sans">Income / Expense</span>
                    <strong className="text-zinc-200">{formatCurrency(sum.totalIncome, currencySymbol)} / {formatCurrency(sum.totalExpenses, currencySymbol)}</strong>
                  </div>
                  <div className="sm:text-right">
                    <span className="block text-[10px] text-zinc-500 font-sans">Ending Balance</span>
                    <strong className="text-emerald-400">{formatCurrency(sum.closingBalance, currencySymbol)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Savings Target Goals */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Financial Target Goals</h3>
            <p className="text-xs text-zinc-400">Allocate rollover savings to long-term targets</p>
          </div>

          <button
            onClick={() => setShowGoalModal(true)}
            className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>

        <div className="space-y-3">
          {savingsGoals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

            return (
              <div key={goal.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-zinc-100">{goal.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">{percent}%</span>
                </div>

                <div className="flex items-baseline justify-between text-xs text-zinc-400">
                  <span>
                    Saved: <strong className="text-zinc-200 font-mono">{formatCurrency(goal.currentAmount, currencySymbol)}</strong>
                  </span>
                  <span>
                    Target: <strong className="text-zinc-200 font-mono">{formatCurrency(goal.targetAmount, currencySymbol)}</strong>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Deposit Progress Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <span className="text-zinc-500">Target Date: {goal.targetDate}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <button
                      onClick={() => onUpdateGoalProgress(goal.id, goal.currentAmount + 100)}
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-blue-500/20 text-blue-300 rounded-lg font-bold border border-zinc-700 transition"
                    >
                      +{currencySymbol}100
                    </button>
                    <button
                      onClick={() => onUpdateGoalProgress(goal.id, goal.currentAmount + 500)}
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-blue-500/20 text-blue-300 rounded-lg font-bold border border-zinc-700 transition"
                    >
                      +{currencySymbol}500
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[28px] p-4 sm:p-5 max-w-sm w-full text-zinc-100 shadow-2xl space-y-3.5 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Create New Savings Goal</h3>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Car, House Downpayment"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Target Amount ({currencySymbol})</label>
                <input
                  type="number"
                  required
                  placeholder="3000"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Already Saved ({currencySymbol})</label>
                <input
                  type="number"
                  value={goalCurrent}
                  onChange={(e) => setGoalCurrent(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Target Date</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
