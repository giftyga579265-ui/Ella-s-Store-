import React, { useState } from "react";
import { Charity } from "../types";
import { Heart, CreditCard, Smartphone } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface CharityDonationsProps {
  charityData: Charity[];
  onLogActivity: (activity: string, type: string) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export default function CharityDonations({ charityData, onLogActivity, onShowToast }: CharityDonationsProps) {
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>("10");
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
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(donationAmount), charityName: selectedCharity.name }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        onShowToast("Payment Error", "Failed to initiate payment.", "error");
      }
    } catch (error) {
      onShowToast("Payment Error", "An error occurred.", "error");
    } finally {
      setLoading(false);
      setSelectedCharity(null);
    }
  };

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="font-sans text-3xl md:text-4xl text-black font-bold tracking-tight">Charity Donations</h2>
        <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase font-bold">Support causes that matter</p>
      </div>

      <div className="grid gap-6">
        {charityData.filter(c => c.active).map(charity => (
          <div key={charity.id} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
            {charity.imageUrl && <img src={charity.imageUrl} alt={charity.name} className="w-32 h-32 rounded-2xl object-cover" />}
            <div className="flex-1 space-y-2">
              <h3 className="font-sans text-xl font-bold">{charity.name}</h3>
              <p className="text-neutral-600 text-sm">{charity.description}</p>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold">₵{charity.currentAmount} / ₵{charity.targetAmount}</span>
                <button 
                  onClick={() => handleDonateInit(charity)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-indigo-500 cursor-pointer"
                >
                  Donate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedCharity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full space-y-6">
            <h3 className="font-sans text-lg font-bold">Donate to {selectedCharity.name}</h3>
            <input 
              type="number" 
              value={donationAmount} 
              onChange={e => setDonationAmount(e.target.value)} 
              className="w-full p-2 border rounded"
              placeholder="Amount"
            />
            <div className="space-y-4">
              <button disabled={loading} onClick={() => handlePayment('MTN')} className="w-full p-4 border rounded-xl flex items-center gap-3 hover:bg-neutral-50 cursor-pointer disabled:opacity-50">
                <Smartphone className="text-emerald-600" />
                <div>
                  <p className="font-bold">MTN Mobile Money</p>
                  <p className="text-xs text-neutral-500">{loading ? "Processing..." : "0248899637"}</p>
                </div>
              </button>
              <button disabled={loading} onClick={() => handlePayment('GooglePay')} className="w-full p-4 border rounded-xl flex items-center gap-3 hover:bg-neutral-50 cursor-pointer disabled:opacity-50">
                <CreditCard className="text-blue-600" />
                <p className="font-bold">{loading ? "Processing..." : "Google Pay"}</p>
              </button>
            </div>
            <button disabled={loading} onClick={() => setSelectedCharity(null)} className="text-neutral-500 text-xs hover:underline cursor-pointer disabled:opacity-50">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
