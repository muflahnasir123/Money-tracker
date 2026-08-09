import { Transaction, MonthlyBudget, MonthSummary, BudgetAlert, Category } from '../types';

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getPreviousMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1; // 0-indexed month
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getNextMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + 1; // 1-indexed month + 1
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function formatCurrency(amount: number, symbol: string = '$'): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${isNegative ? '-' : ''}${symbol}${absVal}`;
}

/**
 * Calculates cascading rollover savings month by month
 */
export function calculateMonthSummaries(
  transactions: Transaction[],
  initialBaseBalance: number = 1000
): Record<string, MonthSummary> {
  // Extract all distinct months from transactions plus current month and adjacent months
  const monthKeysSet = new Set<string>();
  monthKeysSet.add(getCurrentMonthKey());

  transactions.forEach(t => {
    if (t.date && t.date.length >= 7) {
      monthKeysSet.add(t.date.substring(0, 7));
    }
  });

  // Sort months chronologically
  const sortedMonths = Array.from(monthKeysSet).sort();

  // If there are missing intermediate months, bridge them
  if (sortedMonths.length > 1) {
    const minMonth = sortedMonths[0];
    const maxMonth = sortedMonths[sortedMonths.length - 1];
    let curr = minMonth;
    while (curr <= maxMonth) {
      monthKeysSet.add(curr);
      curr = getNextMonthKey(curr);
    }
  }

  const allSortedMonths = Array.from(monthKeysSet).sort();
  const summaries: Record<string, MonthSummary> = {};

  let runningOpeningBalance = initialBaseBalance;

  for (const mKey of allSortedMonths) {
    const monthTx = transactions.filter(t => t.date.startsWith(mKey));
    
    let totalIncome = 0;
    let totalExpenses = 0;

    monthTx.forEach(t => {
      if (t.type === 'income') {
        totalIncome += Number(t.amount) || 0;
      } else {
        totalExpenses += Number(t.amount) || 0;
      }
    });

    const netSavings = totalIncome - totalExpenses;
    const closingBalance = runningOpeningBalance + netSavings;

    summaries[mKey] = {
      monthKey: mKey,
      label: formatMonthLabel(mKey),
      openingBalance: runningOpeningBalance,
      totalIncome,
      totalExpenses,
      netSavings,
      closingBalance
    };

    // Next month's opening balance is this month's closing balance (carried savings!)
    runningOpeningBalance = closingBalance;
  }

  return summaries;
}

/**
 * Evaluates budget status and generates active alerts
 */
export function generateBudgetAlerts(
  transactionsForMonth: Transaction[],
  categories: Category[],
  totalMonthlyBudget: number
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  // Total expenses for the month
  const totalExpense = transactionsForMonth
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Check total budget
  if (totalMonthlyBudget > 0) {
    const percent = Math.round((totalExpense / totalMonthlyBudget) * 100);
    if (percent >= 100) {
      alerts.push({
        id: 'alert_total_exceeded',
        type: 'total',
        spent: totalExpense,
        limit: totalMonthlyBudget,
        percentage: percent,
        level: 'danger',
        message: `Overall monthly budget exceeded! You've spent ${percent}% of your limit.`
      });
    } else if (percent >= 80) {
      alerts.push({
        id: 'alert_total_warning',
        type: 'total',
        spent: totalExpense,
        limit: totalMonthlyBudget,
        percentage: percent,
        level: 'warning',
        message: `High spending warning! You've reached ${percent}% of your total monthly budget.`
      });
    }
  }

  // Calculate category expenses
  const categoryExpenses: Record<string, number> = {};
  transactionsForMonth
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + (Number(t.amount) || 0);
    });

  // Check category budgets
  categories.forEach(cat => {
    if (cat.type === 'expense' && cat.budgetLimit && cat.budgetLimit > 0) {
      const spent = categoryExpenses[cat.id] || 0;
      const limit = cat.budgetLimit;
      const percent = Math.round((spent / limit) * 100);

      if (percent >= 100) {
        alerts.push({
          id: `alert_cat_${cat.id}_danger`,
          type: 'category',
          categoryId: cat.id,
          categoryName: cat.name,
          spent,
          limit,
          percentage: percent,
          level: 'danger',
          message: `${cat.name} budget limit breached (${percent}%)! Spent ${spent} / ${limit}.`
        });
      } else if (percent >= 80) {
        alerts.push({
          id: `alert_cat_${cat.id}_warning`,
          type: 'category',
          categoryId: cat.id,
          categoryName: cat.name,
          spent,
          limit,
          percentage: percent,
          level: 'warning',
          message: `${cat.name} spending is at ${percent}% of its $${limit} budget limit.`
        });
      }
    }
  });

  return alerts;
}

export function getDaysRemainingInMonth(monthKey: string): { remaining: number; total: number; currentDay: number } {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  
  const totalDays = new Date(year, month, 0).getDate();
  const now = new Date();
  
  const isCurrentMonth = getCurrentMonthKey() === monthKey;
  if (!isCurrentMonth) {
    return { remaining: 0, total: totalDays, currentDay: totalDays };
  }

  const currentDay = Math.min(now.getDate(), totalDays);
  const remaining = Math.max(1, totalDays - currentDay + 1);

  return { remaining, total: totalDays, currentDay };
}
