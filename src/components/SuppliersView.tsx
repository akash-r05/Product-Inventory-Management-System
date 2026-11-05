import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Package,
  Building,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';
import { Supplier, Product, Purchase, User } from '../types/inventory';

interface SuppliersViewProps {
  suppliers: Supplier[];
  products: Product[];
  purchases: Purchase[];
  currentUser: User;
  onSaveSupplier: (sup: Omit<Supplier, 'id' | 'createdDate'> & { id?: string }) => { success: boolean; error?: string };
  onDeleteSupplier: (id: string) => { success: boolean; error?: string };
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  products,
  purchases,
  currentUser,
  onSaveSupplier,
  onDeleteSupplier,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    gstNumber: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const productsCountMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      map.set(p.supplierId, (map.get(p.supplierId) || 0) + 1);
    });
    return map;
  }, [products]);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      gstNumber: '',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      companyName: s.companyName,
      email: s.email,
      phone: s.phone,
      address: s.address,
      city: s.city,
      state: s.state,
      gstNumber: s.gstNumber || '',
      status: s.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSaveSupplier({
      ...formData,
      id: editingSupplier?.id,
    });

    if (result.success) {
      setNotification({
        type: 'success',
        message: editingSupplier ? 'Supplier information updated.' : 'New vendor registered.',
      });
      setIsModalOpen(false);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to save supplier.',
      });
    }
  };

  const handleDelete = (s: Supplier) => {
    if (window.confirm(`Are you sure you want to remove or deactivate supplier "${s.companyName}"?`)) {
      const res = onDeleteSupplier(s.id);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.error || 'Supplier removed successfully.',
        });
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Failed to delete supplier.',
        });
      }
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Supplier Management</h1>
          <p className="text-xs text-slate-500">
            Managing certified vendors, procurement contracts, and distribution partners
          </p>
        </div>

        {currentUser.role === 'Admin' && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search suppliers by company, representative, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((s) => {
          const productCount = productsCountMap.get(s.id) || 0;
          const purchaseCount = purchases.filter((p) => p.supplierId === s.id).length;

          return (
            <div
              key={s.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-blue-600">{s.id}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                      s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <h3 className="mt-2 text-base font-bold text-slate-900">{s.companyName}</h3>
                <div className="text-xs text-slate-600 font-medium">{s.name} (Contact)</div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px]">{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {s.city}, {s.state}
                    </span>
                  </div>
                  {s.gstNumber && (
                    <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                      <FileText className="h-3 w-3 shrink-0" />
                      <span>Tax ID: {s.gstNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">{productCount}</span>
                  </div>
                  <span>·</span>
                  <span className="font-mono text-[11px]">{purchaseCount} POs</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingSupplier(s)}
                    className="p-1 rounded text-slate-600 hover:bg-slate-100"
                    title="View Associated Catalog"
                  >
                    <Building className="h-4 w-4" />
                  </button>
                  {currentUser.role === 'Admin' && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1 rounded text-blue-600 hover:bg-blue-50"
                        title="Edit Supplier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-1 rounded text-red-500 hover:bg-red-50"
                        title="Delete or Deactivate Supplier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplier Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingSupplier ? 'Update Supplier Profile' : 'Register New Vendor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Industrial Supplies"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Representative *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rachel Green"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="orders@company.com"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (800) 555-0199"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Warehouse location"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-slate-900 uppercase focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Status:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="rounded border border-slate-200 p-1 text-slate-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
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
                    {editingSupplier ? 'Save' : 'Register'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Catalog View Modal */}
      {viewingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingSupplier.companyName}</h3>
                <span className="text-xs text-slate-500">Products supplied by this vendor</span>
              </div>
              <button onClick={() => setViewingSupplier(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto divide-y divide-slate-100">
              {products.filter((p) => p.supplierId === viewingSupplier.id).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No products currently associated with this supplier.
                </div>
              ) : (
                products
                  .filter((p) => p.supplierId === viewingSupplier.id)
                  .map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{p.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">${p.purchasePrice.toFixed(2)} cost</div>
                        <div className="font-mono text-[11px] text-slate-500">{p.availableQuantity} in stock</div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingSupplier(null)}
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
