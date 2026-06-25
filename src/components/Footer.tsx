import { Link } from "react-router-dom";
import { Store, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a3d4d] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <Link to="/" className="flex flex-col items-start group">
               <h2 className="text-3xl font-black italic tracking-tighter leading-none text-white flex items-center gap-1 uppercase">
                  Namma<span className="text-[#ffe11b]">Market</span>
               </h2>
               <p className="text-[9px] font-black text-blue-100 uppercase tracking-[0.3em] leading-none mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  Textile Hub ✦ <span className="text-[#ffe11b]">Namma Market</span>
               </p>
            </Link>
            <p className="text-blue-100/60 text-xs font-bold leading-relaxed max-w-xs uppercase tracking-tight">
              The elite digital gateway to Bargur's finest textile manufacturing and retail ecosystem.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-blue-100/80 font-bold uppercase tracking-tight">
                <MapPin className="w-4 h-4 text-[#ffe11b]" />
                Bargur, Tamil Nadu, India
              </div>
              <div className="flex items-center gap-3 text-xs text-blue-100/80 font-bold uppercase tracking-tight">
                <Phone className="w-4 h-4 text-[#ffe11b]" />
                +91 93607 40513
              </div>
              <div className="flex items-center gap-3 text-xs text-blue-100/80 font-bold tracking-tight">
                <Mail className="w-4 h-4 text-[#ffe11b]" />
                btmbargurtextilemarket@gmail.com
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-6">About</h4>
            <ul className="space-y-3 text-xs font-bold text-white/90">
              <li><Link to="/contact" className="hover:text-[#ffe11b] transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-[#ffe11b] transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-[#ffe11b] transition-colors">Careers</Link></li>
              <li><Link to="/stories" className="hover:text-[#ffe11b] transition-colors">Namma Market Stories</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-6">Help</h4>
            <ul className="space-y-3 text-xs font-bold text-white/90">
              <li><Link to="/payments" className="hover:text-[#ffe11b] transition-colors">Payments</Link></li>
              <li><Link to="/shipping" className="hover:text-[#ffe11b] transition-colors">Shipping</Link></li>
              <li><Link to="/returns" className="hover:text-[#ffe11b] transition-colors">Cancellation & Returns</Link></li>
              <li><Link to="/faq" className="hover:text-[#ffe11b] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-6">Social</h4>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 bg-white/5 rounded-full hover:bg-[#ffe11b] hover:text-[#172337] transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <div className="mt-8 p-4 bg-white/5 rounded border border-white/10">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-[#ffe11b] mb-1">Wholesale Hub</h5>
              <p className="text-[9px] font-medium text-white/60">Registered Office: Namma Market HQ, Market St, Bargur - 635104</p>
            </div>
          </div>

        </div>

      </div>

      <div className="border-t border-white/10 bg-[#2a4f5f]">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex items-center gap-8 text-[11px] font-bold text-white/80 uppercase tracking-tight">
            <Link to="/sell" className="flex items-center gap-2 hover:text-[#ffe11b] transition-colors">
              <Store className="w-4 h-4 text-[#ffe11b]" /> Become a Seller
            </Link>
            <Link to="/advertise" className="flex items-center gap-2 hover:text-[#ffe11b] transition-colors">
              <Award className="w-4 h-4 text-[#ffe11b]" /> Advertise
            </Link>
          </div>

          <p className="text-[10px] text-white/40 font-medium">
            © 2026 Namma Market (Bargur Marketplace Hub). All rights reserved.
          </p>

          <img
            src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/payment-method-c454fb.svg"
            alt="Payment Methods"
            className="h-4 opacity-70 grayscale hover:grayscale-0 transition-all cursor-pointer"
          />
        </div>
      </div>

    </footer>
  );
}

const Award = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /><circle cx="12" cy="8" r="6" /></svg>
);