import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  Search,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Truck,
  Boxes,
  ShoppingCart,
  Receipt,
  Download,
  AlertTriangle,
} from 'lucide-react';
import {
  Product,
  Category,
  Supplier,
  Purchase,
  Sale,
  StockMovement,
  SystemSettings,
} from '../types/inventory';

type ReportType =
  | 'inventory'
  | 'low_stock'
  | 'out_of_stock'
  | 'category'
  | 'supplier'
  | 'purchases'
  | 'sales'
  | 'movements'
  | 'profit_revenue';

interface ReportsViewProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  purchases: Purchase[];
  sales: Sale[];
  movements: StockMovement[];
  settings: SystemSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  categories,
  suppliers,
  purchases,
  sales,
  movements,
  settings,
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('profit_revenue');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const supplierMap = useMemo(() => new Map(suppliers.map((s) => [s.id, s.companyName])), [suppliers]);
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Compute Profit & Revenue data
  const profitRevenueData = useMemo(() => {
    let totalRevenue = 0;
    let totalCogs = 0;
    let totalDiscount = 0;

    const completedSales = sales.filter((s) => s.salesStatus === 'Completed');

    completedSales.forEach((sale) => {
      totalRevenue += sale.subtotal;
      totalDiscount += sale.discount;

      sale.details.forEach((item) => {
        const prod = productMap.get(item.productId);
        const cost = prod ? prod.purchasePrice : 0;
        totalCogs += cost * item.quantity;
      });
    });

    const netRevenue = totalRevenue - totalDiscount;
    const grossProfit = Math.max(0, netRevenue - totalCogs);
    const profitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    return {
      totalSalesCount: completedSales.length,
      totalRevenue,
      totalDiscount,
      netRevenue,
      totalCogs,
      grossProfit,
      profitMargin,
    };
  }, [sales, productMap]);

  // Handle Export to CSV (Excel compatible)
  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `report_${activeReport}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeReport === 'inventory') {
      headers = ['Product ID', 'Name', 'SKU', 'Category', 'Supplier', 'Cost Price', 'Selling Price', 'Available Stock', 'Total Valuation'];
      rows = products.map((p) => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku,
        `"${categoryMap.get(p.categoryId) || ''}"`,
        `"${supplierMap.get(p.supplierId) || ''}"`,
        p.purchasePrice.toFixed(2),
        p.sellingPrice.toFixed(2),
        p.availableQuantity,
        (p.availableQuantity * p.purchasePrice).toFixed(2),
      ]);
    } else if (activeReport === 'low_stock') {
      headers = ['Product ID', 'Name', 'SKU', 'Available Stock', 'Minimum Stock Threshold', 'Category'];
      rows = products
        .filter((p) => p.availableQuantity > 0 && p.availableQuantity <= p.minimumStockLevel)
        .map((p) => [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.sku,
          p.availableQuantity,
          p.minimumStockLevel,
          `"${categoryMap.get(p.categoryId) || ''}"`,
        ]);
    } else if (activeReport === 'sales') {
      headers = ['Invoice #', 'Date', 'Client', 'Items Count', 'Subtotal', 'Tax', 'Discount', 'Grand Total', 'Status'];
      rows = sales.map((s) => [
        s.invoiceNumber,
        new Date(s.salesDate).toLocaleDateString(),
        `"${s.customerName.replace(/"/g, '""')}"`,
        s.details.length,
        s.subtotal.toFixed(2),
        s.tax.toFixed(2),
        s.discount.toFixed(2),
        s.grandTotal.toFixed(2),
        s.salesStatus,
      ]);
    } else if (activeReport === 'profit_revenue') {
      headers = ['Metric Name', 'Amount ($)'];
      rows = [
        ['Total Sales Count', profitRevenueData.totalSalesCount],
        ['Gross Sales Turnover', profitRevenueData.totalRevenue.toFixed(2)],
        ['Total Client Discounts', profitRevenueData.totalDiscount.toFixed(2)],
        ['Net Commercial Revenue', profitRevenueData.netRevenue.toFixed(2)],
        ['Cost of Goods Sold (COGS)', profitRevenueData.totalCogs.toFixed(2)],
        ['Gross Operating Profit', profitRevenueData.grossProfit.toFixed(2)],
        ['Gross Profit Margin (%)', `${profitRevenueData.profitMargin.toFixed(2)}%`],
      ];
    } else {
      headers = ['ID', 'Reference', 'Type', 'Timestamp', 'Product', 'Quantity'];
      rows = movements.map((m) => [
        m.id,
        m.referenceId || '',
        m.movementType,
        m.movementDate,
        productMap.get(m.productId)?.name || '',
        m.quantity,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const reportTabs = [
    { id: 'profit_revenue' as ReportType, label: 'Profit & Revenue', icon: DollarSign },
    { id: 'inventory' as ReportType, label: 'Inventory Valuation', icon: Boxes },
    { id: 'low_stock' as ReportType, label: 'Low Stock Report', icon: AlertTriangle },
    { id: 'out_of_stock' as ReportType, label: 'Out of Stock', icon: Package },
    { id: 'category' as ReportType, label: 'Category Summary', icon: Layers },
    { id: 'supplier' as ReportType, label: 'Supplier Summary', icon: Truck },
    { id: 'sales' as ReportType, label: 'Sales Orders', icon: Receipt },
    { id: 'purchases' as ReportType, label: 'Purchases POs', icon: ShoppingCart },
    { id: 'movements' as ReportType, label: 'Audit Movements', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Reports & Business Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Dynamic analytics, gross profit calculations, stock movements, and export reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export to Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Report Selector Segmented Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date & Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="font-semibold">Period:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded border border-slate-200 p-1 font-mono text-xs"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded border border-slate-200 p-1 font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search in report..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs w-48 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* REPORT CONTENT DISPLAY */}
      {activeReport === 'profit_revenue' && (
        <div className="space-y-6">
          {/* Revenue vs Profit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Gross Sales Revenue</span>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
                ${profitRevenueData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">From completed customer invoices</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Cost of Goods Sold (COGS)</span>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-700 tabular-nums">
                ${profitRevenueData.totalCogs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Calculated at supplier purchase prices</span>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs">
              <span className="text-xs font-semibold text-blue-900">Gross Operating Profit</span>
              <div className="mt-2 text-2xl font-bold font-mono text-blue-700 tabular-nums">
                ${profitRevenueData.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Revenue minus unit acquisition cost</span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
              <span className="text-xs font-semibold text-emerald-900">Gross Margin %</span>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                {profitRevenueData.profitMargin.toFixed(1)}%
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Healthy enterprise trading margin</span>
            </div>
          </div>

          {/* Sales Profit Breakdown Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/80">
              <h2 className="text-sm font-bold text-slate-900">Individual Order Profit Margin Audit</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Client</th>
                    <th className="py-2.5 px-4 text-right">Order Revenue</th>
                    <th className="py-2.5 px-4 text-right">Cost (COGS)</th>
                    <th className="py-2.5 px-4 text-right">Gross Profit</th>
                    <th className="py-2.5 px-4 text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {sales
                    .filter((s) => s.salesStatus === 'Completed')
                    .map((sale) => {
                      let orderCost = 0;
                      sale.details.forEach((d) => {
                        const p = productMap.get(d.productId);
                        orderCost += (p?.purchasePrice || 0) * d.quantity;
                      });
                      const profit = sale.subtotal - orderCost;
                      const margin = sale.subtotal > 0 ? (profit / sale.subtotal) * 100 : 0;

                      return (
                        <tr key={sale.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-blue-600">{sale.invoiceNumber}</td>
                          <td className="py-2.5 px-4 font-sans text-slate-900 font-medium">{sale.customerName}</td>
                          <td className="py-2.5 px-4 text-right tabular-nums">${sale.subtotal.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">${orderCost.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-600 tabular-nums">${profit.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-center font-bold tabular-nums">{margin.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'inventory' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Product Inventory Valuation Schedule</h2>
            <span className="text-xs font-mono font-bold text-slate-700">
              Total Catalog Value: $
              {products.reduce((a, p) => a + p.availableQuantity * p.purchasePrice, 0).toLocaleString()}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">SKU / Code</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">In Stock</th>
                  <th className="py-2.5 px-4 text-right">Cost Price</th>
                  <th className="py-2.5 px-4 text-right">Selling Price</th>
                  <th className="py-2.5 px-4 text-right">Total Asset Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{p.sku}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{categoryMap.get(p.categoryId)}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold tabular-nums">{p.availableQuantity}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums">${p.purchasePrice.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-blue-600">${p.sellingPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${(p.availableQuantity * p.purchasePrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'low_stock' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-amber-50/50">
            <h2 className="text-sm font-bold text-amber-900">Low Stock Reorder Exceptions Report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">SKU</th>
                  <th className="py-2.5 px-4 text-center">Remaining Units</th>
                  <th className="py-2.5 px-4 text-center">Safety Threshold</th>
                  <th className="py-2.5 px-4">Primary Supplier</th>
                  <th className="py-2.5 px-4 text-center">Action Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter((p) => p.availableQuantity > 0 && p.availableQuantity <= p.minimumStockLevel)
                  .map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{p.sku}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-600 tabular-nums">
                        {p.availableQuantity}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-500 tabular-nums">
                        {p.minimumStockLevel}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">{supplierMap.get(p.supplierId)}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          Issue PO
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'out_of_stock' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-red-50/50">
            <h2 className="text-sm font-bold text-red-900">Zero-Stock Critical Depleted Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">SKU</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-4 text-center">Current Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter((p) => p.availableQuantity === 0)
                  .map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-4 font-mono text-red-600 font-bold">{p.sku}</td>
                      <td className="py-2.5 px-4 text-slate-600">{categoryMap.get(p.categoryId)}</td>
                      <td className="py-2.5 px-4 text-slate-700">{supplierMap.get(p.supplierId)}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-red-600 tabular-nums">
                        0 (Depleted)
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'sales' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80">
            <h2 className="text-sm font-bold text-slate-900">Sales Transactions Register</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4 text-right">Subtotal</th>
                  <th className="py-2.5 px-4 text-right">Tax</th>
                  <th className="py-2.5 px-4 text-right">Discount</th>
                  <th className="py-2.5 px-4 text-right">Grand Total</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-blue-600">{s.invoiceNumber}</td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans">{new Date(s.salesDate).toLocaleDateString()}</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900">{s.customerName}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums">${s.subtotal.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">${s.tax.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">${s.discount.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums">${s.grandTotal.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {s.salesStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'purchases' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80">
            <h2 className="text-sm font-bold text-slate-900">Procurement Expenditures Register</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">PO Invoice #</th>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-4">Order Date</th>
                  <th className="py-2.5 px-4 text-right">Subtotal</th>
                  <th className="py-2.5 px-4 text-right">Tax</th>
                  <th className="py-2.5 px-4 text-right">Grand Total</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-blue-600">{p.invoiceNumber}</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900">{supplierMap.get(p.supplierId)}</td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums">${p.subtotal.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">${p.tax.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums">${p.grandTotal.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        {p.purchaseStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'movements' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80">
            <h2 className="text-sm font-bold text-slate-900">Stock Inflow/Outflow Audit Movements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4 text-center">Delta</th>
                  <th className="py-2.5 px-4 text-center">Previous → Updated</th>
                  <th className="py-2.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{new Date(m.movementDate).toLocaleDateString()}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{m.movementType}</td>
                    <td className="py-2.5 px-4 text-slate-900">{productMap.get(m.productId)?.name}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold tabular-nums">
                      {m.updatedStock >= m.previousStock ? `+${m.quantity}` : `-${m.quantity}`}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-slate-500 tabular-nums">
                      {m.previousStock} → {m.updatedStock}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-sm truncate">{m.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'category' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80">
            <h2 className="text-sm font-bold text-slate-900">Category Catalog Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Category Name</th>
                  <th className="py-2.5 px-4 text-center">Product Count</th>
                  <th className="py-2.5 px-4 text-center">Stock Units</th>
                  <th className="py-2.5 px-4 text-right">Inventory Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => {
                  const prods = products.filter((p) => p.categoryId === c.id);
                  const units = prods.reduce((a, b) => a + b.availableQuantity, 0);
                  const value = prods.reduce((a, b) => a + b.availableQuantity * b.purchasePrice, 0);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold tabular-nums">{prods.length}</td>
                      <td className="py-2.5 px-4 text-center font-mono tabular-nums">{units}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${value.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'supplier' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80">
            <h2 className="text-sm font-bold text-slate-900">Supplier Procurement Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Supplier / Vendor</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4 text-center">Catalog Lines</th>
                  <th className="py-2.5 px-4 text-center">Purchase Orders</th>
                  <th className="py-2.5 px-4 text-right">Total Procurement Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => {
                  const supProds = products.filter((p) => p.supplierId === s.id);
                  const supPurchases = purchases.filter((p) => p.supplierId === s.id);
                  const totalVolume = supPurchases.reduce((a, b) => a + b.grandTotal, 0);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{s.companyName}</td>
                      <td className="py-2.5 px-4 text-slate-600">{s.name}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold tabular-nums">{supProds.length}</td>
                      <td className="py-2.5 px-4 text-center font-mono tabular-nums">{supPurchases.length}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${totalVolume.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
