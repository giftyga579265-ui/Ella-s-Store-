import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Product, Order, Customer, Payment, CustomerLocation, 
  CustomerInquiry, ActivityLog, DiscountCode, MediaFile, HomepageSettings, ChatMessage, NotificationItem, StoreEvent, CustomerReview, DeliveryItem
} from "./types";
import { 
  ShoppingBag, Phone, MapPin, Mail, Clock, HelpCircle, 
  Settings, User, Check, Sparkles, Star, ChevronDown, Lock, Bell, Trash2, X, Menu
} from "lucide-react";

import SmsWidget from "./components/SmsWidget";
import MediaGallery from "./components/MediaGallery";
import CheckoutModal from "./components/CheckoutModal";
import HaiasiChatbot from "./components/HaiasiChatbot";
import AdminDashboard from "./components/AdminDashboard";
import ProductCard from "./components/ProductCard";
import NotificationInbox from "./components/NotificationInbox";
import OrderHistory from "./components/OrderHistory";
import ReviewModal from "./components/ReviewModal";

import { db, auth, googleProvider } from "./lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, getDocs 
} from "firebase/firestore";

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
    signedUp: true
  },
  {
    id: 2,
    name: "Kofi Asante",
    email: "kofi.asante@example.com",
    phone: "0272345678",
    registrationDate: "2026-06-12",
    orders: 1,
    totalSpent: 150,
    signedUp: true
  },
  {
    id: 3,
    name: "Esi Boateng",
    email: "esi.boateng@example.com",
    phone: "0273456789",
    registrationDate: "2026-06-15",
    orders: 2,
    totalSpent: 350,
    signedUp: true
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
    address: "Lapaz, Accra, near Lapaz Market",
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
    message: "I purchased some suit trousers that are too long. Do you do bespoke hemming and taper alterations at your Lapaz shop?",
    date: "2026-06-26",
    status: "in-progress"
  }
];

const INITIAL_MEDIA: MediaFile[] = [
  {
    id: 1,
    type: "image",
    title: "Lapaz Boutique Storefront",
    description: "Welcome to Ella's Store! Visit our showroom in Lapaz, Accra for custom tailoring fittings and retail catalog rows.",
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
    location: "Ella's Store, Lapaz, Accra",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    status: "upcoming"
  },
  {
    id: "evt-2",
    title: "Accra Traditional Couture Fair",
    description: "Vibrant Kente designs and custom bridal styling exhibitions curated directly by Ella. Free fashion consultations for early arrivals.",
    date: "2026-08-05",
    time: "10:00",
    location: "Lapaz Showroom, Accra",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    status: "upcoming"
  }
];

const AUTHORIZED_ADMIN_USERS = ['Asante Isaiah', 'Kofi Asante', 'Etnasa Haiasi', 'gifty.ga579265@gmail.com', 'ella.accra.admin@gmail.com'];

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
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(INITIAL_MEDIA);
  const [events, setEvents] = useState<StoreEvent[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("currentUser") || "";
  });
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return localStorage.getItem("currentUserEmail") || "";
  });

  // Computed notification count for user
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => {
      const email = (n as any).customerEmail;
      if (!email || email === "all") return true;
      if (isLoggedIn && currentUserEmail && email.toLowerCase() === currentUserEmail.toLowerCase()) return true;
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
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Custom dialogs
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminAuthPassword, setAdminAuthPassword] = useState("");
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

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

  // Track visitor session accesses when they load the storefront
  useEffect(() => {
    // Check if we've already logged a visit this tab session
    const hasLoggedAccess = sessionStorage.getItem("hasLoggedAccess");
    if (!hasLoggedAccess) {
      sessionStorage.setItem("hasLoggedAccess", "true");
      const userStr = currentUser || "Guest Session";
      logActivity(`Accessed the storefront as ${userStr}`, "user_action");
    }
  }, [currentUser]);

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
        const hasFood = items.some(item => item.category === 'food');
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

      showToast("Showroom Seeded", "Ella's Boutique sample listings loaded successfully.", "success");
      logActivity("Seeded showroom collections with initial sample data", "admin_action");
    } catch (err) {
      console.error("Error seeding demo data:", err);
      showToast("Seeding Failed", "Could not complete seeding operations.", "error");
    }
  };

  const handleClearAllData = async () => {
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

      showToast("Database Purged", "All store catalog items, customers, and transactions removed successfully.", "success");
      logActivity("Purged database collections for a clean setup", "admin_action");
    } catch (err) {
      console.error("Error clearing database collections:", err);
      showToast("Purge Failed", "Could not complete clear operations.", "error");
    }
  };

  // Form handlers
  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      showToast("Error", "Please fill in credentials.", "error");
      return;
    }

    setIsLoggedIn(true);
    setCurrentUser(loginUsername.trim());
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", loginUsername.trim());
    
    // CRM synchronization
    const existing = customers.find(c => c.name.toLowerCase() === loginUsername.trim().toLowerCase());
    const matchedEmail = loginEmail.trim() || (existing ? existing.email : `${loginUsername.toLowerCase().replace(/\s+/g, '')}@example.com`);
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
        email: loginEmail.trim() || `${loginUsername.toLowerCase().replace(/\s+/g, '')}@example.com`,
        phone: loginPhone.trim() || "024" + Math.floor(1000000 + Math.random() * 8999999),
        registrationDate: new Date().toISOString().split('T')[0],
        orders: 0,
        totalSpent: 0,
        signedUp: true
      };
      setDoc(doc(db, "customers", String(newC.id)), newC).catch(err => {
        console.error("Error saving customer to Firestore:", err);
      });
    } else {
      const updatedC = {
        ...existing,
        email: loginEmail.trim() || existing.email,
        phone: loginPhone.trim() || existing.phone,
        signedUp: true
      };
      setDoc(doc(db, "customers", String(existing.id)), updatedC).catch(err => {
        console.error("Error updating customer in Firestore:", err);
      });
    }

    // Set greeting log
    setTimeout(() => {
      logActivity("Logged in to the customer storefront", "login");
    }, 100);
  };

  const handleAddOrder = async (order: any) => {
    try {
      // 1. Save order to Firestore
      await setDoc(doc(db, "orders", String(order.id)), order);

      // 2. Locate or create customer record
      const customerName = order.customer.trim();
      const existingCust = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());

      if (existingCust) {
        const updatedCust = {
          ...existingCust,
          orders: (existingCust.orders || 0) + 1,
          totalSpent: (existingCust.totalSpent || 0) + order.total
        };
        await setDoc(doc(db, "customers", String(existingCust.id)), updatedCust);
      } else {
        const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
        const newCust: Customer = {
          id: newId,
          name: customerName,
          email: order.email || `${customerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: order.phone || "024" + Math.floor(1000000 + Math.random() * 8999999),
          registrationDate: new Date().toISOString().split('T')[0],
          orders: 1,
          totalSpent: order.total,
          signedUp: true
        };
        await setDoc(doc(db, "customers", String(newId)), newCust);
      }

      // 3. Dispatch system-wide and user notification for the new order
      const shortOrderId = String(order.id).substring(0, 8);
      const isGPay = order.isGooglePay || order.paymentMethod === "googlepay";
      const paymentModeStr = isGPay ? "Google Pay (Secure Card)" : "MTN Mobile Money";
      
      await addNotification(
        "Order Placed Successfully! 🎉",
        `Your invoice #${shortOrderId} for ₵${order.total.toFixed(2)} is authorized via ${paymentModeStr}. We are packaging your items for express delivery!`,
        "success",
        order.email || order.customerEmail || "all"
      );
    } catch (err) {
      console.error("Error saving order & syncing customer:", err);
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
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user.displayName || user.email || "Google User");
        setCurrentUserEmail(user.email || "");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", user.displayName || user.email || "Google User");
        localStorage.setItem("currentUserEmail", user.email || "");
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
        
        const existing = customers.find(c => (c.email && c.email.toLowerCase() === userEmail.toLowerCase()) || c.name.toLowerCase() === userName.toLowerCase());
        if (!existing) {
          const newC: Customer = {
            id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
            name: userName,
            email: userEmail,
            phone: userPhone,
            registrationDate: new Date().toISOString().split('T')[0],
            orders: 0,
            totalSpent: 0,
            signedUp: true
          };
          await setDoc(doc(db, "customers", String(newC.id)), newC);
        } else {
          const updatedC = {
            ...existing,
            email: userEmail,
            signedUp: true
          };
          await setDoc(doc(db, "customers", String(existing.id)), updatedC);
        }
        
        logActivity(`Logged in via Google (${userEmail})`, "login");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      showToast("Google Sign-In Failed", err.message || "Could not authenticate with Google.", "error");
    }
  };

  const handleGoogleAdminAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        const userEmail = user.email.toLowerCase();
        if (AUTHORIZED_ADMIN_USERS.map(e => e.toLowerCase()).includes(userEmail)) {
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
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("currentUserEmail");
      showToast("Signed Out", "You have logged out successfully.", "info");
      logActivity("Logged out of the storefront", "user_action");
      setShowLogin(true);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Shopping cart handlers
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
    e.currentTarget.reset();
  };

  const isAuthorizedAdmin = useMemo(() => {
    return (
      AUTHORIZED_ADMIN_USERS.some(admin => admin.toLowerCase() === currentUser.trim().toLowerCase()) ||
      AUTHORIZED_ADMIN_USERS.some(admin => admin.toLowerCase() === currentUserEmail.trim().toLowerCase())
    );
  }, [currentUser, currentUserEmail]);

  const ProfessionalLogo = () => (
    <div className="flex items-center gap-2.5 group">
      <div className="relative w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-md border border-neutral-200 transition-transform duration-300 group-hover:scale-105">
        <svg className="w-6 h-6 animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="#6366f1" strokeWidth="3" strokeDasharray="4 4" />
          <path d="M38 30H62V36H46V46H58V52H46V64H62V70H38V30Z" fill="white" />
          <path d="M68 25L72 45L65 50" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="68" cy="25" r="2" fill="#f59e0b" />
        </svg>
        <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-indigo-600 rounded-full border border-black flex items-center justify-center text-[9px] font-black text-white">E</span>
      </div>
      <div className="text-left">
        <span className="block font-sans text-sm font-black tracking-widest text-black uppercase group-hover:text-indigo-600 transition-colors">ELLA'S STORE</span>
        <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">COUTURE & ALTERATIONS</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-black select-none antialiased flex flex-col font-sans">
      
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-4 rounded-3xl shadow-xl flex justify-between items-start border animate-in slide-in-from-right duration-250 ${
              t.type === 'success' ? 'bg-white border-emerald-200 text-emerald-800' :
              t.type === 'error' ? 'bg-white border-rose-200 text-rose-800' :
              'bg-white border-indigo-200 text-indigo-800'
            }`}
          >
            <div className="space-y-1">
              <h5 className="font-bold text-xs tracking-wide uppercase">{t.title}</h5>
              <p className="text-xs leading-relaxed text-neutral-700">{t.message}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="text-neutral-400 hover:text-black transition-colors ml-3.5 shrink-0 cursor-pointer"
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
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-neutral-900 flex items-center justify-center font-sans font-black text-2xl mx-auto shadow-md">
                E
              </div>
              <h2 className="font-sans text-2xl text-slate-100 font-bold pt-3 tracking-tight">Welcome to Ella's</h2>
              <p className="text-xs text-slate-400">Lapaz's premium fashion, dressmaking & styling showroom</p>
            </div>

            <div className="space-y-3.5 text-left">
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
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-900 py-3.5 rounded-xl text-xs font-black tracking-wider transition-all shadow-lg uppercase cursor-pointer"
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
              className="w-full bg-white hover:bg-neutral-100 text-neutral-900 py-3.5 rounded-xl text-xs font-bold tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-neutral-200"
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
      {showAdminAuthModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
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
              className="w-full bg-white hover:bg-neutral-100 text-neutral-900 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-neutral-200"
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
        </div>
      )}

      {/* HEADER NAV */}
      <nav className="sticky top-0 bg-slate-950/95 backdrop-blur-md border-b border-slate-900 z-30 transition-all duration-300 shadow-md px-6 py-4.5">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          <a href="#" className="font-sans text-xl tracking-widest text-slate-100 hover:text-indigo-400 transition-colors font-black">
            ELLA'S STORE
          </a>

          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-slate-400">
            <a href="#collections" className="hover:text-indigo-400 transition-colors">Collections</a>
            <a href="#about" className="hover:text-indigo-400 transition-colors">About</a>
            <a href="#process" className="hover:text-indigo-400 transition-colors">Services</a>
            <a href="#events" className="hover:text-indigo-400 transition-colors">Events</a>
            <a href="#shop" className="hover:text-indigo-400 transition-colors">Shop</a>
            <a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a>
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
              className="hover:text-indigo-400 transition-colors uppercase tracking-wider text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              id="desktop-chart-history-btn"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Chart History
            </button>
            <button 
              onClick={() => {
                setShowReviewModal(true);
                logActivity("Opened showroom review modal", "user_action");
              }}
              className="hover:text-indigo-400 transition-colors uppercase tracking-wider text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              id="desktop-reviews-btn"
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              Rate Site
            </button>
            <button 
              onClick={() => setShowMedia(true)}
              className="bg-indigo-600 text-white px-4.5 py-2 rounded-full font-bold shadow hover:bg-indigo-500 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              Media Gallery
            </button>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-300 font-semibold bg-slate-900 px-3 py-1.5 rounded-full border border-slate-850">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="max-w-[80px] truncate">{currentUser}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 text-[10px] font-mono tracking-wider uppercase cursor-pointer"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            )}
            
            {/* NOTIFICATION BELL BUTTON */}
            <button
              onClick={() => {
                setShowNotifications(true);
                logActivity("Opened customer notifications panel", "user_action");
              }}
              className="relative w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-300 hover:border-indigo-500 hover:text-indigo-400 bg-slate-900 transition-colors group cursor-pointer"
              title="Notifications"
              id="notification-bell-btn"
            >
              <Bell className="w-4 h-4 group-hover:scale-110 transition-transform text-slate-300 group-hover:text-indigo-400" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 font-black rounded-full flex items-center justify-center text-[10px] shadow border border-slate-950 animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (cart.length === 0) {
                  showToast("Empty Bag", "Your shopping bag is empty. Please add styles first.", "info");
                  return;
                }
                setShowCheckout(true);
              }}
              className="relative w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-300 hover:border-indigo-500 hover:text-indigo-400 bg-slate-900 transition-colors group cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white font-black rounded-full flex items-center justify-center text-[10px] shadow border border-slate-950">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* CUSTOMER DASHBOARD MENU BUTTON */}
            <button
              onClick={() => {
                setShowMobileMenu(!showMobileMenu);
                logActivity("Opened customer navigation menu", "user_action");
              }}
              className="lg:hidden w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-300 hover:border-indigo-500 hover:text-indigo-400 bg-slate-900 transition-colors cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-45 flex flex-col justify-center items-center p-6 lg:hidden animate-in fade-in duration-300">
          <button 
            onClick={() => setShowMobileMenu(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 hover:text-black cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col gap-8 text-center text-xl font-bold tracking-wider uppercase text-neutral-800 w-full max-w-sm">
            <a 
              href="#collections" 
              onClick={() => setShowMobileMenu(false)}
              className="hover:text-indigo-600 transition-colors py-3 border-b border-neutral-150"
            >
              Collections
            </a>
            <a 
              href="#about" 
              onClick={() => setShowMobileMenu(false)}
              className="hover:text-indigo-600 transition-colors py-3 border-b border-neutral-150"
            >
              About
            </a>
            <a 
              href="#process" 
              onClick={() => setShowMobileMenu(false)}
              className="hover:text-indigo-600 transition-colors py-3 border-b border-neutral-150"
            >
              Services
            </a>
            <a 
              href="#events" 
              onClick={() => setShowMobileMenu(false)}
              className="hover:text-indigo-600 transition-colors py-3 border-b border-neutral-150"
            >
              Events
            </a>
            <a 
              href="#shop" 
              onClick={() => setShowMobileMenu(false)}
              className="hover:text-indigo-600 transition-colors py-3 border-b border-neutral-150"
            >
              Shop
            </a>
            <a 
              href="#contact" 
              onClick={() => setShowMobileMenu(false)}
              className="hover:text-indigo-600 transition-colors py-3 border-b border-neutral-150"
            >
              Contact
            </a>
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
              className="hover:text-indigo-600 text-left uppercase py-3 border-b border-neutral-150 font-bold transition-colors cursor-pointer w-full flex items-center gap-2"
              id="mobile-chart-history-btn"
            >
              <Clock className="w-4 h-4 text-indigo-500" />
              Chart History
            </button>
            <button 
              onClick={() => {
                setShowMobileMenu(false);
                setShowReviewModal(true);
                logActivity("Opened showroom review modal", "user_action");
              }}
              className="hover:text-indigo-600 text-left uppercase py-3 border-b border-neutral-150 font-bold transition-colors cursor-pointer w-full flex items-center gap-2"
              id="mobile-reviews-btn"
            >
              <Star className="w-4 h-4 text-amber-500" />
              Rate Site & Reviews
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
          </div>
        </div>
      )}

      {/* HERO CANVAS */}
      <section 
        className="h-[80vh] bg-cover bg-center flex items-center justify-center relative text-black"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.65), rgba(255,255,255,0.95)), url(${homepageSettings.heroBackground})` }}
      >
        <div className="text-center px-6 space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-center mb-2 scale-110">
            <ProfessionalLogo />
          </div>
          <span className="bg-indigo-50 text-indigo-600 text-[10px] px-3.5 py-1.5 rounded-full font-bold tracking-widest font-mono uppercase shadow-sm border border-indigo-200">
            Operational Showroom Live
          </span>
          <h1 className="font-sans text-5xl md:text-6xl tracking-tight uppercase font-black text-black">ELLA'S STORE</h1>
          <p className="text-sm md:text-base font-sans tracking-wide text-neutral-800 max-w-lg mx-auto">Premium African Couture, Bespoke dressmaking & Tailoring in Lapaz, Accra</p>
          <div className="pt-4">
            <a
              href="#shop"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Discover Collection
            </a>
          </div>
        </div>
      </section>

      {/* COLLECTIONS GRID */}
      <section id="collections" className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-sans text-3xl md:text-4xl text-black font-bold tracking-tight">Our Premium Collections</h2>
          <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase font-bold">Systemized Elegance & Trends</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Evening Couture", desc: "Bespoke traditional laces, evening dresses and coordinates", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600", gridClass: "md:col-span-1" },
            { title: "Day Dress Comfort", desc: "Light Ankara wax prints and tailored daily skater wears", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600", gridClass: "md:col-span-1" },
            { title: "Occasion Ceremony", desc: "Bespoke kente dress fittings for special wedding guests", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600", gridClass: "md:col-span-1" },
          ].map((col, idx) => (
            <div key={idx} className={`${col.gridClass} group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-sm border border-neutral-200 bg-white cursor-pointer`}>
              <img src={col.img} alt={col.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent flex flex-col justify-end p-6 space-y-1.5 transition-opacity">
                <h3 className="font-sans text-xl text-black font-bold">{col.title}</h3>
                <p className="text-neutral-800 text-xs leading-relaxed font-semibold">{col.desc}</p>
                <a href="#shop" className="text-xs text-indigo-600 font-bold uppercase tracking-widest pt-2 flex items-center gap-1 group-hover:text-indigo-500">
                  Shop styles &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT TIMELINE */}
      <section id="about" className="py-20 px-6 bg-neutral-100/65 border-t border-b border-neutral-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-sans text-3xl md:text-4xl text-black font-bold tracking-tight">Bespoke Heritage Since 2021</h2>
            <p className="text-neutral-700 text-sm leading-relaxed">
              Located in the heart of Lapaz, Accra, Ella's Store has emerged as a beloved showroom for traditional Ghanaian dressmaking and retail styles. Over five years of tailoring expertise, we deliver stunning couture collections blending vibrant Ankara prints and delicate laces.
            </p>
            <blockquote className="border-l-4 border-indigo-600 bg-white p-6 rounded-r-3xl italic font-sans text-neutral-800 text-base leading-relaxed border border-neutral-200 shadow-sm">
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
          <h2 className="font-sans text-3xl md:text-4xl text-black font-bold tracking-tight">Professional Showroom Services</h2>
          <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase font-bold">Bento Tailoring Desk</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Styling Consultation", desc: "Expert, localized fashion consults to choose fabrics, coordinates, and silhouettes." },
            { step: "02", title: "Custom Tailoring", desc: "Precise custom dressmaking with fittings mapped out at our showroom." },
            { step: "03", title: "Alterations & Hemming", desc: "Premium suit/dress alterations, tapers, and tapering with professional finishes." },
            { step: "04", title: "Accra Logistics Delivery", desc: "Express delivery routed straight to your doorstep throughout greater Accra." },
          ].map((srv, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-neutral-200 flex flex-col justify-between hover:border-indigo-500/40 transition-colors shadow-sm">
              <span className="font-mono text-3xl font-extrabold text-indigo-600 mb-4">{srv.step}</span>
              <div className="space-y-1.5">
                <h4 className="font-sans text-base text-black font-bold">{srv.title}</h4>
                <p className="text-neutral-600 text-xs leading-relaxed font-medium">{srv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section id="events" className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-sans text-3xl md:text-4xl text-black font-bold tracking-tight">Showroom Events & Launches</h2>
          <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase font-bold">Vibrant runway presentations, design exhibitions & Accra pop-ups</p>
        </div>

        {events.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200/60 rounded-3xl p-12 text-center max-w-xl mx-auto">
            <span className="text-4xl">🗓️</span>
            <h3 className="font-sans text-lg font-bold text-black mt-4">No Active Schedules</h3>
            <p className="text-neutral-500 text-xs mt-1.5 leading-relaxed">
              We are currently designing our next seasonal collection lines in the Lapaz showroom. Please join our SMS updates for future events!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((evt) => (
              <motion.div
                key={evt.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-neutral-250/60 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 bg-neutral-100 overflow-hidden">
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
                        'bg-neutral-200 text-neutral-600 border-neutral-300'
                      }`}>
                        {evt.status === 'upcoming' ? 'Upcoming' : evt.status === 'ongoing' ? 'Ongoing' : 'Past'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-sans text-lg text-black font-extrabold tracking-tight leading-snug">{evt.title}</h3>
                    <p className="text-neutral-600 text-xs leading-relaxed font-medium line-clamp-3">{evt.description}</p>
                    
                    <div className="space-y-2 pt-3 text-xs text-neutral-500 font-bold border-t border-neutral-100">
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

                <div className="p-6 bg-neutral-50/50 border-t border-neutral-100">
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
      <section id="shop" className="py-20 px-6 bg-neutral-100/40 border-t border-b border-neutral-200">
        <div className="max-w-7xl mx-auto w-full space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-sans text-3xl md:text-4xl text-black font-bold tracking-tight">Boutique Catalog Shelf</h2>
            <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase font-bold">Select & Checkout securely with MoMo or Google Pay</p>
          </div>

          {/* Category Navigation Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2.5 max-w-4xl mx-auto border-b border-neutral-200 pb-8">
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
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Dynamic grid wrapping with empty states */}
          {products.filter(p => activeCategory === 'all' || p.category === activeCategory).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 shadow-sm max-w-md mx-auto space-y-3 animate-in fade-in">
              <span className="text-4xl">🍽️</span>
              <h4 className="font-sans text-base font-bold text-neutral-800">Fresh Menu Coming Soon</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                Ella's kitchen is crafting new gourmet dishes right now. Check back shortly!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter(p => activeCategory === 'all' || p.category === activeCategory)
                .map(prod => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={addToCart}
                    isLoggedIn={isLoggedIn}
                    onShowLogin={() => setShowLogin(true)}
                    layout={homepageSettings.productLayout as any}
                  />
                ))}
            </div>
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
            <h2 className="font-sans text-3xl md:text-4xl text-black font-bold tracking-tight">Consult Ella Directly</h2>
            <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase mt-1 font-bold">Showroom phone and scheduling</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-neutral-200 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <strong className="block text-black">Showroom Address</strong>
                <span className="text-neutral-600 font-medium">Lapaz Showroom, Accra, Ghana (Near Market)</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-neutral-200 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <strong className="block text-black">Direct Line</strong>
                <span className="text-neutral-600 font-mono font-medium">0276747037 / +233 27 674 7037</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-neutral-200 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <strong className="block text-black">Showroom Hours</strong>
                <span className="text-neutral-600 font-medium">Mon - Sat: 8:00 AM - 8:00 PM &bull; Sun: Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Submission */}
        <form onSubmit={handleInquirySubmit} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <h3 className="font-sans text-lg font-bold text-black">Forward Consultation Form</h3>
          
          <div className="space-y-1.5">
            <input
              type="text"
              name="name"
              placeholder="Your Full Name"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 text-black placeholder-neutral-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <input
              type="email"
              name="email"
              placeholder="Your Email Address"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 text-black placeholder-neutral-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <input
              type="tel"
              name="phone"
              placeholder="MTN / Mobile Contact Number"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 text-black font-mono placeholder-neutral-400"
            />
          </div>

          <div className="space-y-1.5">
            <select
              name="service"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 text-black"
              required
            >
              <option value="fashion">Traditional styling & fittings</option>
              <option value="alterations">Alterations & tailoring taper</option>
              <option value="delivery">Custom logistics route</option>
              <option value="other">Bespoke catalog query</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <textarea
              name="message"
              placeholder="Draft your sizing details, customization requirements, or dress codes..."
              rows={4}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-neutral-50 text-black placeholder-neutral-400"
              required
            />
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
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-neutral-100" id="in-page-notifications-hub">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-black uppercase tracking-wider text-black">
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

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm">
          {notifications.filter(n => {
            if (!n.customerEmail || n.customerEmail === "all") return true;
            if (isLoggedIn && currentUserEmail && n.customerEmail.toLowerCase() === currentUserEmail.toLowerCase()) return true;
            return false;
          }).length === 0 ? (
            <div className="text-center py-6 text-neutral-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-neutral-500">Your notification log is currently empty.</p>
              <p className="text-[10px] text-neutral-400 mt-1">Updates on orders or promotions will appear directly in this hub.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {notifications.filter(n => {
                if (!n.customerEmail || n.customerEmail === "all") return true;
                if (isLoggedIn && currentUserEmail && n.customerEmail.toLowerCase() === currentUserEmail.toLowerCase()) return true;
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
                      <p className="text-xs text-neutral-600 font-sans leading-relaxed font-medium">{n.message}</p>
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
      <footer className="bg-neutral-100 text-neutral-800 pt-16 pb-8 px-6 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-3">
            <div className="scale-95 origin-left">
              <ProfessionalLogo />
            </div>
            <p className="text-neutral-600 text-xs leading-relaxed font-medium">
              Your favorite bespoke fashion design, Ankara wax prints boutique and alterations clinic based in Lapaz, Accra.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-sans text-sm text-black font-extrabold uppercase tracking-wider">Social Directory</h4>
            <ul className="space-y-1.5 text-xs text-neutral-600 font-medium">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Facebook</a></li>
              <li><a href="https://wa.me/233276747037" className="hover:text-indigo-600 transition-colors">WhatsApp Direct</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-sans text-sm text-black font-extrabold uppercase tracking-wider">Showroom Contacts</h4>
            <div className="text-xs text-neutral-600 space-y-1 font-medium">
              <p>Lapaz Market Area, Accra</p>
              <p className="font-mono text-neutral-600 font-medium">0276747037</p>
              <p>info@ellastore.com</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-sans text-sm text-black font-extrabold uppercase tracking-wider">Store Newsletter</h4>
            <form onSubmit={e => { e.preventDefault(); showToast("Subscribed", "Newsletter active.", "success"); e.currentTarget.reset(); }} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white border border-neutral-200 px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500 text-black"
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

        <div className="max-w-7xl mx-auto border-t border-neutral-200 pt-6 text-center text-[10px] text-slate-500 font-mono">
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

      {/* 4. Stepped MoMo Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          discountCodes={discountCodes}
          onClose={() => setShowCheckout(false)}
          onClearCart={clearCart}
          onAddOrder={handleAddOrder}
          onAddPayment={p => setDoc(doc(db, "payments", String(p.id)), p)}
          onLogActivity={logActivity}
          onShowToast={showToast}
          customerNameDefault={currentUser}
          homepageSettings={homepageSettings}
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
          mediaFiles={mediaFiles}
          homepageSettings={homepageSettings}
          adminMessages={adminMessages}
          events={events}
          reviews={reviews}
          deliveries={deliveries}
          onDeleteReview={handleDeleteReview}
          onUpdateDelivery={handleUpdateDelivery}
          onCreateDelivery={handleCreateDelivery}
          onClose={() => {
            setShowAdminConsole(false);
            logActivity("Exited Admin Operations Dashboard", "admin_action");
          }}
          onSetProducts={updated => syncCollection("products", updated)}
          onSetOrders={updated => syncCollection("orders", updated)}
          onSetLocations={updated => syncCollection("locations", updated)}
          onSetInquiries={updated => syncCollection("inquiries", updated)}
          onSetDiscountCodes={updated => syncCollection("discounts", updated)}
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
          currentUser={currentUser}
          currentUserEmail={currentUserEmail}
          onClose={() => setShowOrderHistory(false)}
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

    </div>
  );
}
