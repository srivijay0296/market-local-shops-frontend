import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid, Shirt, Package, Scissors } from "lucide-react";

const categories = [
  { id: "textiles", name: "Textiles", icon: LayoutGrid, img: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600", color: "from-primary to-accent" },
  { id: "mens-wear", name: "Mens Wear", icon: Shirt, img: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=600", color: "from-accent to-destructive" },
  { id: "ladies-special", name: "Ladies Special", icon: Scissors, img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=600", color: "from-warning to-accent" },
  { id: "raw-materials", name: "Raw Materials", icon: Package, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600", color: "from-success to-primary" },
];

export const CategorySection = React.memo(function CategorySection() {
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground">Protocol <span className="text-primary">Categories</span></h2>
          <p className="text-foreground/50 mt-3 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-accent" /> Filter global assets by classification
          </p>
        </div>
        <Link to="/products" className="btn-primary py-3 px-8 text-xs shrink-0 self-start md:self-auto">
          Explore All Classes
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={`/products?category_id=${c.id}`}
              className="group relative h-80 rounded-3xl overflow-hidden block border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <img src={c.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={c.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-6 shadow-xl transform group-hover:-rotate-12 transition-transform duration-500`}>
                  <c.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-display font-black text-2xl tracking-tight mb-1">{c.name}</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">View Class &rarr;</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
});
