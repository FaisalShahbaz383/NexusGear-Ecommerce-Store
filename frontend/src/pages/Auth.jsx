import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

const Auth = () => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientError, setClientError] = useState('');

  const { login, register, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const switchTab = (toLogin) => {
    setIsLoginTab(toLogin);
    setClientError('');
    setError(null);
  };

  const validateForm = () => {
    setClientError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setClientError('Please provide a valid email format.');
      return false;
    }

    if (password.length < 6) {
      setClientError('Password must contain at least 6 characters.');
      return false;
    }

    if (!isLoginTab) {
      if (!name.trim()) {
        setClientError('Name is required for registration.');
        return false;
      }
      if (password !== confirmPassword) {
        setClientError('Passwords do not match. Please verify.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isLoginTab) {
      const res = await login(email, password);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      }
    } else {
      const res = await register(name, email, password);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      }
    }
  };


  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Card Header & Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/25">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isLoginTab ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-xs text-slate-400">
            Welcome back! Enter your details to access your account.
          </p>
        </div>

        {/* Dual-Tab Selector */}
        <div className="p-1 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center">
          <button
            type="button"
            onClick={() => switchTab(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isLoginTab
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchTab(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              !isLoginTab
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Account
          </button>
        </div>


        {/* Form Error Banner */}
        {(clientError || error) && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-rose-400 text-xs font-medium animate-in fade-in">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{clientError || error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Faisal Shahbaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
                <User className="absolute left-3.5 top-3 text-slate-400" size={15} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
              />
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={15} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
              />
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={15} />
            </div>
          </div>

          {!isLoginTab && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={15} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isLoginTab ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
