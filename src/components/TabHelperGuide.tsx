import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  Layers, 
  Smartphone, 
  Database, 
  Sparkles,
  Info,
  CheckCircle2,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface TabHelperGuideProps {
  activeTab: ActiveTab;
  onOpenAddTxModal: () => void;
  onOpenBudgetModal?: () => void;
  onOpenGoalModal?: () => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
}

export const TabHelperGuide: React.FC<TabHelperGuideProps> = ({
  activeTab,
  onOpenAddTxModal,
  onOpenBudgetModal,
  onOpenGoalModal,
  onLoadDemoData,
  onClearAllData
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showApkGuide, setShowApkGuide] = useState(false);

  const tabInfo: Record<ActiveTab, {
    title: string;
    subtitle: string;
    whatIsIt: string;
    whatToAdd: string[];
    whereItGoes: string;
    primaryActionLabel?: string;
    primaryAction?: () => void;
  }> = {
    dashboard: {
      title: 'Overview & Wallet Pulse',
      subtitle: 'Real-time financial summary & month navigation',
      whatIsIt: 'Your central control panel showing current month income, total expenses, net savings, budget ring, and recent transactions.',
      whatToAdd: [
        'Add Income (Salary, Freelance, Payouts) or Expense (Groceries, Bills, Rent) using the "+ Add Transaction" button.',
        'View automated monthly health status and daily budget velocity.'
      ],
      whereItGoes: 'Transactions added here update your monthly totals, budget bars, analytics charts, and rollover savings automatically.',
      primaryActionLabel: '+ Add New Transaction',
      primaryAction: onOpenAddTxModal
    },
    transactions: {
      title: 'Transaction Log & Filters',
      subtitle: 'Record and categorize every cash movement',
      whatIsIt: 'A searchable ledger of all your income and expense transactions for any selected month.',
      whatToAdd: [
        'Expenses: Daily shopping, utilities, rent, dining, transport, entertainment.',
        'Income: Primary salary, freelance projects, business profits, dividends.',
        'Payment Methods: Cash, Bank Account, Credit Card, or Digital Wallet.'
      ],
      whereItGoes: 'Every transaction is stored in real-time Firestore database and recalculates your budget alerts and category totals.',
      primaryActionLabel: '+ Log Transaction',
      primaryAction: onOpenAddTxModal
    },
    budgets: {
      title: 'Budget Limits & Spending Guards',
      subtitle: 'Set total caps & category safeguards',
      whatIsIt: 'Set monthly budget limits for your total account and individual categories (e.g. $500/mo on Groceries).',
      whatToAdd: [
        'Overall Monthly Limit: Maximum safe spending cap for the current month.',
        'Category Spending Caps: Click on any category card to assign a specific limit.',
        'Daily Velocity Cap: Automatically calculates how much you can safely spend per day.'
      ],
      whereItGoes: 'Alerts trigger automatically when you cross 80% or 100% of any category cap.',
      primaryActionLabel: 'Set Category Cap',
      primaryAction: onOpenBudgetModal
    },
    analytics: {
      title: 'Financial Analytics & Charts',
      subtitle: 'Visual insights & month-over-month trends',
      whatIsIt: 'Interactive data visualization suite powered by Recharts with donut charts, daily area graphs, and bar comparisons.',
      whatToAdd: [
        'No manual data entry required here! This tab automatically analyzes all logged transactions.',
        'Inspect savings rates, average daily expenses, and top spending categories.'
      ],
      whereItGoes: 'Helps you spot spending spikes, evaluate savings targets, and compare performance across previous months.',
      primaryActionLabel: '+ Add Transaction',
      primaryAction: onOpenAddTxModal
    },
    rollover: {
      title: 'Rollover Savings & Target Goals',
      subtitle: 'Automated month-to-month savings roll',
      whatIsIt: 'Automates savings growth! Unspent net income from past months rolls forward into your opening wallet balance.',
      whatToAdd: [
        'Savings Goals: Add targets like "Emergency Fund", "New Laptop", or "Vacation".',
        'Base Wallet: Adjust your starting baseline account balance.',
        'Quick Deposits: Allocate savings directly to goals using +$100 or +$500 quick buttons.'
      ],
      whereItGoes: 'Ensures leftover cash from previous months is never lost and builds long-term wealth.',
      primaryActionLabel: '+ New Savings Goal',
      primaryAction: onOpenGoalModal
    }
  };

  const currentInfo = tabInfo[activeTab];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl mb-4 transition-all">
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 flex items-center justify-between cursor-pointer bg-zinc-950/80 hover:bg-zinc-950 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Guide: {currentInfo.title}</span>
              <span className="text-[10px] font-normal text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                Tab Info & Helper
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">{currentInfo.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-blue-400 font-semibold hidden sm:inline">
            {isExpanded ? 'Hide Help' : 'What to add where?'}
          </span>
          <button className="text-zinc-400 hover:text-white p-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 border-t border-zinc-800/80 space-y-4 bg-zinc-900 text-xs text-zinc-300">
          {/* What is it */}
          <div>
            <strong className="text-zinc-100 font-bold uppercase tracking-wider text-[10px] block mb-1">
              📌 What is this tab about?
            </strong>
            <p className="leading-relaxed text-zinc-300">{currentInfo.whatIsIt}</p>
          </div>

          {/* What to add */}
          <div>
            <strong className="text-zinc-100 font-bold uppercase tracking-wider text-[10px] block mb-1">
              ✏️ What to add here?
            </strong>
            <ul className="space-y-1 text-zinc-300">
              {currentInfo.whatToAdd.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Where it goes */}
          <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
            <strong className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Where does this data go?</span>
            </strong>
            <p className="text-zinc-400 text-[11px] leading-relaxed">{currentInfo.whereItGoes}</p>
          </div>

          {/* Quick Actions & Data Controls */}
          <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {currentInfo.primaryActionLabel && currentInfo.primaryAction && (
                <button
                  onClick={currentInfo.primaryAction}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{currentInfo.primaryActionLabel}</span>
                </button>
              )}

              <button
                onClick={onLoadDemoData}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Populate test transactions for charts"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Sample Data</span>
              </button>

              <button
                onClick={onClearAllData}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Wipe data to start 100% fresh"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Start Clean (0 Data)</span>
              </button>
            </div>

            <button
              onClick={() => setShowApkGuide(!showApkGuide)}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>How to build Android APK?</span>
            </button>
          </div>

          {/* Android APK & Instant PWA Mobile Installation Box */}
          {showApkGuide && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-amber-200 text-xs space-y-3">
              <div>
                <strong className="font-bold flex items-center gap-1 text-amber-400 text-sm mb-1">
                  <Smartphone className="w-4 h-4" />
                  <span>Option 1: Instant Mobile App Installation (No PC or APK required!)</span>
                </strong>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  This app is fully configured as a Progressive Web App (PWA) with live Firebase backend synchronization. You can install it directly onto your Android phone's home screen right now:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 mt-2">
                  <li>Open the <strong className="text-white">Shared App Link</strong> in Google Chrome on your Android mobile device.</li>
                  <li>Tap the <strong className="text-white">Three Dots (⋮) Menu</strong> in Chrome's top right corner.</li>
                  <li>Tap <strong className="text-amber-300">"Install App"</strong> or <strong className="text-amber-300">"Add to Home screen"</strong>.</li>
                  <li>An app icon named <strong>FinTrack Pro</strong> will instantly appear on your mobile home screen and launch fullscreen like a native Android app!</li>
                </ol>
              </div>

              <div className="pt-2 border-t border-amber-500/20">
                <strong className="font-bold text-amber-400 text-xs block mb-1">
                  Option 2: Generate compiled .APK file for Android distribution
                </strong>
                <p className="text-[11px] text-zinc-300 leading-relaxed mb-2">
                  To build a standalone `.apk` binary file using Android build tools or cloud build services:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300 font-mono bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                  <li>Export project code via Top Right Menu &rarr; Export to GitHub / ZIP.</li>
                  <li>Upload repository to GitHub and connect to a free mobile cloud builder like <strong>Codemagic</strong> or <strong>Appflow</strong> to compile an `.apk` automatically in the cloud without local Android Studio!</li>
                  <li>Or run locally with Capacitor: <code className="text-amber-300">npx cap add android && npx cap open android</code></li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
