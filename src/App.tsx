import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Product, Order, Customer, Payment, CustomerLocation, 
  CustomerInquiry, ActivityLog, DiscountCode, Charity, MediaFile, HomepageSettings, ChatMessage, NotificationItem, StoreEvent, CustomerReview, DeliveryItem,
  DeliveryRate, DeliveryPersonnel
} from "./types";
import { ShoppingBag, Phone, MapPin, Mail, Clock, HelpCircle, Settings, User, Check, Ribbon, Star, ChevronDown, Lock, Bell, Trash2, X, Menu, Heart, Search, Mic, Video, Film, Upload, Camera, Image as ImageIcon, Sun, Moon } from 'lucide-react';

import SmsWidget from "./components/SmsWidget";
import MediaGallery from "./components/MediaGallery";
import CharityDonations from "./components/CharityDonations";
import CheckoutModal from "./components/CheckoutModal";
import HaiasiChatbot from "./components/HaiasiChatbot";
import AdminDashboard from "./components/AdminDashboard";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import NotificationInbox from "./components/NotificationInbox";
import OrderHistory from "./components/OrderHistory";
import ReviewModal from "./components/ReviewModal";
import ConferenceRoom from "./components/ConferenceRoom";
// @ts-ignore
import Logo from "./assets/images/ellas_store_logo_1784345363330.jpg";

import { db, auth, googleProvider } from "./lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, getDocs 
} from "firebase/firestore";

// LUXURIOUS AVATAR PRESETS
const AVATAR_PRESETS = [
  { name: "Sleek Gold", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80" },
  { name: "Modern Charcoal", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80" },
  { name: "Traditional Ankara", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&fit=crop&q=80" },
  { name: "Regal Emerald", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&fit=crop&q=80" },
  { name: "Vibrant Indigo", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&fit=crop&q=80" },
  { name: "Crimson Velvet", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&fit=crop&q=80" }
];

// INITIAL DATA CONSTANTS
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Elegant Evening Gown",
    price: 250,
    category: "dresses",
    stock: 15,
    description: "Breathtaking premium evening dress tailored from luxurious fabrics, perfect for traditional weddings, formal galas, and special dinners.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600"
  },
  {
    id: 2,
    name: "Modern Ankara Flare Dress",
    price: 180,
    category: "dresses",
    stock: 22,
    description: "Vibrant custom-tailored Ankara wax print dress featuring a flowing skater silhouette and comfortable lightweight breathable cotton.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600"
  },
  {
    id: 3,
    name: "Special Occasion Lace Maxi",
    price: 320,
    category: "dresses",
    stock: 8,
    description: "Intricately detailed embroidered white lace dress designed with a sleek column silhouette for weddings, christenings, and upscale celebrations.",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600"
  },
  {
    id: 4,
    name: "Fashionable Leather Handbag",
    price: 140,
    category: "bags",
    stock: 12,
    description: "Chic structured designer leather bag featuring detailed metal hardware and a spacious dual-compartment interior.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600"
  },
  {
    id: 5,
    name: "Premium Suede Pumps",
    price: 160,
    category: "shoes",
    stock: 14,
    description: "Sophisticated and comfortable classic suede high heels styled for elegant business attire and formal evening wear.",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600"
  },
  {
    id: 6,
    name: "Royal Beaded Jewelry Set",
    price: 95,
    category: "accessories",
    stock: 25,
    description: "Premium handcrafted traditional Ghanaian bead necklace and earring set featuring gold-toned custom clasps.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"
  },
  {
    id: 7,
    name: "Jollof Rice Royal Feast",
    price: 45,
    category: "food",
    stock: 50,
    description: "Rich, fragrant smoky Ghanaian Jollof rice served with spicy grilled chicken, sweet fried plantains (kelewele), and fresh house shito sauce.",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600"
  },
  {
    id: 8,
    name: "Assorted Fufu & Goat Light Soup",
    price: 60,
    category: "food",
    stock: 30,
    description: "Traditional soft pounded fufu served in rich, spicy aromatic goat light soup with tender cuts of goat meat, garden eggs, and okra.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600"
  },
  {
    id: 9,
    name: "Ella's Special Waakye Platter",
    price: 50,
    category: "food",
    stock: 45,
    description: "Hearty Ghanaian Waakye (rice and beans) accompanied by spaghetti (talia), moist wele stew, hard-boiled egg, avocado, and hot shito.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"
  },
  {
    id: 10,
    name: "Grilled Tilapia with Kelewele",
    price: 55,
    category: "food",
    stock: 25,
    description: "Perfectly seasoned, char-grilled whole tilapia fish served alongside spicy fried plantain cubes (kelewele), and hot sliced red bell-peppers.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600"
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: "Ama Mensah",
    email: "ama.mensah@example.com",
    phone: "0271234567",
    registrationDate: "2026-06-10",
    orders: 3,
    totalSpent: 850,
    signedUp: true,
    loyaltyPoints: 0
  },
  {
    id: 2,
    name: "Kofi Asante",
    email: "kofi.asante@example.com",
    phone: "0272345678",
    registrationDate: "2026-06-12",
    orders: 1,
    totalSpent: 150,
    signedUp: true,
    loyaltyPoints: 0
  },
  {
    id: 3,
    name: "Esi Boateng",
    email: "esi.boateng@example.com",
    phone: "0273456789",
    registrationDate: "2026-06-15",
    orders: 2,
    totalSpent: 350,
    signedUp: true,
    loyaltyPoints: 0
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ELLA-2026-001",
    customer: "Ama Mensah",
    customerId: 1,
    items: ["Elegant Evening Gown (x1)", "Royal Beaded Jewelry Set (x1)"],
    total: 345,
    date: "2026-06-15",
    status: "pending"
  },
  {
    id: "ELLA-2026-002",
    customer: "Kofi Asante",
    customerId: 2,
    items: ["Premium Suede Pumps (x1)"],
    total: 160,
    date: "2026-06-16",
    status: "processing"
  },
  {
    id: "ELLA-2026-003",
    customer: "Esi Boateng",
    customerId: 3,
    items: ["Modern Ankara Flare Dress (x1)", "Fashionable Leather Handbag (x1)"],
    total: 320,
    date: "2026-06-17",
    status: "completed"
  }
];

const INITIAL_DISCOUNTS: DiscountCode[] = [
  {
    id: 1,
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minAmount: 50,
    expiry: "2026-12-31",
    usageLimit: 100,
    usedCount: 25,
    active: true
  },
  {
    id: 2,
    code: "SUMMER25",
    type: "percentage",
    value: 25,
    minAmount: 100,
    expiry: "2026-09-30",
    usageLimit: 50,
    usedCount: 12,
    active: true
  },
  {
    id: 3,
    code: "LAPAZFREE",
    type: "fixed",
    value: 15,
    minAmount: 75,
    expiry: "2026-08-31",
    usageLimit: null,
    usedCount: 38,
    active: true
  }
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: "PAY-2026-001",
    orderId: "ELLA-2026-001",
    customer: "Ama Mensah",
    method: "momo",
    amount: 345,
    date: "2026-06-15",
    status: "completed"
  },
  {
    id: "PAY-2026-002",
    orderId: "ELLA-2026-002",
    customer: "Kofi Asante",
    method: "cash",
    amount: 160,
    date: "2026-06-16",
    status: "completed"
  },
  {
    id: "PAY-2026-003",
    orderId: "ELLA-2026-003",
    customer: "Esi Boateng",
    method: "momo",
    amount: 320,
    date: "2026-06-17",
    status: "completed"
  }
];

const INITIAL_LOCATIONS: CustomerLocation[] = [
  {
    id: 1,
    customerId: 1,
    customerName: "Ama Mensah",
    address: "Ashaiman, Accra, near Ashaiman Market",
    lat: 5.6037,
    lng: -0.2270
  },
  {
    id: 2,
    customerId: 2,
    customerName: "Kofi Asante",
    address: "Achimota Forest Area, Accra",
    lat: 5.6148,
    lng: -0.2322
  },
  {
    id: 3,
    customerId: 3,
    customerName: "Esi Boateng",
    address: "Dansoman Exhibition Street, Accra",
    lat: 5.5700,
    lng: -0.2874
  }
];

const INITIAL_INQUIRIES: CustomerInquiry[] = [
  {
    id: 1,
    customerName: "Ama Mensah",
    customerEmail: "ama.mensah@example.com",
    customerPhone: "0271234567",
    service: "fashion",
    message: "I am preparing for an traditional wedding ceremony in late July. Can you recommend custom lace designs or do you sell Kente coordinates?",
    date: "2026-06-25",
    status: "new"
  },
  {
    id: 2,
    customerName: "Kofi Asante",
    customerEmail: "kofi.asante@example.com",
    customerPhone: "0272345678",
    service: "alterations",
    message: "I purchased some suit trousers that are too long. Do you do bespoke hemming and taper alterations at your Ashaiman shop?",
    date: "2026-06-26",
    status: "in-progress"
  }
];

const INITIAL_MEDIA: MediaFile[] = [
  {
    id: 1,
    type: "image",
    title: "Ashaiman Boutique Storefront",
    description: "Welcome to Ella's Store! Visit our showroom in Ashaiman, Accra for custom tailoring fittings and retail catalog rows.",
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    uploadDate: "2026-06-01"
  },
  {
    id: 2,
    type: "image",
    title: "Embroidered Gowns Catalog",
    description: "Close-up detailing on our bespoke traditional laces and evening gown tailoring.",
    url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800",
    uploadDate: "2026-06-05"
  }
];

const INITIAL_EVENTS: StoreEvent[] = [
  {
    id: "evt-1",
    title: "Ella's Ankara Design Showcase",
    description: "Join us for an exclusive showroom presentation of our latest Ankara flare gowns, custom lace designs, and vibrant Ghanaian cuts.",
    date: "2026-07-12",
    time: "14:00",
    location: "Ella's Store, Ashaiman, Accra",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    status: "upcoming"
  },
  {
    id: "evt-2",
    title: "Accra Traditional Couture Fair",
    description: "Vibrant Kente designs and custom bridal styling exhibitions curated directly by Ella. Free fashion consultations for early arrivals.",
    date: "2026-08-05",
    time: "10:00",
    location: "Ashaiman Showroom, Accra",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    status: "upcoming"
  }
];

const INITIAL_CHARITIES: Charity[] = [
  {
    id: "charity-1",
    name: "Accra Children's Education Initiative",
    description: "Providing desks, books, uniforms and solar study lamps to school kids in needy communities across Accra.",
    targetAmount: 20000,
    currentAmount: 3000,
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
    active: true
  },
  {
    id: "charity-2",
    name: "Ghana Healthcare Clinic Sponsorship",
    description: "Sponsoring prenatal vitamins, pediatric checkups, and clean water filtration systems for rural clinics.",
    targetAmount: 35000,
    currentAmount: 3100,
    imageUrl: "https://images.unsplash.com/photo-1584515906247-4b4c40af709f?w=600",
    active: true
  }
];

const INITIAL_CHARITY_DONATIONS = [
  {
    id: "DON-2026-1001",
    charityId: "charity-1",
    charityName: "Accra Children's Education Initiative",
    customerName: "Kofi Asante",
    customerEmail: "kofi.asante@example.com",
    amount: 500,
    date: "2026-06-15",
    method: "momo",
    status: "completed"
  },
  {
    id: "DON-2026-1002",
    charityId: "charity-1",
    charityName: "Accra Children's Education Initiative",
    customerName: "Gifty Ga",
    customerEmail: "gifty.ga579265@gmail.com",
    amount: 1200,
    date: "2026-06-18",
    method: "googlepay",
    status: "completed"
  },
  {
    id: "DON-2026-1003",
    charityId: "charity-2",
    charityName: "Ghana Healthcare Clinic Sponsorship",
    customerName: "Ella Accra",
    customerEmail: "ella.accra.admin@gmail.com",
    amount: 1500,
    date: "2026-06-20",
    method: "googlepay",
    status: "completed"
  },
  {
    id: "DON-2026-1004",
    charityId: "charity-2",
    charityName: "Ghana Healthcare Clinic Sponsorship",
    customerName: "Asante Isaiah",
    customerEmail: "asante@example.com",
    amount: 800,
    date: "2026-06-25",
    method: "momo",
    status: "completed"
  }
];

const AUTHORIZED_ADMIN_USERS = ['Asante ISAIAH', 'Asante Isaiah', 'Asante Kofi', 'Etnasa Haiasi', 'gifty.ga579265@gmail.com', 'ella.accra.admin@gmail.com'];

interface Toast {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  // STATE MANAGEMENT INITIALIZED DIRECTLY (SYNCED FROM FIRESTORE)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [locations, setLocations] = useState<CustomerLocation[]>(INITIAL_LOCATIONS);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>(INITIAL_INQUIRIES);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(INITIAL_DISCOUNTS);
  const [charityData, setCharityData] = useState<Charity[]>([]);
  const [charityDonations, setCharityDonations] = useState<any[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(INITIAL_MEDIA);
  const [events, setEvents] = useState<StoreEvent[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('ella_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ella_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ella_theme', 'light');
    }
  }, [isDarkMode]);

  const [siteLoading, setSiteLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [isCustomersLoaded, setIsCustomersLoaded] = useState(false);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>({
    heroBackground: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
    productLayout: "grid",
    primaryColor: "#d4af37",
    secondaryColor: "#0a0a0a",
    momoEnabled: true,
    momoMerchantName: "ELLA'S FASHION SHOWROOM",
    momoMerchantNumber: "0244123456",
    momoChargeRate: 0.5
  });

  // Client session state
  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("currentUser") || "";
  });
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return localStorage.getItem("currentUserEmail") || "";
  });
  const [currentUserAvatar, setCurrentUserAvatar] = useState(() => {
    return localStorage.getItem("currentUserAvatar") || "";
  });

  const isAuthorizedAdmin = useMemo(() => {
    return (
      AUTHORIZED_ADMIN_USERS.some(admin => (admin || '').toLowerCase() === (currentUser || '').trim().toLowerCase()) ||
      AUTHORIZED_ADMIN_USERS.some(admin => (admin || '').toLowerCase() === (currentUserEmail || '').trim().toLowerCase())
    );
  }, [currentUser, currentUserEmail]);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(AVATAR_PRESETS[0].url);

  // Computed notification count for user
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => {
      const email = (n as any).customerEmail;
      if (!email || email === "all") return true;
      if (isLoggedIn && currentUserEmail && (email || '').toLowerCase() === (currentUserEmail || '').toLowerCase()) return true;
      return false;
    }).length;
  }, [notifications, currentUserEmail, isLoggedIn]);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [showLogin, setShowLogin] = useState(() => {
    return localStorage.getItem("isLoggedIn") !== "true";
  });

  // Modal displays
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showCharity, setShowCharity] = useState(false);
  const [showConference, setShowConference] = useState(false);
  const [initialConfRoomId, setInitialConfRoomId] = useState<string | null>(null);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Custom states for styling inquiry and SpeechRecognition
  const [isListening, setIsListening] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const recognitionRef = useRef<any>(null);
  
  // Custom dialogs
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminAuthPassword, setAdminAuthPassword] = useState("");
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [deliveryRates, setDeliveryRates] = useState<DeliveryRate[]>([]);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState<DeliveryPersonnel[]>([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [detailInitialTab, setDetailInitialTab] = useState<'classic' | 'spin360' | 'video' | 'tryon'>('classic');

  const handleViewDetail = (product: Product | null, tab: 'classic' | 'spin360' | 'video' | 'tryon' = 'classic') => {
    setSelectedDetailProduct(product);
    setDetailInitialTab(tab);
  };

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // CENTRAL SYNCHRONIZATION HELPER TO WRITE LOCAL LIST CHANGES TO FIRESTORE
  const syncCollection = async (collectionName: string, newItems: any[]) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const existingIds = new Set(querySnapshot.docs.map(doc => doc.id));
      
      const newIds = new Set();
      for (const item of newItems) {
        const docId = String(item.id);
        newIds.add(docId);
        
        // Defensive check: Firestore document limit is ~1MB. 
        // We check size roughly (JSON string length * 2 bytes/char is an upper bound).
        const itemSize = new Blob([JSON.stringify(item)]).size;
        if (itemSize > 1000000) {
          console.error(`Item ${docId} in ${collectionName} is too large (${itemSize} bytes), skipping write to Firestore!`);
          continue;
        }
        
        await setDoc(doc(db, collectionName, docId), item);
      }
      
      for (const existingId of existingIds) {
        if (!newIds.has(existingId)) {
          await deleteDoc(doc(db, collectionName, existingId));
        }
      }
    } catch (err) {
      console.error(`Error syncing ${collectionName} to Firestore:`, err);
    }
  };

  // Auto-seed database collections if empty to provide an immediate live experience
  const autoSeedIfEmpty = async () => {
    try {
      const prodSnap = await getDocs(collection(db, "products"));
      if (prodSnap.empty) {
        console.log("Database is empty. Auto-seeding initial collections...");
        for (const item of INITIAL_PRODUCTS) {
          await setDoc(doc(db, "products", String(item.id)), item);
        }
        for (const item of INITIAL_CUSTOMERS) {
          await setDoc(doc(db, "customers", String(item.id)), item);
        }
        for (const item of INITIAL_ORDERS) {
          await setDoc(doc(db, "orders", String(item.id)), item);
        }
        for (const item of INITIAL_PAYMENTS) {
          await setDoc(doc(db, "payments", String(item.id)), item);
        }
        for (const item of INITIAL_LOCATIONS) {
          await setDoc(doc(db, "locations", String(item.id)), item);
        }
        for (const item of INITIAL_INQUIRIES) {
          await setDoc(doc(db, "inquiries", String(item.id)), item);
        }
        for (const item of INITIAL_DISCOUNTS) {
          await setDoc(doc(db, "discounts", String(item.id)), item);
        }
        for (const item of INITIAL_MEDIA) {
          await setDoc(doc(db, "media", String(item.id)), item);
        }
        for (const item of INITIAL_EVENTS) {
          await setDoc(doc(db, "events", String(item.id)), item);
        }
        console.log("Database successfully seeded.");
        logActivity("Automatically seeded the storefront database on initial access", "admin_action");
      }
    } catch (err) {
      console.error("Error auto-seeding database:", err);
    }
  };

  // Check URL query parameters for conference room redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("room");
    if (roomId) {
      setInitialConfRoomId(roomId);
      setShowConference(true);
      // Clean query parameter from URL bar without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(
        "API Unsupported",
        "The browser's Speech Recognition API is not supported in this environment. Try Google Chrome.",
        "error"
      );
      return;
    }

    // Toggle logic: If already listening, stop the current instance gracefully
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error("Error stopping speech recognition:", err);
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        showToast("Voice Dictation Live", "Listening to your inquiry... Speak now.", "info");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInquiryMessage(prev => prev ? prev + " " + transcript : transcript);
        showToast("Speech Recorded", "Appended transcribed speech text successfully.", "success");
      };

      recognition.onerror = (event: any) => {
        const err = event.error;
        console.error("Speech recognition error:", err);
        setIsListening(false);
        
        // Handle normal transitions or aborts gracefully without showing disruptive toasts
        if (err === "aborted") {
          console.log("Speech recognition was aborted normally.");
          return;
        }
        
        if (err === "no-speech") {
          showToast("No Speech Detected", "We didn't hear anything. Try speaking again.", "info");
          return;
        }

        if (err === "not-allowed") {
          showToast(
            "Access Denied",
            "Microphone access was denied. Please allow microphone permissions or open in a new tab.",
            "error"
          );
          return;
        }

        showToast("Dictation Suspended", `Speech recognition stopped: ${err}`, "info");
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (err) {
      console.error("Speech initialization error:", err);
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  // Synchronize or register current visitor (both Guest and Logged-In Customers)
  const registerVisitorDetails = async (nameToUse: string, emailToUse: string, isLoggedInUser: boolean) => {
    try {
      // 1. Establish persistent Visitor ID
      let visitorIdStr = localStorage.getItem("visitor_tracker_id");
      let visitorId = visitorIdStr ? parseInt(visitorIdStr) : 0;
      
      // If no ID exists, check if there's an existing customer with this name or email
      if (!visitorId) {
        const existingByEmail = customers.find(c => emailToUse && (c.email || '').toLowerCase() === (emailToUse || '').toLowerCase());
        const existingByName = customers.find(c => (c.name || '').toLowerCase() === (nameToUse || '').toLowerCase());
        
        if (existingByEmail) {
          visitorId = existingByEmail.id;
        } else if (existingByName) {
          visitorId = existingByName.id;
        } else {
          // Generate a new unique ID
          visitorId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1000 + Math.floor(Math.random() * 9000);
        }
        localStorage.setItem("visitor_tracker_id", String(visitorId));
      }

      // 2. Identify Device Information
      const userAgent = navigator.userAgent;
      let device = "Desktop (Web)";
      if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
        device = "Mobile Device";
        if (/iPhone/i.test(userAgent)) device = "iPhone";
        else if (/iPad/i.test(userAgent)) device = "iPad";
        else if (/Android/i.test(userAgent)) device = "Android Mobile";
      } else if (/Macintosh/i.test(userAgent)) {
        device = "macOS";
      } else if (/Windows/i.test(userAgent)) {
        device = "Windows PC";
      } else if (/Linux/i.test(userAgent)) {
        device = "Linux PC";
      }

      // 3. Fetch IP and Location Details
      let ipAddress = "127.0.0.1";
      let locationStr = "Accra, Ghana"; // default fallback local timezone city

      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          ipAddress = data.ip || ipAddress;
          if (data.city && data.country_name) {
            locationStr = `${data.city}, ${data.country_name}`;
          }
        }
      } catch (err) {
        console.warn("Could not retrieve IP-based geolocation, using default fallback info:", err);
      }

      // 4. Construct customer record
      const existingRecord = customers.find(c => c.id === visitorId);
      const isSignedUp = isLoggedInUser || (existingRecord ? existingRecord.signedUp : false);
      const ordersCount = existingRecord ? existingRecord.orders : 0;
      const totalSpentCount = existingRecord ? existingRecord.totalSpent : 0;
      const regDate = (existingRecord && existingRecord.registrationDate) ? existingRecord.registrationDate : new Date().toISOString().split('T')[0];

      // Keep temporary guest names fresh if they change session names
      const finalName = isLoggedInUser ? nameToUse : (existingRecord ? existingRecord.name : nameToUse);

      const updatedCustomer: Customer = {
        id: visitorId,
        name: finalName,
        email: emailToUse || (existingRecord ? existingRecord.email : `${(finalName || '').toLowerCase().replace(/\s+/g, '')}_guest@ellastore.com`),
        phone: existingRecord ? existingRecord.phone : "024" + Math.floor(1000000 + Math.random() * 8999999),
        registrationDate: regDate,
        orders: ordersCount,
        totalSpent: totalSpentCount,
        signedUp: isSignedUp,
        lastActive: new Date().toISOString(),
        location: locationStr,
        device: device,
        ip: ipAddress,
        avatarUrl: existingRecord?.avatarUrl || "",
        loyaltyPoints: existingRecord?.loyaltyPoints || 0
      };

      // 5. Persist to Firestore database
      await setDoc(doc(db, "customers", String(visitorId)), updatedCustomer);
      console.log(`Registered details for ${isLoggedInUser ? 'Authenticated' : 'Anonymous'} customer:`, updatedCustomer);
    } catch (err) {
      console.error("Error synchronizing customer activity:", err);
    }
  };

  // Track visitor session accesses and synchronize database customer records
  useEffect(() => {
    const isGuest = !isLoggedIn || !currentUser;
    const displayName = currentUser || localStorage.getItem("guest_visitor_name") || (() => {
      const generatedName = "Guest_" + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem("guest_visitor_name", generatedName);
      return generatedName;
    })();
    const displayEmail = currentUserEmail || "";
    
    // Check if we've already registered this session
    const hasLoggedAccess = sessionStorage.getItem("hasLoggedAccess");
    if (!hasLoggedAccess) {
      sessionStorage.setItem("hasLoggedAccess", "true");
      logActivity(`Accessed the storefront as ${currentUser || "Guest Customer"}`, "user_action");
    }
    
    // Synchronize to customer list in Firestore
    // Introduce a short timeout to let initial database customer arrays load first
    const timer = setTimeout(() => {
      registerVisitorDetails(displayName, displayEmail, !isGuest);
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentUser, isLoggedIn, currentUserEmail]);

  // Monitor if customer account gets deleted by admin
  useEffect(() => {
    if (isCustomersLoaded && isLoggedIn && !isAuthorizedAdmin) {
      const userExists = (customers || []).some(
        c => (c.name || '').toLowerCase() === (currentUser || '').trim().toLowerCase() ||
             (currentUserEmail && (c.email || '').toLowerCase() === (currentUserEmail || '').trim().toLowerCase())
      );
      if (!userExists) {
        setIsLoggedIn(false);
        setCurrentUser("");
        setCurrentUserEmail("");
        setCurrentUserAvatar("");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("currentUserEmail");
        localStorage.removeItem("currentUserAvatar");
        showToast("Session Expired", "Your customer account was deleted. Please re-register to continue.", "info");
        setShowLogin(true);
      }
    }
  }, [isCustomersLoaded, customers, isLoggedIn, isAuthorizedAdmin, currentUser, currentUserEmail]);

  // Handle slow activity timer for loader overlay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (siteLoading) {
      timer = setTimeout(() => {
        setIsSlowLoading(true);
      }, 1200);
    } else {
      setIsSlowLoading(false);
    }
    return () => clearTimeout(timer);
  }, [siteLoading]);

  // REAL-TIME FIRESTORE SYNCHRONIZATION
  useEffect(() => {
    // 1. PRODUCTS
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      if (snapshot.empty) {
        setProducts([]);
        autoSeedIfEmpty();
      } else {
        const items = snapshot.docs.map(doc => doc.data() as Product);
        
        // Ensure food items exist in database
        const hasFood = (items || []).some(item => item.category === 'food');
        if (!hasFood) {
          console.log("No food products found in existing Firestore. Seeding food items...");
          INITIAL_PRODUCTS.forEach(async (item) => {
            if (item.category === 'food') {
              await setDoc(doc(db, "products", String(item.id)), item);
            }
          });
        }

        items.sort((a, b) => a.id - b.id);
        setProducts(items);
      }
    });

    // 2. ORDERS
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      if (snapshot.empty) {
        setOrders([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as Order);
        setOrders(items);
      }
    });

    // 3. CUSTOMERS
    const unsubscribeCustomers = onSnapshot(collection(db, "customers"), (snapshot) => {
      if (snapshot.empty) {
        setCustomers([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as Customer);
        items.sort((a, b) => a.id - b.id);
        setCustomers(items);
      }
      setIsCustomersLoaded(true);
    }, (error) => {
      console.error("Error subscribing to customers collection:", error);
      setIsCustomersLoaded(true);
    });

    // 4. PAYMENTS
    const unsubscribePayments = onSnapshot(collection(db, "payments"), (snapshot) => {
      if (snapshot.empty) {
        setPayments([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as Payment);
        setPayments(items);
      }
    });

    // 5. LOCATIONS
    const unsubscribeLocations = onSnapshot(collection(db, "locations"), (snapshot) => {
      if (snapshot.empty) {
        setLocations([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as CustomerLocation);
        items.sort((a, b) => a.id - b.id);
        setLocations(items);
      }
    });

    // 6. INQUIRIES
    const unsubscribeInquiries = onSnapshot(collection(db, "inquiries"), (snapshot) => {
      if (snapshot.empty) {
        setInquiries([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as CustomerInquiry);
        items.sort((a, b) => b.id - a.id);
        setInquiries(items);
      }
    });

    // 7. DISCOUNT CODES
    const unsubscribeDiscounts = onSnapshot(collection(db, "discounts"), (snapshot) => {
      if (snapshot.empty) {
        setDiscountCodes([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as DiscountCode);
        items.sort((a, b) => a.id - b.id);
        setDiscountCodes(items);
      }
    });

    // CHARITY
    const unsubscribeCharity = onSnapshot(collection(db, "charity"), (snapshot) => {
      if (snapshot.empty) {
        setCharityData([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as Charity);
        setCharityData(items);
      }
    });

    // CHARITY DONATIONS
    const unsubscribeCharityDonations = onSnapshot(collection(db, "charity_donations"), (snapshot) => {
      if (snapshot.empty) {
        setCharityDonations([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data());
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCharityDonations(items);
      }
    });

    // 8. MEDIA FILES
    const unsubscribeMedia = onSnapshot(collection(db, "media"), (snapshot) => {
      if (snapshot.empty) {
        setMediaFiles([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as MediaFile);
        items.sort((a, b) => b.id - a.id);
        setMediaFiles(items);
      }
    });

    // 9. ACTIVITY LOGS
    const unsubscribeActivityLogs = onSnapshot(collection(db, "activity_logs"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as ActivityLog);
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityLogs(items);
    });

    // 10. ADMIN MESSAGES
    const unsubscribeAdminMessages = onSnapshot(collection(db, "admin_messages"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data());
      setAdminMessages(items);
    });

    // 12. NOTIFICATIONS
    const unsubscribeNotifications = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as NotificationItem);
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(items);
    });

    // 13. EVENTS
    const unsubscribeEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      if (snapshot.empty) {
        setEvents([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as StoreEvent);
        // Sort events: upcoming first, then date sorted
        items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(items);
      }
    });

    // 14. REVIEWS
    const unsubscribeReviews = onSnapshot(collection(db, "reviews"), (snapshot) => {
      if (snapshot.empty) {
        setReviews([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as CustomerReview);
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReviews(items);
      }
    });

    // 15. DELIVERIES
    const unsubscribeDeliveries = onSnapshot(collection(db, "deliveries"), (snapshot) => {
      if (snapshot.empty) {
        setDeliveries([]);
      } else {
        const items = snapshot.docs.map(doc => doc.data() as DeliveryItem);
        setDeliveries(items);
      }
    });

    // 11. HOMEPAGE SETTINGS
    const unsubscribeHomepage = onSnapshot(doc(db, "settings", "homepage"), (docSnap) => {
      if (docSnap.exists()) {
        const settings = docSnap.data() as HomepageSettings;
        setHomepageSettings(settings);
        document.documentElement.style.setProperty('--primary-gold', settings.primaryColor);
        document.documentElement.style.setProperty('--dark-charcoal', settings.secondaryColor);
      } else {
        const defaultSettings = {
          heroBackground: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
          productLayout: "grid",
          primaryColor: "#d4af37",
          secondaryColor: "#0a0a0a",
          momoEnabled: true,
          momoMerchantName: "ELLA'S FASHION SHOWROOM",
          momoMerchantNumber: "0244123456",
          momoChargeRate: 0.5
        };
        setDoc(doc(db, "settings", "homepage"), defaultSettings);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeCustomers();
      unsubscribePayments();
      unsubscribeLocations();
      unsubscribeInquiries();
      unsubscribeDiscounts();
      unsubscribeMedia();
      unsubscribeActivityLogs();
      unsubscribeAdminMessages();
      unsubscribeHomepage();
      unsubscribeNotifications();
      unsubscribeEvents();
      unsubscribeReviews();
      unsubscribeDeliveries();
      unsubscribeCharity();
      unsubscribeCharityDonations();
    };
  }, []);

  // Toast Trigger Helper
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Log user activity globally in real time via Firestore
  const logActivity = (description: string, type: 'login' | 'cart_addition' | 'purchase' | 'product_view' | 'inquiry' | 'admin_action' | 'user_action' = 'user_action') => {
    const logId = `log_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const log: ActivityLog = {
      id: Date.now(),
      username: currentUser || "Guest Session",
      type,
      description,
      timestamp: new Date().toISOString(),
      ip: `192.168.1.${Math.floor(100 + Math.random() * 150)}`,
      device: "Desktop / Chrome",
      sessionId: `sess_${Math.random().toString(36).substring(2, 9)}`
    };
    setDoc(doc(db, "activity_logs", logId), log).catch(err => {
      console.error("Error logging activity to Firestore:", err);
    });
  };

  const handleAddReview = async (reviewData: {
    customerName: string;
    customerEmail: string;
    rating: number;
    feedback: string;
    request: string;
  }) => {
    try {
      const id = `rev-${Date.now()}`;
      const newReview: CustomerReview = {
        id,
        ...reviewData,
        date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
      };
      await setDoc(doc(db, "reviews", id), newReview);
      showToast("Review Published", "Thank you! Your feedback helps us shape a better e-commerce boutique.", "success");
      logActivity(`Submitted showroom review and rating of ${reviewData.rating} Stars`, "user_action");
    } catch (err) {
      console.error("Error saving review:", err);
      showToast("Submission Error", "Could not submit review at this time. Please try again.", "error");
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, "reviews", id));
      showToast("Review Removed", "Customer review has been permanently removed from the records.", "success");
    } catch (err) {
      console.error("Error deleting review:", err);
      showToast("Deletion Error", "Could not remove review.", "error");
    }
  };

  const handleUpdateDelivery = async (deliveryId: string, updatedFields: Partial<DeliveryItem>) => {
    try {
      const deliveryRef = doc(db, "deliveries", deliveryId);
      const updatedDelivery = {
        ...updatedFields,
        lastUpdated: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
      };
      await setDoc(deliveryRef, updatedDelivery, { merge: true });
      showToast("Delivery Updated", `Tracking status updated successfully.`, "success");
      logActivity(`Updated delivery details for ${deliveryId}`, "admin_action");

      // Give feedback when the product is delivered
      if (updatedFields.status === 'delivered') {
        const delSnapshot = await getDocs(collection(db, "deliveries"));
        const targetDel = delSnapshot.docs.find(d => d.id === deliveryId)?.data() as DeliveryItem;
        if (targetDel) {
          // Update corresponding order status in order collection
          if (targetDel.orderId) {
            await setDoc(doc(db, "orders", targetDel.orderId), { status: 'completed' }, { merge: true });
          }
          // Give feedback (in-app notification)
          await addNotification(
            "Product Delivered Successfully 📦🎉",
            `Hello ${targetDel.customerName || 'Boutique Fan'}! Your beautiful items from Order ${targetDel.orderId || deliveryId} have been successfully delivered to ${targetDel.address}. Thank you for shopping with Ella's Store!`,
            "success",
            targetDel.customerEmail || "all"
          );
        }
      }
    } catch (err) {
      console.error("Error updating delivery tracking:", err);
      showToast("Update Error", "Could not update delivery tracking. Please try again.", "error");
    }
  };

  const handleCreateDelivery = async (deliveryData: Omit<DeliveryItem, 'lastUpdated'>) => {
    try {
      const newDelivery: DeliveryItem = {
        ...deliveryData,
        lastUpdated: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
      };
      await setDoc(doc(db, "deliveries", newDelivery.id), newDelivery);
      showToast("Delivery Registered", `New delivery tracking created for Order ${deliveryData.orderId}`, "success");
      logActivity(`Created delivery record for Order ${deliveryData.orderId}`, "admin_action");
    } catch (err) {
      console.error("Error creating delivery:", err);
      showToast("Registration Error", "Could not create delivery tracking.", "error");
    }
  };

  // Create & save notifications to Firestore
  const addNotification = async (title: string, message: string, type: 'info' | 'success' | 'warning' | 'promo', targetEmail: string = "all") => {
    try {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const newNotif: NotificationItem = {
        id,
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        customerEmail: targetEmail
      };
      await setDoc(doc(db, "notifications", String(id)), newNotif);
    } catch (err) {
      console.error("Error creating notification in Firestore:", err);
    }
  };

  // Delete notification (Customer Action)
  const deleteNotification = async (id: number) => {
    try {
      await deleteDoc(doc(db, "notifications", String(id)));
      showToast("Notification Deleted", "Removed from notification history.", "success");
      logActivity(`Deleted active notification record (ID: ${id})`, "user_action");
    } catch (err) {
      console.error("Error deleting notification from Firestore:", err);
    }
  };

  const handleSeedDemoData = async () => {
    setSiteLoading(true);
    setLoadingMessage("Seeding Ella's boutique showroom data...");
    try {
      showToast("Seeding Database", "Populating high-fidelity sample listings...", "info");
      
      for (const item of INITIAL_PRODUCTS) {
        await setDoc(doc(db, "products", String(item.id)), item);
      }
      for (const item of INITIAL_CUSTOMERS) {
        await setDoc(doc(db, "customers", String(item.id)), item);
      }
      for (const item of INITIAL_ORDERS) {
        await setDoc(doc(db, "orders", String(item.id)), item);
      }
      for (const item of INITIAL_PAYMENTS) {
        await setDoc(doc(db, "payments", String(item.id)), item);
      }
      for (const item of INITIAL_LOCATIONS) {
        await setDoc(doc(db, "locations", String(item.id)), item);
      }
      for (const item of INITIAL_INQUIRIES) {
        await setDoc(doc(db, "inquiries", String(item.id)), item);
      }
      for (const item of INITIAL_DISCOUNTS) {
        await setDoc(doc(db, "discounts", String(item.id)), item);
      }
      for (const item of INITIAL_MEDIA) {
        await setDoc(doc(db, "media", String(item.id)), item);
      }
      for (const item of INITIAL_EVENTS) {
        await setDoc(doc(db, "events", String(item.id)), item);
      }
      for (const item of INITIAL_CHARITIES) {
        await setDoc(doc(db, "charity", String(item.id)), item);
      }
      for (const item of INITIAL_CHARITY_DONATIONS) {
        await setDoc(doc(db, "charity_donations", String(item.id)), item);
      }

      showToast("Showroom Seeded", "Ella's Boutique sample listings loaded successfully.", "success");
      logActivity("Seeded showroom collections with initial sample data", "admin_action");
    } catch (err) {
      console.error("Error seeding demo data:", err);
      showToast("Seeding Failed", "Could not complete seeding operations.", "error");
    } finally {
      setSiteLoading(false);
      setLoadingMessage("");
    }
  };

  const handleClearAllData = async () => {
    setSiteLoading(true);
    setLoadingMessage("Purging all live records from database collections...");
    try {
      showToast("Clearing Data", "Purging all live records from database collections...", "info");
      
      const purgeCollection = async (colName: string) => {
        const querySnapshot = await getDocs(collection(db, colName));
        for (const docSnap of querySnapshot.docs) {
          await deleteDoc(doc(db, colName, docSnap.id));
        }
      };

      await purgeCollection("products");
      await purgeCollection("customers");
      await purgeCollection("orders");
      await purgeCollection("payments");
      await purgeCollection("locations");
      await purgeCollection("inquiries");
      await purgeCollection("discounts");
      await purgeCollection("media");
      await purgeCollection("events");
      await purgeCollection("charity");
      await purgeCollection("charity_donations");

      showToast("Database Purged", "All store catalog items, customers, and transactions removed successfully.", "success");
      logActivity("Purged database collections for a clean setup", "admin_action");
    } catch (err) {
      console.error("Error clearing database collections:", err);
      showToast("Purge Failed", "Could not complete clear operations.", "error");
    } finally {
      setSiteLoading(false);
      setLoadingMessage("");
    }
  };

  const handleDeleteAllCustomersAndActivities = async () => {
    setSiteLoading(true);
    setLoadingMessage("Deleting all customer accounts and logs securely...");
    try {
      const purgeCollection = async (colName: string) => {
        const querySnapshot = await getDocs(collection(db, colName));
        for (const docSnap of querySnapshot.docs) {
          await deleteDoc(doc(db, colName, docSnap.id));
        }
      };

      await purgeCollection("customers");
      await purgeCollection("activity_logs");

      // Small delay so that the user sees the beautiful loader working
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast("Accounts & Logs Purged", "All customer profiles and activity trackers have been removed from the live database.", "success");
      logActivity("Purged all customer accounts and their respective system logs", "admin_action");
    } catch (err) {
      console.error("Error deleting customers and activities:", err);
      showToast("Operation Failed", "Could not complete account deletion.", "error");
    } finally {
      setSiteLoading(false);
      setLoadingMessage("");
    }
  };

  // Form handlers
  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      showToast("Error", "Please fill in credentials.", "error");
      return;
    }

    setSiteLoading(true);
    setLoadingMessage("Securing customer session & synchronizing custom preferences...");
    try {
      setIsLoggedIn(true);
      setCurrentUser(loginUsername.trim());
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", loginUsername.trim());
      setCurrentUserAvatar(selectedAvatarUrl);
      localStorage.setItem("currentUserAvatar", selectedAvatarUrl);
      
      // CRM synchronization
      const existing = customers.find(c => (c.name || '').toLowerCase() === (loginUsername || '').trim().toLowerCase());
      const matchedEmail = loginEmail.trim() || (existing ? existing.email : `${(loginUsername || '').toLowerCase().replace(/\s+/g, '')}@example.com`);
      setCurrentUserEmail(matchedEmail);
      localStorage.setItem("currentUserEmail", matchedEmail);

      setShowLogin(false);
      showToast("Welcome to Ella's Store!", `Hello ${loginUsername}, enjoy your tailored experience.`, "success");

      addNotification(
        "Welcome to Ella's Store! 👗",
        `Hello ${loginUsername.trim()}, enjoy your personalized space. Explore our exclusive designer collections and master-tailored garments with express delivery!`,
        "info",
        matchedEmail
      );
      if (!existing) {
        const newC: Customer = {
          id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
          name: loginUsername.trim(),
          email: loginEmail.trim() || `${(loginUsername || '').toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: loginPhone.trim() || "024" + Math.floor(1000000 + Math.random() * 8999999),
          registrationDate: new Date().toISOString().split('T')[0],
          orders: 0,
          totalSpent: 0,
          signedUp: true,
          avatarUrl: selectedAvatarUrl,
          loyaltyPoints: 0
        };
        await setDoc(doc(db, "customers", String(newC.id)), newC);
      } else {
        const updatedC = {
          ...existing,
          email: loginEmail.trim() || existing.email,
          phone: loginPhone.trim() || existing.phone,
          signedUp: true,
          avatarUrl: selectedAvatarUrl || existing?.avatarUrl,
          loyaltyPoints: existing.loyaltyPoints || 0
        };
        await setDoc(doc(db, "customers", String(existing.id)), updatedC);
      }

      // Set greeting log
      setTimeout(() => {
        logActivity("Logged in to the customer storefront", "login");
      }, 100);
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setSiteLoading(false);
      setLoadingMessage("");
    }
  };

  const handleRedeemPoints = async (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer && customer.loyaltyPoints >= 10) {
      const updatedCustomer = { ...customer, loyaltyPoints: customer.loyaltyPoints - 10 };
      await setDoc(doc(db, "customers", String(customer.id)), updatedCustomer);
      logActivity(`Customer ${customer.name} redeemed 10 loyalty points for a discount.`, 'user_action');
    }
  };

  const handleAddOrder = async (order: any) => {
    setSiteLoading(true);
    setLoadingMessage("Authorizing mobile payment & processing your couture order...");
    try {
      // 1. Save order to Firestore
      await setDoc(doc(db, "orders", String(order.id)), order);

      // 2. Locate or create customer record
      const customerName = order.customer.trim();
      const existingCust = customers.find(c => (c.name || '').toLowerCase() === (customerName || '').toLowerCase());

      const pointsRedeemed = Number(order.pointsRedeemed || 0);
      const earnedPoints = Math.floor(order.total / 10); // 1 point for every ₵10 spent

      if (existingCust) {
        const currentPoints = existingCust.loyaltyPoints ?? 0;
        const newPoints = Math.max(0, currentPoints - pointsRedeemed + earnedPoints);

        const updatedCust = {
          ...existingCust,
          orders: (existingCust.orders || 0) + 1,
          totalSpent: (existingCust.totalSpent || 0) + order.total,
          loyaltyPoints: newPoints
        };
        await setDoc(doc(db, "customers", String(existingCust.id)), updatedCust);
      } else {
        const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
        const newCust: Customer = {
          id: newId,
          name: customerName,
          email: order.email || `${(customerName || '').toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: order.phone || "024" + Math.floor(1000000 + Math.random() * 8999999),
          registrationDate: new Date().toISOString().split('T')[0],
          orders: 1,
          totalSpent: order.total,
          signedUp: true,
          loyaltyPoints: earnedPoints
        };
        await setDoc(doc(db, "customers", String(newId)), newCust);
      }

      // 3. Dispatch system-wide and user notification for the new order
      const shortOrderId = String(order.id).substring(0, 8);
      const isGPay = order.isGooglePay || order.paymentMethod === "googlepay";
      const paymentModeStr = isGPay ? "Google Pay (Secure Card)" : "MTN Mobile Money";
      
      await addNotification(
        "Order Placed Successfully! 🎉",
        `Your invoice #${shortOrderId} for ₵${(order.total || 0).toFixed(2)} is authorized via ${paymentModeStr}. We are packaging your items for express delivery!`,
        "success",
        order.email || order.customerEmail || "all"
      );
    } catch (err) {
      console.error("Error saving order & syncing customer:", err);
    } finally {
      setSiteLoading(false);
      setLoadingMessage("");
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminAuthPassword === "MegB@1988") {
      setShowAdminAuthModal(false);
      setAdminAuthPassword("");
      setShowAdminConsole(true);
      showToast("Authorized", "Operational Control Panel activated.", "success");
      logActivity("Granted permissions & logged into admin dashboard", "admin_action");
    } else {
      showToast("Access Denied", "Incorrect administrative passcode.", "error");
      logActivity("Unauthorized attempt to bypass admin Operations Panel", "admin_action");
    }
  };

  const handleGoogleLogin = async () => {
    setSiteLoading(true);
    setLoadingMessage("Authenticating secure login with Google Accounts...");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        const photo = user.photoURL || "";
        setIsLoggedIn(true);
        setCurrentUser(user.displayName || user.email || "Google User");
        setCurrentUserEmail(user.email || "");
        setCurrentUserAvatar(photo);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", user.displayName || user.email || "Google User");
        localStorage.setItem("currentUserEmail", user.email || "");
        localStorage.setItem("currentUserAvatar", photo);
        setShowLogin(false);
        showToast("Signed In with Google", `Welcome back, ${user.displayName || 'user'}!`, "success");
        
        addNotification(
          "Signed In with Google! 🎉",
          `Welcome back to Ella's Store, ${user.displayName || 'user'}! Your customer session is authenticated securely with Google. Enjoy premium shopping!`,
          "success",
          user.email || ""
        );
        
        // CRM synchronization
        const userEmail = user.email || "";
        const userName = user.displayName || user.email || "Google User";
        const userPhone = user.phoneNumber || "024" + Math.floor(1000000 + Math.random() * 8999999);
        
        const existing = customers.find(c => (c.email && (c.email || '').toLowerCase() === (userEmail || '').toLowerCase()) || (c.name || '').toLowerCase() === (userName || '').toLowerCase());
        if (!existing) {
          const newC: Customer = {
            id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
            name: userName,
            email: userEmail,
            phone: userPhone,
            registrationDate: new Date().toISOString().split('T')[0],
            orders: 0,
            totalSpent: 0,
            signedUp: true,
            avatarUrl: photo,
            loyaltyPoints: 0
          };
          await setDoc(doc(db, "customers", String(newC.id)), newC);
        } else {
          const updatedC = {
            ...existing,
            email: userEmail,
            signedUp: true,
            avatarUrl: existing.avatarUrl || photo,
            loyaltyPoints: existing.loyaltyPoints || 0
          };
          await setDoc(doc(db, "customers", String(existing.id)), updatedC);
        }
        
        logActivity(`Logged in via Google (${userEmail})`, "login");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      showToast("Google Sign-In Failed", err.message || "Could not authenticate with Google.", "error");
    } finally {
      setSiteLoading(false);
      setLoadingMessage("");
    }
  };

  const handleGoogleAdminAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        const userEmail = (user.email || '').toLowerCase();
        if (AUTHORIZED_ADMIN_USERS.map(e => (e || '').toLowerCase()).includes(userEmail)) {
          setIsLoggedIn(true);
          setCurrentUser(user.displayName || user.email || "Google Admin");
          setCurrentUserEmail(user.email || "");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("currentUser", user.displayName || user.email || "Google Admin");
          localStorage.setItem("currentUserEmail", user.email || "");
          
          setShowAdminAuthModal(false);
          setShowAdminConsole(true);
          showToast("Authorized", `Welcome, Administrator ${user.displayName || ''}! Control Panel activated.`, "success");
          logActivity(`Verified & logged into admin dashboard via Google (${userEmail})`, "admin_action");
        } else {
          showToast("Access Denied", `The Google account ${userEmail} is not authorized for administrative operations.`, "error");
          logActivity(`Unauthorized Google login attempt to bypass admin gate (${userEmail})`, "admin_action");
        }
      }
    } catch (err: any) {
      console.error("Google admin login error:", err);
      showToast("Authentication Failed", err.message || "Google authentication failed.", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
      setCurrentUser("");
      setCurrentUserEmail("");
      setCurrentUserAvatar("");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("currentUserEmail");
      localStorage.removeItem("currentUserAvatar");
      showToast("Signed Out", "You have logged out successfully.", "info");
      logActivity("Logged out of the storefront", "user_action");
      setShowLogin(true);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Shopping cart handlers
  
  const handleNotifyMe = async (product: Product) => {
    if (!isLoggedIn) {
      showToast("Login Required", "Please log in to receive stock alerts.", "info");
      setShowLogin(true);
      return;
    }
    setSiteLoading(true);
    setLoadingMessage("Setting up stock alert...");
    try {
      const alertRef = doc(collection(db, "stock_alerts"));
      await setDoc(alertRef, {
        id: alertRef.id,
        productId: product.id,
        productName: product.name,
        customerEmail: currentUserEmail,
        customerName: currentUser,
        status: "pending",
        timestamp: new Date().toISOString()
      });
      showToast("Alert Set", `We will notify you when ${product.name} is back in stock!`, "success");
      logActivity(`Requested stock alert for ${product.name}`, "user_action");
    } catch (error) {
      console.error("Error setting stock alert:", error);
      showToast("Error", "Failed to set up alert. Please try again.", "error");
    } finally {
      setSiteLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
      }
    });
    showToast("Item Added", `${product.name} is in your bag.`, "success");
    logActivity(`Added catalog product to shopping bag: ${product.name}`, "cart_addition");
  };

  const clearCart = () => {
    setCart([]);
  };

  // Contact form inquiry submission
  const handleInquirySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inqName = formData.get("name") as string;
    const inqEmail = formData.get("email") as string;
    const inqPhone = formData.get("phone") as string;
    const inqService = formData.get("service") as string;
    const inqMessage = formData.get("message") as string;

    if (!inqName || !inqEmail || !inqMessage) {
      showToast("Required Fields", "Please complete name, email, and message.", "error");
      return;
    }

    const ticket: CustomerInquiry = {
      id: inquiries.length > 0 ? Math.max(...inquiries.map(i => i.id)) + 1 : 1,
      customerName: inqName,
      customerEmail: inqEmail,
      customerPhone: inqPhone,
      service: inqService,
      message: inqMessage,
      date: new Date().toISOString().split('T')[0],
      status: 'new'
    };

    setDoc(doc(db, "inquiries", String(ticket.id)), ticket).catch(err => {
      console.error("Error saving inquiry to Firestore:", err);
    });
    showToast("Inquiry Forwarded", "Thank you for reaching out! Ella will consult you shortly.", "success");
    logActivity(`Forwarded digital styling inquiry: "${inqMessage.substring(0, 30)}..."`, "inquiry");
    setInquiryMessage("");
    e.currentTarget.reset();
  };

  const storeFeatures = useMemo(() => [
    {
      name: "Charity Donations & Sponsorships",
      category: "Community Support",
      description: "Support child education, healthcare clinics, and community development initiatives in Accra and across Ghana.",
      tags: ["charity", "donation", "giving", "community", "support", "sponsorship", "help", "poor", "ngo"],
      icon: "💝",
      action: () => {
        setShowCharity(true);
        setShowSearchDialog(false);
      }
    },
    {
      name: "Couture Custom Sizing & Bespoke Clothing",
      category: "Tailoring & Services",
      description: "Submit custom sizing measurements, dress codes, fabric choices, and personalized styling instructions.",
      tags: ["couture", "tailor", "size", "custom", "fitting", "bridal", "measurement", "alteration", "dressmaker", "sewing"],
      icon: "📐",
      action: () => {
        const el = document.querySelector("textarea[placeholder*='sizing']") || document.getElementById("couture-customization-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setShowSearchDialog(false);
      }
    },
    {
      name: "Customer Reviews & Showroom Feedback",
      category: "Social Feedback",
      description: "Read verified feedback or submit your rating and review for Ella's bespoke alterations and catalog.",
      tags: ["review", "feedback", "rating", "star", "comment", "testimonial", "opinion"],
      icon: "⭐",
      action: () => {
        setShowReviewModal(true);
        setShowSearchDialog(false);
      }
    },
    {
      name: "Customer Order History & MoMo Tracking",
      category: "My Account",
      description: "Track live MoMo deliveries, view past orders, and print digital receipts / invoices.",
      tags: ["order", "history", "tracking", "invoice", "receipt", "purchase", "account", "delivery"],
      icon: "📦",
      action: () => {
        if (isLoggedIn) {
          setShowOrderHistory(true);
        } else {
          setShowLogin(true);
          showToast("Sign In Required", "Please sign in to view your order history.", "info");
        }
        setShowSearchDialog(false);
      }
    },
    {
      name: "Interactive AI Styling & Chat Companion",
      category: "AI Styling Assistant",
      description: "Chat with Hai-asi, our real-time Gemini AI, to get custom sizing recommendations, outfit pairings, and style suggestions.",
      tags: ["chat", "bot", "ai", "gemini", "stylist", "recommendation", "help", "support", "conversation"],
      icon: "🤖",
      action: () => {
        const el = document.getElementById("haiasi-chatbot-trigger") || document.querySelector("button[id*='chatbot']");
        if (el && el instanceof HTMLElement) {
          el.click();
        } else {
          showToast("AI Chat Activated", "Click the chatbot launcher in the bottom right of the screen to consult with Hai-asi.", "success");
        }
        setShowSearchDialog(false);
      }
    },
    {
      name: "Premium Ashaiman Showroom & Events Hub",
      category: "Exhibitions & trunk shows",
      description: "Read about our upcoming live product trunk shows, fashion design exhibitions, and cultural runway runway showcases.",
      tags: ["event", "showroom", "exhibition", "trunk show", "lapaz", "accra", "runway", "dates", "tickets"],
      icon: "🎟️",
      action: () => {
        const el = document.getElementById("events-section") || document.getElementById("events");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          showToast("Showroom Events", "Scroll down to see our exciting schedule of physical store exhibitions and popups.", "info");
        }
        setShowSearchDialog(false);
      }
    },
    {
      name: "Contact & Location details",
      category: "Showroom Info",
      description: "Get physical directions to our Ashaiman market showroom, operating hours, direct phone numbers, and WhatsApp channels.",
      tags: ["contact", "location", "showroom", "phone", "email", "hours", "address", "map", "whatsapp"],
      icon: "📍",
      action: () => {
        const el = document.querySelector("footer");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
        setShowSearchDialog(false);
      }
    }
  ], [isLoggedIn]);

  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) return storeFeatures;
    const q = (searchQuery || '').toLowerCase();
    return storeFeatures.filter(f => 
      (f.name || '').toLowerCase().includes(q) ||
      (f.category || '').toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q) ||
      (f.tags || []).some(t => (t || '').toLowerCase().includes(q))
    );
  }, [searchQuery, storeFeatures]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products.slice(0, 4); // show first 4 featured items
    const q = (searchQuery || '').toLowerCase();
    return products.filter(p => 
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  }, [searchQuery, products]);

  const ProfessionalLogo = () => (
    <div className="flex items-center gap-2.5 group">
      <div className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shadow-md border border-neutral-200 dark:border-slate-700 transition-transform duration-300 group-hover:scale-105">
        <img src={Logo} alt="Ella's Store Logo" className="w-full h-full object-cover" />
      </div>
      <div className="text-left">
        <span className="block font-sans text-sm font-black tracking-widest text-black dark:text-white uppercase group-hover:text-indigo-600 transition-colors">ELLA'S STORE</span>
        <span className="block text-[8px] font-mono tracking-wider text-neutral-500 dark:text-slate-400 uppercase">COUTURE & ALTERATIONS</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-950 text-black dark:text-white select-none antialiased flex flex-col font-sans">
      
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-4 rounded-3xl shadow-xl flex justify-between items-start border animate-in slide-in-from-right duration-250 ${
              t.type === 'success' ? 'bg-white dark:bg-slate-900 border-emerald-200 text-emerald-800' :
              t.type === 'error' ? 'bg-white dark:bg-slate-900 border-rose-200 text-rose-800' :
              'bg-white dark:bg-slate-900 border-indigo-200 text-indigo-800'
            }`}
          >
            <div className="space-y-1">
              <h5 className="font-bold text-xs tracking-wide uppercase">{t.title}</h5>
              <p className="text-xs leading-relaxed text-neutral-700 dark:text-slate-300">{t.message}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="text-neutral-400 hover:text-black dark:text-white transition-colors ml-3.5 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* CLIENT LOGIN MODAL OVERLAY (Initially loads if user is anonymous) */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleClientLogin} className="bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-800 space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div className="space-y-1">
              <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center mx-auto shadow-md border border-amber-500/30">
                <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-sans text-2xl text-slate-100 font-bold pt-3 tracking-tight">Welcome to Ella's</h2>
              <p className="text-xs text-slate-400">Ashaiman's premium fashion, dressmaking & styling showroom</p>
            </div>

            <div className="space-y-3.5 text-left">
              {/* AVATAR SELECTOR / CUSTOM UPLOADER */}
              <div className="space-y-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/40">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full border border-slate-700 bg-slate-950 overflow-hidden group flex items-center justify-center shrink-0 shadow-inner">
                    {selectedAvatarUrl ? (
                      <img src={selectedAvatarUrl} alt="Selected Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-slate-500" />
                    )}
                    <label className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
                      <Camera className="w-4 h-4 text-amber-500" />
                      <span className="text-[8px] text-white font-bold mt-0.5">Upload</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                canvas.width = 120;
                                canvas.height = 120;
                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, 120, 120);
                                  const resizedBase64 = canvas.toDataURL("image/jpeg", 0.85);
                                  setSelectedAvatarUrl(resizedBase64);
                                  showToast("Photo Uploaded", "Your custom profile image is ready!", "success");
                                }
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Couture Style Profile</h4>
                    <p className="text-[10px] text-slate-400">Select a luxurious preset or upload a custom photo as your digital avatar.</p>
                  </div>
                </div>
                
                {/* Presets Row */}
                <div className="flex gap-1.5 justify-between">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatarUrl(p.url)}
                      className={`w-8 h-8 rounded-full overflow-hidden border transition-all hover:scale-105 cursor-pointer ${
                        selectedAvatarUrl === p.url ? "border-amber-500 scale-110 ring-2 ring-amber-500/20" : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Full Name / Username</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 text-xs border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-950 text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Passcode / Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full px-4 py-3 text-xs border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-950 text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Email Address (Optional for New Users)</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  className="w-full px-4 py-3 text-xs border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-950 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Mobile Money Phone Number (Optional for New Users)</label>
                <input
                  type="tel"
                  value={loginPhone}
                  onChange={e => setLoginPhone(e.target.value)}
                  placeholder="e.g. 0244123456"
                  className="w-full px-4 py-3 text-xs border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-950 text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-900 dark:text-slate-100 py-3.5 rounded-xl text-xs font-black tracking-wider transition-all shadow-lg uppercase cursor-pointer"
            >
              Sign In
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Or Continue With</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white dark:bg-slate-900 hover:bg-neutral-100 dark:bg-slate-800 text-neutral-900 dark:text-slate-100 py-3.5 rounded-xl text-xs font-bold tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-neutral-200 dark:border-slate-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.26620003,9.76453141 C6.19875283,6.93863208 8.85444,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.52727273 16.4,6.54545455 L19.9636364,2.98181818 C17.8090909,1.07272727 15.0363636,0 12,0 C7.33005844,0 3.29801865,2.78893452 1.45541019,6.8123284 L5.26620003,9.76453141 Z"
                />
                <path
                  fill="#4285F4"
                  d="M23.4545455,12.2727273 C23.4545455,11.4545455 23.3818182,10.7272727 23.2545455,10 L12,10 L12,14.5454545 L18.4363636,14.5454545 C18.1636364,16 17.3181818,17.2727273 16.0363636,18.1272727 L19.9272727,21.1454545 C22.2,19.0545455 23.4545455,15.9545455 23.4545455,12.2727273 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.26620003,9.76453141 C4.98180479,10.628833 4.82103409,11.5540306 4.82103409,12.5181162 C4.82103409,13.4822019 4.98180479,14.4073995 5.26620003,15.2717011 L1.45541019,18.2239041 C0.530349257,16.4952549 0,14.5494285 0,12.5181162 C0,10.4868039 0.530349257,8.5409776 1.45541019,6.8123284 L5.26620003,9.76453141 Z"
                />
                <path
                  fill="#34A853"
                  d="M16.0363636,18.1272727 C14.9363636,18.8636364 13.5727273,19.2727273 12,19.2727273 C8.85444,19.2727273 6.19875283,17.2431862 5.26620003,14.4172869 L1.45541019,17.3694899 C3.29801865,21.3928837 7.33005844,24 12,24 C14.9909091,24 17.5181818,23.0181818 19.3454545,21.3454545 L16.0363636,18.1272727 Z"
                />
              </svg>
              Sign In with Google
            </button>
            
            <p className="text-[10px] text-slate-500">By proceeding, your CRM profile is registered for live tracking.</p>
          </form>
        </div>
      )}

      {/* ADMIN CONSOLE CODE AUTHENTICATION DIALOG */}
      <AnimatePresence>
        {showAdminAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <form onSubmit={handleAdminAuth} className="bg-slate-900 rounded-3xl p-6.5 max-w-sm w-full border border-slate-800 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 bg-indigo-950 text-indigo-400 border border-indigo-800/50 rounded-full flex items-center justify-center mx-auto text-xl">
              <Lock className="w-5 h-5" />
            </div>
            
            <div className="space-y-1">
              <h4 className="font-sans text-lg font-bold text-slate-100">Administrative Gate</h4>
              <p className="text-xs text-slate-400">Provide password to open Ella's dashboard operations.</p>
            </div>

            <input
              type="password"
              value={adminAuthPassword}
              onChange={e => setAdminAuthPassword(e.target.value)}
              placeholder="Enter passcode"
              className="w-full px-4 py-3 text-sm text-center border border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 font-mono tracking-widest bg-slate-950 text-slate-100"
              required={!isLoggedIn}
            />

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-slate-500 text-[9px] uppercase tracking-wider font-semibold">Or Verify with</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAdminAuth}
              className="w-full bg-white dark:bg-slate-900 hover:bg-neutral-100 dark:bg-slate-800 text-neutral-900 dark:text-slate-100 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-neutral-200 dark:border-slate-700"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.26620003,9.76453141 C6.19875283,6.93863208 8.85444,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.52727273 16.4,6.54545455 L19.9636364,2.98181818 C17.8090909,1.07272727 15.0363636,0 12,0 C7.33005844,0 3.29801865,2.78893452 1.45541019,6.8123284 L5.26620003,9.76453141 Z"
                />
                <path
                  fill="#4285F4"
                  d="M23.4545455,12.2727273 C23.4545455,11.4545455 23.3818182,10.7272727 23.2545455,10 L12,10 L12,14.5454545 L18.4363636,14.5454545 C18.1636364,16 17.3181818,17.2727273 16.0363636,18.1272727 L19.9272727,21.1454545 C22.2,19.0545455 23.4545455,15.9545455 23.4545455,12.2727273 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.26620003,9.76453141 C4.98180479,10.628833 4.82103409,11.5540306 4.82103409,12.5181162 C4.82103409,13.4822019 4.98180479,14.4073995 5.26620003,15.2717011 L1.45541019,18.2239041 C0.530349257,16.4952549 0,14.5494285 0,12.5181162 C0,10.4868039 0.530349257,8.5409776 1.45541019,6.8123284 L5.26620003,9.76453141 Z"
                />
                <path
                  fill="#34A853"
                  d="M16.0363636,18.1272727 C14.9363636,18.8636364 13.5727273,19.2727273 12,19.2727273 C8.85444,19.2727273 6.19875283,17.2431862 5.26620003,14.4172869 L1.45541019,17.3694899 C3.29801865,21.3928837 7.33005844,24 12,24 C14.9909091,24 17.5181818,23.0181818 19.3454545,21.3454545 L16.0363636,18.1272727 Z"
                />
              </svg>
              Verify Admin with Google
            </button>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white hover:bg-indigo-500 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-indigo-600/10 cursor-pointer"
              >
                Access Terminal
              </button>
              <button
                type="button"
                onClick={() => setShowAdminAuthModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>

    {/* HEADER NAV */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-neutral-100 dark:border-slate-800 z-30 transition-all duration-300 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="hidden md:block">
              <ProfessionalLogo />
            </div>
            <div className="flex-1 max-w-lg flex items-center gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Search products & store features..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowSearchDialog(true);
                      logActivity(`Searched for "${searchQuery}" in search dialog`, "user_action");
                    }
                  }}
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-neutral-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                />
                <Search className="absolute right-3.5 top-2.5 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />

                {/* Live Suggestions Dropdown */}
                {searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-neutral-150 dark:border-slate-800 z-50 max-h-80 overflow-y-auto divide-y divide-neutral-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Products suggestions */}
                    {filteredProducts.length > 0 && (
                      <div className="p-3 text-left">
                        <div className="text-[9px] font-mono font-bold tracking-wider text-pink-600 uppercase mb-2 px-2">
                          Matching Showroom Products ({filteredProducts.length})
                        </div>
                        <div className="space-y-1">
                          {filteredProducts.map((prod) => (
                            <div
                              key={prod.id}
                              onClick={() => {
                                handleViewDetail(prod, 'classic');
                                setSearchQuery(""); // Close dropdown cleanly on select
                                logActivity(`Clicked matching suggestion "${prod.name}" in dropdown`, "user_action");
                              }}
                              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-50 dark:bg-slate-950 transition-colors cursor-pointer"
                            >
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-8 h-8 rounded-lg object-cover bg-neutral-100 dark:bg-slate-800"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-bold text-neutral-800 dark:text-slate-200 truncate leading-tight uppercase">
                                  {prod.name}
                                </h4>
                                <span className="text-[9px] font-mono text-neutral-400">
                                  {prod.category} • ₵{(prod.price || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Features shortcuts */}
                    {filteredFeatures.length > 0 && (
                      <div className="p-3 text-left">
                        <div className="text-[9px] font-mono font-bold tracking-wider text-indigo-600 uppercase mb-2 px-2">
                          Feature Shortcuts ({filteredFeatures.length})
                        </div>
                        <div className="space-y-1">
                          {filteredFeatures.slice(0, 4).map((feat) => (
                            <div
                              key={feat.name}
                              onClick={() => {
                                feat.action();
                                setSearchQuery(""); // Close dropdown cleanly on select
                                logActivity(`Launched feature shortcut "${feat.name}" from dropdown`, "user_action");
                              }}
                              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-indigo-50/50 transition-colors cursor-pointer"
                            >
                              <span className="text-sm shrink-0">{feat.icon}</span>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-bold text-neutral-800 dark:text-slate-200 truncate leading-none uppercase">
                                  {feat.name}
                                </h4>
                                <p className="text-[9px] text-neutral-500 dark:text-slate-400 truncate mt-0.5 font-medium leading-none">
                                  {feat.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {filteredProducts.length === 0 && filteredFeatures.length === 0 && (
                      <div className="p-4 text-center text-[11px] text-neutral-400 font-medium">
                        No matches found. Try "momo", "review", or "charity".
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowSearchDialog(true);
                  logActivity(`Clicked search button for "${searchQuery}"`, "user_action");
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
            {isLoggedIn && (
              <div 
                onClick={() => {
                  setShowOrderHistory(true);
                  logActivity("Opened customer order history panel via profile chip", "user_action");
                }}
                className="flex items-center gap-2 text-xs text-neutral-700 dark:text-slate-300 font-medium bg-neutral-100 dark:bg-slate-800 pl-1.5 pr-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-slate-700 shrink-0 cursor-pointer hover:bg-neutral-200/80 transition-colors"
                title="View Style Profile & Dashboard"
              >
                {currentUserAvatar ? (
                  <img src={currentUserAvatar} alt={currentUser} className="w-5.5 h-5.5 rounded-full object-cover border border-indigo-200" />
                ) : (
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                )}
                <span className="max-w-[120px] truncate">{currentUser}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <a href="#" className="font-sans text-xl tracking-tight text-neutral-900 dark:text-slate-100 transition-colors font-bold">
                <span className="text-indigo-600">Ella's</span> Store
              </a>
            </div>

          <div className="hidden lg:flex items-center gap-6 text-xs font-medium tracking-wide uppercase text-neutral-600 dark:text-slate-400">
            <a href="#collections" className="hover:text-indigo-600 transition-colors">Collections</a>
            <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
            <a href="#process" className="hover:text-indigo-600 transition-colors">Services</a>
            <a href="#events" className="hover:text-indigo-600 transition-colors">Events</a>
            <a href="#shop" className="hover:text-indigo-600 transition-colors">Shop</a>
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  setShowOrderHistory(true);
                  logActivity("Opened customer order history panel", "user_action");
                } else {
                  setShowLogin(true);
                  showToast("Sign In Required", "Please sign in to view your personalized chart history & payments.", "info");
                }
              }}
              className="hover:text-indigo-600 transition-colors uppercase tracking-wide text-xs font-medium cursor-pointer flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              History
            </button>
            <button 
              onClick={() => setShowMedia(true)}
              className="text-neutral-900 dark:text-slate-100 hover:text-indigo-600 transition-colors uppercase tracking-wide text-xs font-medium cursor-pointer"
            >
              Gallery
            </button>
            <button 
              onClick={() => setShowCharity(true)}
              className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-bold text-xs hover:bg-emerald-100 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              Charity
            </button>
            <button 
              onClick={() => setShowConference(true)}
              className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-bold text-xs hover:bg-indigo-100 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>Conference</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="text-neutral-500 dark:text-slate-400 hover:text-rose-600 text-[10px] font-bold tracking-widest uppercase cursor-pointer"
                >
                  Logout
                </button>
            )}
            
                        <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-9 h-9 rounded-full border border-neutral-200 dark:border-slate-700 flex items-center justify-center text-neutral-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setShowNotifications(true);
                logActivity("Opened customer notifications panel", "user_action");
              }}
              className="w-9 h-9 rounded-full border border-neutral-200 dark:border-slate-700 flex items-center justify-center text-neutral-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (cart.length === 0) {
                  showToast("Empty Bag", "Your shopping bag is empty.", "info");
                  return;
                }
                setShowCheckout(true);
              }}
              className="relative w-9 h-9 rounded-full border border-neutral-200 dark:border-slate-700 flex items-center justify-center text-neutral-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center text-[9px]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setShowMobileMenu(!showMobileMenu);
                logActivity("Opened customer navigation menu", "user_action");
              }}
              className="lg:hidden w-9 h-9 rounded-full border border-neutral-200 dark:border-slate-700 flex items-center justify-center text-neutral-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* MOBILE MENU OVERLAY */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-45 flex flex-col justify-center items-center p-6 lg:hidden animate-in fade-in duration-300">
          <button 
            onClick={() => setShowMobileMenu(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-neutral-100 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 flex items-center justify-center text-neutral-800 dark:text-slate-200 hover:text-black dark:text-white cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4 text-center text-xl font-bold tracking-wider uppercase text-neutral-800 dark:text-slate-200 w-full max-w-sm"
          >
            <motion.a 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              href="#collections" 
              onClick={() => setShowMobileMenu(false)}
              className="group flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-neutral-50 dark:bg-slate-950 transition-all text-neutral-900 dark:text-slate-100"
            >
              <span className="text-lg font-medium tracking-tight">Collections</span>
              <span className="text-neutral-300 group-hover:text-indigo-600 transition-colors">→</span>
            </motion.a>
            <motion.a 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              href="#about" 
              onClick={() => setShowMobileMenu(false)}
              className="group flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-neutral-50 dark:bg-slate-950 transition-all text-neutral-900 dark:text-slate-100"
            >
              <span className="text-lg font-medium tracking-tight">About</span>
              <span className="text-neutral-300 group-hover:text-indigo-600 transition-colors">→</span>
            </motion.a>
            <motion.a 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              href="#process" 
              onClick={() => setShowMobileMenu(false)}
              className="group flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-neutral-50 dark:bg-slate-950 transition-all text-neutral-900 dark:text-slate-100"
            >
              <span className="text-lg font-medium tracking-tight">Services</span>
              <span className="text-neutral-300 group-hover:text-indigo-600 transition-colors">→</span>
            </motion.a>
            <motion.a 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              href="#events" 
              onClick={() => setShowMobileMenu(false)}
              className="group flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-neutral-50 dark:bg-slate-950 transition-all text-neutral-900 dark:text-slate-100"
            >
              <span className="text-lg font-medium tracking-tight">Events</span>
              <span className="text-neutral-300 group-hover:text-indigo-600 transition-colors">→</span>
            </motion.a>
            <motion.a 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              href="#shop" 
              onClick={() => setShowMobileMenu(false)}
              className="group flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-neutral-50 dark:bg-slate-950 transition-all text-neutral-900 dark:text-slate-100"
            >
              <span className="text-lg font-medium tracking-tight">Shop</span>
              <span className="text-neutral-300 group-hover:text-indigo-600 transition-colors">→</span>
            </motion.a>
            <button 
              onClick={() => {
                setShowMobileMenu(false);
                if (isLoggedIn) {
                  setShowOrderHistory(true);
                  logActivity("Opened customer order history panel", "user_action");
                } else {
                  setShowLogin(true);
                  showToast("Sign In Required", "Please sign in to view your personalized chart history & payments.", "info");
                }
              }}
              className="group flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-neutral-50 dark:bg-slate-950 transition-all text-neutral-900 dark:text-slate-100 w-full"
              id="mobile-chart-history-btn"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span className="text-lg font-medium tracking-tight">Chart History</span>
              </div>
              <span className="text-neutral-300 group-hover:text-indigo-600 transition-colors">→</span>
            </button>
            <button 
              onClick={() => {
                setShowMobileMenu(false);
                setShowCharity(true);
              }}
              className="group flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-emerald-50 transition-all text-emerald-900 w-full"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-emerald-500" />
                <span className="text-lg font-medium tracking-tight">Charity Donations</span>
              </div>
              <span className="text-emerald-300 group-hover:text-emerald-600 transition-colors">→</span>
            </button>
            <button 
              onClick={() => {
                setShowMobileMenu(false);
                setShowConference(true);
              }}
              className="group flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-indigo-50 transition-all text-indigo-900 w-full"
            >
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span className="text-lg font-medium tracking-tight">Couture Conference</span>
              </div>
              <span className="text-indigo-300 group-hover:text-indigo-600 transition-colors">→</span>
            </button>
            <button 
              onClick={() => {
                setShowMobileMenu(false);
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-neutral-50 dark:bg-slate-950 transition-all text-neutral-900 dark:text-slate-100 w-full"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-neutral-500 dark:text-slate-400" />
                <span className="text-lg font-medium tracking-tight">Contact</span>
              </div>
              <span className="text-neutral-300 group-hover:text-indigo-600 transition-colors">→</span>
            </button>
            <button 
              onClick={() => {
                setShowMobileMenu(false);
                setShowReviewModal(true);
                logActivity("Opened showroom review modal", "user_action");
              }}
              className="group flex items-center justify-between py-4 px-6 rounded-2xl hover:bg-neutral-50 dark:bg-slate-950 transition-all text-neutral-900 dark:text-slate-100 w-full"
              id="mobile-reviews-btn"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-lg font-medium tracking-tight">Rate Site</span>
              </div>
              <span className="text-neutral-300 group-hover:text-indigo-600 transition-colors">→</span>
            </button>
            <button 
              onClick={() => {
                setShowMobileMenu(false);
                setShowMedia(true);
              }}
              className="mt-4 bg-indigo-600 text-white px-6 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-500 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              Media Gallery
            </button>
          </motion.div>
        </div>
      )}

      {/* HERO CANVAS WITH ANIMATED BACKGROUND AND PROFESSIONAL LOGO */}
      <section className="h-[85vh] flex items-center justify-center relative overflow-hidden text-black dark:text-white bg-neutral-50 dark:bg-slate-950 border-b border-neutral-100 dark:border-slate-800">
        
        {/* Underlay: Animated Zoom/Scale Hero Background Image */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.72), rgba(255,255,255,0.95)), url(${homepageSettings.heroBackground})`,
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Ambient Animated Blurred Blobs Layer (Fashion/Luxury Mood) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 mix-blend-multiply">
          <motion.div
            className="absolute w-[350px] h-[350px] rounded-full bg-indigo-300/40 blur-[80px]"
            animate={{
              x: [-40, 60, -40],
              y: [-20, 40, -20],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ top: "10%", left: "15%" }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full bg-amber-200/35 blur-[80px]"
            animate={{
              x: [50, -30, 50],
              y: [60, -20, 60],
              scale: [1.1, 0.9, 1.1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ bottom: "15%", right: "20%" }}
          />
          <motion.div
            className="absolute w-[280px] h-[280px] rounded-full bg-rose-200/30 blur-[70px]"
            animate={{
              x: [20, -40, 20],
              y: [-50, 30, -50],
              scale: [0.95, 1.1, 0.95],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ top: "40%", right: "10%" }}
          />
        </div>

        {/* Fine Couture Wave Lines (Animated SVG Thread Trails) */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M -100 200 C 300 100, 600 500, 1500 200"
              fill="none"
              stroke="url(#indigoGoldGradient)"
              strokeWidth="2"
              strokeDasharray="8 4"
              animate={{
                strokeDashoffset: [0, -40],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.path
              d="M -100 350 C 400 500, 700 100, 1600 450"
              fill="none"
              stroke="url(#goldIndigoGradient)"
              strokeWidth="1.5"
              animate={{
                d: [
                  "M -100 350 C 400 500, 700 100, 1600 450",
                  "M -100 380 C 420 440, 680 160, 1600 420",
                  "M -100 350 C 400 500, 700 100, 1600 450"
                ]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <defs>
              <linearGradient id="indigoGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
              <linearGradient id="goldIndigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Delicate Golden Sparkles Floating Gently (Couture Magic Dust) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => {
            const randomSize = Math.random() * 4 + 2;
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 8;
            const randomDuration = Math.random() * 10 + 8;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full bg-amber-400/55"
                style={{
                  width: randomSize,
                  height: randomSize,
                  left: `${randomX}%`,
                  bottom: "-5%",
                }}
                animate={{
                  y: ["0vh", "-100vh"],
                  x: ["0px", `${(Math.random() - 0.5) * 60}px`],
                  opacity: [0, 0.7, 0.7, 0],
                }}
                transition={{
                  duration: randomDuration,
                  repeat: Infinity,
                  delay: randomDelay,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

        {/* Foreground Content Card with Elevated Logo */}
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto space-y-6">
          
          {/* Elevated Professional Logo Badge */}
          <motion.div 
            className="inline-flex flex-col items-center p-6 rounded-[2.5rem] bg-white/60 backdrop-blur-md border border-white/80 shadow-2xl space-y-3 max-w-sm mx-auto relative group overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
          >
            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            
            {/* Logo Circular Frame with Gold Ring */}
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center p-1 bg-gradient-to-tr from-amber-400 via-pink-400 to-indigo-500 shadow-xl">
              <div className="absolute inset-0.5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                <img 
                  src={Logo} 
                  alt="Ella's Store Logo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full transform transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
              
              {/* Rotating Dashed Outer Ring (Tape Measure Style) */}
              <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="6 3" strokeOpacity="0.75" />
              </svg>
            </div>

            {/* Typography */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <Ribbon className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                <h2 className="font-sans text-lg font-black tracking-[0.2em] text-neutral-900 dark:text-slate-100 uppercase flex items-center gap-1">
                  ELLA'S <span>🎗</span> STORE
                </h2>
                <Ribbon className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
              </div>
              <p className="text-[9px] font-mono tracking-widest text-indigo-600 font-bold uppercase">COUTURE & LUXURY ALTERATIONS</p>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[8px] font-sans font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">Premium Ashaiman Showroom</span>
              </div>
            </div>
          </motion.div>

          {/* Slogan & Banner Info */}
          <div className="space-y-4 pt-2">
            <span className="bg-indigo-50 text-indigo-600 text-[10px] px-4 py-2 rounded-full font-black tracking-widest font-mono uppercase shadow-sm border border-indigo-100">
              Operational Showroom Live
            </span>
            <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl tracking-tight uppercase font-black text-black dark:text-white leading-none drop-shadow-sm">
              {homepageSettings.heroTitle}
            </h1>
            <p className="text-xs md:text-sm font-sans tracking-wide text-neutral-800 dark:text-slate-200 max-w-lg mx-auto leading-relaxed">
              {homepageSettings.heroDescription}
            </p>
          </div>

          <div className="pt-4">
            <a
              href="#shop"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center gap-2 group"
            >
              Discover Collection
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* COLLECTIONS GRID */}
      <section id="collections" className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-sans text-3xl md:text-4xl text-black dark:text-white font-bold tracking-tight">Our Premium Collections</h2>
          <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase font-bold">Systemized Elegance & Trends</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Evening Couture", desc: "Bespoke traditional laces, evening dresses and coordinates", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600", gridClass: "md:col-span-1" },
            { title: "Day Dress Comfort", desc: "Light Ankara wax prints and tailored daily skater wears", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600", gridClass: "md:col-span-1" },
            { title: "Occasion Ceremony", desc: "Bespoke kente dress fittings for special wedding guests", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600", gridClass: "md:col-span-1" },
          ].map((col, idx) => (
            <div key={idx} className={`${col.gridClass} group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-sm border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer`}>
              <img src={col.img} alt={col.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent flex flex-col justify-end p-6 space-y-1.5 transition-opacity">
                <h3 className="font-sans text-xl text-black dark:text-white font-bold">{col.title}</h3>
                <p className="text-neutral-800 dark:text-slate-200 text-xs leading-relaxed font-semibold">{col.desc}</p>
                <a href="#shop" className="text-xs text-indigo-600 font-bold uppercase tracking-widest pt-2 flex items-center gap-1 group-hover:text-indigo-500">
                  Shop styles &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT TIMELINE */}
      <section id="about" className="py-20 px-6 bg-neutral-100/65 border-t border-b border-neutral-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-sans text-3xl md:text-4xl text-black dark:text-white font-bold tracking-tight">Bespoke Heritage Since 2021</h2>
            <p className="text-neutral-700 dark:text-slate-300 text-sm leading-relaxed">
              Located in the heart of Ashaiman, Accra, Ella's Store has emerged as a beloved showroom for traditional Ghanaian dressmaking and retail styles. Over five years of tailoring expertise, we deliver stunning couture collections blending vibrant Ankara prints and delicate laces.
            </p>
            <blockquote className="border-l-4 border-indigo-600 bg-white dark:bg-slate-900 p-6 rounded-r-3xl italic font-sans text-neutral-800 dark:text-slate-200 text-base leading-relaxed border border-neutral-200 dark:border-slate-700 shadow-sm">
              "We believe fashion is a profound language of self-expression. Every design at Ella's is engineered to highlight your heritage, silhouette, and unique confidence."
            </blockquote>
            <p className="font-mono text-xs font-bold text-indigo-600 uppercase tracking-widest">- Ella, Showroom Tailoring Director</p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-sm border-4 border-white aspect-square max-h-[500px] bg-neutral-200">
            <img src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800" alt="Showroom tailors" className="w-full h-full object-cover opacity-95" />
          </div>
        </div>
      </section>

      {/* SERVICE DESK */}
      <section id="process" className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-sans text-3xl md:text-4xl text-black dark:text-white font-bold tracking-tight">Professional Showroom Services</h2>
          <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase font-bold">Bento Tailoring Desk</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Styling Consultation", desc: "Expert, localized fashion consults to choose fabrics, coordinates, and silhouettes." },
            { step: "02", title: "Custom Tailoring", desc: "Precise custom dressmaking with fittings mapped out at our showroom." },
            { step: "03", title: "Alterations & Hemming", desc: "Premium suit/dress alterations, tapers, and tapering with professional finishes." },
            { step: "04", title: "Accra Logistics Delivery", desc: "Express delivery routed straight to your doorstep throughout greater Accra." },
          ].map((srv, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-neutral-200 dark:border-slate-700 flex flex-col justify-between hover:border-indigo-500/40 transition-colors shadow-sm">
              <span className="font-mono text-3xl font-extrabold text-indigo-600 mb-4">{srv.step}</span>
              <div className="space-y-1.5">
                <h4 className="font-sans text-base text-black dark:text-white font-bold">{srv.title}</h4>
                <p className="text-neutral-600 dark:text-slate-400 text-xs leading-relaxed font-medium">{srv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section id="events" className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-sans text-3xl md:text-4xl text-black dark:text-white font-bold tracking-tight">Showroom Events & Launches</h2>
          <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase font-bold">Vibrant runway presentations, design exhibitions & Accra pop-ups</p>
        </div>

        {events.length === 0 ? (
          <div className="bg-neutral-50 dark:bg-slate-950 border border-neutral-200/60 rounded-3xl p-12 text-center max-w-xl mx-auto">
            <span className="text-4xl">🗓️</span>
            <h3 className="font-sans text-lg font-bold text-black dark:text-white mt-4">No Active Schedules</h3>
            <p className="text-neutral-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
              We are currently designing our next seasonal collection lines in the Ashaiman showroom. Please join our SMS updates for future events!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((evt) => (
              <motion.div
                key={evt.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-900 border border-neutral-250/60 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 bg-neutral-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={evt.imageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"}
                      alt={evt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase border shadow ${
                        evt.status === 'upcoming' ? 'bg-emerald-100 text-emerald-800 border-emerald-200/50' :
                        evt.status === 'ongoing' ? 'bg-indigo-600 text-white border-indigo-500/30 animate-pulse' :
                        'bg-neutral-200 text-neutral-600 dark:text-slate-400 border-neutral-300'
                      }`}>
                        {evt.status === 'upcoming' ? 'Upcoming' : evt.status === 'ongoing' ? 'Ongoing' : 'Past'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-sans text-lg text-black dark:text-white font-extrabold tracking-tight leading-snug">{evt.title}</h3>
                    <p className="text-neutral-600 dark:text-slate-400 text-xs leading-relaxed font-medium line-clamp-3">{evt.description}</p>
                    
                    <div className="space-y-2 pt-3 text-xs text-neutral-500 dark:text-slate-400 font-bold border-t border-neutral-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600">📅</span>
                        <span>{evt.date} {evt.time ? `at ${evt.time}` : ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600">📍</span>
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-neutral-50/50 border-t border-neutral-100 dark:border-slate-800">
                  {evt.status === 'past' ? (
                    <button
                      disabled
                      className="w-full bg-neutral-200 text-neutral-400 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-not-allowed"
                    >
                      Archived Event
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        showToast("RSVP Confirmed!", `Thank you! You are successfully registered for "${evt.title}".`, "success");
                        logActivity(`User RSVP'd to showroom event: "${evt.title}"`, "user_action");
                        if (isLoggedIn && currentUserEmail) {
                          addNotification(
                            "Event RSVP Registered!",
                            `We've saved your spot for "${evt.title}" on ${evt.date}. We look forward to seeing you at ${evt.location}!`,
                            "success",
                            currentUserEmail
                          );
                        }
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Attend & Get RSVP Code</span>
                      <span className="text-amber-300">✦</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* SHOP SECTION */}
      <section id="shop" className="py-20 px-6 bg-neutral-100/40 border-t border-b border-neutral-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto w-full space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-sans text-3xl md:text-4xl text-black dark:text-white font-bold tracking-tight">Boutique Catalog Shelf</h2>
            <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase font-bold">Select & Checkout securely with MoMo or Google Pay</p>
          </div>

          {/* Category Navigation Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2.5 max-w-4xl mx-auto border-b border-neutral-200 dark:border-slate-700 pb-8">
            {[
              { id: 'all', label: 'All Listings' },
              { id: 'dresses', label: 'Evening Couture' },
              { id: 'bags', label: 'Luxury Bags' },
              { id: 'shoes', label: 'Shoes' },
              { id: 'accessories', label: 'Accents' },
              { id: 'food', label: '🍲 Ella\'s Kitchen (Food)' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 border cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                    : 'bg-white dark:bg-slate-900 text-neutral-600 dark:text-slate-400 border-neutral-200 dark:border-slate-700 hover:border-neutral-300 hover:text-neutral-900 dark:text-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Dynamic grid wrapping with empty states */}
          {products.filter(p => 
            (activeCategory === 'all' || p.category === activeCategory) &&
            ((p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || (p.category || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
          ).length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-neutral-200 dark:border-slate-700 shadow-sm max-w-md mx-auto space-y-3 animate-in fade-in">
              <span className="text-4xl">🍽️</span>
              <h4 className="font-sans text-base font-bold text-neutral-800 dark:text-slate-200">No Products Found</h4>
              <p className="text-xs text-neutral-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Try a different search term or category.
              </p>
            </div>
          ) : (
            <motion.div 
              key={activeCategory + "-" + searchQuery}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.12,
                    delayChildren: 0.05
                  }
                }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {products
                .filter(p => 
                  (activeCategory === 'all' || p.category === activeCategory) &&
                  ((p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || (p.category || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
                )
                .map(prod => (
                  <motion.div
                    key={prod.id}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      show: { 
                        opacity: 1, 
                        y: 0, 
                        transition: { 
                          type: "spring", 
                          stiffness: 120, 
                          damping: 18 
                        } 
                      }
                    }}
                    className="h-full"
                  >
                    <ProductCard
                      onNotifyMe={handleNotifyMe}
                      product={prod}
                      allProducts={products}
                      onAddToCart={addToCart}
                      isLoggedIn={isLoggedIn}
                      onShowLogin={() => setShowLogin(true)}
                      layout={homepageSettings.productLayout as any}
                      onViewDetail={handleViewDetail}
                    />
                  </motion.div>
                ))}
            </motion.div>
          )}

          {/* Proceed button */}
          <div className="pt-8 text-center">
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  setShowLogin(true);
                  return;
                }
                if (cart.length === 0) {
                  showToast("Empty Bag", "Add catalog items to proceed.", "info");
                  return;
                }
                setShowCheckout(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2.5 mx-auto cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 animate-bounce" />
              Proceed to checkout
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT & TICKETING */}
      <section id="contact" className="py-20 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h2 className="font-sans text-3xl md:text-4xl text-black dark:text-white font-bold tracking-tight">Consult Ella Directly</h2>
            <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase mt-1 font-bold">Showroom phone and scheduling</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-neutral-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <strong className="block text-black dark:text-white">Showroom Address</strong>
                <span className="text-neutral-600 dark:text-slate-400 font-medium">Ashaiman Showroom, Accra, Ghana (Near Market)</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-neutral-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <strong className="block text-black dark:text-white">Direct Line</strong>
                <span className="text-neutral-600 dark:text-slate-400 font-mono font-medium">0276747037 / +233 27 674 7037</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-neutral-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <strong className="block text-black dark:text-white">Showroom Hours</strong>
                <span className="text-neutral-600 dark:text-slate-400 font-medium">Mon - Sat: 8:00 AM - 8:00 PM &bull; Sun: Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Submission */}
        <form onSubmit={handleInquirySubmit} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-neutral-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-sans text-lg font-bold text-black dark:text-white">Forward Consultation Form</h3>
          
          <div className="space-y-1.5">
            <input
              type="text"
              name="name"
              placeholder="Your Full Name"
              className="w-full px-4 py-3 border border-neutral-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 dark:bg-slate-950 text-black dark:text-white placeholder-neutral-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <input
              type="email"
              name="email"
              placeholder="Your Email Address"
              className="w-full px-4 py-3 border border-neutral-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 dark:bg-slate-950 text-black dark:text-white placeholder-neutral-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <input
              type="tel"
              name="phone"
              placeholder="MTN / Mobile Contact Number"
              className="w-full px-4 py-3 border border-neutral-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 dark:bg-slate-950 text-black dark:text-white font-mono placeholder-neutral-400"
            />
          </div>

          <div className="space-y-1.5">
            <select
              name="service"
              className="w-full px-4 py-3 border border-neutral-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 dark:bg-slate-950 text-black dark:text-white"
              required
            >
              <option value="fashion">Traditional styling & fittings</option>
              <option value="alterations">Alterations & tailoring taper</option>
              <option value="delivery">Custom logistics route</option>
              <option value="other">Bespoke catalog query</option>
            </select>
          </div>

          <div className="space-y-1.5 relative">
            <textarea
              name="message"
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              placeholder="Draft your sizing details, customization requirements, or dress codes..."
              rows={4}
              className="w-full pl-4 pr-12 py-3 border border-neutral-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 dark:bg-slate-950 text-black dark:text-white placeholder-neutral-400"
              required
            />
            <button
              type="button"
              onClick={startSpeechRecognition}
              title="Dictate styling inquiry using voice"
              className={`absolute right-3.5 bottom-3.5 p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                isListening 
                  ? "bg-rose-500 border-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20" 
                  : "bg-white dark:bg-slate-900 border-neutral-200 dark:border-slate-700 text-neutral-400 hover:text-indigo-650 hover:border-indigo-200 hover:shadow-md"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold tracking-wider transition-colors shadow-md cursor-pointer"
          >
            Forward Ticket
          </button>
        </form>
      </section>

      {/* IN-PAGE CUSTOMER NOTIFICATIONS BLOCK */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-neutral-100 dark:border-slate-800" id="in-page-notifications-hub">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-black uppercase tracking-wider text-black dark:text-white">
                Personalized Notifications Hub
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Stored site updates and administrative broadcasts
              </p>
            </div>
          </div>
          {unreadNotificationsCount > 0 && (
            <span className="text-[9px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-mono font-black animate-pulse uppercase">
              {unreadNotificationsCount} Unread
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-neutral-200/80 rounded-2xl p-5 shadow-sm">
          {notifications.filter(n => {
            if (!n.customerEmail || n.customerEmail === "all") return true;
            if (isLoggedIn && currentUserEmail && (n.customerEmail || '').toLowerCase() === (currentUserEmail || '').toLowerCase()) return true;
            return false;
          }).length === 0 ? (
            <div className="text-center py-6 text-neutral-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-neutral-500 dark:text-slate-400">Your notification log is currently empty.</p>
              <p className="text-[10px] text-neutral-400 mt-1">Updates on orders or promotions will appear directly in this hub.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {notifications.filter(n => {
                if (!n.customerEmail || n.customerEmail === "all") return true;
                if (isLoggedIn && currentUserEmail && (n.customerEmail || '').toLowerCase() === (currentUserEmail || '').toLowerCase()) return true;
                return false;
              }).map(n => (
                <div 
                  key={n.id} 
                  className={`p-3.5 rounded-xl border flex justify-between items-start gap-4 transition-all hover:bg-neutral-50/50 ${
                    n.type === 'success' ? 'bg-emerald-50/20 border-emerald-100' :
                    n.type === 'warning' ? 'bg-amber-50/20 border-amber-100' :
                    n.type === 'promo' ? 'bg-purple-50/20 border-purple-100' :
                    'bg-blue-50/20 border-blue-100'
                  }`}
                >
                  <div className="flex gap-2.5 items-start">
                    <span className="mt-0.5 text-xs">
                      {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'promo' ? '🎁' : 'ℹ️'}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{n.title}</h4>
                      <p className="text-xs text-neutral-600 dark:text-slate-400 font-sans leading-relaxed font-medium">{n.message}</p>
                      <span className="text-[8px] text-neutral-400 font-mono font-medium block">
                        {new Date(n.timestamp).toLocaleString('en-GB')}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer group"
                    title="Delete Update"
                  >
                    <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-100 dark:bg-slate-800 text-neutral-800 dark:text-slate-200 pt-16 pb-8 px-6 border-t border-neutral-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-3">
            <div className="scale-95 origin-left">
              <ProfessionalLogo />
            </div>
            <p className="text-neutral-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
              Your favorite bespoke fashion design, Ankara wax prints boutique and alterations clinic based in Ashaiman, Accra.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-sans text-sm text-black dark:text-white font-extrabold uppercase tracking-wider">Social Directory</h4>
            <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-slate-400 font-medium">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Facebook</a></li>
              <li><a href="https://wa.me/233276747037" className="hover:text-indigo-600 transition-colors">WhatsApp Direct</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-sans text-sm text-black dark:text-white font-extrabold uppercase tracking-wider">Showroom Contacts</h4>
            <div className="text-xs text-neutral-600 dark:text-slate-400 space-y-1 font-medium">
              <p>Ashaiman Market Area, Accra</p>
              <p className="font-mono text-neutral-600 dark:text-slate-400 font-medium">0276747037</p>
              <p>info@ellastore.com</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-sans text-sm text-black dark:text-white font-extrabold uppercase tracking-wider">Store Newsletter</h4>
            <form onSubmit={e => { e.preventDefault(); showToast("Subscribed", "Newsletter active.", "success"); e.currentTarget.reset(); }} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500 text-black dark:text-white"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4.5 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-neutral-200 dark:border-slate-700 pt-6 text-center text-[10px] text-slate-500 font-mono">
          <p>&copy; 2026 Ella's Store Accra. Systemized with excellence. All Rights Reserved.</p>
        </div>
      </footer>

      {/* FLOATING ACTION UTILITIES */}
      {/* 1. SMS Contact Panel */}
      <SmsWidget onLogActivity={logActivity} username={currentUser} />

      {/* 2. Real-Time Gemini AI Chatbot */}
      <HaiasiChatbot onLogActivity={logActivity} username={currentUser} />

      {/* 3. Media Gallery Drawer */}
      <MediaGallery 
        mediaFiles={mediaFiles} 
        isOpen={showMedia} 
        onClose={() => setShowMedia(false)} 
        onLogActivity={logActivity} 
        username={currentUser} 
      />
      
      {showCharity && (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 overflow-y-auto">
          <button onClick={() => setShowCharity(false)} className="absolute top-6 right-6 p-2 rounded-full bg-neutral-100 dark:bg-slate-800"><X /></button>
          <CharityDonations 
            charityData={charityData} 
            onLogActivity={logActivity} 
            onShowToast={showToast} 
            currentUser={currentUser}
            currentUserEmail={currentUserEmail}
          />
        </div>
      )}

      {showConference && (
        <div className="fixed inset-0 bg-neutral-900 text-white z-50 overflow-y-auto">
          <ConferenceRoom 
            onClose={() => {
              setShowConference(false);
              setInitialConfRoomId(null);
            }} 
            onShowToast={showToast} 
            onLogActivity={logActivity} 
            currentUser={currentUser || "Anonymous Designer"}
            currentUserEmail={currentUserEmail || "anonymous@example.com"}
            initialRoomId={initialConfRoomId || undefined}
          />
        </div>
      )}

      {/* 4. Stepped MoMo Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          discountCodes={discountCodes}
          deliveryRates={deliveryRates}
          onClose={() => setShowCheckout(false)}
          onClearCart={clearCart}
          onAddOrder={handleAddOrder}
          onAddPayment={p => setDoc(doc(db, "payments", String(p.id)), p)}
          onLogActivity={logActivity}
          onShowToast={showToast}
          onRedeemPoints={handleRedeemPoints}
          customerNameDefault={currentUser}
          homepageSettings={homepageSettings}
          customers={customers}
          currentUserEmail={currentUserEmail}
        />
      )}

      {/* 5. ADMIN ACTIONS PANEL LOCK BUTTON */}
      {isLoggedIn && isAuthorizedAdmin && (
        <div className="fixed bottom-6 left-24 z-45" id="admin-access-panel-anchor">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Pulsing radar ping behind the button */}
            <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping pointer-events-none" />
            
            <motion.button
              onClick={() => setShowAdminAuthModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-slate-900 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 px-4.5 py-2.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
              id="admin-access-btn"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin Operations
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* 6. ADMIN DASHBOARD OPERATIONS WINDOW */}
      {showAdminConsole && (
        <AdminDashboard
          products={products}
          orders={orders}
          customers={customers}
          payments={payments}
          locations={locations}
          inquiries={inquiries}
          activityLogs={activityLogs}
          discountCodes={discountCodes}
          charityData={charityData}
          charityDonations={charityDonations}
          mediaFiles={mediaFiles}
          homepageSettings={homepageSettings}
          adminMessages={adminMessages}
          events={events}
          reviews={reviews}
          deliveries={deliveries}
          deliveryRates={deliveryRates}
          deliveryPersonnel={deliveryPersonnel}
          onDeleteReview={handleDeleteReview}
          onUpdateDelivery={handleUpdateDelivery}
          onCreateDelivery={handleCreateDelivery}
          onSetDeliveryRates={updated => syncCollection("delivery_rates", updated)}
          onSetDeliveryPersonnel={updated => syncCollection("delivery_personnel", updated)}
          onClose={() => {
            setShowAdminConsole(false);
            logActivity("Exited Admin Operations Dashboard", "admin_action");
          }}
          onSetProducts={updated => syncCollection("products", updated)}
          onSetOrders={updated => syncCollection("orders", updated)}
          onSetLocations={updated => syncCollection("locations", updated)}
          onSetInquiries={updated => syncCollection("inquiries", updated)}
          onSetDiscountCodes={updated => syncCollection("discounts", updated)}
          onSetCharityData={updated => syncCollection("charity", updated)}
          onSetMediaFiles={updated => syncCollection("media", updated)}
          onSetHomepageSettings={updated => setDoc(doc(db, "settings", "homepage"), updated)}
          onSetAdminMessages={updated => syncCollection("admin_messages", updated)}
          onSetActivityLogs={updated => syncCollection("activity_logs", updated)}
          onSetEvents={updated => syncCollection("events", updated)}
          onShowToast={showToast}
          onLogActivity={logActivity}
          onAddNotification={addNotification}
          onSeedDemoData={handleSeedDemoData}
          onClearAllData={handleClearAllData}
          onDeleteCustomersAndActivities={handleDeleteAllCustomersAndActivities}
        />
      )}

      {/* 7. CUSTOMER NOTIFICATION DRAWER/INBOX */}
      <NotificationInbox
        notifications={notifications}
        currentUserEmail={currentUserEmail}
        isLoggedIn={isLoggedIn}
        onDeleteNotification={deleteNotification}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* 8. ORDER HISTORY SIDEBAR PANEL */}
      {showOrderHistory && (
        <OrderHistory
          orders={orders}
          payments={payments}
          deliveries={deliveries}
          customers={customers}
          currentUser={currentUser}
          currentUserEmail={currentUserEmail}
          currentUserAvatar={currentUserAvatar}
          onUpdateAvatar={async (newUrl) => {
            setCurrentUserAvatar(newUrl);
            localStorage.setItem("currentUserAvatar", newUrl);
            const existing = customers.find(c => (c.name || '').toLowerCase() === (currentUser || '').toLowerCase() || (currentUserEmail && (c.email || '').toLowerCase() === (currentUserEmail || '').toLowerCase()));
            if (existing) {
              const updatedC = {
                ...existing,
                avatarUrl: newUrl
              };
              await setDoc(doc(db, "customers", String(existing.id)), updatedC);
              showToast("Avatar Updated", "Your couture styling profile avatar has been refreshed!", "success");
              logActivity("Updated styling profile avatar on customer dashboard", "user_action");
            }
          }}
          onClose={() => setShowOrderHistory(false)}
          onRedeemPoints={handleRedeemPoints}
          isCustomerOnly={!isAuthorizedAdmin}
        />
      )}

      {/* 9. REVIEW SUBMISSION MODAL */}
      {showReviewModal && (
        <ReviewModal
          currentUser={currentUser}
          currentUserEmail={currentUserEmail}
          onClose={() => setShowReviewModal(false)}
          onSubmitReview={handleAddReview}
        />
      )}

      {/* 10. INTERACTIVE SEARCH DIALOG / RESULTS MODAL */}
      <AnimatePresence>
        {showSearchDialog && (
          <div 
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowSearchDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, cubicBezier: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-neutral-100 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-neutral-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-neutral-50 dark:bg-slate-950">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 bg-indigo-50 rounded-full text-indigo-600 text-xs font-black">🔍</span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Boutique Search & Intelligence</h3>
                    <p className="text-[10px] text-neutral-500 dark:text-slate-400 font-mono">Real-time matching of premium products & custom services</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSearchDialog(false)}
                  className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:bg-slate-800 rounded-full transition-all cursor-pointer"
                  title="Close Search Dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Filter Bar inside Modal */}
              <div className="p-5 border-b border-neutral-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to filter products, custom measurements, charity initiatives, or chatbot styling support..."
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-neutral-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-neutral-50/50"
                    autoFocus
                  />
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-3 p-1 text-neutral-400 hover:text-slate-800 transition-colors rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Results Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-neutral-50/30">
                
                {/* 1. APP FEATURES AND STORE SERVICES */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-indigo-600 font-black uppercase bg-indigo-50 px-3 py-1 rounded-full">
                      Store Features & Specialities ({filteredFeatures.length})
                    </span>
                    {searchQuery && <span className="text-[9px] text-neutral-400 font-mono">Matched by keywords</span>}
                  </div>

                  {filteredFeatures.length === 0 ? (
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-neutral-200 dark:border-slate-700 text-center text-xs text-neutral-500 dark:text-slate-400 font-medium">
                      No matching services found. Try typing "charity", "sizing", or "reviews".
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredFeatures.map((feat) => (
                        <div
                          key={feat.name}
                          className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-neutral-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{feat.icon}</span>
                              <div>
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block leading-none">{feat.category}</span>
                                <h4 className="text-xs font-black text-neutral-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{feat.name}</h4>
                              </div>
                            </div>
                            <p className="text-[11px] text-neutral-600 dark:text-slate-400 leading-relaxed font-medium font-sans">{feat.description}</p>
                          </div>
                          <div className="pt-3 border-t border-neutral-50 mt-3 flex justify-end">
                            <button
                              onClick={feat.action}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                            >
                              <span>Launch Feature</span>
                              <span>&rarr;</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. MATCHING CATALOG PRODUCTS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-pink-600 font-black uppercase bg-pink-50 px-3 py-1 rounded-full">
                      Showroom Catalog ({filteredProducts.length})
                    </span>
                    {!searchQuery && <span className="text-[9px] text-neutral-400 font-mono">Popular items displayed</span>}
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-neutral-200 dark:border-slate-700 text-center space-y-2 max-w-sm mx-auto">
                      <span className="text-2xl block">🧥</span>
                      <h4 className="text-xs font-black text-slate-800 uppercase">No Product Matches</h4>
                      <p className="text-[10px] text-neutral-500 dark:text-slate-400 font-medium">Try filtering by other categories like "food", "dresses", "accessories", or "shoes".</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setShowSearchDialog(false);
                            handleViewDetail(prod);
                          }}
                          className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-neutral-100 dark:border-slate-800 hover:border-pink-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group cursor-pointer"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-slate-800 shrink-0 border border-neutral-200 dark:border-slate-700">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400 rounded-full font-mono font-bold text-[8px] uppercase tracking-wider">{prod.category}</span>
                              {prod.stock <= 5 && (
                                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full font-sans font-bold text-[8px] uppercase tracking-wider">Low Stock</span>
                              )}
                            </div>
                            <h4 className="text-xs font-black text-neutral-900 dark:text-slate-100 uppercase tracking-tight truncate">{prod.name}</h4>
                            <div className="text-xs font-black text-indigo-600 font-mono">₵{prod.price}</div>
                          </div>

                          <div className="text-right shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(prod);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-colors shadow-sm block cursor-pointer"
                            >
                              Add to Bag
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-neutral-100 dark:border-slate-800 bg-neutral-50 dark:bg-slate-950 text-center">
                <p className="text-[9px] text-neutral-400 font-mono">
                  Press <kbd className="bg-white dark:bg-slate-900 border px-1 rounded shadow-sm">Esc</kbd> or click backdrop to dismiss. Matches update instantly as you type.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 11. PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedDetailProduct && (
          <ProductDetailModal
            onNotifyMe={handleNotifyMe}
            product={selectedDetailProduct}
            allProducts={products}
            onClose={() => handleViewDetail(null)}
            onAddToCart={addToCart}
            isLoggedIn={isLoggedIn}
            onShowLogin={() => setShowLogin(true)}
            onViewProduct={handleViewDetail}
            initialTab={detailInitialTab}
          />
        )}
      </AnimatePresence>

      {/* 12. HIGH-FIDELITY BRANDED LOADER OVERLAY */}
      <AnimatePresence>
        {siteLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative flex flex-col items-center max-w-sm w-full text-center space-y-6"
            >
              {/* Spinning / pulsing luxury ring loader */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-neutral-100 dark:border-slate-800 border-t-neutral-800 animate-spin" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-2 rounded-full border border-dashed border-neutral-300 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                <div className="absolute inset-4 rounded-full bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-2 flex items-center justify-center">
                  <img 
                    src={Logo} 
                    alt="Ella's Store Logo" 
                    className="w-full h-full object-contain rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-2">
                <h2 className="font-sans text-lg font-black tracking-widest text-neutral-900 dark:text-slate-100 uppercase">
                  ELLA'S STORE
                </h2>
                <div className="h-[2px] w-12 bg-neutral-900 mx-auto rounded-full" />
                <p className="text-[10px] text-neutral-500 dark:text-slate-400 font-mono tracking-wider uppercase">
                  {loadingMessage || "Synchronizing Showroom..."}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="w-full bg-neutral-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden max-w-[200px]">
                <div className="bg-neutral-900 h-full rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>

              {/* Slow Loading Notice */}
              <AnimatePresence>
                {isSlowLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-neutral-50 dark:bg-slate-950 rounded-2xl border border-neutral-100 dark:border-slate-800 space-y-1.5"
                  >
                    <p className="text-[11px] text-neutral-600 dark:text-slate-400 font-medium leading-relaxed">
                      Ella's network is taking a moment to process.
                    </p>
                    <p className="text-[9px] text-neutral-400 font-mono leading-normal">
                      Securing transaction channels & tailors' workstation... Thank you for your patience!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
