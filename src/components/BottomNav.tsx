import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, PlusSquare, History, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Only show on mobile, and maybe hide on some specific pages (like admin or checkout)
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/checkout')) {
     return null;
  }

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Feed', path: '/seller-feed', icon: LayoutGrid },
    { label: 'Upload', path: '/seller', icon: PlusSquare },
    { label: 'Orders', path: '/orders', icon: History },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
       <div className="flex justify-around items-center h-16">
         {navItems.map((item) => {
           const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
           return (
             <Link 
               key={item.label} 
               to={item.path} 
               className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                 isActive ? 'text-[#2874f0]' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {isActive ? (
                  <div className="relative">
                     <item.icon className="w-6 h-6 stroke-[2.5]" />
                     <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                  </div>
               ) : (
                  <item.icon className="w-5 h-5 stroke-[2]" />
               )}
               <span className={`text-[10px] font-black uppercase tracking-tight ${isActive ? 'text-[#2874f0]' : ''}`}>
                 {item.label}
               </span>
             </Link>
           );
         })}
       </div>
    </div>
  );
}
