import React from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { KpiCard } from "./KpiCard";
import { DashboardStats } from "@/hooks/useAdminDashboard";

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#EC4899"];

interface OverviewTabProps {
  stats: DashboardStats;
}

export const OverviewTab = React.memo(function OverviewTab({ stats }: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard label="Total Markets" value={stats.totalMarkets} change="Active geographical hubs" />
        <KpiCard label="Total Shops" value={stats.totalShops} change={`${stats.pendingShops} pending approval`} />
        <KpiCard label="Total Products" value={stats.totalProducts} change={`${stats.pendingProducts} pending approval`} />
        <KpiCard label="Total Orders" value={stats.totalOrders} change="Lifetime transactions" />
        <KpiCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} change="Consolidated volume" positive={true} />
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Area Chart for Revenue Trend */}
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Revenue Trajectory</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Monthly Marketplace Sales volume</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24% growth
            </span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesTrend && stats.salesTrend.length ? stats.salesTrend : [
                { name: "Jan", revenue: 4000 }, { name: "Feb", revenue: 6500 },
                { name: "Mar", revenue: 9800 }, { name: "Apr", revenue: 12000 }
              ]}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0" }} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart for Category shares */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-6">Market Sector Share</h3>
            <div className="h-[180px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryShares && stats.categoryShares.length ? stats.categoryShares : [
                      { name: "Silk", value: 30 }, { name: "Cotton", value: 45 }, { name: "Synthetic", value: 25 }
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats.categoryShares && stats.categoryShares.length ? stats.categoryShares : [1, 2, 3]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {(stats.categoryShares && stats.categoryShares.length ? stats.categoryShares : [
              { name: "Silk", value: 30 }, { name: "Cotton", value: 45 }, { name: "Synthetic", value: 25 }
            ]).map((c, i) => (
              <div key={c.name} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {c.name}
                </span>
                <span className="font-bold text-slate-700">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Alert Center / Quick links */}
      <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">System Insights</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            There are currently <span className="font-bold text-slate-700">{stats.pendingShops} shops</span> and <span className="font-bold text-slate-700">{stats.pendingProducts} products</span> waiting for admin clearance. Review requests to keep directory up to date.
          </p>
        </div>
      </div>
    </div>
  );
});
