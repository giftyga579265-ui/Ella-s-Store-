export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  image: string;
  videoUrl?: string;
  images360?: string[];
  tryOnImage?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
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
  avatarUrl?: string;
  lastActive?: string;
  location?: string;
  device?: string;
  ip?: string;
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
  heroTitle?: string;
  heroDescription?: string;
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

export interface Charity {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl?: string;
  active: boolean;
}

export interface ConferenceSession {
  id: string;
  name: string;
  hostName: string;
  hostEmail: string;
  createdAt: string;
  status: 'active' | 'ended';
  videoRecordedUrl?: string;
  recordingDurationSec?: number;
  totalChatsCount?: number;
}

export interface ConferenceChat {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  file?: {
    url: string;
    name: string;
    type: string;
    size?: number;
  };
}

export interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  conferenceId: string;
  conferenceName: string;
  timestamp: string;
  fileSize?: number;
}


