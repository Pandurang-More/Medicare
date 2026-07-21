import React from 'react';
export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colors = {
    blue: 'bg-primary-50 text-primary-600 ring-1 ring-primary-500/20',
    green: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20',
    yellow: 'bg-amber-50 text-amber-600 ring-1 ring-amber-500/20',
    red: 'bg-rose-50 text-rose-600 ring-1 ring-rose-500/20',
    purple: 'bg-purple-50 text-purple-600 ring-1 ring-purple-500/20'
  };

  return (
    <div className="card group cursor-pointer flex items-center gap-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className={`p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm ${colors[color]}`}>
        <Icon className="text-2xl" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 tracking-wide mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs font-medium text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}