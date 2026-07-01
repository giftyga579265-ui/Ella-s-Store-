import React, { useState } from "react";
import { Charity } from "../types";
import { Plus, Trash2, Edit, Save } from "lucide-react";

interface CharityManagerProps {
  charityData: Charity[];
  onSetCharityData: (data: Charity[]) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  onLogActivity: (activity: string, type: 'admin_action') => void;
}

export default function CharityManager({ charityData, onSetCharityData, onShowToast, onLogActivity }: CharityManagerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !targetAmount || !imageUrl) {
      onShowToast("Required Fields", "Please complete all fields and upload an image.", "error");
      return;
    }

    const newCharity: Charity = {
      id: editingId || `charity-${Date.now()}`,
      name,
      description,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      imageUrl,
      active: true
    };

    if (editingId) {
      onSetCharityData(charityData.map(c => c.id === editingId ? newCharity : c));
      onShowToast("Charity Updated", "Charity information updated.", "success");
      onLogActivity(`Updated charity: ${name}`, "admin_action");
    } else {
      onSetCharityData([...charityData, newCharity]);
      onShowToast("Charity Created", "New charity project created.", "success");
      onLogActivity(`Created new charity: ${name}`, "admin_action");
    }

    setName("");
    setDescription("");
    setTargetAmount("");
    setImageUrl("");
    setEditingId(null);
  };

  const startEdit = (charity: Charity) => {
    setEditingId(charity.id);
    setName(charity.name);
    setDescription(charity.description);
    setTargetAmount(charity.targetAmount.toString());
    setImageUrl(charity.imageUrl || "");
  };

  const deleteCharity = (id: string, name: string) => {
    if (confirm(`Delete charity "${name}"?`)) {
      onSetCharityData(charityData.filter(c => c.id !== id));
      onShowToast("Charity Deleted", "Charity removed.", "success");
      onLogActivity(`Deleted charity: ${name}`, "admin_action");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-neutral-900 font-medium">Charity Management</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
        <input type="text" placeholder="Charity Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Target Amount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full p-2 border rounded" />
        <div className="space-y-1">
          <label className="text-xs text-neutral-500 font-medium">Project Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border rounded" />
          {imageUrl && <img src={imageUrl} alt="Preview" className="w-20 h-20 object-cover mt-2 rounded" />}
        </div>
        <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded">
          {editingId ? "Update Charity" : "Create Charity"}
        </button>
      </form>

      <div className="grid gap-4">
        {charityData.map(charity => (
          <div key={charity.id} className="bg-white p-4 rounded-xl border flex items-center justify-between">
            <div>
              <h3 className="font-bold">{charity.name}</h3>
              <p className="text-sm text-neutral-500">{charity.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(charity)} className="text-blue-500"><Edit /></button>
              <button onClick={() => deleteCharity(charity.id, charity.name)} className="text-red-500"><Trash2 /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
