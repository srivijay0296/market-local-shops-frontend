import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  ShoppingCart,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Image,
  Settings,
  Menu,
  X,
} from 'lucide-react';

interface SectionItem {
  name: string;
  path: string;
  icon: JSX.Element;
}

interface Section {
  title: string;
  items: SectionItem[];
}

const sections: Section[] = [
  {
    title: 'Dashboard',
    items: [
      { name: 'Overview', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Market Management',
    items: [
      { name: 'Markets', path: '/admin/markets', icon: <Store className="w-5 h-5" /> },
      { name: 'Create Market', path: '/admin/create-market', icon: <ShoppingBag className="w-5 h-5" /> },
      { name: 'Edit Market', path: '/admin/markets', icon: <ShoppingBag className="w-5 h-5" /> }, // placeholder, same list
    ],
  },
  {
    title: 'Shop Management',
    items: [
      { name: 'Shop Requests', path: '/admin/requests', icon: <ShieldCheck className="w-5 h-5" /> },
      { name: 'Shops', path: '/admin/shops', icon: <ShoppingCart className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Product Management',
    items: [
      { name: 'Products', path: '/admin/products', icon: <ShoppingBag className="w-5 h-5" /> },
      { name: 'Add Product', path: '/add-product', icon: <ShoppingBag className="w-5 h-5" /> },
    ],
  },
  {
    title: 'User Management',
    items: [
      { name: 'Sellers', path: '/admin/sellers', icon: <UserCheck className="w-5 h-5" /> },
      { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Orders',
    items: [{ name: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> }],
  },
  {
    title: 'Content',
    items: [
      { name: 'Banners', path: '/admin/banners', icon: <Image className="w-5 h-5" /> },
      { name: 'Feed Content', path: '/admin/feed', icon: <Image className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Settings',
    items: [{ name: 'Admin Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> }],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`bg-white h-screen border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} shadow-sm`}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h2 className="text-xl font-bold text-gray-800">Admin</h2>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-gray-200">
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>
      <nav className="space-y-2">
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <ul>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors hover:bg-gray-100 ${isActive ? 'bg-gray-100 font-medium' : ''}`}
                    >
                      {item.icon}
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
