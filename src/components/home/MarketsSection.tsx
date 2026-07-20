import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, ArrowRight, MapPin } from "lucide-react";
import type { Market } from "@/lib/api/markets";
import { safeArray } from "@/lib/utils";

interface MarketsSectionProps {
  markets: Market[];
}

export const MarketsSection = React.memo(function MarketsSection({ markets }: MarketsSectionProps) {
  if (markets.length === 0) return null;

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground">Global <span className="text-primary">Hubs</span></h2>
          <p className="text-foreground/50 mt-3 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" /> Prime provisioning locations
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {safeArray(markets).slice(0, 3).map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={`/market/${m.slug}`} className="group block h-72 rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative">
              <img src={m.image_url || "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800"} alt={m.name} className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent flex flex-col justify-end p-8">
                <div className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <ArrowRight className="w-5 h-5 text-white -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
                <h3 className="text-white font-display font-black text-3xl tracking-tight mb-2">{m.name}</h3>
                <p className="text-white/70 text-xs flex items-center gap-2 font-bold uppercase tracking-widest">
                  <MapPin className="w-4 h-4 text-primary" /> {m.location || "Core Sector"}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
});
