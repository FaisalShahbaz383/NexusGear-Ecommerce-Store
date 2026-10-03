import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                NexusGear
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Engineered for audiophiles, creators, and hardware purists. Delivering premium acoustic drivers, mechanical keyboards, and precision wearable gear with end-to-end secure checkout.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-sky-400 transition-colors">Catalog & Storefront</Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-sky-400 transition-colors">Cart & Checkout</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-sky-400 transition-colors">Customer Support Desk</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-sky-400 transition-colors">Order Tracking</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Customer Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/support" className="hover:text-sky-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-sky-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-sky-400 transition-colors">Shipping Info</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-sky-400 transition-colors">Customer Support</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NexusGear Hardware & Sound. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;