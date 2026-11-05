import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Key,
  CheckCircle2,
  X,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { User, UserRole } from '../types/inventory';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onSaveUser: (userData: Partial<User> & { name: string; email: string; role: UserRole }) => User;
  onSwitchRole: (role: UserRole) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onSaveUser,
  onSwitchRole,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff' as UserRole,
    department: 'Order Fulfillment',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setNotification({ type: 'error', message: 'Name and email are required.' });
      return;
    }

    onSaveUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
    });

    setNotification({
      type: 'success',
      message: `User account for "${formData.name}" created with ${formData.role} role.`,
    });
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: 'Staff', department: 'Order Fulfillment', password: '' });
  };

  const handleRoleToggle = (user: User) => {
    const nextRole: UserRole = user.role === 'Admin' ? 'Staff' : 'Admin';
    onSaveUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: nextRole,
    });
    setNotification({
      type: 'success',
      message: `Role for ${user.name} updated to ${nextRole}.`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {notification && (
        <div className="flex items-center justify-between rounded-xl p-3.5 text-xs bg-emerald-50 text-emerald-900 border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            User Management & ASP.NET Core Identity
          </h1>
          <p className="text-xs text-slate-500">
            Configured role-based access control (RBAC) separating Admin authorities from Staff operators
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Role Comparison Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Administrator Role (Full Authority)</span>
          </div>
          <p className="mt-1 text-slate-600 text-[11px]">
            Unrestricted access to all modules: product deletions, supplier contracts, purchase order authorisations, user management, and executive financial reports.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShieldAlert className="h-4 w-4 text-slate-600" />
            <span>Staff Operator Role (Sales & Invoicing)</span>
          </div>
          <p className="mt-1 text-slate-600 text-[11px]">
            Restricted permissions: can record sales orders, check real-time stock levels, and view operational dashboards. Deletions and user modifications are locked.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80">
          <h2 className="text-sm font-bold text-slate-900">Registered System Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Assigned Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs">
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{u.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>

                  <td className="py-3 px-4 text-slate-700">{u.department || 'General'}</td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`rounded px-2.5 py-1 text-[11px] font-semibold ${
                        u.role === 'Admin' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRoleToggle(u)}
                        className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Toggle Role ({u.role === 'Admin' ? 'Staff' : 'Admin'})
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Provision User Account</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sarah@company.com"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Security Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="Staff">Staff (Sales & View)</option>
                    <option value="Admin">Admin (Full Control)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Initial Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  defaultValue="Enterprise@2026"
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 shadow-sm"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
