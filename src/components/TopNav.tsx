import React, { useState } from 'react';
import {
  Search,
  Bell,
  PlusCircle,
  FileCode2,
  ChevronDown,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { User, Product } from '../types/inventory';
import { NavTab } from './Sidebar';

interface TopNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: User;
  onSwitchRole: (role: 'Admin' | 'Staff') => void;
  onOpenNewSale: () => void;
  onOpenNewProduct: () => void;
  onOpenExportModal: () => void;
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  onToggleMobileSidebar: () => void;
  onGlobalSearchSelect: (type: 'product' | 'sale' | 'supplier', id: string) => void;
  allProducts: Product[];
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSwitchRole,
  onOpenNewSale,
  onOpenNewProduct,
  onOpenExportModal,
  lowStockProducts,
  outOfStockProducts,
  onToggleMobileSidebar,
  onGlobalSearchSelect,
  allProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const totalAlerts = lowStockProducts.length + outOfStockProducts.length;

  const tabTitles: Record<NavTab, string> = {
    dashboard: 'Dashboard Overview',
    products: 'Product Catalog & Inventory',
    categories: 'Product Categories',
    suppliers: 'Vendors & Suppliers',
    inventory: 'Stock Control & Audit Movements',
    purchases: 'Procurement & Purchase Orders',
    sales: 'Sales Orders & Invoicing',
    reports: 'Business Reports & Analytics',
    users: 'Identity & User Management',
    'csharp-export': 'C# ASP.NET Core Solution Exporter',
    settings: 'System Configuration',
  };

  const filteredSearchResults = searchQuery.trim()
    ? allProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-8 backdrop-blur-sm">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-400">Inventory Hub</span>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-slate-900 truncate max-w-[200px] md:max-w-none">
            {tabTitles[currentTab]}
          </span>
        </div>
      </div>

      {/* Zone 2: Live Search with Quick Preview */}
      <div className="relative hidden md:block w-72 lg:w-96">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Dropdown Results */}
        {filteredSearchResults.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 rounded-lg border border-slate-200 bg-white shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
            {filteredSearchResults.map((prod) => (
              <button
                key={prod.id}
                onClick={() => {
                  onGlobalSearchSelect('product', prod.id);
                  setSearchQuery('');
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">{prod.name}</div>
                  <div className="font-mono text-[11px] text-slate-500">{prod.sku}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium text-slate-900">${prod.sellingPrice.toFixed(2)}</div>
                  <div className={`text-[10px] font-mono ${prod.availableQuantity === 0 ? 'text-red-600' : 'text-slate-500'}`}>
                    {prod.availableQuantity} in stock
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zone 3: Actions, Alerts & Role Selector */}
      <div className="flex items-center gap-2.5">
        {/* Quick New Sale button */}
        <button
          onClick={onOpenNewSale}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>New Sale</span>
        </button>

        {/* Quick Add Product (Admin Only) */}
        {currentUser.role === 'Admin' && (
          <button
            onClick={onOpenNewProduct}
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <span>+ Product</span>
          </button>
        )}

        {/* .NET C# Export CTA */}
        <button
          onClick={onOpenExportModal}
          title="Download complete C# ASP.NET Core 8 Solution (.ZIP)"
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
        >
          <FileCode2 className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden sm:inline font-mono">.NET ZIP</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Stock alerts"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white font-mono">
                {totalAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Inventory Alerts</span>
                <span className="text-[11px] text-slate-500 font-mono">{totalAlerts} active</span>
              </div>
              <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                {outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500">
                    All inventory levels healthy.
                  </div>
                ) : (
                  <>
                    {outOfStockProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectTab('products');
                          setShowNotifications(false);
                        }}
                        className="flex cursor-pointer items-start gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-900 hover:bg-red-100 transition-colors"
                      >
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-[11px] text-red-700 font-mono">Out of stock (0 available)</div>
                        </div>
                      </div>
                    ))}
                    {lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectTab('products');
                          setShowNotifications(false);
                        }}
                        className="flex cursor-pointer items-start gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900 hover:bg-amber-100 transition-colors"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-[11px] text-amber-700 font-mono">
                            Low stock: {p.availableQuantity} remaining (threshold: {p.minimumStockLevel})
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="font-semibold text-slate-900">{currentUser.role}</span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-xs">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400">SWITCH ROLE</div>
              <button
                onClick={() => {
                  onSwitchRole('Admin');
                  setShowRoleMenu(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left font-medium ${
                  currentUser.role === 'Admin' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Admin (Full Access)</span>
                {currentUser.role === 'Admin' && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
              </button>
              <button
                onClick={() => {
                  onSwitchRole('Staff');
                  setShowRoleMenu(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left font-medium ${
                  currentUser.role === 'Staff' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Staff (Sales & View)</span>
                {currentUser.role === 'Staff' && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
