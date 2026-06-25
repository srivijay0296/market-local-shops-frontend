import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Store, Package, ShoppingBag, ImageIcon } from "lucide-react";

export default function CreateButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const options = [
    { label: "Create Market", path: "/admin/markets/create", icon: Store, color: "text-blue-600" },
    { label: "Add Product", path: "/admin/products/create", icon: Package, color: "text-emerald-600" },
    { label: "Add Shop", path: "/admin/shops/create", icon: ShoppingBag, color: "text-purple-600" },
    { label: "Add Post", path: "/admin/feed/create", icon: ImageIcon, color: "text-amber-600" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all font-semibold m-0"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>Create New</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white overflow-hidden shadow-2xl rounded-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="text-sm font-medium text-slate-700 p-2">
            
            <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-2">
              Quick Actions
            </p>

            {options.map((option, i) => {
              const Icon = option.icon;
              return (
                <li
                  key={i}
                  onClick={() => handleNavigate(option.path)}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition mb-1 group"
                >
                  <div className={`p-1.5 rounded-lg bg-slate-100 group-hover:bg-white transition ${option.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="group-hover:text-blue-600 transition">{option.label}</span>
                </li>
              );
            })}

          </ul>
        </div>
      )}
    </div>
  );
}