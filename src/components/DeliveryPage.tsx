import React, { useState } from 'react';
import { DeliveryRate, DeliveryPersonnel } from '../types';
import { MapPin, DollarSign, Truck, User, Plus, Trash2 } from 'lucide-react';
import DeliveryMap from './DeliveryMap';

interface DeliveryPageProps {
  rates: DeliveryRate[];
  personnel: DeliveryPersonnel[];
  onSetRates: (rates: DeliveryRate[]) => void;
  onSetPersonnel: (personnel: DeliveryPersonnel[]) => void;
}

export default function DeliveryPage({ rates, personnel, onSetRates, onSetPersonnel }: DeliveryPageProps) {
  const [activeTab, setActiveTab] = useState<'rates' | 'personnel'>('rates');
  const [newRate, setNewRate] = useState<DeliveryRate>({ id: Date.now().toString(), locationName: '', price: 0, distanceKm: 0 });
  const [newPersonnel, setNewPersonnel] = useState<DeliveryPersonnel>({ id: Date.now().toString(), name: '', phone: '', currentLat: 0, currentLng: 0, status: 'available' });

  const addRate = () => {
    onSetRates([...rates, newRate]);
    setNewRate({ id: Date.now().toString(), locationName: '', price: 0, distanceKm: 0 });
  };

  const addPersonnel = () => {
    onSetPersonnel([...personnel, newPersonnel]);
    setNewPersonnel({ id: Date.now().toString(), name: '', phone: '', currentLat: 0, currentLng: 0, status: 'available' });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-neutral-200 dark:border-slate-700">
        <button className={`pb-2 ${activeTab === 'rates' ? 'border-b-2 border-indigo-600 font-bold' : ''}`} onClick={() => setActiveTab('rates')}>Delivery Rates & Zones</button>
        <button className={`pb-2 ${activeTab === 'personnel' ? 'border-b-2 border-indigo-600 font-bold' : ''}`} onClick={() => setActiveTab('personnel')}>Delivery Personnel</button>
      </div>

      {activeTab === 'rates' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-neutral-200 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-indigo-600"/> Delivery Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            <input type="text" placeholder="Zone/Location Name" value={newRate.locationName} onChange={e => setNewRate({...newRate, locationName: e.target.value})} className="p-2 border rounded"/>
            <input type="number" placeholder="Price (₵)" value={newRate.price} onChange={e => setNewRate({...newRate, price: Number(e.target.value)})} className="p-2 border rounded"/>
            <input type="number" placeholder="Distance (km)" value={newRate.distanceKm} onChange={e => setNewRate({...newRate, distanceKm: Number(e.target.value)})} className="p-2 border rounded"/>
            <button onClick={addRate} className="bg-indigo-600 text-white p-2 rounded flex items-center justify-center gap-2 col-span-3"><Plus className="w-4 h-4"/> Add Pricing Rule</button>
          </div>
          <ul className="space-y-2">
            {rates.map(rate => (
              <li key={rate.id} className="p-3 bg-neutral-50 dark:bg-slate-950 rounded flex justify-between text-sm border border-neutral-100 dark:border-slate-800">
                <span><strong>{rate.locationName}</strong> - {rate.distanceKm} km</span>
                <span className="font-bold">₵{rate.price}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'personnel' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-neutral-200 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-indigo-600"/> Delivery Personnel Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            <input type="text" placeholder="Name" value={newPersonnel.name} onChange={e => setNewPersonnel({...newPersonnel, name: e.target.value})} className="p-2 border rounded"/>
            <input type="text" placeholder="Phone" value={newPersonnel.phone} onChange={e => setNewPersonnel({...newPersonnel, phone: e.target.value})} className="p-2 border rounded"/>
            <select value={newPersonnel.status} onChange={e => setNewPersonnel({...newPersonnel, status: e.target.value as any})} className="p-2 border rounded">
              <option value="available">Available</option>
              <option value="delivering">Delivering</option>
              <option value="off-duty">Off-duty</option>
            </select>
            <button onClick={addPersonnel} className="bg-indigo-600 text-white p-2 rounded flex items-center justify-center gap-2 col-span-3"><Plus className="w-4 h-4"/> Add Personnel</button>
          </div>
          <ul className="space-y-2">
            {personnel.map(p => (
              <li key={p.id} className="p-3 bg-neutral-50 dark:bg-slate-950 rounded flex justify-between text-sm border border-neutral-100 dark:border-slate-800">
                <span>{p.name} ({p.phone}) - <span className="font-mono text-xs">{p.currentLat.toFixed(4)}, {p.currentLng.toFixed(4)}</span></span>
                <span className={`font-bold ${p.status === 'available' ? 'text-green-600' : 'text-amber-600'}`}>{(p.status || '').toUpperCase()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Map Placeholder */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-neutral-200 dark:border-slate-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-600"/> Live Delivery Fleet Map</h3>
        <div className="h-[400px] bg-neutral-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-slate-700">
            <DeliveryMap personnel={personnel} />
        </div>
      </div>
    </div>
  );
}
