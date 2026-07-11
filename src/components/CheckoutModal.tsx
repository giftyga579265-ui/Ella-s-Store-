import { useState, useEffect } from "react";
import { DiscountCode, Product, HomepageSettings, Customer } from "../types";
import { X, ShoppingBag, CreditCard, Check, Smartphone, Loader2, ArrowLeft, ArrowRight, Tag, AlertTriangle } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutModalProps {
  cart: CartItem[];
  discountCodes: DiscountCode[];
  onClose: () => void;
  onClearCart: () => void;
  onAddOrder: (order: any) => void;
  onAddPayment: (payment: any) => void;
  onLogActivity: (activity: string, type: 'login' | 'cart_addition' | 'purchase' | 'product_view' | 'inquiry' | 'admin_action' | 'user_action') => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  customerNameDefault: string;
  homepageSettings: HomepageSettings;
  customers?: Customer[];
  currentUserEmail?: string;
}

export default function CheckoutModal({
  cart,
  discountCodes,
  onClose,
  onClearCart,
  onAddOrder,
  onAddPayment,
  onLogActivity,
  onShowToast,
  customerNameDefault,
  homepageSettings,
  customers = [],
  currentUserEmail = ""
}: CheckoutModalProps) {
  const [step, setStep] = useState<'summary' | 'customer' | 'momo' | 'success'>('summary');
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [couponError, setCouponError] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(false);
  
  // Form values
  const [name, setName] = useState(customerNameDefault);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [momoConfirmNumber, setMomoConfirmNumber] = useState("");
  const [momoPin, setMomoPin] = useState("");
  
  // Google Pay specific states
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'googlepay'>('momo');
  const [showGPayOverlay, setShowGPayOverlay] = useState(false);
  const [gpayIsAuthorizing, setGpayIsAuthorizing] = useState(false);
  const [gpaySelectedCard, setGpaySelectedCard] = useState('Visa •••• 4111 [ gifty.ga579265@gmail.com ]');
  
  // Loading & final state
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalOrderDetails, setFinalOrderDetails] = useState<any | null>(null);

  useEffect(() => {
    onLogActivity("Initiated checkout flow", "user_action");
  }, []);

  const momoEnabled = homepageSettings.momoEnabled !== false;
  const momoMerchantName = homepageSettings.momoMerchantName || "ELLA'S FASHION SHOWROOM";
  const momoMerchantNumber = homepageSettings.momoMerchantNumber || "0244123456";
  const momoChargeRate = homepageSettings.momoChargeRate ?? 0.5;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 15.00;

  // Retrieve customer's points
  const matchedCustomer = customers.find(c => 
    c.name.toLowerCase() === customerNameDefault.toLowerCase() ||
    (currentUserEmail && c.email.toLowerCase() === currentUserEmail.toLowerCase())
  );
  const availablePoints = matchedCustomer?.loyaltyPoints ?? 0;

  const pointsDiscountAmount = redeemPoints ? Math.min(availablePoints * 0.1, subtotal) : 0;
  const pointsRedeemed = redeemPoints ? Math.min(availablePoints, Math.floor(subtotal * 10)) : 0;

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = (subtotal * appliedDiscount.value) / 100;
    } else {
      discountAmount = appliedDiscount.value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const totalDiscountAmount = Math.min(discountAmount + pointsDiscountAmount, subtotal);

  const momoFee = (subtotal - totalDiscountAmount) * (momoChargeRate / 100);
  const total = subtotal + delivery - totalDiscountAmount + momoFee;

  const handleApplyCoupon = () => {
    setCouponError("");
    const cleanedCode = couponCode.trim().toUpperCase();
    if (!cleanedCode) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const discount = discountCodes.find(d => d.code === cleanedCode && d.active);

    if (!discount) {
      setCouponError("Invalid discount code");
      onLogActivity(`Failed coupon attempt: ${cleanedCode}`, "user_action");
      return;
    }

    if (discount.expiry && new Date(discount.expiry) < new Date()) {
      setCouponError("This coupon code has expired");
      return;
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      setCouponError("Coupon usage limit reached");
      return;
    }

    if (discount.minAmount && subtotal < discount.minAmount) {
      setCouponError(`Min order of ₵${discount.minAmount} required`);
      return;
    }

    setAppliedDiscount(discount);
    onShowToast("Coupon Applied", `You saved ₵${discountAmount.toFixed(2)} with code ${discount.code}`, "success");
    onLogActivity(`Applied coupon code: ${discount.code}`, "user_action");
  };

  const handleNextToCustomer = () => {
    if (cart.length === 0) {
      onShowToast("Error", "Please add items to your cart first.", "error");
      return;
    }
    setStep('customer');
  };

  const handleNextToMomo = () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      onShowToast("Required Fields", "Please fill in all customer information fields.", "error");
      return;
    }

    // Phone validation for MTN Ghana
    const phoneRegex = /^(0|\+233)[235][0-9]{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      onShowToast("Invalid Number", "Please enter a valid MTN Ghana mobile number (starts with 0 or +233, 10 digits total).", "error");
      return;
    }

    setMomoConfirmNumber(phone);
    setStep('momo');
  };

  const handleProcessPayment = () => {
    if (momoConfirmNumber !== phone) {
      onShowToast("Number Mismatch", "MTN numbers do not match. Please confirm your mobile number.", "error");
      return;
    }

    if (!momoPin || momoPin.length < 4) {
      onShowToast("PIN Required", "Please enter a valid 4-digit Mobile Money authorization PIN.", "error");
      return;
    }

    setIsProcessing(true);
    onLogActivity(`Authorizing MoMo payment for ₵${total.toFixed(2)}`, "user_action");

    setTimeout(() => {
      const orderId = `ELLA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentId = `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderData = {
        id: orderId,
        customer: name,
        customerId: Math.floor(100 + Math.random() * 900),
        items: cart.map(item => `${item.name} (x${item.quantity})`),
        total: total,
        date: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        phone: phone.trim(),
        email: email.trim(),
        pointsRedeemed: pointsRedeemed
      };

      const paymentData = {
        id: paymentId,
        orderId: orderId,
        customer: name,
        method: 'momo' as const,
        amount: total,
        date: new Date().toISOString().split('T')[0],
        status: 'completed' as const
      };

      onAddOrder(orderData);
      onAddPayment(paymentData);
      
      setFinalOrderDetails({
        orderId,
        paymentId,
        total,
        name,
        address
      });

      setIsProcessing(false);
      setStep('success');
      onClearCart();
      onShowToast("Payment Successful!", `Order ${orderId} has been placed.`, "success");
      onLogActivity(`Successfully purchased order ${orderId} for ₵${total.toFixed(2)}`, "purchase");
    }, 3000);
  };

  const handleGooglePayPayment = () => {
    setGpayIsAuthorizing(true);
    onLogActivity(`Simulating Google Pay authentication for ₵${total.toFixed(2)}`, "user_action");

    setTimeout(() => {
      const orderId = `ELLA-GP-${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentId = `GPAY-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderData = {
        id: orderId,
        customer: name,
        customerId: Math.floor(100 + Math.random() * 900),
        items: cart.map(item => `${item.name} (x${item.quantity})`),
        total: total,
        date: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        phone: phone.trim(),
        email: email.trim(),
        pointsRedeemed: pointsRedeemed
      };

      const paymentData = {
        id: paymentId,
        orderId: orderId,
        customer: name,
        method: 'googlepay' as const,
        amount: total,
        date: new Date().toISOString().split('T')[0],
        status: 'completed' as const
      };

      onAddOrder(orderData);
      onAddPayment(paymentData);
      
      setFinalOrderDetails({
        orderId,
        paymentId,
        total,
        name,
        address,
        isGooglePay: true
      });

      setGpayIsAuthorizing(false);
      setShowGPayOverlay(false);
      setStep('success');
      onClearCart();
      onShowToast("Google Pay Success!", `Order ${orderId} has been successfully authorized via Google Pay.`, "success");
      onLogActivity(`Successfully purchased order ${orderId} for ₵${total.toFixed(2)} via Google Pay`, "purchase");
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-100 flex flex-col relative max-h-[90vh]">
        
        {/* Header */}
        <header className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-900 text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-indigo-500 animate-pulse" />
            <div>
              <h3 className="font-serif text-lg tracking-wide">Ella's Secure Checkout</h3>
              <p className="text-[10px] text-indigo-400 font-mono">Secure Multi-Method Gateway</p>
            </div>
          </div>
          {step !== 'success' && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-indigo-500 hover:text-neutral-950 flex items-center justify-center transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
        </header>

        {/* Stepper Progress Bar */}
        <div className="bg-amber-100/50 px-6 py-2 border-b border-amber-200/40 flex justify-between text-[11px] font-medium text-neutral-600">
          <span className={step === 'summary' ? 'text-amber-600 font-semibold underline' : ''}>1. Summary</span>
          <span className={step === 'customer' ? 'text-amber-600 font-semibold underline' : ''}>2. Delivery Info</span>
          <span className={step === 'momo' ? 'text-amber-600 font-semibold underline' : ''}>3. Pay Securely</span>
          <span className={step === 'success' ? 'text-green-600 font-semibold underline' : ''}>4. Complete</span>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!momoEnabled ? (
            <div className="py-12 px-4 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-neutral-900">MTN Mobile Money Offline</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                The MTN Mobile Money payment system is temporarily disabled for routine network maintenance. 
                Please contact our help desk or visit us directly to arrange alternative checkout.
              </p>
              <p className="text-[10px] text-amber-600 font-mono">Merchant: {momoMerchantName}</p>
              <div className="pt-6">
                <button
                  onClick={onClose}
                  className="bg-neutral-900 hover:bg-amber-500 hover:text-neutral-900 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all"
                >
                  Close & Return
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Order Summary */}
              {step === 'summary' && (
                <div className="space-y-6">
                  <h4 className="font-serif text-neutral-950 text-base border-b border-neutral-100 pb-2 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    Review Items in Bag
                  </h4>
                  
                  <div className="space-y-2.5">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div>
                          <h5 className="text-sm font-semibold text-neutral-850">{item.name}</h5>
                          <span className="text-xs text-neutral-500">₵{item.price} each &bull; Qty: {item.quantity}</span>
                        </div>
                        <span className="text-sm font-bold text-neutral-900">₵{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Coupon System */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/60 space-y-3">
                    <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-amber-500" />
                      Have an Elegant Promo Code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="Enter code (e.g. WELCOME10)"
                        className="flex-1 px-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 uppercase"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-amber-500 text-neutral-900 px-4 py-2 rounded-xl text-xs font-bold tracking-wide hover:bg-neutral-900 hover:text-white transition-colors duration-300 shadow"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-1 font-medium">{couponError}</p>}
                    {appliedDiscount && (
                      <p className="text-green-600 text-xs font-semibold flex items-center gap-1 mt-1">
                        <Check className="w-3.5 h-3.5" />
                        Promo code "{appliedDiscount.code}" successfully active!
                      </p>
                    )}
                  </div>

                  {/* Loyalty Points Redemption System */}
                  {availablePoints > 0 && (
                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                          <span>🪙</span>
                          <span>Bespoke Loyalty Points</span>
                        </label>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          {availablePoints} Pts Available
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 font-medium">
                        Redeem points for discounts: <strong>10 points = ₵1.00</strong>. 
                        You can save up to <strong>₵{(availablePoints * 0.1).toFixed(2)}</strong> on this order.
                      </p>
                      
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-neutral-150 shadow-sm">
                        <span className="text-xs font-semibold text-neutral-700">Redeem points for discount?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRedeemPoints(!redeemPoints);
                            if (!redeemPoints) {
                              onShowToast("Points Applied", `Applied points discount of ₵${Math.min(availablePoints * 0.1, subtotal).toFixed(2)}!`, "success");
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            redeemPoints 
                              ? "bg-amber-500 text-neutral-900 shadow-sm" 
                              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                          }`}
                        >
                          {redeemPoints ? "Redeemed ✓" : "Redeem Now"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Total Summary */}
                  <div className="border-t border-neutral-150 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-neutral-600">
                      <span>Bag Subtotal</span>
                      <span>₵{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Lapaz Delivery Fee</span>
                      <span>₵{delivery.toFixed(2)}</span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount Coupon ({appliedDiscount.code})</span>
                        <span>-₵{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {redeemPoints && (
                      <div className="flex justify-between text-amber-600 font-medium">
                        <span>Loyalty Points Discount ({pointsRedeemed} pts)</span>
                        <span>-₵{pointsDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {momoFee > 0 && (
                      <div className="flex justify-between text-neutral-600">
                        <span>MTN MoMo Gateway Fee ({momoChargeRate}%)</span>
                        <span>₵{momoFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-serif text-lg text-neutral-900 border-t border-dashed border-neutral-250 pt-3">
                      <span>Amount to Pay</span>
                      <span className="text-amber-500 font-bold text-xl">₵{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNextToCustomer}
                    className="w-full bg-neutral-950 text-white hover:bg-amber-500 hover:text-neutral-900 py-4 rounded-xl text-sm font-bold tracking-wider flex items-center justify-center gap-2 transition-all duration-300 mt-6 shadow-md"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

          {/* STEP 2: Customer Information */}
          {step === 'customer' && (
            <div className="space-y-5">
              <h4 className="font-serif text-neutral-950 text-base border-b border-neutral-100 pb-2">
                Delivery and Billing Details
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your first and last name"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">MTN Ghana Mobile Money Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 0244123456"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                  <small className="text-[10px] text-neutral-500 mt-1 block">
                    Must be registered on MTN Ghana Mobile Money networks.
                  </small>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Delivery Address in Accra</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Street name, landmark, house number, area (e.g. Near Lapaz Market)"
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-100">
                <button
                  onClick={() => setStep('summary')}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={handleNextToMomo}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-neutral-900 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  Confirm Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Multi-Method Payment Options (MTN MoMo & Google Pay) */}
          {step === 'momo' && (
            <div className="space-y-5">
              <h4 className="font-serif text-neutral-950 text-base border-b border-neutral-100 pb-2 text-center text-neutral-800">
                Choose Secure Payment Option
              </h4>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('momo')}
                  className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all duration-300 border flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'momo'
                      ? 'bg-amber-500/10 text-amber-700 border-amber-500 shadow-sm'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <Smartphone className="w-4.5 h-4.5 text-amber-500 shrink-0 animate-pulse" />
                  <span>MTN Mobile Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('googlepay')}
                  className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all duration-300 border flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'googlepay'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-500 shadow-sm'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <CreditCard className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                  <span>Google Pay</span>
                </button>
              </div>

              {paymentMethod === 'momo' ? (
                <div className="space-y-4">
                  {/* Instructions */}
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl space-y-2">
                    <h5 className="font-bold text-neutral-900 text-xs">MTN MoMo Authorization Guide:</h5>
                    <ol className="list-decimal pl-4 text-xs text-neutral-700 space-y-1">
                      <li>Ensure your MTN wallet has at least ₵{total.toFixed(2)}.</li>
                      <li>Funds will be routed securely to <strong>{momoMerchantName}</strong> ({momoMerchantNumber}).</li>
                      <li>Confirm your MTN number and enter your 4-digit PIN to authorize.</li>
                    </ol>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Confirm MTN Wallet Number</label>
                      <input
                        type="text"
                        value={momoConfirmNumber}
                        onChange={e => setMomoConfirmNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 text-center font-mono font-bold bg-neutral-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">MTN Mobile Money PIN (4 digits)</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={momoPin}
                        onChange={e => setMomoPin(e.target.value)}
                        placeholder="&bull; &bull; &bull; &bull;"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 text-center font-mono text-2xl tracking-widest bg-neutral-50"
                      />
                      <small className="text-[10px] text-neutral-400 text-center block mt-1">
                        Your PIN is encrypted and handled securely in the workspace.
                      </small>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-center py-6 border border-dashed border-indigo-200/60 rounded-2xl bg-indigo-50/10">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-1 border border-indigo-100">
                    <CreditCard className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-neutral-800">Google Pay Instant Processing</h5>
                    <p className="text-[11px] text-neutral-500 max-w-xs mx-auto leading-relaxed">
                      Complete your order instantly using cards saved to your Google Account. Safe, fast, and fully secure.
                    </p>
                  </div>

                  {/* Elegant Google Pay Button */}
                  <button
                    type="button"
                    onClick={() => setShowGPayOverlay(true)}
                    className="mx-auto w-fit bg-neutral-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl text-xs font-extrabold tracking-widest transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer border border-neutral-800 hover:scale-[1.02]"
                  >
                    <span className="font-sans font-bold tracking-tight text-white flex items-center gap-1 text-sm">
                      <span className="text-amber-400">G</span>
                      <span className="text-blue-400">o</span>
                      <span className="text-red-400">o</span>
                      <span className="text-green-400">g</span>
                      <span className="text-yellow-400">l</span>
                      <span className="text-blue-500">e</span> Pay
                    </span>
                  </button>
                </div>
              )}

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-neutral-600">Grand Total to Pay:</span>
                <span className="text-lg font-extrabold text-neutral-900 font-mono">₵{total.toFixed(2)}</span>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-100">
                <button
                  disabled={isProcessing}
                  onClick={() => setStep('customer')}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                
                {paymentMethod === 'momo' && (
                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-neutral-900 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                        Authorizing...
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4" />
                        Authorize & Pay
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SIMULATED GOOGLE PAY OVERLAY */}
          {showGPayOverlay && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in duration-300 p-0">
              <div className="bg-[#f8f9fa] w-full rounded-t-3xl p-6 border-t border-neutral-200 shadow-2xl animate-in slide-in-from-bottom duration-300 space-y-6 max-h-[90%] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans font-black text-lg tracking-tight text-neutral-800 flex items-center gap-0.5">
                      <span className="text-blue-600">G</span>
                      <span className="text-red-500">o</span>
                      <span className="text-yellow-500">o</span>
                      <span className="text-blue-500">g</span>
                      <span className="text-green-500">l</span>
                      <span className="text-red-500">e</span> Pay
                    </span>
                    <span className="bg-indigo-100 text-indigo-700 text-[9px] px-2 py-0.5 rounded-md font-bold font-mono">Secure Gateway</span>
                  </div>
                  <button
                    onClick={() => setShowGPayOverlay(false)}
                    className="w-7 h-7 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center text-neutral-700 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Account detail */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                    <div>
                      <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Google Account</h5>
                      <p className="text-xs font-semibold text-neutral-850 mt-0.5">gifty.ga579265@gmail.com</p>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold cursor-pointer">Switch</span>
                  </div>

                  {/* Payment method selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Select Saved Card</label>
                    <div className="bg-white rounded-2xl border border-neutral-150 divide-y divide-neutral-100 overflow-hidden shadow-sm">
                      {[
                        { id: 'visa', label: 'Visa ending in 4111', icon: '💳', desc: 'Preferred card' },
                        { id: 'master', label: 'MasterCard ending in 5555', icon: '💳', desc: 'Backup card' }
                      ].map(card => (
                        <div
                          key={card.id}
                          onClick={() => setGpaySelectedCard(`${card.label} [ gifty.ga579265@gmail.com ]`)}
                          className={`p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-50 transition-colors ${
                            gpaySelectedCard.includes(card.label) ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{card.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-neutral-800">{card.label}</p>
                              <p className="text-[10px] text-neutral-500">{card.desc}</p>
                            </div>
                          </div>
                          {gpaySelectedCard.includes(card.label) && (
                            <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping address info */}
                  <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm space-y-1">
                    <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Shipping Destination</h5>
                    <p className="text-xs font-bold text-neutral-800">{name}</p>
                    <p className="text-xs text-neutral-600 line-clamp-1">{address}</p>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-dashed border-neutral-250 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Store Checkout Total</span>
                      <span>₵{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>GPay Processing Fee</span>
                      <span className="text-green-600 font-bold">FREE (₵0.00)</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                      <span>Total Charge</span>
                      <span>₵{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Final simulation button */}
                <button
                  onClick={handleGooglePayPayment}
                  disabled={gpayIsAuthorizing}
                  className="w-full bg-neutral-900 hover:bg-black text-white py-3.5 rounded-2xl text-xs font-black tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {gpayIsAuthorizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Securing GPay Authentication...</span>
                    </>
                  ) : (
                    <>
                      <span>PAY ₵{total.toFixed(2)} NOW</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 'success' && finalOrderDetails && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-green-100 border-2 border-green-500 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif text-2xl text-green-600 font-medium">Payment Successful!</h4>
                <p className="text-xs text-neutral-500">Your fashion order has been completed successfully.</p>
              </div>

              {/* Invoice */}
              <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl text-left text-xs space-y-3 font-mono">
                <div className="flex justify-between border-b border-dashed border-neutral-300 pb-2.5">
                  <span className="font-bold text-neutral-600">INVOICE DETAILS</span>
                  <span className="text-indigo-600 font-bold">{finalOrderDetails.orderId}</span>
                </div>
                <div className="space-y-1 text-neutral-700">
                  <p><strong>Customer Name:</strong> {finalOrderDetails.name}</p>
                  <p><strong>Amount Paid:</strong> ₵{finalOrderDetails.total.toFixed(2)}</p>
                  <p><strong>Payment Mode:</strong> {finalOrderDetails.isGooglePay ? "Google Pay (Secure Card)" : "MTN Mobile Money"}</p>
                  <p><strong>Gateway Ref:</strong> {finalOrderDetails.paymentId}</p>
                  <p className="line-clamp-2"><strong>Delivery Location:</strong> {finalOrderDetails.address}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200/50 p-2.5 rounded-lg text-[10px] text-center text-indigo-800 leading-relaxed font-sans mt-2 animate-pulse">
                  {finalOrderDetails.isGooglePay 
                    ? "Transaction authorized instantly via Google Pay. Our dispatch team is preparing your package for express delivery! Thank you for choosing Ella's."
                    : "Our delivery couriers will call you on your MTN line shortly to schedule delivery. Thank you for shopping with Ella's Store!"
                  }
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-neutral-900 hover:bg-amber-500 hover:text-neutral-900 text-white py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 shadow"
              >
                Continue Shopping
              </button>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
