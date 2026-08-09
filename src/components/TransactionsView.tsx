import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Edit3, 
  Download, 
  Calendar,
  X,
  CreditCard,
  Banknote,
  Building2,
  Wallet
} from 'lucide-react';
import { Transaction, Category, TransactionType, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/finance';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
  selectedMonth: string;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  currencySymbol,
  selectedMonth,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Filter transactions for the selected month first, then search/filter
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter(t => {
      // Type match
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      
      // Category match
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Payment match
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const cat = categoryMap.get(t.category);
        const matchDesc = t.description.toLowerCase().includes(query);
        const matchNotes = t.notes?.toLowerCase().includes(query) || false;
        const matchCat = cat?.name.toLowerCase().includes(query) || false;
        const matchAmount = t.amount.toString().includes(query);
        return matchDesc || matchNotes || matchCat || matchAmount;
      }

      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [monthTransactions, typeFilter, categoryFilter, paymentFilter, searchTerm, categoryMap]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['ID', 'Date', 'Type', 'Amount', 'Category', 'Description', 'Payment Method', 'Notes'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.date,
      t.type,
      t.amount,
      categoryMap.get(t.category)?.name || t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FinTrack_Transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Top Header & Quick Add */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Transactions</h2>
          <p className="text-xs text-zinc-400">
            {filteredTransactions.length} items logged in {selectedMonth}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAddModal}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-4 shadow-xl space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search description, category, or notes..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Type Selector */}
          <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                typeFilter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 rounded-lg transition ${
                typeFilter === 'income' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 rounded-lg transition ${
                typeFilter === 'expense' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="bank_account">Bank Account</option>
            <option value="digital_wallet">Digital Wallet</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-4 sm:p-6 shadow-xl space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 space-y-2">
            <p className="text-sm font-semibold text-zinc-400">No matching transactions found</p>
            <p className="text-xs">Try clearing filters or add a new transaction for {selectedMonth}.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-2 text-xs font-bold text-blue-400 hover:underline inline-block"
            >
              + Log Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map(tx => {
              const cat = categoryMap.get(tx.category);
              const isIncome = tx.type === 'income';

              return (
                <div 
                  key={tx.id} 
                  className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl hover:bg-zinc-800/40 transition space-y-2.5"
                >
                  {/* Top Row: Category Icon, Description & Amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: cat?.color || '#3f3f46' }}
                      >
                        {isIncome ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-100 truncate">{tx.description}</p>
                        <p className="text-[11px] font-medium text-zinc-400 truncate mt-0.5">
                          {cat?.name || 'General'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`text-sm font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currencySymbol)}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Metadata Badges & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px]">
                        {tx.date}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 capitalize text-[10px]">
                        {tx.paymentMethod.replace('_', ' ')}
                      </span>
                      {tx.notes && (
                        <span className="text-zinc-500 italic max-w-[150px] sm:max-w-xs truncate text-[10px]">
                          "{tx.notes}"
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-blue-600/20 text-zinc-300 hover:text-blue-400 border border-zinc-800 font-semibold text-[11px] transition flex items-center gap-1"
                        title="Edit Transaction"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-rose-600/20 text-zinc-400 hover:text-rose-400 border border-zinc-800 font-semibold text-[11px] transition flex items-center gap-1"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
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
