import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  FileDown,
  Layers,
  Truck,
  Sparkles,
} from 'lucide-react';
import { Product, Category, Supplier, User } from '../types/inventory';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  currentUser: User;
  onSaveProduct: (prod: Omit<Product, 'id' | 'createdDate' | 'updatedDate'> & { id?: string }) => { success: boolean; error?: string };
  onDeleteProduct: (id: string) => { success: boolean; error?: string; softDeleted?: boolean };
  onNavigateToPurchasesForProduct?: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  suppliers,
  currentUser,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    supplierId: '',
    purchasePrice: 0,
    sellingPrice: 0,
    availableQuantity: 0,
    minimumStockLevel: 10,
    image: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  const supplierMap = useMemo(() => {
    return new Map(suppliers.map((s) => [s.id, s.companyName]));
  }, [suppliers]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
        const matchesSupplier = selectedSupplier === 'all' || p.supplierId === selectedSupplier;

        let matchesStock = true;
        if (stockFilter === 'out_of_stock') matchesStock = p.availableQuantity === 0;
        else if (stockFilter === 'low_stock')
          matchesStock = p.availableQuantity > 0 && p.availableQuantity <= p.minimumStockLevel;
        else if (stockFilter === 'in_stock') matchesStock = p.availableQuantity > p.minimumStockLevel;

        return matchesSearch && matchesCategory && matchesSupplier && matchesStock;
      })
      .sort((a, b) => {
        let valA: string | number = a.name.toLowerCase();
        let valB: string | number = b.name.toLowerCase();

        if (sortBy === 'price') {
          valA = a.sellingPrice;
          valB = b.sellingPrice;
        } else if (sortBy === 'quantity') {
          valA = a.availableQuantity;
          valB = b.availableQuantity;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, selectedCategory, selectedSupplier, stockFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      description: '',
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      purchasePrice: 50,
      sellingPrice: 85,
      availableQuantity: 20,
      minimumStockLevel: 10,
      image: '/src/assets/images/scanner_terminal_1793888530235.jpg',
      status: 'Active',
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      description: p.description,
      categoryId: p.categoryId,
      supplierId: p.supplierId,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      availableQuantity: p.availableQuantity,
      minimumStockLevel: p.minimumStockLevel,
      image: p.image || '',
      status: p.status,
    });
    setIsEditorOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSaveProduct({
      ...formData,
      id: editingProduct?.id,
    });

    if (result.success) {
      setNotification({
        type: 'success',
        message: editingProduct ? 'Product details updated successfully.' : 'New product registered successfully.',
      });
      setIsEditorOpen(false);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to save product.',
      });
    }
  };

  const handleDelete = (p: Product) => {
    if (window.confirm(`Are you sure you want to delete or deactivate product "${p.name}"?`)) {
      const res = onDeleteProduct(p.id);
      if (res.success) {
        if (res.softDeleted) {
          setNotification({
            type: 'warning',
            message: res.error || 'Product was deactivated to maintain historical orders.',
          });
        } else {
          setNotification({
            type: 'success',
            message: `Product "${p.name}" removed successfully.`,
          });
        }
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Could not delete product.',
        });
      }
    }
  };

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Supplier', 'Purchase Price', 'Selling Price', 'Quantity', 'Status'];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      `"${categoryMap.get(p.categoryId) || ''}"`,
      `"${supplierMap.get(p.supplierId) || ''}"`,
      p.purchasePrice.toFixed(2),
      p.sellingPrice.toFixed(2),
      p.availableQuantity,
      p.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs shadow-md border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : notification.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Product Management</h1>
          <p className="text-xs text-slate-500">
            Cataloging {products.length} products across multiple categories and vendors
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          {currentUser.role === 'Admin' && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Suppliers ({suppliers.length})</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segmented stock filter buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => {
                setStockFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                stockFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => {
                setStockFilter('in_stock');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                stockFilter === 'in_stock' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => {
                setStockFilter('low_stock');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                stockFilter === 'low_stock' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Stock Alert
            </button>
            <button
              onClick={() => {
                setStockFilter('out_of_stock');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                stockFilter === 'out_of_stock' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Out of Stock
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border border-slate-200 bg-white py-1 px-2 text-slate-700 focus:outline-none"
            >
              <option value="name">Product Name</option>
              <option value="price">Selling Price</option>
              <option value="quantity">Stock Units</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Product & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-center">Available Stock</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isOutOfStock = p.availableQuantity === 0;
                  const isLowStock = p.availableQuantity > 0 && p.availableQuantity <= p.minimumStockLevel;
                  const margin = p.sellingPrice > 0 ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(0) : '0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => setViewingProduct(p)}>
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                              <span>{p.sku}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-600 font-semibold">{margin}% margin</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {categoryMap.get(p.categoryId) || 'Uncategorized'}
                      </td>

                      <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                        {supplierMap.get(p.supplierId) || 'Direct'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        ${p.purchasePrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        ${p.sellingPrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-bold tabular-nums text-sm ${
                              isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'
                            }`}
                          >
                            {p.availableQuantity}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            min: {p.minimumStockLevel}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            Low Stock
                          </span>
                        ) : p.status === 'Inactive' ? (
                          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingProduct(p)}
                            title="View Details"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {currentUser.role === 'Admin' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                title="Edit Product"
                                className="p-1 rounded text-blue-600 hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p)}
                                title="Delete or Deactivate Product"
                                className="p-1 rounded text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs">
          <span className="text-slate-500">
            Showing <span className="font-semibold">{Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
            <span className="font-semibold">{Math.min(filteredProducts.length, currentPage * itemsPerPage)}</span> of{' '}
            <span className="font-semibold">{filteredProducts.length}</span> entries
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 font-mono font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Product Details' : 'Register New Product'}
              </h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Industrial Barcode Scanner"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code * (Unique)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. QS-AT9000-2D"
                      className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:border-blue-500 focus:outline-none uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sku: `SKU-${Date.now().toString().slice(-6)}` })}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 whitespace-nowrap"
                    >
                      Gen
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, features, and capabilities..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier *</label>
                  <select
                    required
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName} ({s.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.availableQuantity}
                    onChange={(e) => setFormData({ ...formData, availableQuantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.minimumStockLevel}
                    onChange={(e) => setFormData({ ...formData, minimumStockLevel: parseInt(e.target.value, 10) || 1 })}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Image URL / Asset</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/src/assets/images/... or image URL"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '/src/assets/images/scanner_terminal_1793888530235.jpg' })}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 whitespace-nowrap"
                  >
                    Preset
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Status:</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active' })}
                    className={`rounded px-2.5 py-1 text-xs font-semibold ${
                      formData.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {formData.status}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 shadow-sm"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-mono font-bold text-blue-600">{viewingProduct.sku}</span>
              <button
                onClick={() => setViewingProduct(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex gap-4">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {viewingProduct.image ? (
                  <img
                    src={viewingProduct.image}
                    alt={viewingProduct.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <Package className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingProduct.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-3">{viewingProduct.description}</p>
                <div className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold">Category: </span>
                  {categoryMap.get(viewingProduct.categoryId)}
                </div>
                <div className="text-xs text-slate-600">
                  <span className="font-semibold">Supplier: </span>
                  {supplierMap.get(viewingProduct.supplierId)}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
              <div>
                <div className="text-[11px] text-slate-500">Unit Cost</div>
                <div className="font-mono text-sm font-bold text-slate-800">
                  ${viewingProduct.purchasePrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Selling Price</div>
                <div className="font-mono text-sm font-bold text-blue-600">
                  ${viewingProduct.sellingPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Available Stock</div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {viewingProduct.availableQuantity} units
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewingProduct(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
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
