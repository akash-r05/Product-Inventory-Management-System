import React, { useRef } from 'react';
import { Printer, Download, X, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Sale, Product, SystemSettings } from '../types/inventory';

interface InvoiceModalProps {
  sale: Sale | null;
  onClose: () => void;
  products: Product[];
  settings: SystemSettings;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  sale,
  onClose,
  products,
  settings,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!sale) return null;

  const productMap = new Map(products.map((p) => [p.id, p]));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 my-8 overflow-hidden">
        {/* Modal Toolbar (hidden on print) */}
        <div className="flex items-center justify-between bg-slate-900 px-6 py-3.5 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-blue-400">COMMERCIAL TAX INVOICE</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 font-mono">{sale.invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div ref={invoiceRef} className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-slate-900">
                    {settings.companyName}
                  </h1>
                  <span className="text-[11px] text-slate-500">Inventory & Logistics Distribution</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                <p>{settings.companyAddress}</p>
                <p>Phone: {settings.companyPhone} · Email: {settings.companyEmail}</p>
                <p className="font-mono text-[10px]">GSTIN / VAT: 27AABCA4812N1Z8</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold font-mono text-slate-900 tracking-tight">
                INVOICE
              </div>
              <div className="text-xs font-mono font-bold text-blue-600 mt-1">
                {sale.invoiceNumber}
              </div>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <p>Date: <span className="font-mono text-slate-800 font-medium">{new Date(sale.salesDate).toLocaleDateString()}</span></p>
                <p>Method: <span className="text-slate-800 font-medium">{sale.paymentMethod}</span></p>
                <p>
                  Status:{' '}
                  <span
                    className={`font-semibold ${
                      sale.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {sale.paymentStatus}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex justify-between text-xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Billed Client
              </span>
              <div className="font-bold text-slate-900 text-sm">{sale.customerName}</div>
              {sale.customerEmail && <div className="text-slate-600 mt-0.5">{sale.customerEmail}</div>}
              {sale.customerPhone && <div className="text-slate-600 font-mono mt-0.5">{sale.customerPhone}</div>}
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Dispatch Order
              </span>
              <div className="font-mono font-medium text-slate-700">Ref ID: {sale.id}</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Fulfillment: Automated SLAM</div>
              <div className="mt-1 flex items-center gap-1 justify-end text-emerald-700 font-medium text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Stock Delivery</span>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.details.map((detail, idx) => {
                  const product = productMap.get(detail.productId);
                  return (
                    <tr key={idx}>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{product ? product.name : 'Product'}</div>
                        <div className="font-mono text-[11px] text-slate-400">{product?.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {detail.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        ${detail.unitSellingPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ${detail.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary / Totals */}
          <div className="flex justify-between items-start pt-2">
            <div className="max-w-xs text-xs text-slate-400">
              <p className="font-semibold text-slate-600 mb-1">Terms & Conditions:</p>
              <p>Goods once delivered in good condition are subject to standard 30-day corporate return policy. Payment due according to invoice contract terms.</p>
              {/* Barcode Simulation */}
              <div className="mt-4">
                <div className="font-mono text-[10px] text-slate-500 mb-1">BARCODE CODE-128: {sale.invoiceNumber}</div>
                <div className="h-8 w-48 bg-slate-900 flex items-center justify-between px-1">
                  <div className="w-1 h-full bg-white mr-1" />
                  <div className="w-2 h-full bg-white mr-1" />
                  <div className="w-0.5 h-full bg-white mr-1" />
                  <div className="w-3 h-full bg-white mr-1" />
                  <div className="w-1.5 h-full bg-white mr-1" />
                  <div className="w-2 h-full bg-white mr-1" />
                  <div className="w-1 h-full bg-white" />
                </div>
              </div>
            </div>

            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">${sale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax:</span>
                <span className="font-mono font-bold">${sale.tax.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Client Discount:</span>
                  <span className="font-mono font-bold">-${sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-blue-700 text-base">
                  ${sale.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Authorized Signature & Warehouse Stamp</span>
            <span>Generated electronically by Apex Inventory System</span>
          </div>
        </div>
      </div>
    </div>
  );
};
