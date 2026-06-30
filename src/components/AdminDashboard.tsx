import React, { useState, useMemo } from "react";
import { 
  Product, Order, Customer, Payment, CustomerLocation, 
  CustomerInquiry, ActivityLog, DiscountCode, MediaFile, HomepageSettings, StoreEvent, CustomerReview, DeliveryItem 
} from "../types";
import CustomerLiveMap from "./CustomerLiveMap";
import { 
  LayoutDashboard, ShoppingCart, Shirt, Users, CreditCard, 
  MapPin, HelpCircle, Activity, Tag, Mail, Image as ImageIcon, Paintbrush, 
  LogOut, Plus, Trash2, Edit, Eye, Check, CheckCircle, TrendingUp, DollarSign,
  Download, Search, Sparkles, MessageCircle, AlertTriangle, Maximize2, Minimize2, X,
  Database, Utensils, Calendar, Star, Truck
} from "lucide-react";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  payments: Payment[];
  locations: CustomerLocation[];
  inquiries: CustomerInquiry[];
  activityLogs: ActivityLog[];
  discountCodes: DiscountCode[];
  mediaFiles: MediaFile[];
  homepageSettings: HomepageSettings;
  adminMessages: any[];
  events: StoreEvent[];
  reviews: CustomerReview[];
  deliveries: DeliveryItem[];
  onDeleteReview?: (id: string) => void;
  onUpdateDelivery: (id: string, fields: Partial<DeliveryItem>) => void;
  onCreateDelivery: (delivery: Omit<DeliveryItem, 'lastUpdated'>) => void;
  
  onClose: () => void;
  onSetProducts: (products: Product[]) => void;
  onSetOrders: (orders: Order[]) => void;
  onSetLocations: (locations: CustomerLocation[]) => void;
  onSetInquiries: (inquiries: CustomerInquiry[]) => void;
  onSetDiscountCodes: (codes: DiscountCode[]) => void;
  onSetMediaFiles: (files: MediaFile[]) => void;
  onSetHomepageSettings: (settings: HomepageSettings) => void;
  onSetAdminMessages: (messages: any[]) => void;
  onSetActivityLogs: (logs: ActivityLog[]) => void;
  onSetEvents: (events: StoreEvent[]) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  onLogActivity: (activity: string, type: 'login' | 'cart_addition' | 'purchase' | 'product_view' | 'inquiry' | 'admin_action' | 'user_action') => void;
  onAddNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'promo', targetEmail: string) => void;
  onSeedDemoData?: () => void;
  onClearAllData?: () => void;
}

export default function AdminDashboard({
  products, orders, customers, payments, locations, inquiries, 
  activityLogs, discountCodes, mediaFiles, homepageSettings, adminMessages, events, reviews, deliveries, onDeleteReview, onUpdateDelivery, onCreateDelivery,
  onClose, onSetProducts, onSetOrders, onSetLocations, onSetInquiries, 
  onSetDiscountCodes, onSetMediaFiles, onSetHomepageSettings, onSetAdminMessages,
  onSetActivityLogs, onSetEvents, onShowToast, onLogActivity, onAddNotification, onSeedDemoData, onClearAllData
}: AdminDashboardProps) {
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [isPageMaximized, setIsPageMaximized] = useState(false);
  const [reviewSearch, setReviewSearch] = useState("");

  // Delivery Tracker Form & Filter States
  const [showCreateDeliveryForm, setShowCreateDeliveryForm] = useState(false);
  const [newDeliveryOrderId, setNewDeliveryOrderId] = useState("");
  const [newDeliveryName, setNewDeliveryName] = useState("");
  const [newDeliveryEmail, setNewDeliveryEmail] = useState("");
  const [newDeliveryPhone, setNewDeliveryPhone] = useState("");
  const [newDeliveryAddress, setNewDeliveryAddress] = useState("");
  const [newDeliveryRider, setNewDeliveryRider] = useState("");
  const [newDeliveryRiderPhone, setNewDeliveryRiderPhone] = useState("");
  const [newDeliveryNotes, setNewDeliveryNotes] = useState("");
  const [newDeliveryEstDate, setNewDeliveryEstDate] = useState("");
  const [newDeliveryItems, setNewDeliveryItems] = useState<string[]>([]);
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [deliverySearch, setDeliverySearch] = useState<string>("");

  // Forms states
  // 1. Product Form
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("dresses");
  const [productStock, setProductStock] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);

  // 2. Location Form
  const [locCustomerId, setLocCustomerId] = useState("");
  const [locAddress, setLocAddress] = useState("");
  const [locLat, setLocLat] = useState("");
  const [locLng, setLocLng] = useState("");

  // 3. Discount Code Form
  const [discCode, setDiscCode] = useState("");
  const [discType, setDiscType] = useState<'percentage' | 'fixed'>("percentage");
  const [discValue, setDiscValue] = useState("");
  const [discMin, setDiscMin] = useState("");
  const [discExpiry, setDiscExpiry] = useState("");
  const [discUsage, setDiscUsage] = useState("");

  // 4. Message Campaign Form
  const [msgTitle, setMsgTitle] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgSelectedCustomerIds, setMsgSelectedCustomerIds] = useState<number[]>([]);
  const [msgSendToAll, setMsgSendToAll] = useState(true);

  // 5. Media Management Form
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio'>("image");
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaDesc, setMediaDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  // 6. Homepage Customization
  const [homeHeroBg, setHomeHeroBg] = useState(homepageSettings.heroBackground);
  const [homeLayout, setHomeLayout] = useState(homepageSettings.productLayout);
  const [homePrimary, setHomePrimary] = useState(homepageSettings.primaryColor);
  const [homeSecondary, setHomeSecondary] = useState(homepageSettings.secondaryColor);
  const [momoEnabled, setMomoEnabled] = useState(homepageSettings.momoEnabled !== false);
  const [momoMerchantName, setMomoMerchantName] = useState(homepageSettings.momoMerchantName || "ELLA'S FASHION SHOWROOM");
  const [momoMerchantNumber, setMomoMerchantNumber] = useState(homepageSettings.momoMerchantNumber || "0244123456");
  const [momoChargeRate, setMomoChargeRate] = useState(homepageSettings.momoChargeRate ?? 0.5);

  // 7. Event Management Form
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [eventStatus, setEventStatus] = useState<'upcoming' | 'ongoing' | 'past'>("upcoming");
  const [showEventForm, setShowEventForm] = useState(false);

  // Activity Filtering State
  const [activityFilter, setActivityFilter] = useState("all");
  const [activitySearch, setActivitySearch] = useState("");

  // Calculated Stats
  const revenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const activeCustomers = useMemo(() => customers.filter(c => c.signedUp).length, [customers]);
  const pendingInquiries = useMemo(() => inquiries.filter(i => i.status === 'new').length, [inquiries]);

  // Food Metrics
  const foodProducts = useMemo(() => products.filter(p => p.category === 'food'), [products]);
  const foodProductNames = useMemo(() => foodProducts.map(p => p.name.toLowerCase()), [foodProducts]);
  const foodOrders = useMemo(() => {
    return orders.filter(order => {
      return order.items.some(item => {
        const lowerItem = item.toLowerCase();
        return foodProductNames.some(foodName => lowerItem.includes(foodName)) || 
               lowerItem.includes("jollof") || 
               lowerItem.includes("fufu") || 
               lowerItem.includes("waakye") || 
               lowerItem.includes("tilapia") ||
               lowerItem.includes("kelewele");
      });
    });
  }, [orders, foodProductNames]);
  const foodRevenue = useMemo(() => {
    return foodOrders.reduce((sum, o) => sum + o.total, 0);
  }, [foodOrders]);

  // Activity Analytics Calculators
  const activityStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = activityLogs.filter(a => a.timestamp.startsWith(today));
    
    // Most active user
    const userCounts: Record<string, number> = {};
    activityLogs.forEach(a => {
      userCounts[a.username] = (userCounts[a.username] || 0) + 1;
    });
    let mostActiveUser = "-";
    let mostActiveCount = 0;
    Object.entries(userCounts).forEach(([u, count]) => {
      if (count > mostActiveCount) {
        mostActiveCount = count;
        mostActiveUser = u;
      }
    });

    // Peak hour
    const hourCounts = Array(24).fill(0);
    activityLogs.forEach(a => {
      try {
        const hr = new Date(a.timestamp).getHours();
        hourCounts[hr]++;
      } catch (e) {}
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    // Top activity type
    const typeCounts: Record<string, number> = {};
    activityLogs.forEach(a => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });
    let topType = "-";
    let topTypeCount = 0;
    Object.entries(typeCounts).forEach(([t, count]) => {
      if (count > topTypeCount) {
        topTypeCount = count;
        topType = t;
      }
    });

    return {
      todayCount: todayLogs.length,
      mostActiveUser,
      mostActiveCount,
      peakHour: `${peakHour}:00 - ${peakHour + 1}:00`,
      peakHourCount: hourCounts[peakHour] || 0,
      topType: topType.replace('_', ' '),
      topTypePercent: activityLogs.length > 0 ? Math.round((topTypeCount / activityLogs.length) * 100) : 0,
      hourCounts,
      userCounts: Object.entries(userCounts).sort((a,b) => b[1] - a[1]).slice(0, 5),
      typeCounts
    };
  }, [activityLogs]);

  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchFilter = activityFilter === "all" || log.type === activityFilter;
      const matchSearch = log.username.toLowerCase().includes(activitySearch.toLowerCase()) || 
                          log.description.toLowerCase().includes(activitySearch.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [activityLogs, activityFilter, activitySearch]);

  // Product Add / Edit Handlers
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productPrice || !productStock) {
      onShowToast("Required Fields", "Please complete all fields", "error");
      return;
    }

    const priceNum = parseFloat(productPrice);
    const stockNum = parseInt(productStock);

    if (editingProductId !== null) {
      // Editing
      const updated = products.map(p => {
        if (p.id === editingProductId) {
          return {
            ...p,
            name: productName,
            price: priceNum,
            category: productCategory,
            stock: stockNum,
            description: productDescription,
            image: productImage || p.image
          };
        }
        return p;
      });
      onSetProducts(updated);
      onShowToast("Product Updated", `Successfully modified ${productName}`, "success");
      onLogActivity(`Updated product catalog ID: ${editingProductId} (${productName})`, "admin_action");
    } else {
      // Adding
      const newProd: Product = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: productName,
        price: priceNum,
        category: productCategory,
        stock: stockNum,
        description: productDescription,
        image: productImage || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400"
      };
      onSetProducts([...products, newProd]);
      onShowToast("Product Added", `Added new catalog item: ${productName}`, "success");
      onLogActivity(`Created new product catalog item: ${productName}`, "admin_action");
    }

    // Reset Form
    setEditingProductId(null);
    setProductName("");
    setProductPrice("");
    setProductCategory("dresses");
    setProductStock("");
    setProductDescription("");
    setProductImage("");
    setShowProductForm(false);
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductName(prod.name);
    setProductPrice(prod.price.toString());
    setProductCategory(prod.category);
    setProductStock(prod.stock.toString());
    setProductDescription(prod.description);
    setProductImage(prod.image);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (id: number, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete ${name} from catalog?`)) {
      onSetProducts(products.filter(p => p.id !== id));
      onShowToast("Product Deleted", "Removed item from active listings.", "success");
      onLogActivity(`Deleted product listing: ${name}`, "admin_action");
    }
  };

  // Image Upload base64 helper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setter(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Locations Handlers
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locCustomerId || !locAddress) {
      onShowToast("Required Fields", "Please select a customer and provide address details.", "error");
      return;
    }

    const customer = customers.find(c => c.id === parseInt(locCustomerId));
    if (!customer) return;

    const newLoc: CustomerLocation = {
      id: locations.length > 0 ? Math.max(...locations.map(l => l.id)) + 1 : 1,
      customerId: customer.id,
      customerName: customer.name,
      address: locAddress,
      lat: locLat ? parseFloat(locLat) : 5.6037,
      lng: locLng ? parseFloat(locLng) : -0.2270,
      notes: "Added via Admin Operations"
    };

    onSetLocations([...locations, newLoc]);
    onShowToast("Location Registered", `Saved location details for ${customer.name}`, "success");
    onLogActivity(`Registered logistics tracking coordinate for customer: ${customer.name}`, "admin_action");

    // Reset
    setLocCustomerId("");
    setLocAddress("");
    setLocLat("");
    setLocLng("");
  };

  const handleDeleteLocation = (id: number, customerName: string) => {
    if (confirm(`Delete delivery tracking coordinates for ${customerName}?`)) {
      onSetLocations(locations.filter(l => l.id !== id));
      onShowToast("Location Removed", "Successfully cleared tracking data.", "success");
      onLogActivity(`Cleared logistics coordinate tracking data for ${customerName}`, "admin_action");
    }
  };

  // Coupon Discount Handlers
  const handleAddDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discCode || !discValue) {
      onShowToast("Error", "Discount code and value are mandatory.", "error");
      return;
    }

    const cleaned = discCode.trim().toUpperCase();
    if (discountCodes.some(d => d.code === cleaned)) {
      onShowToast("Duplicate Code", "This coupon code already exists.", "error");
      return;
    }

    const newCode: DiscountCode = {
      id: discountCodes.length > 0 ? Math.max(...discountCodes.map(d => d.id)) + 1 : 1,
      code: cleaned,
      type: discType,
      value: parseFloat(discValue),
      minAmount: discMin ? parseFloat(discMin) : undefined,
      expiry: discExpiry || undefined,
      usageLimit: discUsage ? parseInt(discUsage) : null,
      usedCount: 0,
      active: true
    };

    onSetDiscountCodes([...discountCodes, newCode]);
    onShowToast("Coupon Code Created", `Created promo coupon: ${cleaned}`, "success");
    onLogActivity(`Created campaign discount coupon code: ${cleaned}`, "admin_action");

    // Reset
    setDiscCode("");
    setDiscValue("");
    setDiscMin("");
    setDiscExpiry("");
    setDiscUsage("");
  };

  const handleDeleteDiscount = (id: number, code: string) => {
    if (confirm(`Permanently delete discount code ${code}?`)) {
      onSetDiscountCodes(discountCodes.filter(d => d.id !== id));
      onShowToast("Discount Deleted", "Discount promo code is no longer active.", "success");
      onLogActivity(`Deleted active discount coupon code: ${code}`, "admin_action");
    }
  };

  // Inquiry Status Handlers
  const handleInquiryStatus = (id: number, status: 'new' | 'in-progress' | 'resolved') => {
    const updated = inquiries.map(i => {
      if (i.id === id) return { ...i, status };
      return i;
    });
    onSetInquiries(updated);
    onShowToast("Inquiry Updated", `Status is now ${status.replace('-', ' ')}`, "success");
    onLogActivity(`Updated customer inquiry status to '${status}' (ID: ${id})`, "admin_action");
  };

  const handleDeleteInquiry = (id: number) => {
    if (confirm("Delete this inquiry record from operations archive?")) {
      onSetInquiries(inquiries.filter(i => i.id !== id));
      onShowToast("Inquiry Deleted", "Removed inquiry from records.", "success");
      onLogActivity(`Deleted archived customer inquiry record (ID: ${id})`, "admin_action");
    }
  };

  // Messaging Campaign Handler
  const handleSendMessageCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle || !msgContent) {
      onShowToast("Required Fields", "Please add a title and content for your campaign message.", "error");
      return;
    }

    let recString = "All Customers";
    if (!msgSendToAll) {
      if (msgSelectedCustomerIds.length === 0) {
        onShowToast("No Recipients", "Please select at least one recipient.", "error");
        return;
      }
      recString = `${msgSelectedCustomerIds.length} Selected Customer(s)`;
    }

    const campaignMsg = {
      id: adminMessages.length > 0 ? Math.max(...adminMessages.map(m => m.id)) + 1 : 1,
      title: msgTitle,
      content: msgContent,
      recipients: msgSendToAll ? "all" : "selected",
      date: new Date().toISOString().split('T')[0],
      sentBy: "Operations Administrator"
    };

    onSetAdminMessages([campaignMsg, ...adminMessages]);
    
    // Dispatch real-time user notifications to database
    if (onAddNotification) {
      if (msgSendToAll) {
        onAddNotification(msgTitle, msgContent, "promo", "all");
      } else {
        msgSelectedCustomerIds.forEach(id => {
          const cust = customers.find(c => c.id === id);
          if (cust && cust.email) {
            onAddNotification(msgTitle, msgContent, "promo", cust.email);
          }
        });
      }
    }

    onShowToast("Campaign Broadcasted", `Newsletter/SMS broadcasted to ${recString}!`, "success");
    onLogActivity(`Dispatched marketing message campaign broadcast: "${msgTitle}" to ${recString}`, "admin_action");

    // Reset
    setMsgTitle("");
    setMsgContent("");
    setMsgSelectedCustomerIds([]);
    setMsgSendToAll(true);
  };

  // Media Manager Handler
  const handleUploadMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaTitle || !mediaUrl) {
      onShowToast("Required Fields", "Media title and asset selection are mandatory.", "error");
      return;
    }

    const newMedia: MediaFile = {
      id: mediaFiles.length > 0 ? Math.max(...mediaFiles.map(m => m.id)) + 1 : 1,
      type: mediaType,
      title: mediaTitle,
      description: mediaDesc,
      url: mediaUrl,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    onSetMediaFiles([newMedia, ...mediaFiles]);
    onShowToast("Asset Uploaded", "Media file successfully loaded into the database.", "success");
    onLogActivity(`Uploaded new catalog media asset: "${mediaTitle}"`, "admin_action");

    // Reset
    setMediaTitle("");
    setMediaDescription("");
    setMediaUrl("");
  };

  const handleDeleteMedia = (id: number, title: string) => {
    if (confirm(`Remove media item "${title}" from the public gallery?`)) {
      onSetMediaFiles(mediaFiles.filter(m => m.id !== id));
      onShowToast("Media Removed", "Asset removed successfully.", "success");
      onLogActivity(`Deleted catalog media file asset: "${title}"`, "admin_action");
    }
  };

  // Event Management Handlers
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventLocation) {
      onShowToast("Required Fields", "Event title, date, and location are mandatory.", "error");
      return;
    }

    const newEvent: StoreEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle,
      description: eventDesc,
      date: eventDate,
      time: eventTime || undefined,
      location: eventLocation,
      imageUrl: eventImageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
      status: eventStatus
    };

    onSetEvents([newEvent, ...events]);
    onShowToast("Event Created", "Ella's Store event is now published live on the store event page.", "success");
    onLogActivity(`Created a new store event: "${eventTitle}" for date ${eventDate}`, "admin_action");

    // Reset
    setEventTitle("");
    setEventDesc("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    setEventImageUrl("");
    setEventStatus("upcoming");
    setShowEventForm(false);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the event "${title}"?`)) {
      onSetEvents(events.filter(evt => evt.id !== id));
      onShowToast("Event Deleted", "Removed event from live schedules.", "success");
      onLogActivity(`Deleted store event: "${title}"`, "admin_action");
    }
  };

  // Home Design Customization Save
  const handleSaveHomepageCustomization = () => {
    const updated: HomepageSettings = {
      heroBackground: homeHeroBg || homepageSettings.heroBackground,
      productLayout: homeLayout,
      primaryColor: homePrimary,
      secondaryColor: homeSecondary,
      momoEnabled: momoEnabled,
      momoMerchantName: momoMerchantName,
      momoMerchantNumber: momoMerchantNumber,
      momoChargeRate: Number(momoChargeRate)
    };

    onSetHomepageSettings(updated);
    onShowToast("Design & MoMo Configurations Active", "Homepage colors, assets, and MTN MoMo payment options saved permanently.", "success");
    onLogActivity("Updated homepage template and custom MTN Mobile Money payment settings", "admin_action");
  };

  // Export logs JSON helper
  const exportActivityLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `EllasStore_ActivityLogs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast("Logs Exported", "Activity tracker logs downloaded successfully.", "success");
  };

  const PageToggleBtn = () => (
    <button
      onClick={() => {
        setIsPageMaximized(!isPageMaximized);
        onLogActivity(isPageMaximized ? "Restored admin dashboard sidebar" : "Maximized admin dashboard page panel", "user_action");
        onShowToast(
          isPageMaximized ? "Page Restored" : "Page Maximized",
          isPageMaximized ? "Sidebar navigation is now visible." : "Dashboard page maximized to full width.",
          "info"
        );
      }}
      className="text-xs px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 transition-all font-bold flex items-center gap-1.5 shadow-sm cursor-pointer inline-flex shrink-0 self-center"
      title={isPageMaximized ? "Show Sidebar navigation menu" : "Maximize active page workspace"}
    >
      {isPageMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      <span>{isPageMaximized ? "Minimize Page" : "Maximize Page"}</span>
    </button>
  );

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom duration-300" id="admin-minimized-pill">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-900 font-bold text-sm shadow">
            E
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">Operations Console</div>
            <div className="text-[9px] text-amber-500 font-mono tracking-widest uppercase">Minimized</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
          <button
            onClick={() => {
              setMinimized(false);
              onShowToast("Console Restored", "Operations dashboard restored successfully.", "success");
            }}
            className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl transition-colors hover:text-white cursor-pointer"
            title="Restore Dashboard"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-rose-950/50 hover:bg-rose-900/50 text-rose-400 rounded-xl transition-colors border border-rose-800/30 cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!maximized && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-45 animate-in fade-in duration-200" onClick={() => setMinimized(true)} />
      )}
      <div className={`fixed bg-neutral-100 z-50 flex flex-col ${maximized ? 'inset-0' : 'inset-4 md:inset-10 rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden'}`} id="admin-operations-panel">
        {/* Header */}
        <header className="bg-neutral-950 text-white px-6 py-4.5 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-900 font-serif font-black text-xl shadow">
              E
            </div>
            <div>
              <h1 className="font-serif text-lg tracking-wider">Ella's Store operations console</h1>
              <p className="text-[10px] font-mono text-amber-500 tracking-widest uppercase">Admin Terminal Connected</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Minimize Button */}
            <button 
              onClick={() => {
                setMinimized(true);
                onShowToast("Console Minimized", "Operations console minimized. Click widget to restore.", "info");
              }} 
              className="text-xs text-neutral-400 hover:text-white border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 px-3 py-1.5 rounded-xl transition-all font-medium flex items-center gap-1.5 cursor-pointer"
              title="Minimize to Tray"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Minimize</span>
            </button>

            {/* Maximize Button */}
            <button 
              onClick={() => {
                setMaximized(!maximized);
                onShowToast(maximized ? "Restored Layout" : "Maximized Screen", maximized ? "Returned to window mode." : "Expanded to full screen.", "info");
              }} 
              className="text-xs text-neutral-400 hover:text-white border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 px-3 py-1.5 rounded-xl transition-all font-medium flex items-center gap-1.5 cursor-pointer"
              title={maximized ? "Compact screen layout" : "Full screen layout"}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{maximized ? "Restore" : "Maximize"}</span>
            </button>

            {/* Page Layout Maximize/Minimize Button */}
            <button 
              onClick={() => {
                setIsPageMaximized(!isPageMaximized);
                onLogActivity(isPageMaximized ? "Restored admin dashboard sidebar" : "Maximized admin dashboard page panel", "user_action");
                onShowToast(
                  isPageMaximized ? "Page Restored" : "Page Maximized",
                  isPageMaximized ? "Sidebar navigation is now visible." : "Dashboard page maximized to full width.",
                  "info"
                );
              }} 
              className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                isPageMaximized 
                  ? "bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold" 
                  : "text-neutral-400 hover:text-white border border-neutral-800 bg-neutral-900 hover:bg-neutral-850"
              }`}
              title={isPageMaximized ? "Minimize active page area (Show Sidebar)" : "Maximize active page area (Hide Sidebar)"}
            >
              {isPageMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPageMaximized ? "Minimize Page" : "Maximize Page"}</span>
            </button>
            
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-900 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 shadow flex items-center gap-1.5 cursor-pointer"
              id="admin-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout operations
            </button>
          </div>
        </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        {!isPageMaximized && (
          <aside className="w-64 bg-neutral-900 text-neutral-300 border-r border-neutral-800 flex flex-col justify-between overflow-y-auto shrink-0 py-6">
            <ul className="space-y-1.5 px-3">
              {[
                { id: "dashboard", label: "Operations Dashboard", icon: LayoutDashboard },
                { id: "orders", label: "Fulfillment Orders", icon: ShoppingCart, count: orders.filter(o=>o.status==='pending').length },
                { id: "products", label: "Catalog Products", icon: Shirt },
                { id: "customers", label: "Registered CRM", icon: Users },
                { id: "payments", label: "Transaction Payments", icon: CreditCard },
                { id: "locations", label: "Logistics Locations", icon: MapPin },
                { id: "inquiries", label: "Customer Inquiries", icon: HelpCircle, count: pendingInquiries },
                { id: "activities", label: "Activity Tracker Log", icon: Activity },
                { id: "discounts", label: "Promo Coupons", icon: Tag },
                { id: "messaging", label: "SMS Campaigns", icon: Mail },
                { id: "media", label: "Asset Management", icon: ImageIcon },
                { id: "events", label: "Store Events", icon: Calendar, count: events?.length || 0 },
                { id: "reviews", label: "Customer Reviews", icon: Star, count: reviews?.length || 0 },
                { id: "delivery", label: "Delivery Tracker", icon: Truck, count: deliveries?.filter(d=>d.status!=='delivered' && d.status!=='failed').length || 0 },
                { id: "customize", label: "Homepage Design", icon: Paintbrush },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 group ${
                        activeTab === tab.id
                          ? "bg-amber-500 text-neutral-900 shadow-md font-bold"
                          : "hover:bg-neutral-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors group-hover:scale-110 duration-300 ${activeTab === tab.id ? 'text-neutral-900' : 'text-amber-500'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${activeTab === tab.id ? 'bg-neutral-900 text-white' : 'bg-amber-500 text-neutral-900'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            
            <div className="px-3 py-4 border-t border-neutral-800 space-y-2">
              <a
                href="https://console.firebase.google.com/project/teak-technique-g71nt/firestore/databases/ai-studio-ellasstore-6673b3a5-ee4c-4237-b264-769d13c47377/data"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-300 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-amber-500" />
                <span>Firebase DB Console</span>
              </a>
            </div>

            <div className="px-6 py-4 border-t border-neutral-800 text-[10px] text-neutral-500 font-mono flex flex-col gap-1">
              <p>Admin Terminal: Online</p>
              <p className="text-[9px]">Build Version v1.4.2</p>
            </div>
          </aside>
        )}

        {/* Dashboard Main Console */}
        <main className="flex-1 bg-neutral-100 p-8 overflow-y-auto">
          
          {/* TAB 1: Dashboard Overview */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Operations Dashboard Overview</h2>
                  <p className="text-xs text-neutral-500">Live operational stats and fulfillment pipelines for Ella's Store.</p>
                </div>
                <PageToggleBtn />
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[
                  { label: "Pending Orders Pipeline", val: orders.filter(o=>o.status==='pending').length, desc: `${orders.length} total orders registered`, icon: ShoppingCart },
                  { label: "Estimated Gross Revenue", val: `₵${revenue.toFixed(2)}`, desc: "Accumulated checkout totals", icon: DollarSign },
                  { label: "Products in Catalog", val: products.length, desc: "Across active style listings", icon: Shirt },
                  { label: "Active CRM Accounts", val: activeCustomers, desc: "Registered customer logins", icon: Users },
                  { label: "Completed Payments", val: payments.filter(p=>p.status==='completed').length, desc: `Across MTN MoMo, cash, card, GPay`, icon: CreditCard },
                  { label: "Gourmet Food Orders", val: foodOrders.length, desc: `${foodProducts.length} active menu items`, icon: Utensils },
                  { label: "Food Sales Revenue", val: `₵${foodRevenue.toFixed(2)}`, desc: "Gourmet kitchen sales", icon: DollarSign },
                  { label: "Google Pay Payments", val: payments.filter(p=>p.method==='googlepay').length, desc: "Completed via GPay sandbox", icon: CreditCard },
                  { label: "Pending Consultations", val: pendingInquiries, desc: "Customer form inquiry tickets", icon: HelpCircle },
                  { label: "Live System Actions (24h)", val: activityLogs.length, desc: "Granular session records", icon: Activity },
                  { label: "Campaign Promo Coupons", val: discountCodes.length, desc: "Active discount coupon systems", icon: Tag },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm flex items-center justify-between hover:border-amber-500/40 transition-colors group">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">{stat.label}</span>
                        <h3 className="text-2xl font-serif text-neutral-900 group-hover:text-amber-600 transition-colors duration-300">{stat.val}</h3>
                        <p className="text-[10px] text-neutral-400 font-medium">{stat.desc}</p>
                      </div>
                      <div className="w-11 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Secondary block with live notifications */}
              <div className="bg-neutral-900 text-white p-6 rounded-3xl border border-neutral-800 shadow-xl space-y-4">
                <h4 className="font-serif text-lg text-amber-500 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                  Terminal Notice Bulletin
                </h4>
                <div className="text-xs text-neutral-300 leading-relaxed max-w-2xl space-y-2">
                  <p>Welcome to the consolidated full-stack operational suite. From this portal, you have direct, server-authoritative control over catalogs, discounts, messaging campaigns, and user metrics.</p>
                  <p className="text-[11px] text-neutral-400 font-mono">Any product catalogs added or edited here will automatically adjust the live client shopping view. Checkout orders placed on the frontend will stream instantly into your fulfillment queues.</p>
                </div>
              </div>

              {/* Database Slate Administration Panel */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-sm space-y-4 animate-in slide-in-from-bottom-2 duration-350">
                <div>
                  <h3 className="font-serif text-lg text-neutral-900 font-medium flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-neutral-500" />
                    Pristine Database & Demo Seeding Controls
                  </h3>
                  <p className="text-xs text-neutral-500">Ella's store starts as a clean slate for real products. Click below to either purge all live collections or re-seed high-fidelity sample collections.</p>
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClearAllData}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Clear All Firestore Collections
                  </button>
                  <button
                    type="button"
                    onClick={onSeedDemoData}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all shadow cursor-pointer"
                  >
                    Seed Elegant Boutique Demo Data
                  </button>
                  
                  <a
                    href="https://console.firebase.google.com/project/teak-technique-g71nt/firestore/databases/ai-studio-ellasstore-6673b3a5-ee4c-4237-b264-769d13c47377/data"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FFCA28]/20 hover:bg-[#FFCA28]/35 text-[#E65100] border border-[#FFCA28]/50 hover:border-[#FFCA28]/70 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Database className="w-4 h-4 shrink-0 text-[#F57C00]" />
                    Go to Live Firebase Database
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Fulfillment Orders */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Fulfillment Order Queues</h2>
                  <p className="text-xs text-neutral-500">Approve, route, or archive client checkout transactions.</p>
                </div>
                <PageToggleBtn />
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-950 text-white font-serif uppercase tracking-wider">
                        <th className="p-4 border-b border-neutral-800">Order ID</th>
                        <th className="p-4 border-b border-neutral-800">Customer Name</th>
                        <th className="p-4 border-b border-neutral-800">Fulfillment Items</th>
                        <th className="p-4 border-b border-neutral-800">Gross Total</th>
                        <th className="p-4 border-b border-neutral-800">Transaction Date</th>
                        <th className="p-4 border-b border-neutral-800">Fulfillment Status</th>
                        <th className="p-4 border-b border-neutral-800 text-center">Fulfillment Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-neutral-50/50">
                          <td className="p-4 font-mono font-bold text-amber-600">{order.id}</td>
                          <td className="p-4 font-semibold text-neutral-800">{order.customer}</td>
                          <td className="p-4 font-medium text-neutral-600">{order.items.join(", ")}</td>
                          <td className="p-4 font-black font-mono text-neutral-900">₵{order.total.toFixed(2)}</td>
                          <td className="p-4 font-medium text-neutral-500">{order.date}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide capitalize ${
                              order.status === 'completed' ? 'bg-green-100 text-green-700' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-1.5">
                              {order.status !== 'completed' && order.status !== 'cancelled' && (
                                <>
                                  <button
                                    onClick={() => {
                                      const updated = orders.map(o => o.id === order.id ? { ...o, status: 'processing' as const } : o);
                                      onSetOrders(updated);
                                      onShowToast("Fulfillment Processing", `Fulfilling order ${order.id}`, "info");
                                      onLogActivity(`Advanced order fulfillment status to 'processing' (Order: ${order.id})`, "admin_action");
                                    }}
                                    className="bg-blue-500 text-white px-2.5 py-1 rounded-lg font-bold text-[10px]"
                                  >
                                    Process
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = orders.map(o => o.id === order.id ? { ...o, status: 'completed' as const } : o);
                                      onSetOrders(updated);
                                      onShowToast("Order Fulfilled", `Completed order shipment ${order.id}`, "success");
                                      onLogActivity(`Advanced order fulfillment status to 'completed' (Order: ${order.id})`, "admin_action");
                                    }}
                                    className="bg-green-600 text-white px-2.5 py-1 rounded-lg font-bold text-[10px]"
                                  >
                                    Fulfill
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(`Cancel order ${order.id}?`)) {
                                    const updated = orders.map(o => o.id === order.id ? { ...o, status: 'cancelled' as const } : o);
                                    onSetOrders(updated);
                                    onShowToast("Order Cancelled", `Fulfillment cancelled for ${order.id}`, "info");
                                    onLogActivity(`Cancelled client order checkout: ${order.id}`, "admin_action");
                                  }
                                }}
                                className="bg-red-500 text-white px-2.5 py-1 rounded-lg font-bold text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Catalog Products */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Catalog Product Listings</h2>
                  <p className="text-xs text-neutral-500">Inject, update, or delete products directly from the store's shelves.</p>
                </div>
                
                <div className="flex items-center gap-3 ml-auto flex-wrap animate-in fade-in">
                  <PageToggleBtn />
                  <button
                    onClick={() => {
                      setEditingProductId(null);
                      setProductName("");
                      setProductPrice("");
                      setProductCategory("dresses");
                      setProductStock("");
                      setProductDescription("");
                      setProductImage("");
                      setShowProductForm(!showProductForm);
                    }}
                    className="bg-amber-500 text-neutral-900 hover:bg-neutral-950 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Product
                  </button>
                </div>
              </div>

              {/* Product Add/Edit Form Panel */}
              {showProductForm && (
                <form onSubmit={handleProductSubmit} className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-md max-w-2xl animate-in slide-in-from-top-4 duration-300 space-y-4">
                  <h3 className="font-serif text-lg text-neutral-900 border-b border-neutral-100 pb-2">
                    {editingProductId ? `Edit Catalog Listing (ID: ${editingProductId})` : "Create Catalog Listing"}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block">Product Name</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={e => setProductName(e.target.value)}
                        placeholder="e.g. Traditional Lace Gown"
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block">Category Group</label>
                      <select
                        value={productCategory}
                        onChange={e => setProductCategory(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white"
                      >
                        <option value="dresses">Dresses</option>
                        <option value="accessories">Accessories</option>
                        <option value="shoes">Shoes</option>
                        <option value="bags">Bags</option>
                        <option value="food">Gourmet Food</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block">Price in Cedis (₵)</label>
                      <input
                        type="number"
                        value={productPrice}
                        onChange={e => setProductPrice(e.target.value)}
                        placeholder="e.g. 250"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block">Inventory Stock Count</label>
                      <input
                        type="number"
                        value={productStock}
                        onChange={e => setProductStock(e.target.value)}
                        placeholder="e.g. 15"
                        min="0"
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-600 block">Product Sizing & Details Description</label>
                    <textarea
                      value={productDescription}
                      onChange={e => setProductDescription(e.target.value)}
                      placeholder="Write fabric features, sizing details, colors..."
                      rows={3}
                      className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-600 block font-serif">Product Image Asset</label>
                    <div className="border-2 border-dashed border-neutral-250 p-6 rounded-2xl text-center hover:border-amber-500 transition-colors relative cursor-pointer group bg-neutral-50/50">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleImageUpload(e, setProductImage)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <ImageIcon className="w-8 h-8 mx-auto text-neutral-400 group-hover:text-amber-500 transition-colors mb-2" />
                      <p className="text-xs text-neutral-600 font-medium">Click to select product image file (Base64 conversion)</p>
                      {productImage && (
                        <div className="mt-4 max-w-xs mx-auto">
                          <img src={productImage} alt="Base64 preview" className="rounded-xl border border-neutral-200 shadow-sm max-h-40 object-cover mx-auto" />
                          <p className="text-[9px] text-green-600 mt-1.5 font-bold">✓ Image attached securely</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3.5 pt-3">
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-neutral-900 px-5 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all shadow"
                    >
                      {editingProductId ? "Update listing" : "Publish to shelves"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-neutral-200"
                    >
                      Cancel operations
                    </button>
                  </div>
                </form>
              )}

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-950 text-white font-serif uppercase tracking-wider">
                        <th className="p-4 border-b border-neutral-800">Thumbnail</th>
                        <th className="p-4 border-b border-neutral-800">Product Name</th>
                        <th className="p-4 border-b border-neutral-800">Category</th>
                        <th className="p-4 border-b border-neutral-800">Unit Price</th>
                        <th className="p-4 border-b border-neutral-800">Stock Status</th>
                        <th className="p-4 border-b border-neutral-800 text-center">Fulfillment Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {products.map(prod => (
                        <tr key={prod.id} className="hover:bg-neutral-50/50">
                          <td className="p-4">
                            <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shadow-sm" />
                          </td>
                          <td className="p-4 font-bold text-neutral-800">
                            <div>
                              <p className="text-sm font-semibold">{prod.name}</p>
                              <span className="text-[10px] text-neutral-400 font-medium font-serif line-clamp-1">{prod.description}</span>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-neutral-600 capitalize">{prod.category}</td>
                          <td className="p-4 font-black font-mono text-neutral-900">₵{prod.price.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                              prod.stock === 0 ? 'bg-red-100 text-red-700' :
                              prod.stock < 5 ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {prod.stock === 0 ? 'Out of Stock' : `${prod.stock} units`}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => startEditProduct(prod)}
                                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-amber-100 text-neutral-700 hover:text-amber-800 flex items-center justify-center transition-colors border border-neutral-200"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-red-100 text-neutral-700 hover:text-red-750 flex items-center justify-center transition-colors border border-neutral-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CRM Customers */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Customer Relationship Management (CRM)</h2>
                  <p className="text-xs text-neutral-500">Track registration statistics, order frequencies, and lifetime value metrics. Click on any row to view and extract user data.</p>
                </div>
                <PageToggleBtn />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Side: Customers Table */}
                <div className={`${selectedCustomer ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm transition-all duration-300`}>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-neutral-950 text-white font-serif uppercase tracking-wider">
                          <th className="p-4 border-b border-neutral-800">ID</th>
                          <th className="p-4 border-b border-neutral-800">Customer Name</th>
                          <th className="p-4 border-b border-neutral-800">Email Address</th>
                          <th className="p-4 border-b border-neutral-800">Phone Contact</th>
                          <th className="p-4 border-b border-neutral-800">Date Registered</th>
                          <th className="p-4 text-center border-b border-neutral-800">Fulfillments</th>
                          <th className="p-4 border-b border-neutral-800">Lifetime Spent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {customers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-neutral-400 font-medium">
                              No customer accounts have registered yet. When users log into the storefront online, their records will instantly appear here.
                            </td>
                          </tr>
                        ) : (
                          customers.map(customer => (
                            <tr 
                              key={customer.id} 
                              onClick={() => setSelectedCustomer(selectedCustomer?.id === customer.id ? null : customer)}
                              className={`hover:bg-neutral-50/50 cursor-pointer transition-colors ${
                                selectedCustomer?.id === customer.id ? 'bg-amber-50/70 border-l-4 border-amber-500' : ''
                              }`}
                            >
                              <td className="p-4 font-mono font-bold text-neutral-400">CRM-{customer.id}</td>
                              <td className="p-4 font-bold text-neutral-800 flex items-center gap-2">
                                {customer.name}
                                {selectedCustomer?.id === customer.id && <Check className="w-3.5 h-3.5 text-amber-500" />}
                              </td>
                              <td className="p-4 font-medium text-neutral-600">{customer.email}</td>
                              <td className="p-4 font-mono font-medium text-neutral-500">{customer.phone}</td>
                              <td className="p-4 font-medium text-neutral-400">{customer.registrationDate}</td>
                              <td className="p-4 text-center font-bold font-mono text-neutral-700">{customer.orders} orders</td>
                              <td className="p-4 font-black font-mono text-neutral-900">₵{customer.totalSpent.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side: Selected Customer Details Dossier */}
                {selectedCustomer && (
                  <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 shadow-sm space-y-6 animate-in slide-in-from-right-4 duration-350">
                    <div className="flex justify-between items-start border-b border-neutral-150 pb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-600">Active CRM Profile</span>
                        <h3 className="font-serif text-lg text-neutral-900 font-medium">{selectedCustomer.name}</h3>
                        <p className="text-[10px] text-neutral-400">Registered on {selectedCustomer.registrationDate}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedCustomer(null)}
                        className="text-neutral-400 hover:text-neutral-600 p-1 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Contact Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-3 rounded-xl border border-neutral-200/30">
                      <div>
                        <span className="text-[9px] text-neutral-400 block font-semibold uppercase">Email</span>
                        <span className="font-medium text-neutral-800 break-all">{selectedCustomer.email}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-400 block font-semibold uppercase">Phone Contact</span>
                        <span className="font-mono font-medium text-neutral-800 break-all">{selectedCustomer.phone}</span>
                      </div>
                    </div>

                    {/* Fulfillments Summary */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider font-sans border-b border-neutral-100 pb-1.5 flex justify-between items-center">
                        <span>Fulfillment Orders</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md font-bold">
                          {orders.filter(o => o.customer.toLowerCase() === selectedCustomer.name.toLowerCase()).length}
                        </span>
                      </h4>
                      <div className="max-h-36 overflow-y-auto space-y-2 pr-1 text-xs">
                        {orders.filter(o => o.customer.toLowerCase() === selectedCustomer.name.toLowerCase()).length === 0 ? (
                          <p className="text-[11px] text-neutral-400 italic">No checkout orders registered yet.</p>
                        ) : (
                          orders.filter(o => o.customer.toLowerCase() === selectedCustomer.name.toLowerCase()).map(order => (
                            <div key={order.id} className="p-2 border border-neutral-150/65 rounded-lg flex justify-between items-center bg-white shadow-sm hover:border-amber-500/30 transition-colors">
                              <div>
                                <span className="font-mono font-bold text-amber-600">{order.id}</span>
                                <p className="text-[10px] text-neutral-400 font-mono">{order.date}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-bold text-neutral-800">₵{order.total.toFixed(2)}</div>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black capitalize ${
                                  order.status === 'completed' ? 'bg-green-50 border border-green-200 text-green-600' :
                                  'bg-amber-50 border border-amber-200 text-amber-600'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Locations Summary */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider font-sans border-b border-neutral-100 pb-1.5 flex justify-between items-center">
                        <span>Delivery Addresses</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md font-bold">
                          {locations.filter(l => l.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()).length}
                        </span>
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 text-[11px] text-neutral-600">
                        {locations.filter(l => l.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()).length === 0 ? (
                          <p className="text-[11px] text-neutral-400 italic">No logistics addresses mapped.</p>
                        ) : (
                          locations.filter(l => l.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()).map(loc => (
                            <div key={loc.id} className="p-2 border border-neutral-150/50 rounded-lg flex gap-2 items-start bg-neutral-50/50">
                              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-neutral-800">{loc.address}</p>
                                <p className="font-mono text-[9px] text-neutral-400">({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Activity Logs Summary */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider font-sans border-b border-neutral-100 pb-1.5 flex justify-between items-center">
                        <span>Recent Activity Events</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md font-bold">
                          {activityLogs.filter(log => log.username.toLowerCase() === selectedCustomer.name.toLowerCase()).length}
                        </span>
                      </h4>
                      <div className="max-h-36 overflow-y-auto space-y-2 pr-1 text-xs">
                        {activityLogs.filter(log => log.username.toLowerCase() === selectedCustomer.name.toLowerCase()).length === 0 ? (
                          <p className="text-[11px] text-neutral-400 italic">No activity tracks registered.</p>
                        ) : (
                          activityLogs.filter(log => log.username.toLowerCase() === selectedCustomer.name.toLowerCase()).slice(0, 10).map((log, idx) => (
                            <div key={idx} className="p-2 border border-neutral-100 rounded-lg bg-neutral-50/40 text-[11px]">
                              <p className="font-medium text-neutral-800">{log.description}</p>
                              <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-1 font-mono">
                                <span className="capitalize text-amber-600 font-bold">{log.type}</span>
                                <span>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Data Extraction Action button */}
                    <div className="pt-2 border-t border-neutral-150">
                      <button
                        onClick={() => {
                          const custOrders = orders.filter(o => o.customer.toLowerCase() === selectedCustomer.name.toLowerCase());
                          const custPayments = payments.filter(p => p.customer.toLowerCase() === selectedCustomer.name.toLowerCase());
                          const custLocations = locations.filter(l => l.customerName.toLowerCase() === selectedCustomer.name.toLowerCase());
                          const custLogs = activityLogs.filter(log => log.username.toLowerCase() === selectedCustomer.name.toLowerCase());

                          const dossier = {
                            customer: selectedCustomer,
                            orders: custOrders,
                            payments: custPayments,
                            locations: custLocations,
                            activityLogs: custLogs,
                            extractedAt: new Date().toISOString()
                          };

                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dossier, null, 2));
                          const downloadAnchor = document.createElement('a');
                          downloadAnchor.setAttribute("href", dataStr);
                          downloadAnchor.setAttribute("download", `EllaStore_Dossier_${selectedCustomer.name.replace(/\s+/g, '_')}.json`);
                          document.body.appendChild(downloadAnchor);
                          downloadAnchor.click();
                          downloadAnchor.remove();

                          onShowToast("Dossier Extracted", `Fully structured profile data for ${selectedCustomer.name} exported successfully.`, "success");
                          onLogActivity(`Exported CRM customer profile dossier for: ${selectedCustomer.name}`, "admin_action");
                        }}
                        className="w-full bg-neutral-900 hover:bg-amber-500 text-white hover:text-neutral-900 py-3 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Extract User Dossier (JSON)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Payments Tracking */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Payment Logs and Invoicing</h2>
                  <p className="text-xs text-neutral-500">Live operational ledger logs for checking and verifying MTN Mobile Money transactions.</p>
                </div>
                <PageToggleBtn />
              </div>

              {/* Payments Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Aggregate Cash Routed", val: `₵${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`, type: 'momo' },
                  { label: "MTN Mobile Money Transactions", val: payments.filter(p=>p.method==='momo').length, type: 'momo' },
                  { label: "Cash Delivery Receipts", val: payments.filter(p=>p.method==='cash').length, type: 'cash' },
                  { label: "Standard Card Receipts", val: payments.filter(p=>p.method==='card').length, type: 'card' },
                ].map((st, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">{st.label}</span>
                      <h4 className="text-xl font-mono font-black text-neutral-900">{st.val}</h4>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-950 text-white font-serif uppercase tracking-wider">
                        <th className="p-4 border-b border-neutral-800">Transaction ID</th>
                        <th className="p-4 border-b border-neutral-800">Order ID</th>
                        <th className="p-4 border-b border-neutral-800">Customer Name</th>
                        <th className="p-4 border-b border-neutral-800">Payment Gateway</th>
                        <th className="p-4 border-b border-neutral-800">Amount Sent</th>
                        <th className="p-4 border-b border-neutral-800">Verification Date</th>
                        <th className="p-4 border-b border-neutral-800">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {payments.map(pay => (
                        <tr key={pay.id} className="hover:bg-neutral-50/50">
                          <td className="p-4 font-mono font-semibold text-neutral-500">{pay.id}</td>
                          <td className="p-4 font-mono font-bold text-amber-600">{pay.orderId}</td>
                          <td className="p-4 font-bold text-neutral-800">{pay.customer}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide capitalize ${
                              pay.method === 'momo' ? 'bg-amber-100 text-amber-800' :
                              pay.method === 'cash' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {pay.method === 'momo' ? 'MTN MoMo Gateway' : pay.method}
                            </span>
                          </td>
                          <td className="p-4 font-black font-mono text-neutral-900">₵{pay.amount.toFixed(2)}</td>
                          <td className="p-4 font-medium text-neutral-400">{pay.date}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 capitalize">
                              {pay.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Locations Logistics */}
          {activeTab === "locations" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Logistics Location Coordinates</h2>
                  <p className="text-xs text-neutral-500">Configure logistics mapping, pins, and delivery coordinates for couriers.</p>
                </div>
                <PageToggleBtn />
              </div>

              {/* Delivery Coordinates Map */}
              <CustomerLiveMap 
                locations={locations} 
                onShowToast={onShowToast} 
              />

              {/* Coordinates Forms */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to add */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm space-y-4 h-fit">
                  <h3 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-2">Add Delivery Coordinates</h3>
                  
                  <form onSubmit={handleAddLocation} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 block">Select Customer Profile</label>
                      <select
                        value={locCustomerId}
                        onChange={e => setLocCustomerId(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white"
                        required
                      >
                        <option value="">Select CRM User</option>
                        {customers.filter(c => c.signedUp).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 block">Delivery Address Details</label>
                      <input
                        type="text"
                        value={locAddress}
                        onChange={e => setLocAddress(e.target.value)}
                        placeholder="e.g. Lapaz Near market"
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600 block">Latitude</label>
                        <input
                          type="text"
                          value={locLat}
                          onChange={e => setLocLat(e.target.value)}
                          placeholder="e.g. 5.6037"
                          className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600 block">Longitude</label>
                        <input
                          type="text"
                          value={locLng}
                          onChange={e => setLocLng(e.target.value)}
                          placeholder="e.g. -0.2270"
                          className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-neutral-950 text-white hover:bg-amber-500 hover:text-neutral-900 py-3 rounded-xl text-xs font-bold tracking-wider transition-colors shadow"
                    >
                      Save Location
                    </button>
                  </form>
                </div>

                {/* List registered */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-serif text-lg text-neutral-900">Fulfillment Shipping Coordinates</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {locations.map(loc => (
                      <div key={loc.id} className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm space-y-3 relative group hover:border-amber-500/50 transition-colors">
                        <button
                          onClick={() => handleDeleteLocation(loc.id, loc.customerName)}
                          className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-amber-600 uppercase font-mono tracking-wider">CRM Profile ID: {loc.customerId}</span>
                          <h4 className="font-bold text-neutral-800 text-sm">{loc.customerName}</h4>
                          <p className="text-xs text-neutral-500">{loc.address}</p>
                        </div>

                        <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-[10px] font-mono text-neutral-500">
                          <span>Lat: {loc.lat}</span>
                          <span>Lng: {loc.lng}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Customer Inquiries */}
          {activeTab === "inquiries" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Customer Consultation Inquiries</h2>
                  <p className="text-xs text-neutral-500">Operational inbox responding to style advice, alterations, and custom garment inquiries.</p>
                </div>
                <PageToggleBtn />
              </div>

              <div className="space-y-4">
                {inquiries.map(inq => (
                  <div key={inq.id} className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm space-y-4 relative group hover:border-amber-500/40 transition-colors">
                    <button
                      onClick={() => handleDeleteInquiry(inq.id)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex justify-between items-start flex-wrap gap-4 border-b border-neutral-100 pb-3">
                      <div>
                        <h4 className="font-serif text-base text-neutral-850 flex items-center gap-1.5 font-semibold">
                          {inq.customerName} 
                          <span className="text-xs font-sans text-neutral-400 font-normal">via {inq.service} Desk</span>
                        </h4>
                        <p className="text-xs text-neutral-500">{inq.customerEmail} &bull; {inq.customerPhone} &bull; Received on {inq.date}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide capitalize ${
                        inq.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        inq.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {inq.status.replace('-', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed font-serif italic">"{inq.message}"</p>

                    <div className="flex gap-2 pt-1.5 text-xs">
                      {inq.status !== 'resolved' && (
                        <button
                          onClick={() => handleInquiryStatus(inq.id, 'resolved')}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] tracking-wide"
                        >
                          Mark as Resolved
                        </button>
                      )}
                      {inq.status === 'new' && (
                        <button
                          onClick={() => handleInquiryStatus(inq.id, 'in-progress')}
                          className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] tracking-wide"
                        >
                          Mark In Progress
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: Granular User Activity Logs */}
          {activeTab === "activities" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">User Activity & Operational Analytics</h2>
                  <p className="text-xs text-neutral-500">Live operational auditing and interaction tracking for Ella's Store.</p>
                </div>
                
                <div className="flex gap-3 items-center flex-wrap ml-auto">
                  <PageToggleBtn />
                  <button
                    onClick={exportActivityLogs}
                    className="bg-amber-500 text-neutral-900 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export JSON
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Reset auditing log history database?")) {
                        onSetActivityLogs([]);
                        onShowToast("Audit logs cleared", "Reset active metrics tracking databases.", "info");
                      }
                    }}
                    className="bg-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md"
                  >
                    Clear Audit Logs
                  </button>
                </div>
              </div>

              {/* Filters toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-sm flex flex-col md:flex-row gap-3.5 items-center">
                <select
                  value={activityFilter}
                  onChange={e => setActivityFilter(e.target.value)}
                  className="px-4 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white min-w-[150px]"
                >
                  <option value="all">All Interaction Types</option>
                  <option value="login">Profile Logins</option>
                  <option value="cart_addition">Cart Additions</option>
                  <option value="purchase">Orders/Purchases</option>
                  <option value="product_view">Visual Views</option>
                  <option value="inquiry">Consultation Inquiry</option>
                  <option value="admin_action">Admin Dashboard Actions</option>
                </select>

                <div className="flex-1 relative w-full">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={e => setActivitySearch(e.target.value)}
                    placeholder="Search session logs by username, IP address or action description..."
                    className="w-full pl-11 pr-4 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Activity Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-neutral-900 text-white p-5 rounded-2xl border border-neutral-800 shadow flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Auditing System Active</span>
                  <div className="my-2.5">
                    <h3 className="text-xl font-bold font-mono text-white">{activityLogs.length} total</h3>
                    <p className="text-[10px] text-neutral-400">Interaction records logged</p>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-400">Database fully synced</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Most Active Session</span>
                  <div className="my-2.5">
                    <h3 className="text-lg font-bold text-neutral-850 truncate">{activityStats.mostActiveUser}</h3>
                    <p className="text-[10px] text-neutral-400">Lifetime user activity stats</p>
                  </div>
                  <span className="text-[10px] text-amber-600 font-bold font-mono uppercase">{activityStats.mostActiveCount} actions recorded</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Peak Action Hour</span>
                  <div className="my-2.5">
                    <h3 className="text-lg font-bold text-neutral-850">{activityStats.peakHour}</h3>
                    <p className="text-[10px] text-neutral-400">Highest system interaction density</p>
                  </div>
                  <span className="text-[10px] text-amber-600 font-bold font-mono uppercase">{activityStats.peakHourCount} records grouped</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Primary Action Group</span>
                  <div className="my-2.5">
                    <h3 className="text-lg font-bold text-neutral-850 capitalize">{activityStats.topType}</h3>
                    <p className="text-[10px] text-neutral-400">Most frequent interaction</p>
                  </div>
                  <span className="text-[10px] text-amber-600 font-bold font-mono uppercase">{activityStats.topTypePercent}% of system metrics</span>
                </div>
              </div>

              {/* Graphical representation (Simple visual grid representing 24-hr bars) */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm space-y-4">
                <h3 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-amber-500" />
                  Interaction density timelines (Hourly heatmap)
                </h3>
                <div className="flex h-16 items-end gap-1.5 bg-neutral-50 p-3.5 border border-neutral-150 rounded-xl">
                  {activityStats.hourCounts.map((count, hr) => {
                    const maxVal = Math.max(...activityStats.hourCounts) || 1;
                    const fillPct = (count / maxVal) * 100;
                    return (
                      <div 
                        key={hr} 
                        className="flex-1 bg-amber-500 rounded-t hover:bg-neutral-950 transition-colors cursor-pointer relative group" 
                        style={{ height: `${Math.max(4, fillPct)}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono whitespace-nowrap z-10">
                          {hr}:00 - {count} records
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neutral-400 uppercase tracking-wider pt-1.5 px-1">
                  <span>12:00 AM</span>
                  <span>6:00 AM</span>
                  <span>12:00 PM</span>
                  <span>6:00 PM</span>
                  <span>11:59 PM</span>
                </div>
              </div>

              {/* Double Panel Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6.5">
                
                {/* Leaderboards */}
                <div className="space-y-4 lg:col-span-1">
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm space-y-4">
                    <h4 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-1.5 font-bold">Top Users by Density</h4>
                    <div className="space-y-2">
                      {activityStats.userCounts.map(([user, count], index) => (
                        <div key={user} className="flex justify-between items-center text-xs p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                          <span className="font-semibold text-neutral-700">{index + 1}. {user}</span>
                          <span className="font-bold text-amber-600 font-mono">{count} clicks</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm space-y-4">
                    <h4 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-1.5 font-bold">Hourly Activity Heatmap</h4>
                    <div className="grid grid-cols-6 gap-2 pt-1">
                      {activityStats.hourCounts.map((count, idx) => {
                        const densityMax = Math.max(...activityStats.hourCounts) || 1;
                        const opacity = count > 0 ? (count / densityMax) : 0.05;
                        return (
                          <div 
                            key={idx} 
                            style={{ backgroundColor: `rgba(212, 175, 55, ${opacity})` }}
                            className="aspect-square rounded flex items-center justify-center font-mono font-black text-[9px] cursor-pointer hover:border hover:border-amber-500 select-none text-neutral-800"
                            title={`${idx}:00 - ${count} activities`}
                          >
                            {idx}h
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Audit Grid Table list */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
                  <header className="bg-neutral-950 text-white p-4.5 font-serif text-sm uppercase tracking-wider flex justify-between">
                    <span>Granular Auditing Tracker Logs</span>
                    <span className="font-mono text-xs">{filteredLogs.length} matching</span>
                  </header>
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-neutral-900 text-white font-mono text-[10px] uppercase">
                          <th className="p-3 border-b border-neutral-800">Timestamp</th>
                          <th className="p-3 border-b border-neutral-800">Username</th>
                          <th className="p-3 border-b border-neutral-800">Interaction</th>
                          <th className="p-3 border-b border-neutral-800">Operational Log Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-mono text-[11px] text-neutral-600">
                        {filteredLogs.map(log => (
                          <tr key={log.id} className="hover:bg-neutral-50/50">
                            <td className="p-3 whitespace-nowrap text-neutral-400">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="p-3 font-semibold text-neutral-800">{log.username}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wide uppercase ${
                                log.type === 'purchase' ? 'bg-green-150 text-green-700' :
                                log.type === 'cart_addition' ? 'bg-blue-150 text-blue-700' :
                                'bg-neutral-200 text-neutral-700'
                              }`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="p-3 text-neutral-550 max-w-sm truncate" title={log.description}>{log.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: Discount Coupons */}
          {activeTab === "discounts" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Operational Discount Campaigns</h2>
                  <p className="text-xs text-neutral-500">Inject discount coupon codes with minimum values, expirations, and budget rules.</p>
                </div>
                <PageToggleBtn />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form panels */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm space-y-4 h-fit">
                  <h3 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-2">Generate Promo Coupon</h3>
                  
                  <form onSubmit={handleAddDiscount} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 block">Promo Code String</label>
                      <input
                        type="text"
                        value={discCode}
                        onChange={e => setDiscCode(e.target.value)}
                        placeholder="e.g. WELCOME10"
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 uppercase"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 block">Deduction Method</label>
                      <select
                        value={discType}
                        onChange={e => setDiscType(e.target.value as any)}
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white"
                        required
                      >
                        <option value="percentage">Percentage Deduction (%)</option>
                        <option value="fixed">Fixed Deduction Amount (₵)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 block">Deduction Value</label>
                      <input
                        type="number"
                        value={discValue}
                        onChange={e => setDiscValue(e.target.value)}
                        placeholder="Percentage or absolute cash value"
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 block">Minimum Order Subtotal (₵)</label>
                      <input
                        type="number"
                        value={discMin}
                        onChange={e => setDiscMin(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 block">Expiry Date</label>
                      <input
                        type="date"
                        value={discExpiry}
                        onChange={e => setDiscExpiry(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 block">Global Usage Limit (Times)</label>
                      <input
                        type="number"
                        value={discUsage}
                        onChange={e => setDiscUsage(e.target.value)}
                        placeholder="Leave blank for infinite"
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-neutral-950 text-white hover:bg-amber-500 hover:text-neutral-900 py-3 rounded-xl text-xs font-bold tracking-wider transition-colors shadow"
                    >
                      Publish Promo Code
                    </button>
                  </form>
                </div>

                {/* List Coupons */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-serif text-lg text-neutral-900">Active Campaign Coupons</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {discountCodes.map(disc => (
                      <div key={disc.id} className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm relative group hover:border-amber-500/50 transition-colors flex flex-col justify-between">
                        <button
                          onClick={() => handleDeleteDiscount(disc.id, disc.code)}
                          className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-2">
                          <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-lg font-bold font-mono tracking-widest uppercase inline-block">
                            {disc.code}
                          </span>

                          <div className="space-y-1 font-serif text-xs text-neutral-500 pt-2 border-t border-dashed border-neutral-100">
                            <p><strong>Deduction Rate:</strong> {disc.type === 'percentage' ? `${disc.value}% off` : `₵${disc.value} cash reduction`}</p>
                            <p><strong>Min subtotal requirement:</strong> ₵{disc.minAmount || 0}</p>
                            <p><strong>Campaign expiry limit:</strong> {disc.expiry || "Continuous campaigns"}</p>
                            <p><strong>Usage quota:</strong> {disc.usedCount} total deductions</p>
                          </div>
                        </div>

                        <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-4">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Active promo code</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: Campaign Messaging */}
          {activeTab === "messaging" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Broadcast Message Campaigns</h2>
                  <p className="text-xs text-neutral-500">Draft and send direct broadcast alerts or newsletters to client CRM profiles.</p>
                </div>
                <PageToggleBtn />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Campaigns Form */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm h-fit space-y-4">
                  <h3 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-2">Draft Campaign alert</h3>

                  <form onSubmit={handleSendMessageCampaign} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block">Campaign Title</label>
                      <input
                        type="text"
                        value={msgTitle}
                        onChange={e => setMsgTitle(e.target.value)}
                        placeholder="e.g. Summer Traditional designs out!"
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block">Audience Targeting</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                          <input
                            type="radio"
                            checked={msgSendToAll}
                            onChange={() => setMsgSendToAll(true)}
                            className="accent-amber-500"
                          />
                          <span>All CRM profiles</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                          <input
                            type="radio"
                            checked={!msgSendToAll}
                            onChange={() => setMsgSendToAll(false)}
                            className="accent-amber-500"
                          />
                          <span>Selected Profiles</span>
                        </label>
                      </div>
                    </div>

                    {!msgSendToAll && (
                      <div className="space-y-2 border border-neutral-200 p-3 rounded-xl max-h-36 overflow-y-auto">
                        {customers.filter(c=>c.signedUp).map(c => (
                          <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-neutral-50 p-1.5 rounded">
                            <input
                              type="checkbox"
                              checked={msgSelectedCustomerIds.includes(c.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setMsgSelectedCustomerIds([...msgSelectedCustomerIds, c.id]);
                                } else {
                                  setMsgSelectedCustomerIds(msgSelectedCustomerIds.filter(id => id !== c.id));
                                }
                              }}
                              className="accent-amber-500"
                            />
                            <span>{c.name} ({c.phone})</span>
                          </label>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block">Message Body Content</label>
                      <textarea
                        value={msgContent}
                        onChange={e => setMsgContent(e.target.value)}
                        placeholder="Draft your promotional newsletter body here..."
                        rows={4}
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-neutral-950 text-white hover:bg-amber-500 hover:text-neutral-900 py-3 rounded-xl text-xs font-bold tracking-wider transition-colors shadow"
                    >
                      Dispatch Broadcast campaign
                    </button>
                  </form>
                </div>

                {/* Dispatch Archive */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-serif text-lg text-neutral-900">Campaign Dispatch Archive</h3>

                  <div className="space-y-4">
                    {adminMessages.map(msg => (
                      <div key={msg.id} className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm space-y-3 relative">
                        <div className="flex justify-between items-start border-b border-neutral-100 pb-2">
                          <div>
                            <h4 className="font-bold text-neutral-800 text-sm">{msg.title}</h4>
                            <p className="text-[10px] text-neutral-400">Broadcasted on {msg.date} by {msg.sentBy}</p>
                          </div>
                          <span className="text-[10px] bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Recipient: {msg.recipients}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed italic">"{msg.content}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: Media Assets Manager */}
          {activeTab === "media" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Catalogs Media Manager</h2>
                  <p className="text-xs text-neutral-500">Add digital catalogs, visual brochures, evening gown portfolios, or video clips.</p>
                </div>
                <PageToggleBtn />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Forms */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-sm h-fit space-y-4">
                  <h3 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-2">Upload Asset</h3>

                  <form onSubmit={handleUploadMedia} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block">Asset Type</label>
                      <select
                        value={mediaType}
                        onChange={e => setMediaType(e.target.value as any)}
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white"
                      >
                        <option value="image">Portfolio Image</option>
                        <option value="video">Promotional Video</option>
                        <option value="audio">Runway Audio/Track</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block">Asset Title</label>
                      <input
                        type="text"
                        value={mediaTitle}
                        onChange={e => setMediaTitle(e.target.value)}
                        placeholder="e.g. Evening gowns brochure"
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block">Short Description</label>
                      <textarea
                        value={mediaDesc}
                        onChange={e => setMediaDescription(e.target.value)}
                        placeholder="e.g. Traditional designs, premium silk..."
                        rows={2.5}
                        className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-600 block font-serif">Attach File Asset</label>
                      <div className="border-2 border-dashed border-neutral-250 p-6 rounded-2xl text-center hover:border-amber-500 transition-colors relative cursor-pointer group bg-neutral-50/50">
                        <input 
                          type="file" 
                          accept="image/*,video/*,audio/*" 
                          onChange={e => handleImageUpload(e, setMediaUrl)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <ImageIcon className="w-8 h-8 mx-auto text-neutral-400 group-hover:text-amber-500 transition-colors mb-2" />
                        <p className="text-xs text-neutral-600 font-medium">Click to select asset file (Base64 conversion)</p>
                        {mediaUrl && (
                          <p className="text-[10px] text-green-600 mt-2 font-bold">✓ Media asset attached securely</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-neutral-950 text-white hover:bg-amber-500 hover:text-neutral-900 py-3 rounded-xl text-xs font-bold tracking-wider transition-colors shadow"
                    >
                      Save Catalog Asset
                    </button>
                  </form>
                </div>

                {/* List registered */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-serif text-lg text-neutral-900 font-medium">Archived Media Catalogs</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {mediaFiles.map(media => (
                      <div key={media.id} className="bg-white p-4.5 rounded-2xl border border-neutral-200/60 shadow-sm relative group hover:border-amber-500/50 transition-colors flex flex-col justify-between">
                        <button
                          onClick={() => handleDeleteMedia(media.id, media.title)}
                          className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-2">
                          <div className="aspect-video bg-neutral-100 rounded-xl border border-neutral-150 overflow-hidden relative">
                            {media.type === 'image' && (
                              <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                            )}
                            {media.type !== 'image' && (
                              <div className="w-full h-full flex items-center justify-center text-amber-500">
                                <Activity className="w-10 h-10" />
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            <h4 className="font-bold text-neutral-800 text-xs">{media.title}</h4>
                            <p className="text-[10px] text-neutral-400 line-clamp-2 mt-1">{media.description}</p>
                          </div>
                        </div>

                        <span className="text-[9px] font-mono text-neutral-400 mt-4 block">Uploaded {media.uploadDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: Homepage Design */}
          {activeTab === "customize" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Visual Homepage Architect</h2>
                  <p className="text-xs text-neutral-500">Customize the design colors, spacing, backgrounds, and layout of the customer store page.</p>
                </div>
                <PageToggleBtn />
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm max-w-3xl space-y-6">
                
                {/* 1. Hero Background */}
                <div className="space-y-2">
                  <h3 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-1.5">1. Hero Section Canvas Image</h3>
                  <div className="border-2 border-dashed border-neutral-250 p-6 rounded-2xl text-center hover:border-amber-500 transition-colors relative cursor-pointer group bg-neutral-50/50">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleImageUpload(e, setHomeHeroBg)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <ImageIcon className="w-8 h-8 mx-auto text-neutral-400 group-hover:text-amber-500 transition-colors mb-2" />
                    <p className="text-xs text-neutral-600 font-medium">Click to select new high-resolution hero background image</p>
                    {homeHeroBg && (
                      <div className="mt-4 max-w-xs mx-auto">
                        <img src={homeHeroBg} alt="Base64 preview" className="rounded-xl border border-neutral-200 shadow-sm max-h-32 object-cover mx-auto" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Grid Style Arrangement */}
                <div className="space-y-3">
                  <h3 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-1.5">2. Catalog Layout Alignment</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: "grid", label: "Responsive Grid" },
                      { id: "list", label: "Compact Rows" },
                      { id: "carousel", label: "Slider Carousel" },
                      { id: "masonry", label: "Flowing Masonry" },
                    ].map(lay => (
                      <button
                        key={lay.id}
                        type="button"
                        onClick={() => setHomeLayout(lay.id as any)}
                        className={`p-4 rounded-xl border text-xs font-bold transition-all duration-300 ${
                          homeLayout === lay.id
                            ? "bg-amber-100 border-amber-500 text-amber-950 font-black shadow-inner shadow-amber-200"
                            : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600"
                        }`}
                      >
                        {lay.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Colors Schema */}
                <div className="space-y-3">
                  <h3 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-1.5">3. Accent Palette Palette</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 block">Primary Brand Color (Gold/Accent)</label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={homePrimary}
                          onChange={e => setHomePrimary(e.target.value)}
                          className="w-12 h-10 border border-neutral-200 rounded-xl cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          value={homePrimary}
                          onChange={e => setHomePrimary(e.target.value)}
                          className="flex-1 px-4 py-2 border border-neutral-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600 block">Secondary Dark Canvas Color</label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={homeSecondary}
                          onChange={e => setHomeSecondary(e.target.value)}
                          className="w-12 h-10 border border-neutral-200 rounded-xl cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          value={homeSecondary}
                          onChange={e => setHomeSecondary(e.target.value)}
                          className="flex-1 px-4 py-2 border border-neutral-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. MTN Mobile Money Gateway Setup */}
                <div className="space-y-4 pt-2 border-t border-neutral-100">
                  <h3 className="font-serif text-base text-neutral-900 pb-1.5 flex items-center gap-1.5 border-b border-neutral-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                    4. MTN Mobile Money Gateway Setup
                  </h3>

                  <div className="space-y-4">
                    {/* Gateway status */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-800">Gateway Online Status</h4>
                        <p className="text-[10px] text-neutral-400">Toggle whether customers can checkout using the MTN MoMo payment option.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMomoEnabled(!momoEnabled)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                          momoEnabled 
                            ? "bg-green-100 text-green-700 border border-green-200" 
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {momoEnabled ? "● ACTIVE & ONLINE" : "○ OFFLINE / MAINT."}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Merchant Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600 block">Registered Merchant Name</label>
                        <input
                          type="text"
                          value={momoMerchantName}
                          onChange={e => setMomoMerchantName(e.target.value)}
                          placeholder="e.g. ELLA'S FASHION SHOWROOM"
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Merchant Number */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600 block">MTN Wallet / Merchant Number</label>
                        <input
                          type="tel"
                          value={momoMerchantNumber}
                          onChange={e => setMomoMerchantNumber(e.target.value)}
                          placeholder="e.g. 0244123456"
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* MoMo Charge Rate */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600 block">Gateway Surcharge Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={momoChargeRate}
                          onChange={e => setMomoChargeRate(Number(e.target.value))}
                          placeholder="e.g. 0.5"
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save actions */}
                <div className="pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={handleSaveHomepageCustomization}
                    className="bg-amber-500 hover:bg-amber-600 text-neutral-900 px-6 py-3 rounded-xl text-xs font-black tracking-wider transition-all shadow"
                  >
                    Commit Theme Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: Store Events Scheduler */}
          {activeTab === "events" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Boutique Events Scheduler</h2>
                  <p className="text-xs text-neutral-500">Create and display promotional showcase dates, Ankara exhibitions, and catalog pop-up sales.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="bg-neutral-900 hover:bg-neutral-850 text-white px-4 py-2 rounded-xl text-xs font-black tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-500" />
                    {showEventForm ? "Hide Form" : "Create Event Listing"}
                  </button>
                  <PageToggleBtn />
                </div>
              </div>

              {showEventForm && (
                <form onSubmit={handleAddEvent} className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm max-w-2xl space-y-4">
                  <h3 className="font-serif text-base text-neutral-900 border-b border-neutral-100 pb-2">Publish a Store Event</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Event Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ella's Ankara Design Showcase"
                        value={eventTitle}
                        onChange={e => setEventTitle(e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Event Status *</label>
                      <select
                        value={eventStatus}
                        onChange={e => setEventStatus(e.target.value as any)}
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing (Happening Now)</option>
                        <option value="past">Past / Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Short Description</label>
                    <textarea
                      placeholder="Give a compelling preview of this boutique event, show times, custom styling, or special MoMo discounts..."
                      value={eventDesc}
                      onChange={e => setEventDesc(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Event Date *</label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={e => setEventDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Event Time (Optional)</label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={e => setEventTime(e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Location / Venue *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lapaz Showroom, Accra"
                        value={eventLocation}
                        onChange={e => setEventLocation(e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-600 block">Banner Image / Showcase Cover</label>
                    <div className="border-2 border-dashed border-neutral-250 p-5 rounded-2xl text-center hover:border-amber-500 transition-colors relative cursor-pointer group bg-neutral-50/50">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleImageUpload(e, setEventImageUrl)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <ImageIcon className="w-6 h-6 mx-auto text-neutral-400 group-hover:text-amber-500 transition-colors mb-2" />
                      <p className="text-xs text-neutral-600 font-medium">Click to select new cover or design banner image</p>
                      {eventImageUrl && (
                        <div className="mt-3 max-w-xs mx-auto">
                          <img src={eventImageUrl} alt="Banner preview" className="rounded-xl border border-neutral-200 shadow-sm max-h-24 object-cover mx-auto" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEventForm(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-neutral-900 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all shadow"
                    >
                      Publish Live Event
                    </button>
                  </div>
                </form>
              )}

              {/* Events Grid list */}
              <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400">
                    <Calendar className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
                    <p className="text-sm font-medium">No store events scheduled currently.</p>
                    <p className="text-xs">Publish your first design pop-up or Ankara runway launch above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.map(evt => (
                      <div key={evt.id} className="border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-neutral-50/30 flex flex-col justify-between">
                        <div>
                          {/* Event Image Banner */}
                          <div className="relative h-40 bg-neutral-100 overflow-hidden">
                            <img 
                              src={evt.imageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"} 
                              alt={evt.title} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border shadow ${
                                evt.status === 'upcoming' ? 'bg-green-100 text-green-700 border-green-200' :
                                evt.status === 'ongoing' ? 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse' :
                                'bg-neutral-200 text-neutral-600 border-neutral-300'
                              }`}>
                                {evt.status}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-2">
                            <h4 className="font-serif text-base text-neutral-900 font-bold tracking-tight">{evt.title}</h4>
                            <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{evt.description}</p>
                            
                            <div className="space-y-1.5 pt-2 text-[11px] text-neutral-500 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                <span>{evt.date} {evt.time ? `at ${evt.time}` : ""}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-neutral-100 p-4 bg-white flex justify-end">
                          <button
                            onClick={() => handleDeleteEvent(evt.id, evt.title)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-xl border border-red-100 hover:border-red-200 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Listing
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 14: Customer Reviews and Requests */}
          {activeTab === "reviews" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Customer Reviews & Requests</h2>
                  <p className="text-xs text-neutral-500">View and tally ratings, testimonials, and customized tailoring requests left by visitors.</p>
                </div>
                <div className="flex items-center gap-2">
                  <PageToggleBtn />
                </div>
              </div>

              {/* Tallying & Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Metric 1: Average Rating */}
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm space-y-1 text-center">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Average Score</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-serif text-3xl font-black text-amber-500">
                      {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                    </span>
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <p className="text-[10px] text-neutral-500">Based on {reviews.length} customer reviews</p>
                </div>

                {/* Metric 2: Ratings Tally bar charts */}
                <div className="bg-white border border-neutral-200 p-4.5 rounded-2xl shadow-sm md:col-span-2 space-y-2">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Rating Distribution Tally</p>
                  <div className="space-y-1.5">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = reviews.filter(r => r.rating === stars).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3 text-xs">
                          <span className="w-12 font-mono font-bold text-neutral-600 flex items-center gap-1">
                            {stars} <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          </span>
                          <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="w-8 text-right font-mono font-bold text-neutral-700">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Metric 3: Feature / Design Requests */}
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-center space-y-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Garment Requests</p>
                  <span className="font-sans text-3xl font-black text-indigo-600">
                    {reviews.filter(r => r.request && r.request.trim() !== "").length}
                  </span>
                  <p className="text-[10px] text-neutral-500">Custom styling requests lodged</p>
                </div>
              </div>

              {/* Reviews List and Search */}
              <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="font-serif text-lg text-neutral-900 font-bold">Feedback Activity Log</h3>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search reviews & requests..."
                      value={reviewSearch}
                      onChange={e => setReviewSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-16 text-neutral-400">
                    <Star className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
                    <p className="text-sm font-medium">No reviews received yet.</p>
                    <p className="text-xs">Ratings & requests will populate here as clients leave site reviews.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews
                      .filter(rev => {
                        const q = reviewSearch.toLowerCase();
                        return (
                          rev.customerName.toLowerCase().includes(q) ||
                          rev.customerEmail.toLowerCase().includes(q) ||
                          rev.feedback.toLowerCase().includes(q) ||
                          rev.request.toLowerCase().includes(q)
                        );
                      })
                      .map(rev => (
                        <div key={rev.id} className="border border-neutral-150/60 rounded-2xl p-5 bg-neutral-50/20 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-extrabold text-neutral-900">{rev.customerName}</h4>
                                <span className="text-[10px] text-neutral-400 font-bold block">{rev.customerEmail || "No Email Provided"}</span>
                              </div>
                              <span className="text-[10px] text-neutral-400 font-mono font-medium">{rev.date}</span>
                            </div>

                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(st => (
                                <Star 
                                  key={st} 
                                  className={`w-4 h-4 ${st <= rev.rating ? "fill-amber-500 text-amber-500" : "text-neutral-200"}`} 
                                />
                              ))}
                            </div>

                            <div className="space-y-1.5">
                              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Feedback</p>
                              <p className="text-xs text-neutral-700 font-medium leading-relaxed bg-white border border-neutral-100 p-3 rounded-xl">
                                {rev.feedback}
                              </p>
                            </div>

                            {rev.request && rev.request.trim() !== "" && (
                              <div className="space-y-1.5 pt-1">
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                  <span>✦</span> Special Request
                                </p>
                                <p className="text-xs text-indigo-900 font-semibold leading-relaxed bg-indigo-50/50 border border-indigo-100/45 p-3 rounded-xl italic">
                                  "{rev.request}"
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-neutral-100 pt-3 flex justify-end">
                            <button
                              onClick={() => {
                                if (onDeleteReview) {
                                  onDeleteReview(rev.id);
                                  onShowToast("Review Deleted", `Successfully removed review from ${rev.customerName}.`, "success");
                                  onLogActivity(`Deleted review from ${rev.customerName}`, "admin_action");
                                }
                              }}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-xl border border-red-100 hover:border-red-200 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove Activity
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 15: Delivery Tracker */}
          {activeTab === "delivery" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-neutral-250 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 font-medium">Boutique Delivery Logistics</h2>
                  <p className="text-xs text-neutral-500">Track and dispatch customer shipments, manage riders, and send real-time delivery alerts.</p>
                </div>
                <button
                  onClick={() => setShowCreateDeliveryForm(!showCreateDeliveryForm)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md hover:shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {showCreateDeliveryForm ? "Hide Logistics Dispatch Form" : "Dispatch New Shipment"}
                </button>
              </div>

              {/* Delivery KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Total Tracked</span>
                    <span className="text-2xl font-serif font-bold text-neutral-900">{deliveries?.length || 0}</span>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center animate-pulse">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">En Route Shipments</span>
                    <span className="text-2xl font-serif font-bold text-neutral-900">
                      {deliveries?.filter(d => d.status === 'dispatched' || d.status === 'in_transit' || d.status === 'ordered').length || 0}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Completed Deliveries</span>
                    <span className="text-2xl font-serif font-bold text-neutral-900">
                      {deliveries?.filter(d => d.status === 'delivered').length || 0}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Failed / Exceptions</span>
                    <span className="text-2xl font-serif font-bold text-neutral-900">
                      {deliveries?.filter(d => d.status === 'failed').length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* DISPATCH NEW SHIPMENT FORM */}
              {showCreateDeliveryForm && (
                <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-md space-y-6 animate-in slide-in-from-top duration-300">
                  <div className="border-b border-neutral-100 pb-3">
                    <h3 className="font-serif text-lg text-neutral-900 font-semibold">Initiate Logistics Delivery Tracker</h3>
                    <p className="text-xs text-neutral-500">Select an unfulfilled customer order to automatically pre-populate contact details and items.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Order selector */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-2">Select Customer Order</label>
                      <select
                        value={newDeliveryOrderId}
                        onChange={(e) => {
                          const orderId = e.target.value;
                          setNewDeliveryOrderId(orderId);
                          const ord = orders.find(o => o.id === orderId);
                          if (ord) {
                            setNewDeliveryName(ord.customer || "");
                            const cust = customers.find(c => c.name === ord.customer || c.id === ord.customerId);
                            setNewDeliveryEmail(cust?.email || "");
                            setNewDeliveryPhone(cust?.phone || "");
                            setNewDeliveryItems(ord.items || []);
                            const loc = locations.find(l => l.customerId === ord.customerId);
                            setNewDeliveryAddress(loc?.address || "");
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Choose Order ID --</option>
                        {orders.map(o => (
                          <option key={o.id} value={o.id}>
                            {o.id} - {o.customer} (${o.total}) [{o.status}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-2">Customer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Gifty Ga"
                        value={newDeliveryName}
                        onChange={(e) => setNewDeliveryName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-2">Customer Email</label>
                      <input
                        type="email"
                        placeholder="e.g. customer@example.com"
                        value={newDeliveryEmail}
                        onChange={(e) => setNewDeliveryEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-2">Customer Phone</label>
                      <input
                        type="text"
                        placeholder="e.g. +233 55 123 4567"
                        value={newDeliveryPhone}
                        onChange={(e) => setNewDeliveryPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-2">Delivery Shipping Address</label>
                      <input
                        type="text"
                        placeholder="e.g. House No. 42, Spintex Road, Accra"
                        value={newDeliveryAddress}
                        onChange={(e) => setNewDeliveryAddress(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-2">Dispatch Rider Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Kwame Mensah"
                        value={newDeliveryRider}
                        onChange={(e) => setNewDeliveryRider(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-2">Rider Contact Phone</label>
                      <input
                        type="text"
                        placeholder="e.g. +233 24 999 8888"
                        value={newDeliveryRiderPhone}
                        onChange={(e) => setNewDeliveryRiderPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-2">Est. Delivery Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Jul 3, 2026"
                        value={newDeliveryEstDate}
                        onChange={(e) => setNewDeliveryEstDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-2">Logistics Shipping Notes / Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. Leave package with front desk if customer is away, call before arriving..."
                        value={newDeliveryNotes}
                        onChange={(e) => setNewDeliveryNotes(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
                    <button
                      onClick={() => setShowCreateDeliveryForm(false)}
                      className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newDeliveryOrderId) {
                          onShowToast("Order Required", "Please select or type an Order ID to track.", "error");
                          return;
                        }
                        if (!newDeliveryAddress) {
                          onShowToast("Address Required", "Please specify a shipping delivery address.", "error");
                          return;
                        }
                        const delId = `del-${Date.now().toString().substring(8)}`;
                        onCreateDelivery({
                          id: delId,
                          orderId: newDeliveryOrderId,
                          customerName: newDeliveryName,
                          customerEmail: newDeliveryEmail,
                          customerPhone: newDeliveryPhone,
                          address: newDeliveryAddress,
                          items: newDeliveryItems,
                          status: 'ordered',
                          dispatchRiderName: newDeliveryRider || "Ella's Standard Courier",
                          dispatchRiderPhone: newDeliveryRiderPhone || "Store Direct Support",
                          notes: newDeliveryNotes,
                          estimatedDeliveryDate: newDeliveryEstDate || "As soon as possible"
                        });
                        // Reset fields
                        setNewDeliveryOrderId("");
                        setNewDeliveryName("");
                        setNewDeliveryEmail("");
                        setNewDeliveryPhone("");
                        setNewDeliveryAddress("");
                        setNewDeliveryRider("");
                        setNewDeliveryRiderPhone("");
                        setNewDeliveryNotes("");
                        setNewDeliveryEstDate("");
                        setNewDeliveryItems([]);
                        setShowCreateDeliveryForm(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-xs font-bold shadow cursor-pointer"
                    >
                      Confirm Dispatch tracking
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery Logistics Table / Filter Interface */}
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-neutral-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-50/40">
                  <div className="flex flex-wrap gap-1.5">
                    {['all', 'ordered', 'dispatched', 'in_transit', 'delivered', 'failed'].map(statusVal => (
                      <button
                        key={statusVal}
                        onClick={() => setDeliveryFilter(statusVal)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer capitalize ${
                          deliveryFilter === statusVal
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {statusVal.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search deliveries, address, riders..."
                      value={deliverySearch}
                      onChange={(e) => setDeliverySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="divide-y divide-neutral-150">
                  {deliveries
                    ?.filter(d => deliveryFilter === 'all' || d.status === deliveryFilter)
                    ?.filter(d => {
                      const searchStr = deliverySearch.toLowerCase();
                      return (
                        d.customerName?.toLowerCase().includes(searchStr) ||
                        d.customerEmail?.toLowerCase().includes(searchStr) ||
                        d.address?.toLowerCase().includes(searchStr) ||
                        d.orderId?.toLowerCase().includes(searchStr) ||
                        d.dispatchRiderName?.toLowerCase().includes(searchStr) ||
                        d.id?.toLowerCase().includes(searchStr)
                      );
                    })
                    ?.map(del => {
                      const statusTimeline = [
                        { key: 'ordered', label: 'Ordered' },
                        { key: 'dispatched', label: 'Dispatched' },
                        { key: 'in_transit', label: 'In Transit' },
                        { key: 'delivered', label: 'Delivered' }
                      ];

                      const currentStatusIdx = statusTimeline.findIndex(s => s.key === del.status);
                      const isFailed = del.status === 'failed';

                      return (
                        <div key={del.id} className="p-6 hover:bg-neutral-50/20 transition-colors space-y-6">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            {/* Left Header columns */}
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2.5">
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold">
                                  ID: {del.id}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                                  Order ID: {del.orderId}
                                </span>
                                <span className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase ${
                                  del.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                                  del.status === 'failed' ? 'bg-rose-50 text-rose-700' :
                                  del.status === 'in_transit' ? 'bg-blue-50 text-blue-700 animate-pulse' :
                                  'bg-amber-50 text-amber-700'
                                }`}>
                                  {del.status.replace('_', ' ')}
                                </span>
                              </div>

                              <h4 className="text-sm font-extrabold text-neutral-900">{del.customerName}</h4>
                              <p className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="font-semibold text-neutral-700">Address:</span> {del.address}
                              </p>
                              {del.customerPhone && (
                                <p className="text-xs text-neutral-500 font-medium">
                                  <span className="font-semibold text-neutral-700">Customer Phone:</span> {del.customerPhone} | {del.customerEmail}
                                </p>
                              )}
                              {del.items && del.items.length > 0 && (
                                <div className="text-[11px] text-neutral-600 bg-neutral-50 border border-neutral-100/60 px-3.5 py-2 rounded-xl inline-block mt-2">
                                  <span className="font-black text-neutral-700 uppercase tracking-wide mr-1.5 block mb-1">Shipping Items:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {del.items.map((it, i) => (
                                      <span key={i} className="bg-white border border-neutral-200 px-2 py-0.5 rounded text-neutral-700 font-medium">
                                        {it}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Middle Logistics columns */}
                            <div className="lg:w-80 space-y-1.5 bg-neutral-50/50 border border-neutral-150/40 p-4 rounded-2xl">
                              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Rider Logistics Details</p>
                              <div className="text-xs space-y-1 text-neutral-700">
                                <p><span className="font-semibold text-neutral-500">Courier:</span> {del.dispatchRiderName || "Not assigned"}</p>
                                <p><span className="font-semibold text-neutral-500">Rider Contact:</span> {del.dispatchRiderPhone || "Not assigned"}</p>
                                <p><span className="font-semibold text-neutral-500">Est. Date:</span> {del.estimatedDeliveryDate || "Not assigned"}</p>
                                {del.notes && <p className="italic text-neutral-500 mt-1">"{del.notes}"</p>}
                              </div>
                            </div>
                          </div>

                          {/* Beautiful Horizontal Stage Progress Tracker Timeline */}
                          <div className="pt-2">
                            <div className="relative flex items-center justify-between w-full max-w-xl mx-auto">
                              {/* Horizontal Timeline Bar */}
                              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-200 -z-10 rounded-full" />
                              <div 
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-500" 
                                style={{ 
                                  width: isFailed ? "100%" : `${(Math.max(0, currentStatusIdx) / (statusTimeline.length - 1)) * 100}%` 
                                }} 
                              />

                              {/* Timeline Circles */}
                              {statusTimeline.map((step, idx) => {
                                const isDone = !isFailed && idx <= currentStatusIdx;
                                const isCurrent = !isFailed && idx === currentStatusIdx;
                                return (
                                  <div key={step.key} className="flex flex-col items-center gap-1.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 font-mono text-[10px] font-black transition-all duration-300 ${
                                      isFailed && idx === statusTimeline.length - 1
                                        ? 'bg-rose-500 border-rose-600 text-white'
                                        : isCurrent
                                        ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow'
                                        : isDone
                                        ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                                        : 'bg-white border-neutral-300 text-neutral-400'
                                    }`}>
                                      {isFailed && idx === statusTimeline.length - 1 ? "✕" : isDone && idx < currentStatusIdx ? "✓" : idx + 1}
                                    </div>
                                    <span className={`text-[10px] font-bold tracking-wide ${
                                      isFailed && idx === statusTimeline.length - 1 ? 'text-rose-500' :
                                      isCurrent ? 'text-indigo-600 font-extrabold' :
                                      isDone ? 'text-neutral-800' : 'text-neutral-400'
                                    }`}>
                                      {isFailed && idx === statusTimeline.length - 1 ? "Failed" : step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Quick Actions Control Bar */}
                          <div className="border-t border-neutral-100 pt-4.5 flex flex-wrap gap-2.5 justify-end">
                            <button
                              onClick={() => onUpdateDelivery(del.id, { status: 'dispatched' })}
                              disabled={del.status === 'dispatched'}
                              className="px-3.5 py-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Dispatch Order
                            </button>
                            <button
                              onClick={() => onUpdateDelivery(del.id, { status: 'in_transit' })}
                              disabled={del.status === 'in_transit'}
                              className="px-3.5 py-1.5 border border-indigo-100 text-indigo-600 hover:bg-indigo-50/50 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Mark In Transit
                            </button>
                            <button
                              onClick={() => onUpdateDelivery(del.id, { status: 'delivered' })}
                              disabled={del.status === 'delivered'}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Delivered & Alert Customer
                            </button>
                            <button
                              onClick={() => onUpdateDelivery(del.id, { status: 'failed' })}
                              disabled={del.status === 'failed'}
                              className="px-3.5 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Failed
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  {(!deliveries || deliveries.length === 0) && (
                    <div className="p-12 text-center text-neutral-400 space-y-3">
                      <Truck className="w-12 h-12 text-neutral-300 mx-auto" />
                      <div>
                        <p className="font-serif font-semibold text-neutral-700">No deliveries registered yet</p>
                        <p className="text-xs text-neutral-500 mt-1">Click "Dispatch New Shipment" to track your first customer product dispatch.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  </>
);
}
