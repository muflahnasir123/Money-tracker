import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  DollarSign, 
  Bell, 
  RotateCcw, 
  Sparkles,
  Smartphone,
  Check,
  Cloud
} from 'lucide-react';
import { CURRENCIES } from '../data/categories';
import { formatMonthLabel, getPreviousMonthKey, getNextMonthKey, getCurrentMonthKey } from '../utils/finance';
import { BudgetAlert } from '../types';

interface HeaderProps {
  selectedMonth: string;
  onMonthChange: (monthKey: string) => void;
  currencySymbol: string;
  onCurrencyChange: (code: string, symbol: string) => void;
  alerts: BudgetAlert[];
  onResetData: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenAlertsModal: () => void;
  isFirebaseConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMonth,
  onMonthChange,
  currencySymbol,
  onCurrencyChange,
  alerts,
  onResetData,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenAlertsModal,
  isFirebaseConnected = true
}) => {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentMonthKey = getCurrentMonthKey();
  const isCurrentMonth = selectedMonth === currentMonthKey;

  // Generate available months for picker
  const generateMonthOptions = () => {
    const options = [];
    const [currYearStr, currMonthStr] = currentMonthKey.split('-');
    const currYear = parseInt(currYearStr, 10);
    
    // Past 12 months + future 3 months
    for (let year = currYear - 1; year <= currYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const key = `${year}-${String(month).padStart(2, '0')}`;
        options.push(key);
      }
    }
    return options.sort().reverse();
  };

  const dangerAlertsCount = alerts.filter(a => a.level === 'danger').length;

  return (
    <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 shadow-xl px-4 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* App Title & Subtitle */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/30 text-lg">
              $
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                Financial Management
              </p>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>FinTrack Pro</span>
                {isFirebaseConnected && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Cloud className="w-3 h-3 text-amber-400 animate-pulse" />
                    Firebase
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Mobile Bell Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenAlertsModal}
              className="relative p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
              title="Budget Alerts"
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${
                  dangerAlertsCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                }`}>
                  {alerts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Month Navigation & Picker */}
        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={() => onMonthChange(getPreviousMonthKey(selectedMonth))}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm tracking-tight transition"
            >
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{formatMonthLabel(selectedMonth)}</span>
              {isCurrentMonth && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  NOW
                </span>
              )}
            </button>

            {/* Month Picker Dropdown */}
            {showMonthPicker && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 max-h-72 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 divide-y divide-zinc-800">
                <div className="pb-2">
                  <button
                    onClick={() => {
                      onMonthChange(currentMonthKey);
                      setShowMonthPicker(false);
                    }}
                    className="w-full text-xs font-bold text-blue-400 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 rounded-xl px-3 py-2 flex items-center justify-between transition"
                  >
                    <span>Jump to Current Month</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="pt-2 space-y-1">
                  {generateMonthOptions().map(mKey => {
                    const isSel = mKey === selectedMonth;
                    const isCurr = mKey === currentMonthKey;
                    return (
                      <button
                        key={mKey}
                        onClick={() => {
                          onMonthChange(mKey);
                          setShowMonthPicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                          isSel 
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span>{formatMonthLabel(mKey)}</span>
                        {isCurr && <span className="text-[10px] text-emerald-400 font-bold uppercase">Current</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onMonthChange(getNextMonthKey(selectedMonth))}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {!isCurrentMonth && (
            <button
              onClick={() => onMonthChange(currentMonthKey)}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded-xl transition shadow-md"
              title="Return to active month"
            >
              Today
            </button>
          )}
        </div>

        {/* Right Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition"
            >
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono">{currencySymbol}</span>
            </button>

            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Currency</div>
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onCurrencyChange(c.code, c.symbol);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                      currencySymbol === c.symbol ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{c.name}</span>
                    {currencySymbol === c.symbol && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bell Alerts Button */}
          <button
            onClick={onOpenAlertsModal}
            className="relative p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition border border-zinc-700"
            title="Budget Alerts"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${
                dangerAlertsCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
              }`}>
                {alerts.length}
              </span>
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-700 transition border border-zinc-700"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mobile Frame Toggle */}
          <button
            onClick={onToggleMobileFrame}
            className={`p-2 rounded-xl transition border ${
              isMobileFrame 
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
            title="Toggle Device Frame"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 max-w-sm w-full text-zinc-100 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Reset Demo Data?</h3>
            <p className="text-xs text-zinc-400 mb-6">
              This will restore pre-populated 3-month demo transactions and savings rollover.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white transition"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
