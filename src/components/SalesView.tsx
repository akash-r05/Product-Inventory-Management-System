import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  Eye,
  RotateCcw,
  Printer,
  Calendar,
  FileDown,
  ShoppingBag,
} from 'lucide-react';
import { Sale, SalesDetail, Product, User, SystemSettings } from '../types/inventory';

interface SalesViewProps {
  sales: Sale[];
  products: Product[];
  settings: SystemSettings;
  currentUser: User;
  onCreateSale: (
    sale: Omit<Sale, 'id' | 'details'> & { details: Omit<SalesDetail, 'id' | 'salesId'>[] }
  ) => { success: boolean; error?: string; sale?: Sale };
  onCancelOrReturnSale: (saleId: string, actionType: 'Cancelled' | 'Returned') => { success: boolean; error?: string };
  onViewInvoice: (sale: Sale) => void;
  openCreateImmediately?: boolean;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  products,
  settings,
  currentUser,
  onCreateSale,
  onCancelOrReturnSale,
  onViewInvoice,
  openCreateImmediately = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(openCreateImmediately);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`${settings.invoicePrefix}${Date.now().toString().slice(-4)}`);
  const [salesDate, setSalesDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'Bank Transfer' | 'UPI'>('Credit Card');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Available active products only for sale
  const availableProducts = useMemo(() => {
    return products.filter((p) => p.status === 'Active');
  }, [products]);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Initial line item with an in-stock product
  const defaultProduct = availableProducts.find((p) => p.availableQuantity > 0) || availableProducts[0];

  const [lineItems, setLineItems] = useState<
    Array<{ productId: string; quantity: number; unitSellingPrice: number; tax: number; totalAmount: number }>
  >([
    {
      productId: defaultProduct?.id || '',
      quantity: 1,
      unitSellingPrice: defaultProduct?.sellingPrice || 0,
      tax: 0,
      totalAmount: defaultProduct?.sellingPrice || 0,
    },
  ]);

  // Subtotal, tax, grand total
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + item.quantity * item.unitSellingPrice, 0);
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
    const unitPrice = prod ? prod.sellingPrice : 0;
    const qty = updated[index].quantity;
    updated[index] = {
      ...updated[index],
      productId: pId,
      unitSellingPrice: unitPrice,
      totalAmount: unitPrice * qty,
    };
    setLineItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...lineItems];
    const validQty = Math.max(1, qty);
    const unitPrice = updated[index].unitSellingPrice;
    updated[index] = {
      ...updated[index],
      quantity: validQty,
      totalAmount: unitPrice * validQty,
    };
    setLineItems(updated);
  };

  const addLineItem = () => {
    const available = availableProducts.find(
      (p) => p.availableQuantity > 0 && !lineItems.some((i) => i.productId === p.id)
    ) || availableProducts[0];

    if (!available) return;

    setLineItems([
      ...lineItems,
      {
        productId: available.id,
        quantity: 1,
        unitSellingPrice: available.sellingPrice,
        tax: 0,
        totalAmount: available.sellingPrice,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleOpenCreate = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setInvoiceNumber(`${settings.invoicePrefix}${Date.now().toString().slice(-4)}`);
    setSalesDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('Credit Card');
    setPaymentStatus('Paid');
    setDiscount(0);
    setNotes('');

    const starter = availableProducts.find((p) => p.availableQuantity > 0) || availableProducts[0];
    setLineItems([
      {
        productId: starter?.id || '',
        quantity: 1,
        unitSellingPrice: starter?.sellingPrice || 0,
        tax: 0,
        totalAmount: starter?.sellingPrice || 0,
      },
    ]);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend pre-validation for stock
    for (const item of lineItems) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        setNotification({ type: 'error', message: 'Invalid product selected.' });
        return;
      }
      if (item.quantity > prod.availableQuantity) {
        setNotification({
          type: 'error',
          message: `Cannot sell ${item.quantity} units of "${prod.name}". Only ${prod.availableQuantity} units available in stock.`,
        });
        return;
      }
    }

    const result = onCreateSale({
      customerName,
      customerEmail,
      customerPhone,
      invoiceNumber,
      salesDate: new Date(salesDate).toISOString(),
      subtotal,
      tax: calculatedTax,
      discount,
      grandTotal,
      paymentMethod,
      paymentStatus,
      salesStatus: 'Completed',
      notes,
      details: lineItems.map((item) => ({
        ...item,
        tax: (item.totalAmount * settings.taxRatePercentage) / 100,
        totalAmount: item.totalAmount,
      })),
    });

    if (result.success && result.sale) {
      setNotification({
        type: 'success',
        message: `Sale invoice ${invoiceNumber} created! Inventory updated.`,
      });
      setIsModalOpen(false);
      onViewInvoice(result.sale);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to complete sale.',
      });
    }
  };

  const handleCancelOrReturn = (sale: Sale, action: 'Cancelled' | 'Returned') => {
    if (window.confirm(`Are you sure you want to mark invoice ${sale.invoiceNumber} as ${action}? This will restore all items back to inventory stock.`)) {
      const res = onCancelOrReturnSale(sale.id, action);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Sale ${sale.invoiceNumber} ${action}. Inventory stock successfully restored.`,
        });
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Failed to update sale.',
        });
      }
    }
  };

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customerEmail && s.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || s.salesStatus === statusFilter;
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Sales Orders & Billing POS</h1>
          <p className="text-xs text-slate-500">
            Process client orders, enforce strict inventory checks, and generate commercial invoices
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Sale Invoice</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, client name, or email..."
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
            <option value="all">All Sales Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Sales Date</th>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    No sales invoices found under these filters.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 cursor-pointer" onClick={() => onViewInvoice(sale)}>
                      {sale.invoiceNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(sale.salesDate).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{sale.customerName}</div>
                      {sale.customerEmail && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {sale.customerEmail}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-700">
                      {sale.details.reduce((acc, d) => acc + d.quantity, 0)} units
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      ${sale.subtotal.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      ${sale.grandTotal.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {sale.paymentMethod}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          sale.salesStatus === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : sale.salesStatus === 'Pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {sale.salesStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="p-1 rounded text-blue-600 hover:bg-blue-50"
                          title="View / Print Tax Invoice"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        {currentUser.role === 'Admin' && sale.salesStatus === 'Completed' && (
                          <button
                            onClick={() => handleCancelOrReturn(sale, 'Returned')}
                            className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            title="Process Return & Restock Inventory"
                          >
                            <RotateCcw className="h-4 w-4" />
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

      {/* New Sale Modal (POS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Create Sales Invoice (POS Checkout)</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Meridian Logistics Inc."
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="accounts@meridian.com"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 uppercase focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sales Date *</label>
                  <input
                    type="date"
                    required
                    value={salesDate}
                    onChange={(e) => setSalesDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer (Wire)</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / Digital</option>
                  </select>
                </div>
              </div>

              {/* Line items selector */}
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800">Order Products</span>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <Plus className="h-3 w-3" /> Add Product
                  </button>
                </div>

                {lineItems.map((item, idx) => {
                  const currentProd = productMap.get(item.productId);
                  const maxAvailable = currentProd ? currentProd.availableQuantity : 0;
                  const isInsufficient = item.quantity > maxAvailable;

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col md:flex-row items-center gap-2 p-2.5 rounded-lg border bg-white ${
                        isInsufficient ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex-1 w-full">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full rounded border border-slate-200 p-1.5 text-slate-900 focus:outline-none text-xs"
                        >
                          {availableProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.sellingPrice.toFixed(2)}) — {p.availableQuantity} available
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          max={maxAvailable}
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)}
                          className={`w-full rounded border p-1.5 font-mono text-center focus:outline-none text-xs ${
                            isInsufficient ? 'border-red-500 text-red-700 bg-red-50 font-bold' : 'border-slate-200'
                          }`}
                        />
                      </div>

                      <div className="w-28 text-right font-mono text-xs text-slate-600">
                        ${item.unitSellingPrice.toFixed(2)}
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
                  );
                })}
              </div>

              {/* Financial Calculation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Notes / Dispatch Instructions</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Delivery dock, purchase order reference number..."
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
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
                    <span>Client Discount ($):</span>
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
                    <span className="font-mono text-blue-700 text-base">${grandTotal.toFixed(2)}</span>
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
                  Complete Sale & Print Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
