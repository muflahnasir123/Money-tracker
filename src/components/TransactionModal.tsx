import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Tag, CreditCard, FileText } from 'lucide-react';
import { Transaction, Category, TransactionType, PaymentMethod } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'> | Transaction) => void;
  editingTransaction?: Transaction | null;
  categories: Category[];
  selectedMonth: string;
  currencySymbol: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  categories,
  selectedMonth,
  currencySymbol
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
    } else {
      setType('expense');
      setAmount('');
      const defaultCat = categories.find(c => c.type === 'expense')?.id || '';
      setCategory(defaultCat);
      setDescription('');
      
      // Default to today or selected month's 1st
      const today = new Date().toISOString().substring(0, 10);
      setDate(today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`);
      setPaymentMethod('credit_card');
      setNotes('');
    }
  }, [editingTransaction, isOpen, categories, selectedMonth]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !description || !category || !date) return;

    if (editingTransaction) {
      onSave({
        ...editingTransaction,
        type,
        amount: numAmount,
        category,
        description,
        date,
        paymentMethod,
        notes
      });
    } else {
      onSave({
        type,
        amount: numAmount,
        category,
        description,
        date,
        paymentMethod,
        notes
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] max-w-md w-full p-6 text-zinc-100 shadow-2xl relative overflow-hidden space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h3 className="text-xl font-bold tracking-tight text-white">
            {editingTransaction ? 'Edit Transaction' : 'Log New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const firstExp = categories.find(c => c.type === 'expense');
                if (firstExp) setCategory(firstExp.id);
              }}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                const firstInc = categories.find(c => c.type === 'income');
                if (firstInc) setCategory(firstInc.id);
              }}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Income</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Amount ({currencySymbol})
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-lg font-bold">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-9 pr-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Grocery Haul, Monthly Rent, Client Fee"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="credit_card">Credit Card</option>
              <option value="bank_account">Bank Account / Transfer</option>
              <option value="digital_wallet">Digital Wallet / Apple Pay</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Add extra context or receipt reference..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition"
            >
              {editingTransaction ? 'Update' : 'Save Transaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
