import React, { useState } from 'react';
import { User as UserIcon, Lock, Mail, Phone, MapPin, Eye, EyeOff, Sparkles, Shield, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface GlassmorphicLoginGateProps {
  onUnlockGuest: () => void;
  isOpen?: boolean;
  onCloseModal?: () => void;
  isModalMode?: boolean;
  roleHint?: 'customer' | 'admin';
}

export const GlassmorphicLoginGate: React.FC<GlassmorphicLoginGateProps> = ({
  onUnlockGuest,
  isOpen = true,
  onCloseModal,
  isModalMode = false,
  roleHint
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState(roleHint === 'admin' ? 'ops@gomeat.in' : '');
  const [password, setPassword] = useState(roleHint === 'admin' ? 'admin123' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  React.useEffect(() => {
    if (isOpen && roleHint === 'admin') {
      setIdentifier('ops@gomeat.in');
      setPassword('admin123');
      setMode('login');
    }
  }, [isOpen, roleHint]);

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your email or username, and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      if (onCloseModal) onCloseModal();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('JSON') || msg.includes('token') || msg.includes('server error')) {
        setError('Invalid credentials or service temporarily initializing. Please try again.');
      } else {
        setError(msg || 'Invalid credentials. Please verify your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({
        name: regName,
        email: regEmail,
        password,
        phone: regPhone,
        address: regAddress
      });
      if (onCloseModal) onCloseModal();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (role: 'customer' | 'admin') => {
    setError(null);
    setMode('login');
    if (role === 'customer') {
      setIdentifier('pooja.sundaram@gmail.com');
      setPassword('customer123');
    } else {
      setIdentifier('ops@gomeat.in');
      setPassword('admin123');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto ${isModalMode ? 'bg-black/75 backdrop-blur-md p-4' : 'w-full h-full'}`}>
      
      {/* Background Illustrated Landscape (Matching the reference aesthetic) */}
      {!isModalMode && (
        <div className="absolute inset-0 -z-10 overflow-hidden bg-[#7895a2]">
          {/* Sky Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#82a3b2] via-[#658594] to-[#2b414e]" />

          {/* SVG Vector Scenic Nature & Silhouette Wildlife Landscape */}
          <svg
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Distant Mountains / Hills Layer 1 */}
            <path
              d="M0 620 C240 540, 480 570, 720 530 C960 490, 1200 580, 1440 550 L1440 900 L0 900 Z"
              fill="#52707e"
              opacity="0.65"
            />

            {/* Distant Mountains Layer 2 */}
            <path
              d="M0 670 C300 590, 600 630, 900 590 C1150 560, 1320 630, 1440 610 L1440 900 L0 900 Z"
              fill="#3a5462"
              opacity="0.85"
            />

            {/* Midground Rolling Savanna Plains */}
            <path
              d="M0 720 C280 680, 620 710, 940 670 C1180 640, 1340 690, 1440 680 L1440 900 L0 900 Z"
              fill="#253843"
            />

            {/* Center Background Mountain Peak */}
            <path
              d="M360 720 Q720 280 1080 720 Z"
              fill="#425c6a"
              opacity="0.5"
            />

            {/* Big Center Tree Canopy (The Iconic Acacia Tree from Reference) */}
            <g fill="#111c22">
              {/* Main Trunk & Branches */}
              <path d="M710 720 Q715 540 690 480 Q680 440 630 400 L645 390 Q700 435 715 470 Q730 430 790 395 L800 405 Q745 445 735 480 Q730 550 735 720 Z" />
              <path d="M700 480 Q620 450 560 410 L570 400 Q630 440 705 470 Z" />
              <path d="M730 490 Q820 460 880 420 L870 410 Q815 450 725 480 Z" />
              
              {/* Dense Foliage Clouds */}
              <circle cx="720" cy="310" r="130" opacity="0.95" />
              <circle cx="600" cy="330" r="110" opacity="0.95" />
              <circle cx="840" cy="330" r="110" opacity="0.95" />
              <circle cx="510" cy="380" r="85" opacity="0.9" />
              <circle cx="930" cy="380" r="85" opacity="0.9" />
              <circle cx="660" cy="240" r="95" opacity="0.9" />
              <circle cx="780" cy="240" r="95" opacity="0.9" />
              <circle cx="720" cy="210" r="75" opacity="0.85" />
            </g>

            {/* Foreground Deer / Gazelle Silhouettes */}
            {/* Left Deer */}
            <g fill="#0c161c" transform="translate(410, 560) scale(0.95)">
              {/* Horns */}
              <path d="M50 40 Q40 10 25 0 Q20 20 40 45 Z" />
              <path d="M55 42 Q70 12 85 0 Q75 22 58 48 Z" />
              {/* Head & Ears */}
              <ellipse cx="50" cy="55" rx="14" ry="20" transform="rotate(-15 50 55)" />
              <ellipse cx="38" cy="48" rx="5" ry="12" transform="rotate(-40 38 48)" />
              {/* Neck & Body */}
              <path d="M45 70 Q55 110 75 130 Q120 135 150 145 Q165 170 160 210 L140 210 Q145 170 130 160 L90 160 Q80 200 70 240 L55 240 Q65 190 70 145 Q50 120 40 75 Z" />
              <ellipse cx="115" cy="150" rx="45" ry="30" />
              {/* Legs */}
              <rect x="85" y="170" width="8" height="90" rx="3" />
              <rect x="135" y="170" width="8" height="90" rx="3" />
            </g>

            {/* Right Deer */}
            <g fill="#0c161c" transform="translate(840, 590) scale(0.9)">
              <ellipse cx="60" cy="65" rx="14" ry="20" transform="rotate(15 60 65)" />
              <path d="M65 48 Q75 18 90 8 Q80 28 68 52 Z" />
              <path d="M55 50 Q40 20 25 10 Q35 30 52 54 Z" />
              <ellipse cx="90" cy="140" rx="45" ry="28" />
              <path d="M60 80 Q55 120 75 135 L60 230 L72 230 L85 150 L115 150 L125 230 L137 230 L130 140 Q115 120 75 75 Z" />
            </g>

            {/* Trees in Distance */}
            <g fill="#21333d" opacity="0.8">
              <ellipse cx="140" cy="640" rx="80" ry="35" />
              <rect x="136" y="640" width="8" height="60" />
              <ellipse cx="1280" cy="650" rx="90" ry="40" />
              <rect x="1275" y="650" width="9" height="55" />
            </g>

            {/* Foreground Foliage Grass Border */}
            <path
              d="M0 830 Q120 810 240 840 Q380 810 520 850 Q720 820 920 850 Q1120 810 1320 840 Q1380 820 1440 835 L1440 900 L0 900 Z"
              fill="#080e12"
            />
          </svg>

          {/* Vignette Overlay for Depth */}
          <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />
        </div>
      )}

      {/* ======================================================== */}
      {/* Centered Frosted Glass Login Container (Exact Reference)  */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-[420px] mx-4 animate-in fade-in zoom-in-95 duration-300">
        
        {/* The Glass Card Body */}
        <div className="relative rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/25 shadow-2xl p-7 pt-9 text-white overflow-hidden">
          
          {/* Subtle Glass Sheen Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/30 pointer-events-none" />

          {/* Top Pill Tab ("Login" / "Register") matching Reference Image */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <div className="bg-[#4a6370]/90 backdrop-blur-md px-6 py-1.5 rounded-b-2xl border-b border-x border-white/30 text-white font-extrabold text-xs tracking-wider shadow-md">
              {mode === 'login' ? 'Login' : 'Register'}
            </div>
          </div>

          {/* Brand Header */}
          <div className="text-center mt-2 mb-6">
            <div className="inline-flex items-center gap-2 mb-1">
              <img src="/images/logo-dark.png" alt="GoMeat" className="h-7 w-auto object-contain drop-shadow-md" />
            </div>
            <p className="text-[11px] text-slate-300/90 font-medium">
              Freshness we can trust • 0°C to 4°C Cold Chain
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-500/30 border border-rose-400/40 text-rose-100 text-xs text-center backdrop-blur-xs animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Username / Email Input with Icon on Right */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username or Email"
                  className="w-full pl-5 pr-12 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/30 focus:border-white text-white placeholder-slate-300 text-xs transition outline-none shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                  <UserIcon className="w-4 h-4" />
                </div>
              </div>

              {/* Password Input with Lock Icon on Right */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-5 pr-12 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/30 focus:border-white text-white placeholder-slate-300 text-xs transition outline-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember Me Checkbox Row */}
              <div className="flex items-center justify-between text-[11px] text-slate-200 px-2 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-white/20 border-white/40 text-[#d11243] focus:ring-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => autofillDemo('admin')}
                  className="text-slate-300 hover:text-white underline text-[11px]"
                >
                  Ops Admin?
                </button>
              </div>

              {/* Main Pill Login Button (Exact Reference Styling) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-98 transition duration-150 cursor-pointer mt-2"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          ) : (
            /* Register Mode */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-5 py-2.5 rounded-full bg-white/10 border border-white/30 text-white placeholder-slate-300 text-xs outline-none"
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full px-5 py-2.5 rounded-full bg-white/10 border border-white/30 text-white placeholder-slate-300 text-xs outline-none"
                />
              </div>

              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create Password"
                  className="w-full px-5 py-2.5 rounded-full bg-white/10 border border-white/30 text-white placeholder-slate-300 text-xs outline-none"
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="10-digit Phone Number"
                  className="w-full px-5 py-2.5 rounded-full bg-white/10 border border-white/30 text-white placeholder-slate-300 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs uppercase tracking-wider shadow-lg transition cursor-pointer mt-1"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex py-2 items-center my-3">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-slate-300 font-bold">
              Or Continue With
            </span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          {/* Genuine Google OAuth Button */}
          <div className="w-full flex justify-center">
            <GoogleSignInButton
              text={mode === 'login' ? 'continue_with' : 'signup_with'}
              onSuccess={() => {
                if (onCloseModal) onCloseModal();
              }}
              onError={(err) => setError(err)}
            />
          </div>

          {/* Quick 1-Click Demo Fill Credentials Chips */}
          <div className="mt-5 pt-4 border-t border-white/15 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block text-center">
              Quick 1-Click Demo Access:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => autofillDemo('customer')}
                className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <UserIcon className="w-3 h-3 text-cyan-300" />
                <span>Customer (Pooja)</span>
              </button>

              <button
                type="button"
                onClick={() => autofillDemo('admin')}
                className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-rose-300" />
                <span>Admin (Rajeshwar)</span>
              </button>
            </div>
          </div>

          {/* Toggle Register / Login Link */}
          <div className="mt-4 text-center text-xs text-slate-300 space-y-2">
            <div>
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className="text-white font-bold underline hover:text-rose-200 transition"
                  >
                    Register
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="text-white font-bold underline hover:text-rose-200 transition"
                  >
                    Login
                  </button>
                </span>
              )}
            </div>

            {/* Guest Access Link so users can bypass into catalog */}
            <div>
              <button
                type="button"
                onClick={onUnlockGuest}
                className="text-[11px] text-slate-300 hover:text-white underline font-medium flex items-center justify-center gap-1 mx-auto transition"
              >
                <span>Continue as Guest (Explore Store)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
