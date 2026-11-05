import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  Boxes,
  ShoppingCart,
  Receipt,
  BarChart3,
  Users,
  Settings,
  DownloadCloud,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { User } from '../types/inventory';

export type NavTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'suppliers'
  | 'inventory'
  | 'purchases'
  | 'sales'
  | 'reports'
  | 'users'
  | 'csharp-export'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: User;
  onOpenAuth: () => void;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  currentUser,
  onOpenAuth,
  lowStockCount,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as NavTab, label: 'Products', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined },
    { id: 'categories' as NavTab, label: 'Categories', icon: Layers },
    { id: 'suppliers' as NavTab, label: 'Suppliers', icon: Truck },
    { id: 'inventory' as NavTab, label: 'Inventory / Stock', icon: Boxes },
    { id: 'purchases' as NavTab, label: 'Purchases', icon: ShoppingCart },
    { id: 'sales' as NavTab, label: 'Sales & Billing', icon: Receipt },
    { id: 'reports' as NavTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'users' as NavTab, label: 'User Management', icon: Users, adminOnly: true },
    { id: 'csharp-export' as NavTab, label: '.NET C# Solution (.ZIP)', icon: DownloadCloud, highlight: true },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-slate-200 transition-all duration-300 ease-in-out border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-sm font-bold tracking-tight text-white block truncate">
                Apex Inventory
              </span>
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                Enterprise v2026.4
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && currentUser.role !== 'Admin') {
            return null;
          }
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : item.highlight
                  ? 'bg-blue-950/60 text-blue-300 hover:bg-blue-900/60 border border-blue-800/50'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !item.badge && (
                    <span className="ml-auto rounded bg-blue-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-blue-200 font-mono">
                      ZIP
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip on collapsed */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full ml-2 hidden rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg group-hover:block z-50 whitespace-nowrap border border-slate-700">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Role & User Footer */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed ? (
          <div className="rounded-lg bg-slate-800/80 p-2.5 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white font-semibold text-xs border border-slate-600">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate block">
                    {currentUser.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck className="h-3 w-3 text-blue-400 shrink-0" />
                  <span className="truncate capitalize">{currentUser.role} Role</span>
                </div>
              </div>
              <button
                onClick={onOpenAuth}
                title="Account & Auth"
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onOpenAuth}
              title={`${currentUser.name} (${currentUser.role})`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-xs font-bold border border-slate-700 hover:bg-slate-700"
            >
              {currentUser.name[0]}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
