import React, { useState, useMemo } from "react";
import { Charity, Payment } from "../types";
import { Plus, Trash2, Edit, Save, Download, Users, DollarSign, Heart, TrendingUp, FileText, Search, Tag, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface CharityManagerProps {
  charityData: Charity[];
  charityDonations?: any[];
  payments?: Payment[];
  onSetCharityData: (data: Charity[]) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  onLogActivity: (activity: string, type: 'admin_action') => void;
}

export default function CharityManager({ 
  charityData, 
  charityDonations = [], 
  payments = [],
  onSetCharityData, 
  onShowToast, 
  onLogActivity 
}: CharityManagerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Administrative views navigation
  const [activeSubTab, setActiveSubTab] = useState<"projects" | "donors" | "ledger">("projects");
  const [searchQuery, setSearchQuery] = useState("");

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
    if (!name || !description || !targetAmount) {
      onShowToast("Required Fields", "Please complete name, description, and target amount.", "error");
      return;
    }

    const fallbackImage = imageUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600";

    const isNew = !editingId;
    const existingObj = charityData.find(c => c.id === editingId);
    
    const newCharity: Charity = {
      id: editingId || `charity-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: existingObj ? (existingObj.currentAmount || 0) : 0,
      imageUrl: fallbackImage,
      active: true
    };

    if (editingId) {
      onSetCharityData(charityData.map(c => c.id === editingId ? newCharity : c));
      onShowToast("Charity Updated", `Successfully updated project: ${name}`, "success");
      onLogActivity(`Updated charity project parameters for: ${name}`, "admin_action");
    } else {
      onSetCharityData([...charityData, newCharity]);
      onShowToast("Charity Created", `Successfully created project: ${name}`, "success");
      onLogActivity(`Created new charity project: ${name}`, "admin_action");
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

  const deleteCharity = (id: string, charName: string) => {
    if (confirm(`Are you sure you want to delete charity project "${charName}"? This action cannot be undone.`)) {
      onSetCharityData(charityData.filter(c => c.id !== id));
      onShowToast("Charity Deleted", "Charity project has been removed.", "success");
      onLogActivity(`Deleted charity project: ${charName}`, "admin_action");
    }
  };

  // 1. Group Donations by Customer to calculate "total money raised from every donated customer"
  const donorStats = useMemo(() => {
    const donorMap: Record<string, {
      name: string;
      email: string;
      totalDonated: number;
      donationCount: number;
      supportedCharities: Set<string>;
      lastDonationDate: string;
    }> = {};

    charityDonations.forEach(d => {
      const emailKey = (d.customerEmail || "anonymous@example.com").toLowerCase().trim();
      if (!donorMap[emailKey]) {
        donorMap[emailKey] = {
          name: d.customerName || "Anonymous Donor",
          email: d.customerEmail || "anonymous@example.com",
          totalDonated: 0,
          donationCount: 0,
          supportedCharities: new Set<string>(),
          lastDonationDate: d.date || "N/A"
        };
      }

      const entry = donorMap[emailKey];
      entry.totalDonated += parseFloat(d.amount) || 0;
      entry.donationCount += 1;
      if (d.charityName) {
        entry.supportedCharities.add(d.charityName);
      }
      
      // Update date if current donation date is newer
      if (d.date && d.date !== "N/A") {
        entry.lastDonationDate = d.date;
      }
    });

    return Object.values(donorMap).sort((a, b) => b.totalDonated - a.totalDonated);
  }, [charityDonations]);

  // Filtered lists based on search bar
  const filteredDonors = useMemo(() => {
    if (!searchQuery.trim()) return donorStats;
    const query = (searchQuery || '').toLowerCase().trim();
    return donorStats.filter(
      donor => 
        (donor.name || '').toLowerCase().includes(query) || 
        (donor.email || '').toLowerCase().includes(query)
    );
  }, [donorStats, searchQuery]);

  const filteredLedger = useMemo(() => {
    const sorted = [...charityDonations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (!searchQuery.trim()) return sorted;
    const query = (searchQuery || '').toLowerCase().trim();
    return sorted.filter(
      d => 
        (d.customerName || "").toLowerCase().includes(query) || 
        (d.customerEmail || "").toLowerCase().includes(query) || 
        (d.charityName || "").toLowerCase().includes(query) ||
        (d.id || "").toLowerCase().includes(query)
    );
  }, [charityDonations, searchQuery]);

  // Aggregate stats
  const aggregateDonationsTotal = useMemo(() => {
    return charityDonations.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
  }, [charityDonations]);

  // Helper to trigger CSV file download of spreadsheet
  const downloadDonationsCSV = (dataToExport: any[], fileNamePrefix: string) => {
    if (dataToExport.length === 0) {
      onShowToast("No Data", "There is no transaction data available to export.", "error");
      return;
    }

    // Define columns
    const headers = ["Donation ID", "Charity Project ID", "Charity Project Name", "Customer Donor Name", "Customer Donor Email", "Amount (GH₵)", "Donation Date", "Payment Gateway", "Transaction Status"];
    
    // Map items to row arrays
    const rows = dataToExport.map(d => [
      d.id || "N/A",
      d.charityId || "N/A",
      `"${(d.charityName || "N/A").replace(/"/g, '""')}"`,
      `"${(d.customerName || "N/A").replace(/"/g, '""')}"`,
      d.customerEmail || "N/A",
      d.amount || 0,
      d.date || "N/A",
      (d.method || "momo").toUpperCase(),
      (d.status || "completed").toUpperCase()
    ]);

    // Construct CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    // Download blob trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileNamePrefix}_ledger_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast("Spreadsheet Exported", `Saved spreadsheet CSV report of transactions successfully.`, "success");
    onLogActivity(`Exported charity transaction spreadsheet reports (${dataToExport.length} records)`, "admin_action");
  };

  const handleDownloadExcel = () => {
    try {
      if (charityDonations.length === 0 && payments.length === 0) {
        onShowToast("No Data Available", "There are no payment or donation records to export.", "error");
        return;
      }

      // 1. Create workbook
      const wb = XLSX.utils.book_new();

      // 2. Map Charity Donations Data
      const donationsSheetData = charityDonations.map(d => ({
        "Donation ID": d.id || "N/A",
        "Charity Project ID": d.charityId || "N/A",
        "Charity Project Name": d.charityName || "N/A",
        "Donor Name": d.customerName || "Anonymous Donor",
        "Donor Email": d.customerEmail || "anonymous@example.com",
        "Amount (GH₵)": parseFloat(d.amount) || 0,
        "Donation Date": d.date || "N/A",
        "Payment Gateway": (d.method || "momo").toUpperCase(),
        "Transaction Status": (d.status || "completed").toUpperCase()
      }));

      // 3. Map General Store Payments Data
      const paymentsSheetData = payments.map(p => ({
        "Transaction ID": p.id || "N/A",
        "Order Reference ID": p.orderId || "N/A",
        "Customer Name": p.customer || "N/A",
        "Payment Gateway": (p.method || "momo").toUpperCase(),
        "Amount Paid (GH₵)": parseFloat(p.amount as any) || 0,
        "Verification Date": p.date || "N/A",
        "Transaction Status": (p.status || "completed").toUpperCase()
      }));

      // 4. Create sheets from JSON
      const wsDonations = XLSX.utils.json_to_sheet(donationsSheetData);
      const wsPayments = XLSX.utils.json_to_sheet(paymentsSheetData);

      // 5. Auto-size columns for better layout formatting
      const fitToColumn = (data: any[]) => {
        if (!data || data.length === 0) return [];
        const keys = Object.keys(data[0]);
        return keys.map(key => {
          let maxLen = key.toString().length;
          data.forEach(row => {
            const val = row[key];
            if (val !== undefined && val !== null) {
              const valLen = val.toString().length;
              if (valLen > maxLen) maxLen = valLen;
            }
          });
          return { wch: Math.min(maxLen + 3, 50) };
        });
      };

      wsDonations["!cols"] = fitToColumn(donationsSheetData);
      wsPayments["!cols"] = fitToColumn(paymentsSheetData);

      // 6. Append Sheets to the workbook
      XLSX.utils.book_append_sheet(wb, wsDonations, "Charity Donations");
      XLSX.utils.book_append_sheet(wb, wsPayments, "Store Payments");

      // 7. Write and download the Excel workbook file
      XLSX.writeFile(wb, `Ella_Boutique_Financial_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`);

      onShowToast("Excel Exported", "Successfully downloaded Excel spreadsheet containing all payment and donation records.", "success");
      onLogActivity("Exported all payment and donation records to Excel workbook", "admin_action");
    } catch (error) {
      console.error("Failed to export Excel file:", error);
      onShowToast("Export Error", "An error occurred during Excel spreadsheet generation.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-neutral-900 to-indigo-950 text-white p-6 rounded-3xl border border-neutral-800 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent)] pointer-events-none" />
        <div className="space-y-1 z-10">
          <span className="text-indigo-400 text-[10px] font-mono tracking-widest uppercase font-black block">Philanthropy Operations</span>
          <h2 className="font-serif text-3xl font-medium tracking-tight">Charity, Donations & Sponsorships</h2>
          <p className="text-neutral-400 text-xs font-sans max-w-xl">
            Empower Ghana's kids and local health clinics. Track donor contributions, create projects, and print transaction ledgers in spreadsheet format.
          </p>
        </div>
        <div className="flex gap-4 items-center bg-white/5 border border-white/10 px-5 py-3 rounded-2xl z-10 shadow-inner">
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500/20 animate-pulse" />
          <div>
            <span className="text-[10px] text-neutral-400 font-mono font-medium block uppercase">Total Money Raised</span>
            <span className="text-xl font-black font-sans text-neutral-50">GH₵ {aggregateDonationsTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Panel Selection */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 dark:border-slate-700 pb-2.5 gap-4">
        <div className="flex gap-1 bg-neutral-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => { setActiveSubTab("projects"); setSearchQuery(""); }} 
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "projects" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-neutral-600 dark:text-slate-400 hover:text-neutral-950"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Philanthropic Projects ({charityData.length})
          </button>
          <button 
            onClick={() => { setActiveSubTab("donors"); setSearchQuery(""); }} 
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "donors" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-neutral-600 dark:text-slate-400 hover:text-neutral-950"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Donors & Contributions ({donorStats.length})
          </button>
          <button 
            onClick={() => { setActiveSubTab("ledger"); setSearchQuery(""); }} 
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "ledger" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-neutral-600 dark:text-slate-400 hover:text-neutral-950"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Global Donations Ledger ({charityDonations.length})
          </button>
        </div>

        {/* Global Downloads and Search */}
        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab !== "projects" && (
            <div className="relative w-48 sm:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input 
                type="text" 
                placeholder={activeSubTab === "donors" ? "Search donors..." : "Search ledger entries..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 dark:border-slate-700 rounded-lg text-black dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          )}
          <button 
            onClick={handleDownloadExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            title="Download full payment & donation records in Excel (.xlsx) format"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download as Spreadsheet (Excel)</span>
          </button>
          <button 
            onClick={() => downloadDonationsCSV(charityDonations, "global_donations")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer"
            title="Download charity donations as CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV (Donations)</span>
          </button>
        </div>
      </div>

      {/* 3. Sub-Tab Renders */}
      {activeSubTab === "projects" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creation/Editing Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-neutral-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-medium text-neutral-900 dark:text-slate-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-indigo-600" />
              {editingId ? "Modify Philanthropic Project" : "Initiate New Cause"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs font-medium">
              <div className="space-y-1">
                <label className="text-neutral-500 dark:text-slate-400">Project Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ashaiman Children Study Fund" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full p-2.5 border rounded-xl text-black dark:text-white bg-neutral-50 dark:bg-slate-950" 
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-500 dark:text-slate-400">Target Goal Amount (₵ / GH₵)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 15000" 
                  value={targetAmount} 
                  onChange={e => setTargetAmount(e.target.value)} 
                  className="w-full p-2.5 border rounded-xl text-black dark:text-white bg-neutral-50 dark:bg-slate-950" 
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-500 dark:text-slate-400">Description & Mission statement</label>
                <textarea 
                  placeholder="Provide precise descriptions about where this money is going..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full p-2.5 border rounded-xl text-black dark:text-white bg-neutral-50 dark:bg-slate-950 min-h-24" 
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-500 dark:text-slate-400">Project Cover Banner Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="w-full p-2 border border-dashed rounded-xl text-neutral-500 dark:text-slate-400 cursor-pointer bg-neutral-50 dark:bg-slate-950" 
                />
                {imageUrl && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border">
                    <img src={imageUrl} alt="Preview" className="w-full h-24 object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-sm text-xs transition-colors"
                >
                  {editingId ? "Save Changes" : "Create Project"}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null);
                      setName("");
                      setDescription("");
                      setTargetAmount("");
                      setImageUrl("");
                    }} 
                    className="bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 text-neutral-600 dark:text-slate-400 font-bold px-4 py-2.5 rounded-xl cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Active Causes List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-lg font-medium text-neutral-900 dark:text-slate-100">Active Store Causes</h3>
            <div className="grid gap-4">
              {charityData.length === 0 ? (
                <div className="bg-neutral-50 dark:bg-slate-950 border border-neutral-200 dark:border-slate-700 rounded-2xl p-8 text-center text-neutral-500 dark:text-slate-400">
                  <p className="font-bold">No Philanthropic Causes Configured</p>
                  <p className="text-xs mt-1">Populate using the form or seed the database to test the flow.</p>
                </div>
              ) : (
                charityData.map(charity => {
                  const percent = Math.min(100, Math.round(((charity.currentAmount || 0) / charity.targetAmount) * 100));
                  const projectDonations = charityDonations.filter(d => d.charityId === charity.id);
                  const projectTotal = projectDonations.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
                  
                  return (
                    <div key={charity.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-neutral-200 dark:border-slate-700 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex gap-4 items-center">
                          {charity.imageUrl && (
                            <img src={charity.imageUrl} alt={charity.name} className="w-16 h-16 object-cover rounded-xl shadow-sm border" />
                          )}
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Active Project
                            </span>
                            <h4 className="font-bold text-neutral-900 dark:text-slate-100 font-serif text-base">{charity.name}</h4>
                            <p className="text-xs text-neutral-500 dark:text-slate-400 line-clamp-2 max-w-md leading-relaxed">{charity.description}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 self-end sm:self-center">
                          <button 
                            onClick={() => downloadDonationsCSV(projectDonations, `project_${charity.id}`)}
                            title="Export Project Spreadsheet Report"
                            className="p-2 text-neutral-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer border border-neutral-100 dark:border-slate-800"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => startEdit(charity)} 
                            title="Edit Project"
                            className="p-2 text-neutral-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer border border-neutral-100 dark:border-slate-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteCharity(charity.id, charity.name)} 
                            title="Remove Cause"
                            className="p-2 text-neutral-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-neutral-100 dark:border-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Financial Tracker Bar */}
                      <div className="bg-neutral-50 dark:bg-slate-950 p-4.5 rounded-xl border space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <div className="space-x-1.5">
                            <span className="text-neutral-500 dark:text-slate-400 uppercase tracking-widest text-[9px] font-bold">Raised So Far:</span>
                            <span className="text-indigo-600 font-extrabold">GH₵ {projectTotal.toLocaleString()}</span>
                          </div>
                          <div className="space-x-1.5">
                            <span className="text-neutral-500 dark:text-slate-400 uppercase tracking-widest text-[9px] font-bold">Target Goal:</span>
                            <span className="text-neutral-900 dark:text-slate-100 font-extrabold">GH₵ {charity.targetAmount.toLocaleString()}</span>
                          </div>
                          <span className="text-emerald-600 font-black">{percent}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full transition-all duration-500 rounded-full" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono font-medium flex justify-between">
                          <span>Donations registered: {projectDonations.length} transactions</span>
                          <span>Last donation value: GH₵ {projectDonations[0]?.amount || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* activeSubTab === "donors" -> Customer-centric donation summaries */}
      {activeSubTab === "donors" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-5 border-b border-neutral-200 dark:border-slate-700 bg-neutral-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-medium text-neutral-900 dark:text-slate-100">Total Money Raised From Every Donated Customer</h3>
              <p className="text-xs text-neutral-500 dark:text-slate-400 font-sans mt-0.5">Aggregates and totals all philantropic contributions grouped by customer account.</p>
            </div>
            <button 
              onClick={() => {
                // Generate CSV summarizing each customer total raised
                const headers = ["Customer Name", "Customer Email", "Total Contribution (GH₵)", "Donation Actions", "Distinct Charities Supported", "Last Transaction Date"];
                const rows = donorStats.map(d => [
                  `"${(d.name || "Unknown").replace(/"/g, '""')}"`,
                  d.email,
                  d.totalDonated,
                  d.donationCount,
                  `"${Array.from(d.supportedCharities || []).join(", ").replace(/"/g, '""')}"`,
                  d.lastDonationDate
                ]);
                const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `customer_charity_contributions_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                onShowToast("Donors Spreadsheet Exported", `Saved customer contributions report successfully.`, "success");
              }}
              className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 self-start"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Donors Summary (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400 font-mono text-[9px] font-black uppercase tracking-wider border-b border-neutral-200 dark:border-slate-700">
                  <th className="py-3 px-5">Customer Donor</th>
                  <th className="py-3 px-5">Customer Email</th>
                  <th className="py-3 px-5">Total Donations</th>
                  <th className="py-3 px-5">Total Amount Raised</th>
                  <th className="py-3 px-5">Causes Sponsored</th>
                  <th className="py-3 px-5">Last Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150 font-sans text-xs">
                {filteredDonors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500 dark:text-slate-400 font-semibold">
                      No matching customer accounts or donations found.
                    </td>
                  </tr>
                ) : (
                  filteredDonors.map((donor, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-neutral-900 dark:text-slate-100 flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 text-indigo-600 font-black rounded-full flex items-center justify-center text-[10px] uppercase shadow-inner">
                          {donor.name.charAt(0)}
                        </div>
                        <span>{donor.name}</span>
                      </td>
                      <td className="py-3.5 px-5 text-neutral-600 dark:text-slate-400 font-mono text-[11px]">{donor.email}</td>
                      <td className="py-3.5 px-5 font-bold text-neutral-700 dark:text-slate-300">{donor.donationCount} payments</td>
                      <td className="py-3.5 px-5 font-extrabold text-indigo-600 font-mono text-sm">
                        GH₵ {donor.totalDonated.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(donor.supportedCharities).map((cName, cIdx) => (
                            <span key={cIdx} className="bg-neutral-100 dark:bg-slate-800 border text-neutral-600 dark:text-slate-400 text-[9px] px-2 py-0.5 rounded-full font-bold truncate max-w-[120px]" title={cName}>
                              {cName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-neutral-400 font-mono">{donor.lastDonationDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* activeSubTab === "ledger" -> Direct payments listing */}
      {activeSubTab === "ledger" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-5 border-b border-neutral-200 dark:border-slate-700 bg-neutral-50 dark:bg-slate-950 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-medium text-neutral-900 dark:text-slate-100">Global Philanthropic Donations Ledger</h3>
              <p className="text-xs text-neutral-500 dark:text-slate-400 font-sans mt-0.5">Line-by-line detailed listing of all completed donor transactions.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400 font-mono text-[9px] font-black uppercase tracking-wider border-b border-neutral-200 dark:border-slate-700">
                  <th className="py-3 px-5">Donation ID</th>
                  <th className="py-3 px-5">Donor</th>
                  <th className="py-3 px-5">Sponsored Cause</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Payment Method</th>
                  <th className="py-3 px-5 text-right">Amount (GH₵)</th>
                  <th className="py-3 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150 font-sans text-xs">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500 dark:text-slate-400 font-semibold">
                      No matching records found in the global payments ledger.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((d, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-[10px] text-neutral-400 font-bold">#{d.id}</td>
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-neutral-900 dark:text-slate-100">{d.customerName || "Anonymous Donor"}</p>
                        <p className="text-[10px] text-neutral-500 dark:text-slate-400 font-mono">{d.customerEmail || "anonymous@example.com"}</p>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-neutral-800 dark:text-slate-200">{d.charityName || "N/A"}</td>
                      <td className="py-3.5 px-5 text-neutral-500 dark:text-slate-400 font-mono text-[11px]">{d.date}</td>
                      <td className="py-3.5 px-5">
                        <span className="bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400 border px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase">
                          {d.method || "momo"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-extrabold text-indigo-600 font-mono text-sm">
                        GH₵ {(parseFloat(d.amount) || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200/50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide">
                          {(d.status || "completed")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
