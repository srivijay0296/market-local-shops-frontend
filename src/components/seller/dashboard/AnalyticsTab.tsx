import React from "react";
import { motion } from "framer-motion";
import { BarChart3, MessageSquare, AlertCircle } from "lucide-react";

interface AnalyticsTabProps {
  enquiriesCount: number;
}

export const AnalyticsTab = React.memo(function AnalyticsTab({ enquiriesCount }: AnalyticsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-slate-950 dark:bg-slate-900/60 p-8 rounded-[28px] text-white shadow-glass border border-slate-900 relative overflow-hidden">
        <BarChart3 className="w-10 h-10 text-primary mb-6 relative z-10" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 relative z-10">Total Profile Views</p>
        <h4 className="text-5xl font-display font-black tracking-tight relative z-10">1,240</h4>
        <div className="mt-8 flex items-center gap-3 relative z-10">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1 }} className="h-full bg-primary"></motion.div>
          </div>
          <span className="text-[9px] font-bold text-primary uppercase tracking-wider shrink-0">+12% this week</span>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </div>
      
      <div className="bg-gradient-to-br from-primary to-accent p-8 rounded-[28px] text-primary-foreground shadow-lg relative overflow-hidden">
        <MessageSquare className="w-10 h-10 text-primary-foreground/50 mb-6 relative z-10" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/80 mb-2 relative z-10">Active Enquiries</p>
        <h4 className="text-5xl font-display font-black tracking-tight relative z-10">{enquiriesCount}</h4>
        <p className="text-xs mt-4 font-medium opacity-90 relative z-10">Potential leads awaiting response</p>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-y-1/2 translate-x-1/4 pointer-events-none" />
      </div>

      <div className="bg-card p-8 rounded-[28px] border border-border shadow-glass relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-6 text-foreground/55">
          <AlertCircle className="w-5 h-5 text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Platform Status</span>
        </div>
        <h4 className="text-lg font-display font-black text-foreground leading-none">All Systems Operational</h4>
        <p className="text-xs text-foreground/60 mt-3 leading-relaxed">Your shop is visible to the network. Payment gateways, location services, and notifications are running perfectly.</p>
      </div>
    </div>
  );
});
