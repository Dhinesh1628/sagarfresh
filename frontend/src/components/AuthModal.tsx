import React, { useState } from 'react';
import { X, AlertCircle, Lock, Mail, Phone, MapPin, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoleHint?: 'customer' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultRoleHint }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [loginIdentifier, setLoginIdentifier] = useState(
    defaultRoleHint === 'admin' ? 'ops@gomeat.in' : ''
  );
  const [loginPassword, setLoginPassword] = useState('');

  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Please enter your email or mobile number, and password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(loginIdentifier.trim(), loginPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({
        name,
        email: regEmail,
        password: regPassword,
        phone,
        address
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 text-gray-800 dark:text-gray-100 z-10 space-y-4 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-gray-950 dark:text-white">
              {mode === 'login' ? 'Sign In to GoMeat' : 'Create an Account'}
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Enter your registered login details to proceed
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode switcher tabs */}
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700 font-bold">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-1.5 rounded-md text-center cursor-pointer transition ${
              mode === 'login' ? 'bg-white dark:bg-slate-700 text-gray-950 dark:text-white shadow-2xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-1.5 rounded-md text-center cursor-pointer transition ${
              mode === 'register' ? 'bg-white dark:bg-slate-700 text-gray-950 dark:text-white shadow-2xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                Email Address or 10-Digit Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. pooja.sundaram@gmail.com or 9876543210"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>
            </div>

            {/* Credential Reference Box (Shows credentials so user knows what to type!) */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-[11px] space-y-1 text-gray-600 dark:text-gray-300">
              <span className="font-bold text-gray-800 dark:text-gray-200 block">Registered Account Credentials:</span>
              <div className="flex justify-between items-center py-0.5">
                <span>Customer (Pooja):</span>
                <span className="font-mono text-gray-900 dark:text-white font-semibold">pooja.sundaram@gmail.com / customer123</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>Hub Admin (Rajeshwar):</span>
                <span className="font-mono text-[#d11243] dark:text-rose-400 font-semibold">ops@gomeat.in / admin123</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-lg font-extrabold text-xs cursor-pointer shadow-xs transition"
            >
              {loading ? 'Verifying Credentials...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Sen"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Email</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="ananya@gmail.com"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">10-Digit Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Delivery Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / Building Name, Locality"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-lg font-extrabold text-xs cursor-pointer shadow-xs transition"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Google OAuth Section */}
        <div className="relative flex py-2 items-center my-3">
          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
            Or Continue With
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
        </div>

        <div className="w-full flex justify-center">
          <GoogleSignInButton
            text={mode === 'login' ? 'continue_with' : 'signup_with'}
            onSuccess={onClose}
            onError={(err) => setError(err)}
          />
        </div>

      </div>
    </div>
  );
};
