import React from 'react';
import { AlertTriangle, ShieldAlert, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { BudgetAlert } from '../types';
import { formatCurrency, formatMonthLabel } from '../utils/finance';

interface AlertBannerProps {
  alerts: BudgetAlert[];
  selectedMonth: string;
  openingBalance: number;
  prevMonthSavings: number;
  currencySymbol: string;
  onNavigateToBudgets: () => void;
  onNavigateToRollover: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts,
  selectedMonth,
  openingBalance,
  prevMonthSavings,
  currencySymbol,
  onNavigateToBudgets,
  onNavigateToRollover
}) => {
  const dangerAlerts = alerts.filter(a => a.level === 'danger');
  const warningAlerts = alerts.filter(a => a.level === 'warning');

  return (
    <div className="space-y-3 mb-6">
      {/* Automatic Month Rollover Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[28px] p-4 shadow-xl flex items-center justify-between gap-3 text-zinc-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                {formatMonthLabel(selectedMonth)} Wallet
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full">
                Rollover Active
              </span>
            </div>
            <p className="text-sm font-semibold text-zinc-200 mt-1">
              Opening Balance: <span className="text-emerald-400 font-mono font-bold">{formatCurrency(openingBalance, currencySymbol)}</span>
            </p>
            <p className="text-xs text-zinc-400">
              Includes {prevMonthSavings >= 0 ? '+' : ''}{formatCurrency(prevMonthSavings, currencySymbol)} net savings carried from previous month.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToRollover}
          className="shrink-0 p-2 text-xs font-bold text-blue-400 hover:text-white hover:bg-zinc-800 rounded-xl flex items-center gap-1 transition"
        >
          <span className="hidden sm:inline">Details</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Danger Budget Alerts */}
      {dangerAlerts.length > 0 && (
        <div className="bg-rose-950/60 border border-rose-500/40 rounded-[28px] p-4 shadow-xl flex items-start justify-between gap-3 text-rose-100">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-rose-300">
                Critical Budget Alert ({dangerAlerts.length})
              </h4>
              <p className="text-sm font-semibold mt-0.5">
                {dangerAlerts[0].message}
              </p>
              {dangerAlerts.length > 1 && (
                <p className="text-xs text-rose-300/80 mt-1">
                  Plus {dangerAlerts.length - 1} other budget breaches this month.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onNavigateToBudgets}
            className="shrink-0 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition"
          >
            Manage
          </button>
        </div>
      )}

      {/* Warning Budget Alerts */}
      {dangerAlerts.length === 0 && warningAlerts.length > 0 && (
        <div className="bg-amber-950/60 border border-amber-500/30 rounded-[28px] p-4 shadow-lg flex items-start justify-between gap-3 text-amber-100">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300">
                Budget Warning
              </h4>
              <p className="text-sm font-semibold mt-0.5">
                {warningAlerts[0].message}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToBudgets}
            className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
};
