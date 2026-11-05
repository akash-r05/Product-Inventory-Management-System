import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Package,
  Layers,
  Truck,
  Boxes,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  ShoppingCart,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Product, Purchase, Sale, StockMovement, User } from '../types/inventory';
import { NavTab } from './Sidebar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardViewProps {
  currentUser: User;
  metrics: {
    totalProducts: number;
    totalCategories: number;
    totalSuppliers: number;
    totalStockQuantity: number;
    totalInventoryValuation: number;
    lowStockProducts: Product[];
    outOfStockProducts: Product[];
    totalPurchaseValue: number;
    totalSalesValue: number;
    estimatedGrossProfit: number;
    profitMarginPercentage: number;
    monthlySalesTrends: {
      labels: string[];
      sales: number[];
      purchases: number[];
    };
    categoryDistribution: { name: string; count: number }[];
    topSellingProducts: { name: string; quantity: number; revenue: number }[];
    recentSales: Sale[];
    recentPurchases: Purchase[];
    recentMovements: StockMovement[];
  };
  onNavigateTab: (tab: NavTab) => void;
  onViewInvoice: (sale: Sale) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  metrics,
  onNavigateTab,
  onViewInvoice,
}) => {
  // Line chart: Monthly Sales & Revenue Trend
  const salesChartData = {
    labels: metrics.monthlySalesTrends.labels,
    datasets: [
      {
        label: 'Sales Revenue ($)',
        data: metrics.monthlySalesTrends.sales,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Purchase Cost ($)',
        data: metrics.monthlySalesTrends.purchases,
        borderColor: '#94a3b8',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.35,
        fill: false,
        pointBackgroundColor: '#94a3b8',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 600 },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          color: '#94a3b8',
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  // Category Distribution Doughnut
  const categoryChartData = {
    labels: metrics.categoryDistribution.map((c) => c.name),
    datasets: [
      {
        data: metrics.categoryDistribution.map((c) => c.count),
        backgroundColor: [
          '#2563eb',
          '#0ea5e9',
          '#6366f1',
          '#14b8a6',
          '#f59e0b',
          '#ec4899',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Stock Availability Breakdown
  const inStockCount = metrics.totalProducts - metrics.lowStockProducts.length - metrics.outOfStockProducts.length;
  const stockAvailabilityData = {
    labels: ['Healthy Stock', 'Low Stock Alert', 'Out of Stock'],
    datasets: [
      {
        data: [
          Math.max(0, inStockCount),
          metrics.lowStockProducts.length,
          metrics.outOfStockProducts.length,
        ],
        backgroundColor: ['#16a34a', '#f59e0b', '#dc2626'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Top Selling Products Horizontal Bar
  const topSellingData = {
    labels: metrics.topSellingProducts.map((p) => p.name.slice(0, 24) + '...'),
    datasets: [
      {
        label: 'Revenue ($)',
        data: metrics.topSellingProducts.map((p) => p.revenue),
        backgroundColor: '#2563eb',
        borderRadius: 4,
      },
    ],
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        callbacks: {
          label: (context: any) => `Revenue: $${context.parsed.x.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          callback: (v: any) => `$${v}`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#475569' },
      },
    },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <span>OPERATIONAL REPOSITORY</span>
            <span>·</span>
            <span>REAL-TIME TELEMETRY</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Welcome back, {currentUser.name}
          </h1>
          <p className="mt-1 text-xs text-slate-300 max-w-xl">
            Centralized inventory control active. Monitoring {metrics.totalProducts} registered products across {metrics.totalCategories} active categories and {metrics.totalSuppliers} verified enterprise suppliers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('sales')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md transition-colors"
          >
            <span>Record New Sale</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNavigateTab('purchases')}
            className="flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <span>Create Purchase</span>
            <ArrowDownRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Products</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metrics.totalProducts}
            </span>
            <span className="text-[11px] text-slate-400">across catalog</span>
          </div>
        </div>

        {/* Total Inventory Units */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Stock Units</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metrics.totalStockQuantity}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ${metrics.totalInventoryValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} value
            </span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => onNavigateTab('products')}
          className={`cursor-pointer rounded-xl border p-4 shadow-xs transition-all ${
            metrics.lowStockProducts.length > 0
              ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Low Stock Warning</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold tracking-tight text-amber-700 tabular-nums">
              {metrics.lowStockProducts.length}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Reorder required</span>
          </div>
        </div>

        {/* Out of Stock Alert */}
        <div
          onClick={() => onNavigateTab('products')}
          className={`cursor-pointer rounded-xl border p-4 shadow-xs transition-all ${
            metrics.outOfStockProducts.length > 0
              ? 'border-red-200 bg-red-50/40 hover:border-red-400'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Out of Stock</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold tracking-tight text-red-600 tabular-nums">
              {metrics.outOfStockProducts.length}
            </span>
            <span className="text-[11px] text-red-700 font-medium">Unavailable</span>
          </div>
        </div>

        {/* Total Sales Value */}
        <div
          onClick={() => onNavigateTab('sales')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Sales (Revenue)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-xl font-bold tracking-tight text-slate-900 tabular-nums">
              ${metrics.totalSalesValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center">
              +18.4%
            </span>
          </div>
        </div>

        {/* Total Purchase Value */}
        <div
          onClick={() => onNavigateTab('purchases')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Procurement</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-xl font-bold tracking-tight text-slate-900 tabular-nums">
              ${metrics.totalPurchaseValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-400">PO totals</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gross Margin Profit</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-xl font-bold tracking-tight text-blue-700 tabular-nums">
              ${metrics.estimatedGrossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-mono text-blue-600 font-semibold">
              {metrics.profitMarginPercentage.toFixed(1)}% margin
            </span>
          </div>
        </div>

        {/* Partners & Categories */}
        <div
          onClick={() => onNavigateTab('suppliers')}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Suppliers & Categories</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metrics.totalSuppliers} <span className="text-xs text-slate-400 font-normal">/ {metrics.totalCategories}</span>
            </span>
            <span className="text-[11px] text-slate-400">active channels</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Purchases Timeline */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Financial Revenue & Purchase Overview</h2>
              <p className="text-xs text-slate-400">Monthly sales turnover compared against procurement expenditures</p>
            </div>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600 font-medium">
              Chart.js Active
            </span>
          </div>
          <div className="h-72">
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </div>

        {/* Stock Health & Category Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Stock Availability Ratio</h2>
              <span className="text-[11px] font-mono text-slate-400">{metrics.totalProducts} Total Items</span>
            </div>
            <div className="h-44 relative flex items-center justify-center">
              <Doughnut
                data={stockAvailabilityData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
                  cutout: '68%',
                }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                In Stock & Nominal
              </span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {Math.max(0, inStockCount)} items
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Low Stock Warning
              </span>
              <span className="font-mono font-semibold text-amber-600 tabular-nums">
                {metrics.lowStockProducts.length} items
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                Critical Depleted
              </span>
              <span className="font-mono font-semibold text-red-600 tabular-nums">
                {metrics.outOfStockProducts.length} items
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Charts & Top Selling Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Selling Products by Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top-Selling Products by Revenue</h2>
              <p className="text-xs text-slate-400">Highest grossing inventory lines in past quarter</p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Full Report <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-56">
            <Bar data={topSellingData} options={horizontalBarOptions} />
          </div>
        </div>

        {/* Product Category Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Category Catalog Distribution</h2>
              <p className="text-xs text-slate-400">Breakdown of product SKUs across categories</p>
            </div>
            <button
              onClick={() => onNavigateTab('categories')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Categories <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            <Doughnut
              data={categoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } },
                },
                cutout: '55%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activities Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales with Invoicing */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Sales Orders</h3>
            </div>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {metrics.recentSales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => onViewInvoice(sale)}
                className="group flex cursor-pointer items-center justify-between py-2.5 text-xs hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {sale.customerName}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {sale.invoiceNumber} · {sale.details.length} item(s)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 tabular-nums">
                    ${sale.grandTotal.toFixed(2)}
                  </div>
                  <span className={`text-[10px] font-semibold ${sale.salesStatus === 'Completed' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {sale.salesStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Purchases</h3>
            </div>
            <button
              onClick={() => onNavigateTab('purchases')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {metrics.recentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between py-2.5 text-xs -mx-2 px-2 rounded-lg hover:bg-slate-50/80 transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">{purchase.invoiceNumber}</div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(purchase.purchaseDate).toLocaleDateString()} · {purchase.paymentStatus}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 tabular-nums">
                    ${purchase.grandTotal.toFixed(2)}
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600">
                    {purchase.purchaseStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Stock Movements */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Stock Movements Log</h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Audit Trail
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {metrics.recentMovements.map((mov) => (
              <div key={mov.id} className="py-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                    {mov.remarks}
                  </span>
                  <span
                    className={`font-mono font-semibold text-[11px] tabular-nums ${
                      mov.updatedStock >= mov.previousStock ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {mov.updatedStock >= mov.previousStock ? '+' : '-'}
                    {mov.quantity}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">
                    Stock: {mov.previousStock} → {mov.updatedStock}
                  </span>
                  <span>{mov.createdBy.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
