export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  image: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  orders: number;
  totalSpent: number;
  signedUp: boolean;
}

export interface Order {
  id: string;
  customer: string;
  customerId: number;
  items: string[];
  total: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export interface DiscountCode {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  expiry?: string;
  usageLimit?: number | null;
  usedCount: number;
  active: boolean;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  timestamp: string;
  read: boolean;
  customerEmail?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  customer: string;
  method: 'momo' | 'cash' | 'card' | 'googlepay';
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface CustomerLocation {
  id: number;
  customerId: number;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  notes?: string;
}

export interface CustomerInquiry {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  message: string;
  date: string;
  status: 'new' | 'in-progress' | 'resolved';
}

export interface ActivityLog {
  id: number;
  username: string;
  type: 'login' | 'cart_addition' | 'purchase' | 'product_view' | 'inquiry' | 'admin_action' | 'user_action';
  description: string;
  timestamp: string;
  ip: string;
  device: string;
  sessionId: string;
}

export interface MediaFile {
  id: number;
  type: 'image' | 'video' | 'audio';
  title: string;
  description: string;
  url: string;
  uploadDate: string;
}

export interface HomepageSettings {
  heroBackground: string;
  productLayout: 'grid' | 'list' | 'carousel' | 'masonry';
  primaryColor: string;
  secondaryColor: string;
  momoEnabled?: boolean;
  momoMerchantName?: string;
  momoMerchantNumber?: string;
  momoChargeRate?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export interface StoreEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  imageUrl?: string;
  status: 'upcoming' | 'ongoing' | 'past';
}

export interface CustomerReview {
  id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  feedback: string;
  request: string;
  date: string;
}

export interface DeliveryItem {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address: string;
  items: string[];
  status: 'ordered' | 'dispatched' | 'in_transit' | 'delivered' | 'failed';
  dispatchRiderName?: string;
  dispatchRiderPhone?: string;
  notes?: string;
  estimatedDeliveryDate?: string;
  lastUpdated: string;
}

