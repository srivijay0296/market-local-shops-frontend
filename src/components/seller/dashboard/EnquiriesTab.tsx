import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, Package } from "lucide-react";

interface EnquiriesTabProps {
  enquiries: any[];
}

export const EnquiriesTab = React.memo(function EnquiriesTab({ enquiries }: EnquiriesTabProps) {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 border border-border shadow-sm">
        <h2 className="text-xl font-display font-black text-foreground">Customer Enquiries</h2>
        <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mt-1">Direct messages and quotes from buyers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enquiries.map(enq => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={enq.id} 
            className="bg-card p-6 rounded-[24px] border border-border shadow-glass flex flex-col gap-4 group hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{enq.profiles?.name || 'Anonymous Buyer'}</p>
                <p className="text-[9px] text-foreground/50 uppercase tracking-wider mt-0.5">{enq.profiles?.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-foreground/45 uppercase tracking-widest flex items-center gap-1">
                <Package className="w-3 h-3 text-accent" /> Interested In:
              </p>
              <p className="text-sm font-bold text-foreground">{enq.products?.name}</p>
            </div>
            <div className="bg-background/80 p-4 rounded-xl border border-border/60">
              <p className="text-xs text-foreground/80 font-medium leading-relaxed">"{enq.message}"</p>
            </div>
            <div className="flex justify-between items-center mt-2 pt-4 border-t border-border/60">
              <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">{new Date(enq.created_at).toLocaleDateString()}</span>
              <a 
                href={`mailto:${enq.profiles?.email}`}
                className="text-xs font-bold text-accent uppercase tracking-wider hover:underline"
              >
                Reply via Email &rarr;
              </a>
            </div>
          </motion.div>
        ))}
        {enquiries.length === 0 && (
          <div className="col-span-full py-20 bg-card rounded-[28px] border border-border shadow-glass text-center">
            <MessageSquare className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <p className="text-foreground/50 font-bold uppercase text-xs tracking-widest">No enquiries received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
});
