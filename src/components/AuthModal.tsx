import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { User, UserRole } from '../types/inventory';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  onRegisterUser: (name: string, email: string, role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSelectUser,
  onRegisterUser,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Staff');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      onSelectUser(found);
      setNotification(`Authenticated as ${found.name} (${found.role})`);
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 800);
    } else {
      // Auto sign in as demo admin if email not matched
      const defaultUser = users[0];
      onSelectUser(defaultUser);
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onRegisterUser(name, email, role);
    setNotification(`Account created for ${name}. Signed in as ${role}.`);
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 800);
  };

  const handleQuickDemoLogin = (targetRole: UserRole) => {
    const target = users.find((u) => u.role === targetRole) || users[0];
    onSelectUser(target);
    setNotification(`Quick signed in as ${target.name} (${target.role})`);
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Side: Illustration & Branding */}
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-slate-900 text-white overflow-hidden">
          {/* Background image with contrast scrim */}
          <img
            src="/src/assets/images/auth_inventory_hero_1793888530155.jpg"
            alt="Automated logistics distribution facility"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white block">Apex Inventory</span>
                <span className="text-xs text-blue-300 font-mono">ASP.NET Core Identity</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Role-Based Access Control</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Enterprise Stock Intelligence & Supply Chain Management
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time synchronization across warehouses, purchasing workflows, sales invoicing, and immutable stock movement audits.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="p-8 flex flex-col justify-center">
          {notification ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 animate-bounce" />
              <div className="text-sm font-bold text-slate-900">{notification}</div>
            </div>
          ) : isRegisterMode ? (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New User Account</h3>
                <p className="text-xs text-slate-500">Register employee profile in Identity system</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Liam Foster"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="liam.foster@apexindustrial.com"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Allocation</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Staff">Staff (Order Processing & View)</option>
                  <option value="Admin">Administrator (Unrestricted Access)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Complete Registration
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-slate-500 hover:text-blue-600 font-medium"
                >
                  Already registered? Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Sign In to Inventory</h3>
                <p className="text-xs text-slate-500">Access role-authorized operations console</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander.wright@apexindustrial.com"
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Password</label>
                  <span className="text-[11px] text-blue-600 cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-9 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                  <span>Remember session</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Authorize & Login</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Quick Demo Switcher */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  One-Click Demo Profiles:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('Admin')}
                    className="rounded-lg border border-blue-200 bg-blue-50/70 p-2 text-left hover:bg-blue-100 transition-colors"
                  >
                    <div className="font-bold text-blue-900">Login as Admin</div>
                    <div className="text-[10px] text-blue-600">Alexander Wright</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('Staff')}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100 transition-colors"
                  >
                    <div className="font-bold text-slate-900">Login as Staff</div>
                    <div className="text-[10px] text-slate-500">Elena Rostova</div>
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-slate-500 hover:text-blue-600 font-medium"
                >
                  Need a new account? Register here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
