import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Category, Product, User } from '../types/inventory';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  currentUser: User;
  onSaveCategory: (cat: Omit<Category, 'id' | 'createdDate'> & { id?: string }) => { success: boolean; error?: string };
  onDeleteCategory: (id: string) => { success: boolean; error?: string };
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  currentUser,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' as 'Active' | 'Inactive' });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const productCountPerCategory = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      map.set(p.categoryId, (map.get(p.categoryId) || 0) + 1);
    });
    return map;
  }, [products]);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormData({ name: c.name, description: c.description, status: c.status });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSaveCategory({
      ...formData,
      id: editingCategory?.id,
    });

    if (result.success) {
      setNotification({
        type: 'success',
        message: editingCategory ? 'Category updated.' : 'New category created.',
      });
      setIsModalOpen(false);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to save category.',
      });
    }
  };

  const handleDelete = (c: Category) => {
    const count = productCountPerCategory.get(c.id) || 0;
    if (count > 0) {
      setNotification({
        type: 'error',
        message: `Cannot delete "${c.name}". There are ${count} products assigned to this category.`,
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${c.name}"?`)) {
      const res = onDeleteCategory(c.id);
      if (res.success) {
        setNotification({ type: 'success', message: 'Category removed successfully.' });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to delete.' });
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Category Management</h1>
          <p className="text-xs text-slate-500">
            Organizing product catalog into structured taxonomy groups
          </p>
        </div>

        {currentUser.role === 'Admin' && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search categories by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((c) => {
          const count = productCountPerCategory.get(c.id) || 0;
          return (
            <div
              key={c.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-blue-600">{c.id}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                      c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900">{c.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.description || 'No description provided.'}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Package className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">{count}</span>
                  <span className="text-slate-400">products</span>
                </div>

                {currentUser.role === 'Admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1 rounded text-blue-600 hover:bg-blue-50"
                      title="Edit Category"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="p-1 rounded text-red-500 hover:bg-red-50"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sensors & Telemetry"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Scope, storage considerations, and product types..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {editingCategory ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
