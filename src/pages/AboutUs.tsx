import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Award, ShieldCheck, Truck, Users, Sprout, ShoppingBag, Store, Zap, Cpu, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden">
      <Header />
      
      {/* Narrative Hero */}
      <div className="relative pt-40 pb-32 overflow-hidden bg-dark text-white border-b border-border">
         <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] mix-blend-screen opacity-30" />
         </div>
         
         <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest mb-8 text-white shadow-2xl"
            >
               <Cpu className="w-4 h-4 text-primary" />
               <span>System Architecture & Vision</span>
            </motion.div>
            
            <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-6xl md:text-8xl font-display font-black mb-6 tracking-tighter leading-[0.9]"
            >
               Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Heritage</span>
            </motion.h1>
            
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-xl md:text-2xl text-white/60 font-medium max-w-3xl mx-auto leading-relaxed"
            >
               Revolutionizing the global supply ecosystem through digital craftsmanship, high-frequency connectivity, and enterprise-grade retail infrastructure.
            </motion.p>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-32 space-y-40 relative z-10">
         {/* Mission Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="space-y-8"
            >
               <div className="h-1.5 w-24 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
               <h2 className="text-5xl md:text-6xl font-display font-black text-foreground tracking-tight leading-none">
                  Core Infrastructure, <br /> <span className="text-primary">Infinite Scale</span>
               </h2>
               <p className="text-foreground/60 text-lg font-medium leading-relaxed">
                  Our platform was architected with a singular vision: to empower verified nodes and suppliers with a first-class digital framework capable of global distribution.
               </p>
               <p className="text-foreground/60 font-medium leading-relaxed">
                  We transcend standard commerce protocols. We are the digital heartbeat of a heritage industry. From agile manufacturing units to immense wholesale hubs, we provide the computational tools necessary to project mastery worldwide.
               </p>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-6 relative">
               <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-10" />
               <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-2xl border border-border"
               >
                  <img src="https://images.unsplash.com/photo-1528459840556-42d833923461?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" alt="Weaving" />
               </motion.div>
               <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="aspect-[4/5] bg-dark rounded-3xl mt-12 overflow-hidden shadow-2xl border border-border"
               >
                  <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 opacity-90" alt="Textiles" />
               </motion.div>
            </div>
         </div>

         {/* Core Values */}
         <div className="bg-white/40 backdrop-blur-2xl p-10 md:p-20 rounded-[3rem] border border-border shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-success/10 rounded-full blur-[80px] pointer-events-none" />
            
            <h3 className="text-center text-4xl md:text-5xl font-display font-black text-foreground mb-16 tracking-tight relative z-10">Protocol Directives</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-border group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
               >
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500 border border-border shadow-sm">
                     <Globe className="w-8 h-8" />
                  </div>
                  <h4 className="font-display font-black text-xl mb-3 text-foreground">Decentralized Reach</h4>
                  <p className="text-foreground/60 text-sm font-medium leading-relaxed">Preserving localized architectural patterns while executing vast, cross-region supply chain optimizations.</p>
               </motion.div>

               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-border group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
               >
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-success mb-6 group-hover:bg-success group-hover:text-white transition-colors duration-500 border border-border shadow-sm">
                     <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="font-display font-black text-xl mb-3 text-foreground">Zero-Trust Fairness</h4>
                  <p className="text-foreground/60 text-sm font-medium leading-relaxed">Cryptographically bridging originators directly to clients, enforcing equitable value transfer and resource maximization.</p>
               </motion.div>

               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-border group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
               >
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-500 border border-border shadow-sm">
                     <Zap className="w-8 h-8" />
                  </div>
                  <h4 className="font-display font-black text-xl mb-3 text-foreground">Unified Synchrony</h4>
                  <p className="text-foreground/60 text-sm font-medium leading-relaxed">A monolithic interface aggregating disparate supplier networks into one seamless, high-velocity commercial engine.</p>
               </motion.div>
            </div>
         </div>

         {/* Call to Action */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center bg-dark p-12 md:p-24 rounded-[3rem] text-white overflow-hidden relative group shadow-2xl border border-white/10"
         >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-1000 blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full -translate-x-1/3 translate-y-1/3 group-hover:scale-150 transition-transform duration-1000 blur-[80px]" />
            
            <h2 className="text-5xl md:text-7xl font-display font-black mb-10 tracking-tighter relative z-10 leading-none">Initialize <br /> The Protocol</h2>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
               <Link to="/products" className="btn-primary py-5 px-12 text-sm shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)]">
                  Access Assets
               </Link>
               <Link to="/sellers" className="bg-white/5 backdrop-blur-xl text-white px-12 py-5 rounded-full font-bold border border-white/10 uppercase tracking-widest text-sm hover:bg-white/10 transition-colors">
                  Deploy Node
               </Link>
            </div>
         </motion.div>
      </main>

      <Footer />
    </div>
  );
}
