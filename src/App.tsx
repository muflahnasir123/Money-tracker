import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AlertBanner } from './components/AlertBanner';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { AnalyticsView } from './components/AnalyticsView';
import { RolloverView } from './components/RolloverView';
import { TransactionModal } from './components/TransactionModal';
import { TabHelperGuide } from './components/TabHelperGuide';

import { ActiveTab, Transaction, Category, BudgetAlert } from './types';
import { 
  loadTransactions, saveTransactions, 
  loadCategories, saveCategories, 
  loadSettings, saveSettings, 
  loadGoals, saveGoals,
  resetToSampleData,
  clearAllStoredData
} from './utils/storage';
import { 
  getCurrentMonthKey, 
  calculateMonthSummaries, 
  generateBudgetAlerts, 
  getPreviousMonthKey,
  formatCurrency,
  formatMonthLabel
} from './utils/finance';
import { 
  initAuth, 
  subscribeUserData, 
  syncTransactionToFirestore, 
  deleteTransactionFromFirestore, 
  syncCategoriesToFirestore, 
  syncGoalsToFirestore, 
  syncSettingsToFirestore,
  seedSampleFirestoreData,
  clearAllFirestoreData
} from './firebase';
import { X, Sliders, ShieldAlert, Check } from 'lucide-react';

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [categories, setCategories] = useState<Category[]>(loadCategories);
  const [goals, setGoals] = useState(loadGoals);
  const [settings, setSettings] = useState(loadSettings);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isTotalBudgetModalOpen, setIsTotalBudgetModalOpen] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState(settings.totalMonthlyBudget.toString());

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryLimitInput, setCategoryLimitInput] = useState('');

  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Firebase Auth initialization
  useEffect(() => {
    const unsubAuth = initAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Real-time Firestore sync listener
  useEffect(() => {
    if (!currentUser) return;
    const unsubData = subscribeUserData(currentUser.uid, {
      onTransactions: (txs) => setTransactions(txs),
      onCategories: (cats) => setCategories(cats),
      onGoals: (g) => setGoals(g),
      onSettings: (s) => setSettings(s)
    });
    return () => unsubData();
  }, [currentUser]);

  // Persist state updates locally and to Firebase
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveCategories(categories);
    if (currentUser) {
      syncCategoriesToFirestore(currentUser.uid, categories);
    }
  }, [categories, currentUser]);

  useEffect(() => {
    saveGoals(goals);
    if (currentUser) {
      syncGoalsToFirestore(currentUser.uid, goals);
    }
  }, [goals, currentUser]);

  useEffect(() => {
    saveSettings(settings);
    if (currentUser) {
      syncSettingsToFirestore(currentUser.uid, settings);
    }
  }, [settings, currentUser]);

  // Compute month summaries with automatic month-to-month savings rollover
  const monthSummaries = useMemo(() => {
    return calculateMonthSummaries(transactions, settings.initialBaseSavings);
  }, [transactions, settings.initialBaseSavings]);

  const currentSummary = monthSummaries[selectedMonth] || {
    monthKey: selectedMonth,
    label: formatMonthLabel(selectedMonth),
    openingBalance: settings.initialBaseSavings,
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    closingBalance: settings.initialBaseSavings
  };

  // Get previous month savings for rollover insight
  const prevMonthKey = getPreviousMonthKey(selectedMonth);
  const prevMonthSummary = monthSummaries[prevMonthKey];
  const prevMonthSavings = prevMonthSummary ? prevMonthSummary.netSavings : 0;

  // Filter transactions for current selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Generate budget alerts
  const budgetAlerts = useMemo(() => {
    return generateBudgetAlerts(monthTransactions, categories, settings.totalMonthlyBudget);
  }, [monthTransactions, categories, settings.totalMonthlyBudget]);

  // Handlers for transactions
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'> | Transaction) => {
    let savedTx: Transaction;
    if ('id' in txData) {
      savedTx = txData as Transaction;
      setTransactions(prev => prev.map(t => t.id === savedTx.id ? savedTx : t));
    } else {
      savedTx = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
      };
      setTransactions(prev => [savedTx, ...prev]);
    }

    if (currentUser) {
      syncTransactionToFirestore(currentUser.uid, savedTx);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (currentUser) {
      deleteTransactionFromFirestore(currentUser.uid, id);
    }
  };

  const handleResetAllData = () => {
    resetToSampleData();
    setTransactions(loadTransactions());
    setCategories(loadCategories());
    setGoals(loadGoals());
    setSettings(loadSettings());
    setSelectedMonth(getCurrentMonthKey());
  };

  const handleLoadDemoData = async () => {
    resetToSampleData();
    setTransactions(loadTransactions());
    setCategories(loadCategories());
    setGoals(loadGoals());
    setSettings(loadSettings());
    if (currentUser) {
      await seedSampleFirestoreData(currentUser.uid);
    }
  };

  const handleClearAllData = async () => {
    clearAllStoredData();
    setTransactions([]);
    setGoals([]);
    if (currentUser) {
      await clearAllFirestoreData(currentUser.uid);
    }
  };

  const handleSaveTotalBudget = () => {
    const val = parseFloat(totalBudgetInput);
    if (!isNaN(val) && val >= 0) {
      setSettings(prev => ({ ...prev, totalMonthlyBudget: val }));
      setIsTotalBudgetModalOpen(false);
    }
  };

  const handleSaveCategoryBudget = () => {
    if (!editingCategory) return;
    const val = parseFloat(categoryLimitInput);
    const limit = !isNaN(val) && val >= 0 ? val : undefined;

    setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, budgetLimit: limit } : c));
    setEditingCategory(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Device Frame Simulation Toggle Wrapper */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isMobileFrame 
          ? 'max-w-sm mx-auto my-6 border-[8px] border-zinc-800 rounded-[44px] shadow-2xl overflow-hidden min-h-[840px] bg-[#0A0A0B]' 
          : 'w-full'
      }`}>
        
        {/* Header Navigation */}
        <Header
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          currencySymbol={settings.currencySymbol}
          onCurrencyChange={(code, symbol) => setSettings(prev => ({ ...prev, currencyCode: code, currencySymbol: symbol }))}
          alerts={budgetAlerts}
          onResetData={handleLoadDemoData}
          onClearData={handleClearAllData}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
          isFirebaseConnected={!!currentUser}
        />

        {/* Main View Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-4 pb-24">
          
          {/* Interactive Helper Guide - What to add where and Tab Explanations */}
          <TabHelperGuide
            activeTab={activeTab}
            onOpenAddTxModal={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            onOpenBudgetModal={() => setIsTotalBudgetModalOpen(true)}
            onOpenGoalModal={() => setActiveTab('rollover')}
            onLoadDemoData={handleLoadDemoData}
            onClearAllData={handleClearAllData}
          />

          {/* Automatic Month Rollover & Active Budget Alert Banner */}
          <AlertBanner
            alerts={budgetAlerts}
            selectedMonth={selectedMonth}
            openingBalance={currentSummary.openingBalance}
            prevMonthSavings={prevMonthSavings}
            currencySymbol={settings.currencySymbol}
            onNavigateToBudgets={() => setActiveTab('budgets')}
            onNavigateToRollover={() => setActiveTab('rollover')}
          />

          {/* Active Tab View Rendering */}
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={currentSummary}
              transactions={transactions}
              categories={categories}
              totalMonthlyBudget={settings.totalMonthlyBudget}
              alerts={budgetAlerts}
              currencySymbol={settings.currencySymbol}
              selectedMonth={selectedMonth}
              onOpenAddModal={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              categories={categories}
              currencySymbol={settings.currencySymbol}
              selectedMonth={selectedMonth}
              onOpenAddModal={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              totalMonthlyBudget={settings.totalMonthlyBudget}
              categories={categories}
              transactions={transactions}
              alerts={budgetAlerts}
              currencySymbol={settings.currencySymbol}
              selectedMonth={selectedMonth}
              onOpenEditTotalBudget={() => {
                setTotalBudgetInput(settings.totalMonthlyBudget.toString());
                setIsTotalBudgetModalOpen(true);
              }}
              onOpenCategoryBudgetModal={(cat) => {
                setEditingCategory(cat);
                setCategoryLimitInput((cat.budgetLimit || 0).toString());
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              categories={categories}
              monthSummaries={monthSummaries}
              selectedMonth={selectedMonth}
              currencySymbol={settings.currencySymbol}
            />
          )}

          {activeTab === 'rollover' && (
            <RolloverView
              monthSummaries={monthSummaries}
              selectedMonth={selectedMonth}
              initialBaseSavings={settings.initialBaseSavings}
              onUpdateBaseSavings={(amt) => setSettings(prev => ({ ...prev, initialBaseSavings: amt }))}
              savingsGoals={goals}
              onAddGoal={(g) => setGoals(prev => [...prev, { ...g, id: `goal_${Date.now()}` }])}
              onUpdateGoalProgress={(id, amt) => setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: amt } : g))}
              currencySymbol={settings.currencySymbol}
            />
          )}

        </main>

        {/* Bottom Tab Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertsCount={budgetAlerts.length}
        />

      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
        categories={categories}
        selectedMonth={selectedMonth}
        currencySymbol={settings.currencySymbol}
      />

      {/* Overall Budget Limit Modal */}
      {isTotalBudgetModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[28px] p-4 sm:p-5 max-w-sm w-full text-zinc-100 shadow-2xl space-y-3.5 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Set Monthly Overall Budget</h3>
            <p className="text-xs text-zinc-400">
              Set your target expense limit for the whole month. FinTrack will alert you at 80% and 100%.
            </p>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Monthly Target ({settings.currencySymbol})</label>
              <input
                type="number"
                value={totalBudgetInput}
                onChange={(e) => setTotalBudgetInput(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-base font-bold text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-zinc-800">
              <button
                onClick={() => setIsTotalBudgetModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTotalBudget}
                className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
              >
                Save Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Budget Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[28px] p-4 sm:p-5 max-w-sm w-full text-zinc-100 shadow-2xl space-y-3.5 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Category Limit: {editingCategory.name}</h3>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Budget Cap ({settings.currencySymbol})</label>
              <input
                type="number"
                value={categoryLimitInput}
                onChange={(e) => setCategoryLimitInput(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-base font-bold text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-zinc-800">
              <button
                onClick={() => setEditingCategory(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategoryBudget}
                className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      {isAlertsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[28px] p-4 sm:p-5 max-w-md w-full text-zinc-100 shadow-2xl space-y-3.5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 shrink-0">
              <h3 className="text-base font-bold flex items-center gap-2 text-white">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Active Budget Alerts ({budgetAlerts.length})</span>
              </h3>
              <button onClick={() => setIsAlertsModalOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {budgetAlerts.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No budget warnings or breaches for this month!</p>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                {budgetAlerts.map(a => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border text-xs ${
                      a.level === 'danger'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                    }`}
                  >
                    <p className="font-bold text-white">{a.message}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Spent {formatCurrency(a.spent, settings.currencySymbol)} / {formatCurrency(a.limit, settings.currencySymbol)} ({a.percentage}%)
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right border-t border-zinc-800 shrink-0">
              <button
                onClick={() => setIsAlertsModalOpen(false)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
