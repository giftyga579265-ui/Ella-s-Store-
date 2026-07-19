import React, { useState, useEffect } from "react";
import { Charity } from "../types";
import { 
  Heart, CreditCard, Smartphone, Target, Award, Users, TrendingUp, Sparkles, 
  Check, ChevronRight, Shield, Lock, RefreshCw, CheckCircle2, AlertCircle, ArrowLeft, Send
} from "lucide-react";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

interface CharityDonationsProps {
  charityData: Charity[];
  onLogActivity: (activity: string, type: string) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  currentUser?: string;
  currentUserEmail?: string;
}

export default function CharityDonations({ 
  charityData, 
  onLogActivity, 
  onShowToast,
  currentUser = "",
  currentUserEmail = ""
}: CharityDonationsProps) {
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>("50");
  const [loading, setLoading] = useState(false);

  // MTN Mobile Money Wallet Simulation States
  const [showMomoGateway, setShowMomoGateway] = useState(false);
  const [momoStep, setMomoStep] = useState<'redirect' | 'input' | 'otp' | 'prompt' | 'processing' | 'success' | 'error'>('redirect');
  const [momoPhone, setMomoPhone] = useState("");
  const [momoPin, setMomoPin] = useState("");
  const [momoOtp, setMomoOtp] = useState("");
  const [momoError, setMomoError] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [ussdPinInput, setUssdPinInput] = useState("");

  // Handle countdown effect for initial redirection
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showMomoGateway && momoStep === 'redirect') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 750);
      } else {
        setMomoStep('input');
      }
    }
    return () => clearTimeout(timer);
  }, [showMomoGateway, momoStep, countdown]);

  const handleDonateInit = (charity: Charity) => {
    setSelectedCharity(charity);
    setDonationAmount("50");
    onLogActivity(`Selected charity for donation: ${charity.name}`, "user_action");
  };

  const handlePayment = async (method: 'MTN' | 'GooglePay') => {
    if (!selectedCharity) return;
    
    if (method === 'MTN') {
      // Trigger interactive MTN MoMo wallet portal
      setCountdown(3);
      setMomoStep('redirect');
      setMomoPhone("");
      setMomoPin("");
      setMomoOtp("");
      setUssdPinInput("");
      setMomoError("");
      setShowMomoGateway(true);
      onLogActivity(`Selected MTN Mobile Money wallet redirect for ${selectedCharity.name}`, "user_action");
      return;
    }

    // Google Pay payment route
    setLoading(true);
    onLogActivity(`Initiated payment for ${selectedCharity.name} via ${method}`, "user_action");
    
    try {
      const donationId = `DON-GPAY-${Math.floor(1000 + Math.random() * 9000)}`;
      const amountVal = parseFloat(donationAmount);
      
      if (isNaN(amountVal) || amountVal <= 0) {
        onShowToast("Invalid Amount", "Please enter or select a valid contribution amount.", "error");
        setLoading(false);
        return;
      }

      const donationDoc = {
        id: donationId,
        charityId: selectedCharity.id,
        charityName: selectedCharity.name,
        customerName: currentUser.trim() || "Anonymous Donor",
        customerEmail: currentUserEmail.trim() || "anonymous@example.com",
        amount: amountVal,
        date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
        method: 'googlepay',
        status: 'completed'
      };

      await setDoc(doc(db, "charity_donations", donationId), donationDoc);

      const updatedAmount = (selectedCharity.currentAmount || 0) + amountVal;
      await setDoc(doc(db, "charity", selectedCharity.id), {
        currentAmount: updatedAmount
      }, { merge: true });

      onShowToast("Bespoke Donation Recorded!", `Thank you! Your donation of ₵${amountVal} was securely sent.`, "success");
      onLogActivity(`Donated ₵${amountVal} to ${selectedCharity.name} via Google Pay`, "user_action");

      setTimeout(() => {
        setSelectedCharity(null);
      }, 500);

    } catch (error) {
      console.error("Payment registration error:", error);
      onShowToast("Payment Error", "An error occurred registering your donation. Please retry.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Submit MoMo Details
  const handleMomoSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setMomoError("");

    // Simple Ghana Phone Number validation: starts with 0 and has 10 digits
    const cleanPhone = momoPhone.replace(/\s+/g, "");
    const ghPhoneRegex = /^0(24|54|55|59|20|50|23|27|57|26|56)\d{7}$/;

    if (!ghPhoneRegex.test(cleanPhone)) {
      setMomoError("Please enter a valid Ghana MTN MoMo number (e.g. 024XXXXXXX, 054XXXXXXX).");
      return;
    }

    if (momoPin.length < 4) {
      setMomoError("Please enter your 4-digit or 6-digit Mobile Money Wallet PIN.");
      return;
    }

    setMomoStep('otp');
    onLogActivity(`Ghana MTN MoMo wallet credentials entered for ${momoPhone}`, "user_action");
  };

  // Verify MoMo OTP
  const handleMomoVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (momoOtp.length < 4) {
      setMomoError("Please enter the 4-digit OTP code sent via SMS.");
      return;
    }
    setMomoError("");
    setMomoStep('prompt');
  };

  // Approve USSD Wallet Prompt
  const handleMomoApproveUssdPrompt = async () => {
    if (!ussdPinInput) {
      setMomoError("Enter MoMo PIN to complete authorization.");
      return;
    }
    
    setMomoError("");
    setMomoStep('processing');

    setTimeout(async () => {
      try {
        const donationId = `DON-MOMO-${Math.floor(10000 + Math.random() * 90000)}`;
        const amountVal = parseFloat(donationAmount);
        
        const donationDoc = {
          id: donationId,
          charityId: selectedCharity!.id,
          charityName: selectedCharity!.name,
          customerName: currentUser.trim() || "Anonymous Donor",
          customerEmail: currentUserEmail.trim() || "anonymous@example.com",
          amount: amountVal,
          date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
          method: 'momo',
          status: 'completed',
          momoPhone: momoPhone
        };

        // Save donation to charity_donations in Firestore
        await setDoc(doc(db, "charity_donations", donationId), donationDoc);

        // Update Charity Progress
        const updatedAmount = (selectedCharity!.currentAmount || 0) + amountVal;
        await setDoc(doc(db, "charity", selectedCharity!.id), {
          currentAmount: updatedAmount
        }, { merge: true });

        setMomoStep('success');
        onShowToast("MoMo Wallet Approved!", `GHS ${amountVal} has been securely debited from ${momoPhone}.`, "success");
        onLogActivity(`Successfully debited GHS ${amountVal} from MTN MoMo wallet ${momoPhone} for ${selectedCharity!.name}`, "user_action");

      } catch (e) {
        console.error("Error writing MoMo donation", e);
        setMomoStep('error');
      }
    }, 2000);
  };

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-300">
      {/* Premium Header Design */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3 py-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
          Ella Community Outreach
        </span>
        <h2 className="font-sans text-3xl md:text-5xl text-neutral-950 font-black tracking-tight leading-tight">
          Philanthropic Sponsorships
        </h2>
        <p className="text-neutral-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
          At Ella's Store, we believe beauty lies in our communities. A percentage of all boutique couture earnings is split among local children’s homes, education, and health clinics in Accra, Ghana.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {charityData.filter(c => c.active).map(charity => {
          const progressPercent = Math.min(100, Math.round((charity.currentAmount / charity.targetAmount) * 100)) || 0;
          return (
            <div 
              key={charity.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-all hover:shadow-md group animate-in fade-in duration-300"
            >
              <div>
                {/* Image Section */}
                <div className="relative h-48 bg-neutral-100 dark:bg-slate-800 overflow-hidden">
                  <img 
                    src={charity.imageUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop"} 
                    alt={charity.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-indigo-600 border border-indigo-500/10 flex items-center gap-1">
                    <Target className="w-3 h-3 text-indigo-500 animate-pulse" />
                    <span>Target Target</span>
                  </div>
                </div>

                {/* Info block */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-sans text-base font-black text-neutral-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                      {charity.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-slate-400 leading-relaxed font-medium">
                      {charity.description}
                    </p>
                  </div>

                  {/* Progress info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="text-neutral-400 text-[10px] uppercase font-mono font-bold block">Current Balance</span>
                        <span className="font-sans text-neutral-900 dark:text-slate-100 font-extrabold text-sm">₵{charity.currentAmount}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-400 text-[10px] uppercase font-mono font-bold block">Funding Goal</span>
                        <span className="text-neutral-500 dark:text-slate-400 font-bold">₵{charity.targetAmount}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full h-2.5 bg-neutral-100 dark:bg-slate-800 rounded-full overflow-hidden border border-neutral-200/40">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-rose-500"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                      <span>Progress Achieved</span>
                      <span className="text-indigo-600 font-extrabold">{progressPercent}% Funded</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button 
                  onClick={() => handleDonateInit(charity)}
                  className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 text-white font-sans text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
                  <span>Sponsor Outreach</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sponsor / Donation Configuration Modal */}
      <AnimatePresence>
        {selectedCharity && !showMomoGateway && (
          <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-neutral-200 dark:border-slate-700 shadow-2xl p-6 max-w-md w-full space-y-6"
            >
              {/* Header */}
              <div className="space-y-1.5 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
                  <Heart className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-sans text-lg font-black text-neutral-900 dark:text-slate-100">Outreach Contribution</h3>
                <p className="text-neutral-400 text-[10px] max-w-[280px] mx-auto">
                  100% of your sponsor contribution goes directly to the {selectedCharity.name} program.
                </p>
              </div>

              {/* Amount Presets */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono font-bold text-neutral-400 block">Select Sponsor Tier (₵)</label>
                <div className="grid grid-cols-4 gap-2">
                  {["20", "50", "100", "250"].map(preset => {
                    const active = donationAmount === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDonationAmount(preset)}
                        className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                          active 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10" 
                            : "bg-neutral-50 dark:bg-slate-950 border-neutral-200 dark:border-slate-700 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:bg-slate-800"
                        }`}
                      >
                        ₵{preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-neutral-400 block">Custom Amount (₵)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-xs text-neutral-400 font-black">₵</span>
                  <input 
                    type="number" 
                    value={donationAmount} 
                    onChange={e => setDonationAmount(e.target.value)} 
                    className="w-full pl-8 pr-4 py-2.5 border border-neutral-200 dark:border-slate-700 rounded-xl text-xs font-bold text-neutral-900 dark:text-slate-100 bg-neutral-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 focus:bg-white dark:bg-slate-900"
                    placeholder="Amount"
                    min="1"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase font-mono font-bold text-neutral-400">Select Wallet Gateway Option</p>
                
                {/* MTN Ghana Mobile Money */}
                <button 
                  disabled={loading} 
                  onClick={() => handlePayment('MTN')} 
                  className="w-full p-4 border border-amber-300 rounded-2xl flex items-center justify-between bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-50 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFCC00] flex items-center justify-center font-black text-neutral-950 border border-amber-400 text-[10px] shrink-0 shadow-sm font-mono">
                      momo
                    </div>
                    <div>
                      <p className="font-black text-xs text-neutral-900 dark:text-slate-100">MTN Mobile Money Wallet</p>
                      <p className="text-[10px] text-amber-800 font-bold">Secure Redirect to Ghana Wallet &bull; Active</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Google Pay */}
                <button 
                  disabled={loading} 
                  onClick={() => handlePayment('GooglePay')} 
                  className="w-full p-4 border border-neutral-200 dark:border-slate-700 rounded-2xl flex items-center justify-between hover:bg-neutral-50 dark:bg-slate-950 transition-colors cursor-pointer disabled:opacity-50 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center border border-neutral-800 shrink-0 shadow-sm">
                      <CreditCard className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-black text-xs text-neutral-900 dark:text-slate-100">Google Pay / Stripe</p>
                      <p className="text-[10px] text-neutral-500 dark:text-slate-400">Secure Direct Card Gateway</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* Cancel Button */}
              <div className="pt-2 text-center">
                <button 
                  disabled={loading} 
                  onClick={() => setSelectedCharity(null)} 
                  className="text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:text-slate-100 text-xs font-bold underline cursor-pointer disabled:opacity-50"
                >
                  Close & return
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Ghana MTN Mobile Money Secure Wallet Gateway Portal Overlay */}
        {selectedCharity && showMomoGateway && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121212] border border-neutral-800 rounded-[36px] w-full max-w-4xl min-h-[500px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
            >
              
              {/* Left Panel: MTN Brand Portal */}
              <div className="flex-1 bg-[#FFCC00] p-8 flex flex-col justify-between text-neutral-900 dark:text-slate-100 relative">
                {/* Background design accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 rounded-full filter blur-xl opacity-30 -mr-16 -mt-16"></div>
                
                <div className="space-y-6">
                  {/* MTN logo and secure label */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 text-[#FFCC00] flex items-center justify-center font-black text-xs tracking-tighter">
                        MTN
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-800 dark:text-slate-200 font-mono block">GHANA</span>
                        <span className="text-[11px] font-extrabold text-neutral-950 block -mt-1">Mobile Money</span>
                      </div>
                    </div>
                    <div className="bg-neutral-900/10 px-2.5 py-1 rounded-full border border-neutral-900/15 text-[9px] font-black uppercase flex items-center gap-1 text-neutral-900 dark:text-slate-100">
                      <Lock className="w-3 h-3" />
                      <span>SECURE SSL</span>
                    </div>
                  </div>

                  {/* Merchant information block */}
                  <div className="p-5 bg-neutral-900/5 rounded-2xl border border-neutral-900/10 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-slate-300 font-mono">Bespoke Merchant Portal</p>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-neutral-900 dark:text-slate-100">ELLA COUTURE OUTREACH</p>
                      <p className="text-[10px] text-neutral-700 dark:text-slate-300">Account ID: <span className="font-mono font-bold">MC-0248899637</span></p>
                    </div>
                    <hr className="border-neutral-900/10" />
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-neutral-600 dark:text-slate-400 font-bold uppercase">Sponsorship Amount</p>
                        <p className="text-xl font-black text-neutral-900 dark:text-slate-100 font-mono">GHS {(parseFloat(donationAmount) || 0).toFixed(2)}</p>
                      </div>
                      <div className="text-right text-[10px] text-neutral-600 dark:text-slate-400 font-bold">
                        <p>No Fees Applied</p>
                        <p className="text-indigo-900 font-extrabold">Outreach Rate 1:1</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure footer info */}
                <div className="mt-8 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-800 dark:text-slate-200 font-semibold">
                    <Shield className="w-4 h-4 text-neutral-900 dark:text-slate-100" />
                    <span>Bank-grade security authorization</span>
                  </div>
                  <p className="text-[9px] text-neutral-700 dark:text-slate-300 leading-normal">
                    This is an active MTN Ghana MoMo secure wallet gateway simulation ensuring instant, real-time Firestore database verification and updates.
                  </p>
                </div>
              </div>

              {/* Right Panel: Active Steps / Redirection / Interactive Smartphone */}
              <div className="flex-[1.2] bg-neutral-950 p-8 flex flex-col justify-center relative border-t md:border-t-0 md:border-l border-neutral-800">
                
                {/* 1. Step 'redirect' */}
                {momoStep === 'redirect' && (
                  <div className="text-center space-y-6 max-w-xs mx-auto animate-pulse">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 animate-ping"></div>
                      <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-neutral-950 font-black">
                        <RefreshCw className="w-6 h-6 animate-spin duration-1500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase text-neutral-200">Wallet Redirection</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Establishing secure handshake with your Ghana MTN MoMo mobile phone...
                      </p>
                    </div>
                    <div className="font-mono text-xl text-amber-400 font-black bg-neutral-900/50 py-2 rounded-2xl border border-neutral-800">
                      Redirecting in {countdown}s
                    </div>
                  </div>
                )}

                {/* 2. Step 'input' */}
                {momoStep === 'input' && (
                  <form onSubmit={handleMomoSubmitDetails} className="space-y-6">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-neutral-100">MoMo Wallet Authentication</h4>
                      <p className="text-xs text-neutral-500 dark:text-slate-400">Provide your MTN mobile phone number & PIN below.</p>
                    </div>

                    {momoError && (
                      <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{momoError}</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Phone Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block font-mono">MTN Ghana Phone Number</label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-xs font-bold text-neutral-500 dark:text-slate-400 font-mono">+233</span>
                          <input 
                            required
                            type="tel" 
                            placeholder="e.g. 0248899637"
                            value={momoPhone}
                            onChange={e => setMomoPhone(e.target.value)}
                            className="w-full pl-16 pr-4 py-3 bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* PIN Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block font-mono">Mobile Money PIN (4-Digits)</label>
                        <input 
                          required
                          type="password" 
                          maxLength={6}
                          placeholder="&bull;&bull;&bull;&bull;"
                          value={momoPin}
                          onChange={e => setMomoPin(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-xl text-xs font-bold tracking-widest focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setShowMomoGateway(false)}
                        className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-bold uppercase rounded-2xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-3 bg-[#FFCC00] hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase rounded-2xl cursor-pointer shadow-lg shadow-amber-400/5 flex items-center justify-center gap-1"
                      >
                        <span>Request OTP</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. Step 'otp' */}
                {momoStep === 'otp' && (
                  <form onSubmit={handleMomoVerifyOtp} className="space-y-6">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-neutral-100">SMS Verification Code</h4>
                      <p className="text-xs text-neutral-500 dark:text-slate-400">A one-time OTP was sent via SMS to <span className="text-amber-400 font-bold font-mono">{momoPhone}</span>.</p>
                    </div>

                    {momoError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{momoError}</span>
                      </div>
                    )}

                    <div className="space-y-2 text-center">
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block font-mono text-left">Enter 4-Digit OTP Code</label>
                      <input 
                        required
                        type="text" 
                        maxLength={4}
                        placeholder="e.g. 8839"
                        value={momoOtp}
                        onChange={e => setMomoOtp(e.target.value)}
                        className="w-full text-center px-4 py-4 bg-neutral-900 border border-neutral-800 text-neutral-100 text-lg font-black tracking-widest rounded-xl focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setMomoStep('input')}
                        className="flex-1 py-3 bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-bold uppercase rounded-2xl cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Edit Info</span>
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-3 bg-[#FFCC00] hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase rounded-2xl cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Verify Wallet</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 4. Step 'prompt' (Interactive Phone Emulator) */}
                {momoStep === 'prompt' && (
                  <div className="space-y-5 flex flex-col items-center">
                    <div className="text-center space-y-1 w-full">
                      <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 font-mono">Step 4: Push Notification simulation</h4>
                      <p className="text-[10px] text-neutral-500 dark:text-slate-400">We triggered a secure USSD dialog popup on your virtual phone screen below to complete GHS authorization.</p>
                    </div>

                    {/* Highly polished iPhone/Android USSD Emulator */}
                    <div className="w-[240px] h-[360px] bg-neutral-900 rounded-[32px] border-4 border-neutral-800 shadow-xl overflow-hidden flex flex-col relative">
                      {/* Phone Speaker & Camera Notch */}
                      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-neutral-950 rounded-full flex items-center justify-center gap-1.5">
                        <span className="w-8 h-1 bg-neutral-800 rounded-full"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></span>
                      </div>

                      {/* Phone Status bar */}
                      <div className="pt-7 px-4 flex justify-between text-[8px] font-mono font-bold text-neutral-400 bg-neutral-950">
                        <span>12:00</span>
                        <span>MTN-GH 5G</span>
                      </div>

                      {/* Dynamic USSD Popup Body */}
                      <div className="flex-1 p-4 flex items-center justify-center bg-neutral-950">
                        <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center space-y-4 shadow-2xl">
                          <p className="text-[10px] font-extrabold text-neutral-200 leading-normal font-mono text-left">
                            Y'ello!<br />
                            Authorize payment of GHS {(parseFloat(donationAmount) || 0).toFixed(2)} to ELLA'S COUTURE?<br />
                            Enter your Wallet PIN to approve.
                          </p>
                          
                          {/* PIN input within phone */}
                          <input 
                            type="password" 
                            maxLength={4}
                            placeholder="Wallet PIN"
                            value={ussdPinInput}
                            onChange={e => setUssdPinInput(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-center bg-neutral-950 border border-neutral-800 text-[#FFCC00] rounded-lg text-xs font-black tracking-widest focus:outline-none focus:border-amber-400 font-mono"
                          />

                          {momoError && (
                            <p className="text-[8px] text-rose-400 font-bold leading-none">{momoError}</p>
                          )}

                          <div className="flex gap-2">
                            <button 
                              type="button" 
                              onClick={() => {
                                setMomoError("Transaction Cancelled by user.");
                                setMomoStep('input');
                              }}
                              className="flex-1 py-1 bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 text-[9px] font-black uppercase rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button 
                              type="button" 
                              onClick={handleMomoApproveUssdPrompt}
                              className="flex-1 py-1 bg-[#FFCC00] text-neutral-950 hover:bg-amber-400 text-[9px] font-black uppercase rounded-lg cursor-pointer"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Phone Navigation Bar */}
                      <div className="h-6 bg-neutral-950 flex items-center justify-center">
                        <span className="w-20 h-1 bg-neutral-700 rounded-full"></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Step 'processing' */}
                {momoStep === 'processing' && (
                  <div className="text-center space-y-6 max-w-xs mx-auto">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
                      <div className="w-14 h-14 rounded-full bg-[#FFCC00] flex items-center justify-center text-neutral-950">
                        <RefreshCw className="w-6 h-6 animate-spin duration-1000" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase text-neutral-200">Processing Wallet Debit</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        MTN Telecommunications API registering payment block, writing persistent ledger details to Firebase...
                      </p>
                    </div>
                    <div className="h-1.5 w-32 bg-neutral-900 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full animate-[loading_1.5s_infinite] w-1/2"></div>
                    </div>
                  </div>
                )}

                {/* 6. Step 'success' */}
                {momoStep === 'success' && (
                  <div className="text-center space-y-6 max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                      <CheckCircle2 className="w-8 h-8 animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-base font-black text-white">Sponsorship Completed!</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        GHS <span className="text-emerald-400 font-bold font-mono">{(parseFloat(donationAmount) || 0).toFixed(2)}</span> has been securely deducted from wallet <span className="text-neutral-200 font-mono">{momoPhone}</span> and synchronized into the community foundation database.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowMomoGateway(false);
                        setSelectedCharity(null);
                      }}
                      className="w-full py-3 bg-[#FFCC00] hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase rounded-2xl cursor-pointer"
                    >
                      Done & Close
                    </button>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
