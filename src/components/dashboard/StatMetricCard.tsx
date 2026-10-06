import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatMetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  variant?: 'danger' | 'warning' | 'primary' | 'success' | 'slate';
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
}

export const StatMetricCard: React.FC<StatMetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'slate',
  trend,
}) => {
  const variantStyles = {
    danger: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      iconBg: 'bg-red-500/20 text-red-400',
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
    primary: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-400',
    },
    success: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    slate: {
      border: 'border-slate-800',
      bg: 'bg-slate-900/60',
      text: 'text-slate-200',
      iconBg: 'bg-slate-800 text-slate-400',
    },
  }[variant];

  return (
    <div
      className={`glass-panel p-5 rounded-2xl border ${variantStyles.border} ${variantStyles.bg} relative overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-lg`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
          {label}
        </span>
        <div className={`p-2 rounded-xl ${variantStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
          {value}
        </span>
        {subValue && <span className="text-xs text-slate-400">{subValue}</span>}
      </div>

      {trend && (
        <div className="mt-2.5 flex items-center space-x-1.5 text-xs">
          {trend.isNeutral ? (
            <Minus className="w-3.5 h-3.5 text-slate-400" />
          ) : trend.isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span
            className={
              trend.isNeutral
                ? 'text-slate-400'
                : trend.isPositive
                ? 'text-emerald-400'
                : 'text-rose-400'
            }
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};
