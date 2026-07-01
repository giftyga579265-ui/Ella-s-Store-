import React, { useState } from "react";
import { Charity } from "../types";
import { Heart, CreditCard, Smartphone } from "lucide-react";

interface CharityDonationsProps {
  charityData: Charity[];
  onLogActivity: (activity: string, type: string) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export default function CharityDonations({ charityData, onLogActivity, onShowToast }: CharityDonationsProps) {
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);

  const handleDonate = (charity: Charity) => {
    setSelectedCharity(charity);
    onLogActivity(`Selected charity for donation: ${charity.name}`, "user_action");
  };

  const handlePayment = (method: 'MTN' | 'GooglePay') => {
    if (!selectedCharity) return;
    
    onLogActivity(`Initiated payment for ${selectedCharity.name} via ${method}`, "user_action");
    onShowToast("Payment Initiated", `Processing donation of ${selectedCharity.name} via ${method}...`, "success");
    
    // In a real implementation, this would trigger an API call to a payment gateway
    // and redirect the user.
    setSelectedCharity(null);
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
                  onClick={() => handleDonate(charity)}
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
            <div className="space-y-4">
              <button onClick={() => handlePayment('MTN')} className="w-full p-4 border rounded-xl flex items-center gap-3 hover:bg-neutral-50 cursor-pointer">
                <Smartphone className="text-emerald-600" />
                <div>
                  <p className="font-bold">MTN Mobile Money</p>
                  <p className="text-xs text-neutral-500">0248899637</p>
                </div>
              </button>
              <button onClick={() => handlePayment('GooglePay')} className="w-full p-4 border rounded-xl flex items-center gap-3 hover:bg-neutral-50 cursor-pointer">
                <CreditCard className="text-blue-600" />
                <p className="font-bold">Google Pay</p>
              </button>
            </div>
            <button onClick={() => setSelectedCharity(null)} className="text-neutral-500 text-xs hover:underline cursor-pointer">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
