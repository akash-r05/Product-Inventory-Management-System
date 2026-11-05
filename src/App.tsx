import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { inventoryStore } from './services/inventoryStorage';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { CategoriesView } from './components/CategoriesView';
import { SuppliersView } from './components/SuppliersView';
import { InventoryView } from './components/InventoryView';
import { PurchasesView } from './components/PurchasesView';
import { SalesView } from './components/SalesView';
import { InvoiceModal } from './components/InvoiceModal';
import { ReportsView } from './components/ReportsView';
import { UserManagementView } from './components/UserManagementView';
import { SettingsView } from './components/SettingsView';
import { DotNetSolutionModal } from './components/DotNetSolutionModal';
import { AuthModal } from './components/AuthModal';
import { Sale, UserRole } from './types/inventory';

export default function App() {
  // Sync state with storage service
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = inventoryStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);
  const [openSaleFormImmediately, setOpenSaleFormImmediately] = useState(false);

  // Data from store
  const currentUser = inventoryStore.getCurrentUser();
  const products = inventoryStore.getProducts();
  const categories = inventoryStore.getCategories();
  const suppliers = inventoryStore.getSuppliers();
  const purchases = inventoryStore.getPurchases();
  const sales = inventoryStore.getSales();
  const movements = inventoryStore.getMovements();
  const users = inventoryStore.getUsers();
  const settings = inventoryStore.getSettings();
  const metrics = inventoryStore.getDashboardMetrics();

  const handleSwitchRole = (role: UserRole) => {
    inventoryStore.switchRole(role);
  };

  const handleGlobalSearchSelect = (type: 'product' | 'sale' | 'supplier', id: string) => {
    if (type === 'product') {
      setCurrentTab('products');
    } else if (type === 'sale') {
      const found = sales.find((s) => s.id === id);
      if (found) setActiveInvoice(found);
      else setCurrentTab('sales');
    } else if (type === 'supplier') {
      setCurrentTab('suppliers');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setMobileSidebarOpen(false);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        lowStockCount={metrics.lowStockProducts.length + metrics.outOfStockProducts.length}
      />

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Content Layout */}
      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navigation Bar */}
        <TopNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onOpenNewSale={() => {
            setCurrentTab('sales');
            setOpenSaleFormImmediately(true);
          }}
          onOpenNewProduct={() => {
            setCurrentTab('products');
          }}
          onOpenExportModal={() => setCurrentTab('csharp-export')}
          lowStockProducts={metrics.lowStockProducts}
          outOfStockProducts={metrics.outOfStockProducts}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onGlobalSearchSelect={handleGlobalSearchSelect}
          allProducts={products}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              metrics={metrics}
              onNavigateTab={setCurrentTab}
              onViewInvoice={(sale) => setActiveInvoice(sale)}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              products={products}
              categories={categories}
              suppliers={suppliers}
              currentUser={currentUser}
              onSaveProduct={(p) => inventoryStore.saveProduct(p)}
              onDeleteProduct={(id) => inventoryStore.deleteProduct(id)}
              onNavigateToPurchasesForProduct={() => setCurrentTab('purchases')}
            />
          )}

          {currentTab === 'categories' && (
            <CategoriesView
              categories={categories}
              products={products}
              currentUser={currentUser}
              onSaveCategory={(c) => inventoryStore.saveCategory(c)}
              onDeleteCategory={(id) => inventoryStore.deleteCategory(id)}
            />
          )}

          {currentTab === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              products={products}
              purchases={purchases}
              currentUser={currentUser}
              onSaveSupplier={(s) => inventoryStore.saveSupplier(s)}
              onDeleteSupplier={(id) => inventoryStore.deleteSupplier(id)}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              products={products}
              movements={movements}
              currentUser={currentUser}
              onRecordAdjustment={(productId, type, qty, remarks, ref) =>
                inventoryStore.recordStockAdjustment(productId, type, qty, remarks, ref)
              }
            />
          )}

          {currentTab === 'purchases' && (
            <PurchasesView
              purchases={purchases}
              products={products}
              suppliers={suppliers}
              settings={settings}
              currentUser={currentUser}
              onCreatePurchase={(p) => inventoryStore.createPurchase(p)}
              onUpdateStatus={(id, s) => inventoryStore.updatePurchaseStatus(id, s)}
            />
          )}

          {currentTab === 'sales' && (
            <SalesView
              sales={sales}
              products={products}
              settings={settings}
              currentUser={currentUser}
              onCreateSale={(s) => inventoryStore.createSale(s)}
              onCancelOrReturnSale={(id, type) => inventoryStore.cancelOrReturnSale(id, type)}
              onViewInvoice={(sale) => setActiveInvoice(sale)}
              openCreateImmediately={openSaleFormImmediately}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              products={products}
              categories={categories}
              suppliers={suppliers}
              purchases={purchases}
              sales={sales}
              movements={movements}
              settings={settings}
            />
          )}

          {currentTab === 'users' && (
            <UserManagementView
              users={users}
              currentUser={currentUser}
              onSaveUser={(u) => inventoryStore.saveUser(u)}
              onSwitchRole={handleSwitchRole}
            />
          )}

          {currentTab === 'csharp-export' && <DotNetSolutionModal />}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              currentUser={currentUser}
              onUpdateSettings={(newSet) => inventoryStore.updateSettings(newSet)}
              onResetDatabase={() => inventoryStore.resetDatabase()}
            />
          )}
        </main>
      </div>

      {/* Invoicing Modal */}
      <InvoiceModal
        sale={activeInvoice}
        onClose={() => setActiveInvoice(null)}
        products={products}
        settings={settings}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        users={users}
        onSelectUser={(u) => inventoryStore.setCurrentUser(u)}
        onRegisterUser={(name, email, role) => {
          const user = inventoryStore.saveUser({ name, email, role });
          inventoryStore.setCurrentUser(user);
        }}
      />
    </div>
  );
}
