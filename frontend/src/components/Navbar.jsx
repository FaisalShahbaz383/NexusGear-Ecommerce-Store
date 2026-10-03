import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Package,
  Headphones,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  // Derive role states for clean conditional rendering
  const isGuest = !user;
  const isCustomer = user && user.role === 'user';
  // isAdmin already comes from context (user?.role === 'admin')

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                NexusGear
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  STORE
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* ADMIN: Logo + Admin Panel only */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all shadow-sm"
              >
                <LayoutDashboard size={16} />
                Admin Panel
              </Link>
            )}

            {/* CUSTOMER or GUEST: Storefront + Support */}
            {!isAdmin && (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Storefront
                </Link>
                <Link
                  to="/support"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <Headphones size={16} />
                  Support
                </Link>
              </>
            )}

            {/* CUSTOMER only: My Orders */}
            {isCustomer && (
              <Link
                to="/orders"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Package size={16} />
                My Orders
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart: visible to customers and guests only */}
            {!isAdmin && (
              <Link
                to="/checkout"
                className="relative p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70 text-slate-200 hover:text-white hover:border-sky-500/50 hover:bg-slate-800 transition-all group"
                title="Shopping Cart & Checkout"
                aria-label={`Shopping cart with ${itemsCount} items`}
              >
                <ShoppingBag size={20} className="group-hover:scale-110 transition-transform duration-200" />
                {itemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[11px] font-extrabold flex items-center justify-center shadow-lg shadow-sky-500/40 ring-2 ring-slate-900 animate-in zoom-in-75 duration-200">
                    {itemsCount > 99 ? '99+' : itemsCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Dropdown or Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-slate-800/80 border border-slate-700/70 text-slate-200 hover:border-sky-500/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-none line-clamp-1">{user.name}</p>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role}</span>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-700/60">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>

                    {/* Customer dropdown items */}
                    {isCustomer && (
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      >
                        <Package size={16} />
                        Order History
                      </Link>
                    )}

                    {/* Admin dropdown items */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/10"
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-700/60 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 transition-all hover:shadow-sky-500/40"
              >
                <UserIcon size={16} />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile header row */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile cart: customers and guests only */}
            {!isAdmin && (
              <Link
                to="/checkout"
                className="relative p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-all"
                aria-label={`Shopping cart with ${itemsCount} items`}
              >
                <ShoppingBag size={20} />
                {itemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md shadow-sky-500/40 ring-2 ring-slate-900">
                    {itemsCount > 99 ? '99+' : itemsCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {/* ADMIN mobile: Admin Panel only */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-amber-300 hover:bg-amber-500/10"
            >
              Admin Panel
            </Link>
          )}

          {/* CUSTOMER or GUEST mobile: Storefront + Support */}
          {!isAdmin && (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Storefront
              </Link>
              <Link
                to="/support"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Support
              </Link>
            </>
          )}

          {/* CUSTOMER mobile: My Orders */}
          {isCustomer && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              My Orders
            </Link>
          )}

          <div className="pt-2 border-t border-slate-800">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 text-base font-medium"
              >
                Sign Out ({user.email})
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl bg-sky-500 text-white font-semibold"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
