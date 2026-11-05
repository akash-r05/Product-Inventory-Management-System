import React, { useState } from 'react';
import {
  Settings,
  Building2,
  DollarSign,
  Percent,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText,
  Save,
} from 'lucide-react';
import { SystemSettings, User } from '../types/inventory';

interface SettingsViewProps {
  settings: SystemSettings;
  currentUser: User;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
  onResetDatabase: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  currentUser,
  onUpdateSettings,
  onResetDatabase,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setNotification('Configuration settings updated successfully.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to restore the initial demo inventory dataset? All custom sales, purchases, and products will be reset to defaults.')) {
      onResetDatabase();
      setNotification('Database reset to initial demo state.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {notification && (
        <div className="flex items-center gap-2 rounded-xl p-3.5 text-xs bg-emerald-50 text-emerald-900 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">System Settings & Parameters</h1>
        <p className="text-xs text-slate-500">
          Configure business profile, commercial tax rates, stock thresholds, and document numbering
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Company Profile */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Company & Facility Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Registered Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Email</label>
              <input
                type="email"
                required
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Facility Address</label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Financial & Inventory Rules */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Currency, Taxes & Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency Code & Symbol</label>
              <select
                value={formData.currencyCode}
                onChange={(e) => {
                  const code = e.target.value;
                  const symbol = code === 'USD' ? '$' : code === 'INR' ? '₹' : code === 'EUR' ? '€' : '£';
                  setFormData({ ...formData, currencyCode: code, currencySymbol: symbol });
                }}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Commercial Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.taxRatePercentage}
                onChange={(e) => setFormData({ ...formData, taxRatePercentage: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Low Stock Alert (Units)</label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value, 10) || 10 })}
                className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Invoice & PO Numbering Prefixes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Document Numbering Prefixes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sales Invoice Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full rounded-lg border border-slate-200 p-2 font-mono uppercase text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Order (PO) Prefix</label>
              <input
                type="text"
                value={formData.purchasePrefix}
                onChange={(e) => setFormData({ ...formData, purchasePrefix: e.target.value })}
                className="w-full rounded-lg border border-slate-200 p-2 font-mono uppercase text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Database</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
