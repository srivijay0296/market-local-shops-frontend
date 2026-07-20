import React from "react";

interface KpiCardProps {
  label: string;
  value: any;
  change: string;
  positive?: boolean;
}

export const KpiCard = React.memo(function KpiCard({ label, value, change, positive }: KpiCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-display font-black text-slate-800 mt-2">{value}</h3>
      </div>
      <p className={`text-[10px] font-semibold mt-3 ${positive ? 'text-emerald-600' : 'text-slate-400'}`}>{change}</p>
    </div>
  );
});
