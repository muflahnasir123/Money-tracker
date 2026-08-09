import React from 'react';
import { LayoutDashboard, Receipt, PieChart, Sliders, Repeat } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  alertsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  alertsCount
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions' as ActiveTab, label: 'Transactions', icon: Receipt },
    { id: 'budgets' as ActiveTab, label: 'Budgets', icon: Sliders, badge: alertsCount },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: PieChart },
    { id: 'rollover' as ActiveTab, label: 'Rollover', icon: Repeat },
  ];

  return (
    <nav id="bottom-navigation-bar" className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 shadow-2xl px-2 py-1.5">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'text-blue-400 font-bold scale-105' 
                  : 'text-zinc-500 hover:text-zinc-300 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition ${isActive ? 'bg-blue-600/20' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>

              {/* Active Pill Indicator */}
              {isActive && (
                <span className="absolute -bottom-1 w-5 h-1 bg-blue-500 rounded-full" />
              )}

              {/* Alert Badge */}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
