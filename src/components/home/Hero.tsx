import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Globe, ArrowRight } from "lucide-react";

interface HeroProps {
  y: any;
  opacity: any;
}

export const Hero = ({ y, opacity }: HeroProps) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center justify-center min-h-[95vh] bg-dark text-white">
      {/* Animated 3D Background Elements */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-40">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-primary/30 rounded-full mix-blend-screen filter blur-[120px] animate-float" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-accent/20 rounded-full mix-blend-screen filter blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-success/20 rounded-full mix-blend-screen filter blur-[100px] animate-float" style={{ animationDelay: "4s" }} />
      </motion.div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs font-bold uppercase tracking-widest mb-8 text-white shadow-2xl"
          >
            <Zap className="w-4 h-4 text-primary fill-primary" />
            <span>Next-Gen Enterprise Wholesale Hub</span>
          </motion.div>

          <h1 className="text-6xl md:text-[7rem] font-display font-black text-white tracking-tighter leading-[0.95] mb-8 mix-blend-lighten">
            Global <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
              Supply Protocol
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Deploy enterprise-grade provisioning. Interface directly with verified global nodes and execute high-volume asset transfers seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full max-w-md mx-auto sm:max-w-none">
            <Link to="/products" className="btn-primary w-full sm:w-auto text-sm py-5 px-10 flex items-center justify-center gap-3">
              Access Market <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/sellers" className="w-full sm:w-auto text-sm py-5 px-10 flex items-center justify-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors shadow-2xl">
              Register Node <Globe className="w-5 h-5 text-primary" />
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest">Descend</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </motion.div>
    </section>
  );
};
