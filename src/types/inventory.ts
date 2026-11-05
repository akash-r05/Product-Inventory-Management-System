export type UserRole = 'Admin' | 'Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gstNumber?: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  supplierId: string;
  purchasePrice: number;
  sellingPrice: number;
  availableQuantity: number;
  minimumStockLevel: number;
  image?: string;
  createdDate: string;
  updatedDate: string;
  status: 'Active' | 'Inactive';
}

export type MovementType = 'Purchase' | 'Sale' | 'Return' | 'Adjustment' | 'Damage';

export interface StockMovement {
  id: string;
  productId: string;
  movementType: MovementType;
  quantity: number;
  previousStock: number;
  updatedStock: number;
  referenceId?: string; // Purchase Invoice / Sales Invoice / Adjustment ID
  remarks: string;
  movementDate: string;
  createdBy: string;
}

export interface PurchaseDetail {
  id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  unitPurchasePrice: number;
  tax: number;
  totalAmount: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  purchaseDate: string;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  purchaseStatus: 'Confirmed' | 'Pending' | 'Cancelled';
  notes?: string;
  details: PurchaseDetail[];
}

export interface SalesDetail {
  id: string;
  salesId: string;
  productId: string;
  quantity: number;
  unitSellingPrice: number;
  tax: number;
  totalAmount: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  salesDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'UPI';
  paymentStatus: 'Paid' | 'Pending';
  salesStatus: 'Completed' | 'Pending' | 'Cancelled' | 'Returned';
  notes?: string;
  details: SalesDetail[];
}

export interface SystemSettings {
  companyName: string;
  currencySymbol: string;
  currencyCode: string;
  taxRatePercentage: number;
  lowStockThreshold: number;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  invoicePrefix: string;
  purchasePrefix: string;
}
