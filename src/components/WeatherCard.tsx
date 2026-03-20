import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WeatherCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = React.memo(({
  title,
  value,
  unit,
  icon: Icon,
  description,
  className,
}) => {
  return (
    <div className={cn(
      "bg-white p-4 rounded-xl border border-black/5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
      </div>
      {description && <p className="text-[10px] text-slate-400 italic">{description}</p>}
    </div>
  );
});
