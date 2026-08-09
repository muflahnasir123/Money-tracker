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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[28px] max-w-md w-full p-4 sm:p-5 text-zinc-100 shadow-2xl relative overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
            {editingTransaction ? 'Edit Transaction' : 'Log New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 pt-3 pr-1 text-xs">
          
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const firstExp = categories.find(c => c.type === 'expense');
                if (firstExp) setCategory(firstExp.id);
              }}
              className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                const firstInc = categories.find(c => c.type === 'income');
                if (firstInc) setCategory(firstInc.id);
              }}
              className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
              Amount ({currencySymbol})
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-base font-bold">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Grocery Haul, Rent, Fee"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="credit_card">Credit Card</option>
              <option value="bank_account">Bank Account / Transfer</option>
              <option value="digital_wallet">Digital Wallet / Apple Pay</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Notes (Optional)</label>
            <textarea
              rows={1.5}
              placeholder="Extra context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition"
            >
              {editingTransaction ? 'Update' : 'Save Transaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
