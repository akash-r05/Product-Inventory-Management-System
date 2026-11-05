import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  Eye,
  FileText,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { Purchase, PurchaseDetail, Product, Supplier, User, SystemSettings } from '../types/inventory';

interface PurchasesViewProps {
  purchases: Purchase[];
  products: Product[];
  suppliers: Supplier[];
  settings: SystemSettings;
  currentUser: User;
  onCreatePurchase: (
    purchase: Omit<Purchase, 'id' | 'details'> & { details: Omit<PurchaseDetail, 'id' | 'purchaseId'>[] }
  ) => { success: boolean; error?: string };
  onUpdateStatus: (purchaseId: string, status: 'Confirmed' | 'Pending' | 'Cancelled') => { success: boolean; error?: string };
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  products,
  suppliers,
  settings,
  currentUser,
  onCreatePurchase,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`${settings.purchasePrefix}${Date.now().toString().slice(-4)}`);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Partial'>('Paid');
  const [purchaseStatus, setPurchaseStatus] = useState<'Confirmed' | 'Pending'>('Confirmed');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Line items
  const [lineItems, setLineItems] = useState<
    Array<{ productId: string; quantity: number; unitPurchasePrice: number; tax: number; totalAmount: number }>
  >([
    {
      productId: products[0]?.id || '',
      quantity: 10,
      unitPurchasePrice: products[0]?.purchasePrice || 0,
      tax: 0,
      totalAmount: (products[0]?.purchasePrice || 0) * 10,
    },
  ]);

  const supplierMap = useMemo(() => new Map(suppliers.map((s) => [s.id, s.companyName])), [suppliers]);
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Totals
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + item.quantity * item.unitPurchasePrice, 0);
  }, [lineItems]);

  const calculatedTax = useMemo(() => {
    return (subtotal * settings.taxRatePercentage) / 100;
  }, [subtotal, settings.taxRatePercentage]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + calculatedTax - discount);
  }, [subtotal, calculatedTax, discount]);

  const handleProductChange = (index: number, pId: string) => {
    const prod = productMap.get(pId);
    const updated = [...lineItems];
    const unitPrice = prod ? prod.purchasePrice : 0;
    const qty = updated[index].quantity;
    updated[index] = {
      ...updated[index],
      productId: pId,
      unitPurchasePrice: unitPrice,
      totalAmount: unitPrice * qty,
    };
    setLineItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...lineItems];
    const validQty = Math.max(1, qty);
    const unitPrice = updated[index].unitPurchasePrice;
    updated[index] = {
      ...updated[index],
      quantity: validQty,
      totalAmount: unitPrice * validQty,
    };
    setLineItems(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...lineItems];
    const validPrice = Math.max(0, price);
    const qty = updated[index].quantity;
    updated[index] = {
      ...updated[index],
      unitPurchasePrice: validPrice,
      totalAmount: validPrice * qty,
    };
    setLineItems(updated);
  };

  const addLineItem = () => {
    const firstProd = products[0];
    setLineItems([
      ...lineItems,
      {
        productId: firstProd?.id || '',
        quantity: 5,
        unitPurchasePrice: firstProd?.purchasePrice || 0,
        tax: 0,
        totalAmount: (firstProd?.purchasePrice || 0) * 5,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleOpenCreate = () => {
    setSupplierId(suppliers[0]?.id || '');
    setInvoiceNumber(`${settings.purchasePrefix}${Date.now().toString().slice(-4)}`);
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setPaymentStatus('Paid');
    setPurchaseStatus('Confirmed');
    setDiscount(0);
    setNotes('');
    setLineItems([
      {
        productId: products[0]?.id || '',
        quantity: 10,
        unitPurchasePrice: products[0]?.purchasePrice || 0,
        tax: 0,
        totalAmount: (products[0]?.purchasePrice || 0) * 10,
      },
    ]);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onCreatePurchase({
      supplierId,
      invoiceNumber,
      purchaseDate: new Date(purchaseDate).toISOString(),
      subtotal,
      tax: calculatedTax,
      discount,
      grandTotal,
      paymentStatus,
      purchaseStatus,
      notes,
      details: lineItems.map((item) => ({
        ...item,
        tax: (item.totalAmount * settings.taxRatePercentage) / 100,
        totalAmount: item.totalAmount,
      })),
    });

    if (result.success) {
      setNotification({
        type: 'success',
        message: `Purchase Order ${invoiceNumber} created successfully. Stock levels updated.`,
      });
      setIsModalOpen(false);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to create purchase order.',
      });
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    const supName = supplierMap.get(p.supplierId) || '';
    const matchesSearch =
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.purchaseStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Procurement & Purchase Orders</h1>
          <p className="text-xs text-slate-500">
            Record supplier orders and automatically replenish inventory quantities
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">PO Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ShoppingCart className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {p.invoiceNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.purchaseDate).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {supplierMap.get(p.supplierId) || 'Direct'}
                    </td>

                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-700">
                      {p.details.length}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      ${p.subtotal.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      ${p.grandTotal.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          p.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          p.purchaseStatus === 'Confirmed'
                            ? 'bg-blue-50 text-blue-700'
                            : p.purchaseStatus === 'Pending'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {p.purchaseStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingPurchase(p)}
                          className="p-1 rounded text-slate-600 hover:bg-slate-100"
                          title="View PO Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {currentUser.role === 'Admin' && p.purchaseStatus === 'Pending' && (
                          <button
                            onClick={() => {
                              onUpdateStatus(p.id, 'Confirmed');
                              setNotification({ type: 'success', message: `PO ${p.invoiceNumber} confirmed & stock added.` });
                            }}
                            className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Create Supplier Purchase Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Supplier *</label>
                  <select
                    required
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice / PO Number *</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items Container */}
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800">Order Line Items</span>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <Plus className="h-3 w-3" /> Add Product
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex-1 w-full">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full rounded border border-slate-200 p-1.5 text-slate-900 focus:outline-none text-xs"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.purchasePrice.toFixed(2)}) - Current: {p.availableQuantity}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)}
                        className="w-full rounded border border-slate-200 p-1.5 font-mono text-center focus:outline-none text-xs"
                      />
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Unit Cost"
                        value={item.unitPurchasePrice}
                        onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-slate-200 p-1.5 font-mono text-right focus:outline-none text-xs"
                      />
                    </div>

                    <div className="w-28 text-right font-mono font-bold text-slate-900 pr-2">
                      ${item.totalAmount.toFixed(2)}
                    </div>

                    <button
                      type="button"
                      disabled={lineItems.length === 1}
                      onClick={() => removeLineItem(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary and Financials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Purchase Status</label>
                      <select
                        value={purchaseStatus}
                        onChange={(e) => setPurchaseStatus(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                      >
                        <option value="Confirmed">Confirmed (Updates Stock)</option>
                        <option value="Pending">Pending (Draft)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Order Notes</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Delivery terms, tracking notes..."
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({settings.taxRatePercentage}%):</span>
                    <span className="font-mono font-bold">${calculatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Discount ($):</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-24 rounded border border-slate-200 p-1 font-mono text-right text-xs"
                    />
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Grand Total:</span>
                    <span className="font-mono text-blue-700">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
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
                  Create & Confirm PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View PO Detail Modal */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Purchase Order {viewingPurchase.invoiceNumber}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(viewingPurchase.purchaseDate).toLocaleDateString()} · {supplierMap.get(viewingPurchase.supplierId)}
                </span>
              </div>
              <button onClick={() => setViewingPurchase(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
              {viewingPurchase.details.map((d, i) => {
                const prod = productMap.get(d.productId);
                return (
                  <div key={i} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{prod?.name || d.productId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {d.quantity} × ${d.unitPurchasePrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      ${d.totalAmount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">${viewingPurchase.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax:</span>
                <span className="font-mono font-bold">${viewingPurchase.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                <span>Grand Total:</span>
                <span className="font-mono text-blue-700">${viewingPurchase.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewingPurchase(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
