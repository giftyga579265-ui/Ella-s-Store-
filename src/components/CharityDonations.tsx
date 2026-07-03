import React, { useState } from "react";
import { Charity } from "../types";
import { Heart, CreditCard, Smartphone, Target, Award, Users, TrendingUp, Sparkles, Check, ChevronRight } from "lucide-react";
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

  const handleDonateInit = (charity: Charity) => {
    setSelectedCharity(charity);
    onLogActivity(`Selected charity for donation: ${charity.name}`, "user_action");
  };

  const handlePayment = async (method: 'MTN' | 'GooglePay') => {
    if (!selectedCharity) return;
    
    setLoading(true);
    onLogActivity(`Initiated payment for ${selectedCharity.name} via ${method}`, "user_action");
    
    try {
      const donationId = `DON-2026-${Math.floor(1000 + Math.random() * 9000)}`;
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
        method: method === 'MTN' ? 'momo' : 'googlepay',
        status: 'completed'
      };

      // Save donation to charity_donations collection
      await setDoc(doc(db, "charity_donations", donationId), donationDoc);

      // Increment charity's currentAmount
      const updatedAmount = (selectedCharity.currentAmount || 0) + amountVal;
      await setDoc(doc(db, "charity", selectedCharity.id), {
        currentAmount: updatedAmount
      }, { merge: true });

      onShowToast("Bespoke Donation Recorded!", `Thank you! Your donation of ₵${amountVal} was securely sent.`, "success");
      onLogActivity(`Donated ₵${amountVal} to ${selectedCharity.name} via ${method}`, "user_action");

      // Set timeout to mock the API webhook completing
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
        <p className="text-neutral-500 text-xs md:text-sm leading-relaxed">
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
              className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-all hover:shadow-md group"
            >
              <div>
                {/* Image Section */}
                <div className="relative h-48 bg-neutral-100 overflow-hidden shrink-0">
                  <img 
                    src={charity.imageUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"} 
                    alt={charity.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-full text-[9px] font-black tracking-wider uppercase border bg-white/95 text-neutral-800 border-neutral-200 shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                      <span>Active Drive</span>
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-sans text-lg font-black text-neutral-900 tracking-tight leading-snug">
                      {charity.name}
                    </h3>
                    <p className="text-neutral-600 text-xs leading-relaxed line-clamp-3">
                      {charity.description}
                    </p>
                  </div>

                  {/* Highlights badges */}
                  <div className="grid grid-cols-3 gap-2 py-1 text-[9px] font-bold text-neutral-500 uppercase font-mono">
                    <div className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Accra CSR</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Bespoke Care</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>100% Direct</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar (The Thermometer) */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-medium">Funds Raised Goal</span>
                      <span className="font-bold text-neutral-900">{progressPercent}%</span>
                    </div>
                    
                    {/* Progress Track */}
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/40 relative">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500 relative"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/30 animate-pulse"></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono font-bold pt-0.5">
                      <span className="text-indigo-600">₵{charity.currentAmount.toLocaleString()} Raised</span>
                      <span className="text-neutral-400">Goal ₵{charity.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 bg-neutral-50 border-t border-neutral-100 mt-auto">
                <button 
                  onClick={() => handleDonateInit(charity)}
                  className="w-full bg-neutral-950 hover:bg-neutral-900 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Sponsor Campaign</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Donation Flow Modal (Staggered and elegant) */}
      <AnimatePresence>
        {selectedCharity && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl border border-neutral-150 relative"
            >
              <div className="space-y-1.5 text-center">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
                  <Heart className="w-5 h-5 fill-rose-50" />
                </div>
                <h3 className="font-sans text-lg font-black text-neutral-950 tracking-tight">
                  Support {selectedCharity.name}
                </h3>
                <p className="text-neutral-500 text-[11px]">
                  Select or enter your desired contribution amount in Ghana Cedis.
                </p>
              </div>

              {/* Preset Amount Chips */}
              <div className="grid grid-cols-5 gap-2">
                {["10", "25", "50", "100", "250"].map(preset => {
                  const active = donationAmount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDonationAmount(preset)}
                      className={`py-2 rounded-xl text-xs font-black tracking-wide border transition-all cursor-pointer ${
                        active 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10" 
                          : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      ₵{preset}
                    </button>
                  );
                })}
              </div>

              {/* Amount input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-neutral-400">Custom Amount (₵)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-xs text-neutral-400 font-black">₵</span>
                  <input 
                    type="number" 
                    value={donationAmount} 
                    onChange={e => setDonationAmount(e.target.value)} 
                    className="w-full pl-8 pr-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 bg-neutral-50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="Amount"
                    min="1"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase font-mono font-bold text-neutral-400">Select Gateway Option</p>
                
                {/* MTN Mobile Money */}
                <button 
                  disabled={loading} 
                  onClick={() => handlePayment('MTN')} 
                  className="w-full p-4 border border-neutral-200 rounded-2xl flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center font-black text-neutral-950 border border-amber-300 text-xs shrink-0 shadow-sm">
                      MTN
                    </div>
                    <div>
                      <p className="font-black text-xs text-neutral-900">MTN Mobile Money</p>
                      <p className="text-[10px] text-neutral-500 font-mono">Bespoke Merchant ID &bull; 0248899637</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Google Pay */}
                <button 
                  disabled={loading} 
                  onClick={() => handlePayment('GooglePay')} 
                  className="w-full p-4 border border-neutral-200 rounded-2xl flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center border border-neutral-800 shrink-0 shadow-sm">
                      <CreditCard className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-black text-xs text-neutral-900">Google Pay / Stripe</p>
                      <p className="text-[10px] text-neutral-500">Secure Direct Card Gateway</p>
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
                  className="text-neutral-500 hover:text-neutral-900 text-xs font-bold underline cursor-pointer disabled:opacity-50"
                >
                  Close & return
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
