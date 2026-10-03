import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const { user } = useAuth();

  const links = [
    { to: '/admin', label: 'Overview Metrics', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products & Stock', icon: Boxes },
    { to: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { to: '/admin/support', label: 'Support Inquiries', icon: MessageSquare },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 md:min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div>
        {/* Admin Header */}
        <div className="px-3 py-3 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <ShieldCheck size={18} />
            <span>Admin Control Hub</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">
            {user?.email}
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Return to store */}
      <div className="mt-8 pt-4 border-t border-slate-800">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Return to Storefront
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
