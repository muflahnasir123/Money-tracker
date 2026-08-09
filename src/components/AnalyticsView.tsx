import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  Legend 
} from 'recharts';
import { Transaction, Category, MonthSummary } from '../types';
import { formatCurrency, formatMonthLabel } from '../utils/finance';
import { PieChart, TrendingUp, TrendingDown, DollarSign, Target, Award } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
  monthSummaries: Record<string, MonthSummary>;
  selectedMonth: string;
  currencySymbol: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories,
  monthSummaries,
  selectedMonth,
  currencySymbol
}) => {
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Current month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // 1. Donut Data for Category Expenses
  const categoryPieData = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      });

    return Object.entries(map)
      .map(([catId, value]) => {
        const cat = categoryMap.get(catId);
        return {
          name: cat?.name || 'Other',
          value,
          color: cat?.color || '#64748b'
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions, categoryMap]);

  // 2. Daily Area Chart Data
  const dailySpendingData = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const dayMap: Record<number, { income: number; expense: number }> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      dayMap[i] = { income: 0, expense: 0 };
    }

    monthTransactions.forEach(t => {
      const day = parseInt(t.date.substring(8, 10), 10);
      if (dayMap[day]) {
        if (t.type === 'income') {
          dayMap[day].income += Number(t.amount);
        } else {
          dayMap[day].expense += Number(t.amount);
        }
      }
    });

    return Array.from({ length: daysInMonth }, (_, idx) => {
      const dayNum = idx + 1;
      return {
        day: `Day ${dayNum}`,
        Income: dayMap[dayNum].income,
        Expense: dayMap[dayNum].expense
      };
    });
  }, [monthTransactions, selectedMonth]);

  // 3. Multi-Month Bar Comparison Data
  const multiMonthBarData = useMemo(() => {
    const keys = Object.keys(monthSummaries).sort();
    return keys.map(mKey => {
      const summary = monthSummaries[mKey];
      return {
        month: formatMonthLabel(mKey).replace(/ 20\d\d/, ''), // e.g. "August"
        Income: summary.totalIncome,
        Expenses: summary.totalExpenses,
        NetSavings: summary.netSavings
      };
    });
  }, [monthSummaries]);

  // Key Financial KPIs
  const currentSummary = monthSummaries[selectedMonth] || {
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    openingBalance: 0
  };

  const savingsRate = currentSummary.totalIncome > 0 
    ? Math.round((currentSummary.netSavings / currentSummary.totalIncome) * 100) 
    : 0;

  const totalExpense = currentSummary.totalExpenses;
  const daysInMonth = dailySpendingData.length || 30;
  const avgDailySpend = daysInMonth > 0 ? totalExpense / daysInMonth : 0;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Financial Analytics</h2>
        <p className="text-xs text-zinc-400">Data visualizer & monthly trends for {formatMonthLabel(selectedMonth)}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Savings Rate</p>
          <p className={`text-xl font-mono font-bold ${savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {savingsRate}%
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Target: &gt; 20% of Income</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Avg Daily Expense</p>
          <p className="text-xl font-mono font-bold text-white">
            {formatCurrency(avgDailySpend, currencySymbol)}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Per day in {selectedMonth}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Net Cashflow</p>
          <p className={`text-xl font-mono font-bold ${currentSummary.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(currentSummary.netSavings, currencySymbol)}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Income minus Expense</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Top Expense</p>
          <p className="text-sm font-bold text-amber-400 truncate mt-1">
            {categoryPieData[0]?.name || 'N/A'}
          </p>
          <p className="text-[10px] font-mono text-zinc-500">
            {categoryPieData[0] ? formatCurrency(categoryPieData[0].value, currencySymbol) : '$0.00'}
          </p>
        </div>
      </div>

      {/* Donut Chart: Category Expenses */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-xl text-zinc-100 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Expense Distribution</h3>

        {categoryPieData.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-8">No expense data to visualize for this month.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => formatCurrency(val, currencySymbol)}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '16px', color: '#fff' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown Legend */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categoryPieData.map(item => {
                const percent = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-zinc-200">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(item.value, currencySymbol)} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Daily Trajectory Area Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-xl text-zinc-100 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Spending Trajectory</h3>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySpendingData}>
              <defs>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="day" stroke="#71717a" tick={{ fontSize: 10 }} />
              <YAxis stroke="#71717a" tick={{ fontSize: 10 }} tickFormatter={(v) => `${currencySymbol}${v}`} />
              <Tooltip 
                formatter={(val: number) => formatCurrency(val, currencySymbol)}
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '16px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="Expense" stroke="#f43f5e" fillOpacity={1} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Month Bar Comparison Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-xl text-zinc-100 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Month-over-Month Comparison</h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiMonthBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 11 }} />
              <YAxis stroke="#71717a" tick={{ fontSize: 10 }} tickFormatter={(v) => `${currencySymbol}${v}`} />
              <Tooltip 
                formatter={(val: number) => formatCurrency(val, currencySymbol)}
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '16px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="NetSavings" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
