import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  History,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Product, StockMovement, MovementType, User } from '../types/inventory';

interface InventoryViewProps {
  products: Product[];
  movements: StockMovement[];
  currentUser: User;
  onRecordAdjustment: (
    productId: string,
    type: MovementType,
    quantity: number,
    remarks: string,
    referenceId?: string
  ) => { success: boolean; error?: string };
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  movements,
  currentUser,
  onRecordAdjustment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form
  const [formData, setFormData] = useState({
    productId: products[0]?.id || '',
    movementType: 'Adjustment' as MovementType,
    quantity: 1,
    remarks: '',
    referenceId: '',
  });

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const prod = productMap.get(m.productId);
      const matchesSearch =
        m.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.referenceId && m.referenceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prod && prod.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prod && prod.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'all' || m.movementType === typeFilter;
      const matchesProduct = productFilter === 'all' || m.productId === productFilter;

      return matchesSearch && matchesType && matchesProduct;
    });
  }, [movements, searchTerm, typeFilter, productFilter, productMap]);

  const handleOpenModal = () => {
    setFormData({
      productId: products[0]?.id || '',
      movementType: 'Adjustment',
      quantity: 5,
      remarks: 'Quarterly inventory audit recount',
      referenceId: `AUDIT-${Date.now().toString().slice(-4)}`,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onRecordAdjustment(
      formData.productId,
      formData.movementType,
      formData.quantity,
      formData.remarks,
      formData.referenceId
    );

    if (result.success) {
      setNotification({
        type: 'success',
        message: 'Stock adjustment and movement successfully logged.',
      });
      setIsModalOpen(false);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to adjust stock.',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {notification && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Inventory & Stock Movement Audit</h1>
          <p className="text-xs text-slate-500">
            Immutable tracking ledger recording all inflows, outflows, and cycle counts
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Manual Adjustment / Recount</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, product, remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Movement Types</option>
              <option value="Purchase">Purchases (+)</option>
              <option value="Sale">Sales (-)</option>
              <option value="Return">Returns (+)</option>
              <option value="Adjustment">Manual Adjustments</option>
              <option value="Damage">Damage Write-Offs (-)</option>
            </select>
          </div>

          <div>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Products ({products.length})</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Quantity Delta</th>
                <th className="py-3 px-4 text-center">Previous → Updated</th>
                <th className="py-3 px-4">Reference ID</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-right">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <History className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    No stock movements recorded under these filters.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const prod = productMap.get(m.productId);
                  const isPositive = m.updatedStock >= m.previousStock;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(m.movementDate).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                            m.movementType === 'Purchase'
                              ? 'bg-blue-50 text-blue-700'
                              : m.movementType === 'Sale'
                              ? 'bg-indigo-50 text-indigo-700'
                              : m.movementType === 'Return'
                              ? 'bg-emerald-50 text-emerald-700'
                              : m.movementType === 'Damage'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {m.movementType}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{prod ? prod.name : 'Unknown Product'}</div>
                        <div className="font-mono text-[11px] text-slate-400">{prod?.sku}</div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                        <span className={isPositive ? 'text-emerald-600' : 'text-red-600'}>
                          {isPositive ? '+' : '-'}
                          {m.quantity}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600 tabular-nums">
                        {m.previousStock} <span className="text-slate-400">→</span> <span className="font-bold text-slate-900">{m.updatedStock}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {m.referenceId || 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {m.remarks}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">
                        {m.createdBy}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Record Stock Adjustment</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Product *</label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.availableQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Type *</label>
                <select
                  value={formData.movementType}
                  onChange={(e) => setFormData({ ...formData, movementType: e.target.value as MovementType })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Adjustment">Adjustment (Count Correction)</option>
                  <option value="Damage">Damage (Scrap / Discard Units)</option>
                  <option value="Return">Customer Return Restock</option>
                  <option value="Purchase">Manual Supplier Inflow</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {formData.movementType === 'Adjustment' ? 'New Total Stock Count' : 'Quantity to Apply'} *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference Number / Audit Ticket</label>
                <input
                  type="text"
                  value={formData.referenceId}
                  onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                  placeholder="e.g. AUDIT-2026-Q4"
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 uppercase focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Remarks *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Reason for adjustment, inspector notes..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
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
                  Confirm & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
