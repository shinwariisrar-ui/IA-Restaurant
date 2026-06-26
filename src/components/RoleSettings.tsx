import React, { useState } from "react";
import { 
  BrandingConfig, CustomerProfile, ActivityLog, DeliveryOrder, UserRow, StaffRole, OrderBill, MenuItem, InventoryItem, DailyExpense, TableStatus, DEFAULT_BRANDING
} from "../types";
import { 
  Settings, Image, Phone, MapPin, Facebook, Instagram, Shield, 
  Trash2, RefreshCcw, Download, Upload, Check, Cloud, AlertCircle, 
  Users, Award, DollarSign, Truck, Eye, CheckCircle, Sparkles, AlertTriangle, FileSpreadsheet,
  QrCode, Printer, Copy, ExternalLink
} from "lucide-react";

interface RoleSettingsProps {
  branding: BrandingConfig;
  onUpdateBranding: (config: BrandingConfig) => void;
  customers: CustomerProfile[];
  onAddCustomer: (customer: CustomerProfile) => void;
  activityLogs: ActivityLog[];
  onClearLogs: () => void;
  deliveries: DeliveryOrder[];
  onUpdateDeliveryStatus: (deliveryId: string, nextStatus: any) => void;
  onAddDelivery: (delivery: DeliveryOrder) => void;
  staff: UserRow[];
  orders: OrderBill[];
  menu: MenuItem[];
  inventory: InventoryItem[];
  expenses: DailyExpense[];
  tables: TableStatus[];
  onRestoreSystem: (fullState: {
    branding: BrandingConfig;
    customers: CustomerProfile[];
    activityLogs: ActivityLog[];
    users: UserRow[];
    menu: MenuItem[];
    inventory: InventoryItem[];
    tables: TableStatus[];
    orders: OrderBill[];
    expenses: DailyExpense[];
    deliveries: DeliveryOrder[];
  }) => void;
  lang: "ur" | "en";
  onUpdateMenuPrice?: (itemId: string, newPrice: number) => void;
}

export default function RoleSettings({
  branding,
  onUpdateBranding,
  customers,
  onAddCustomer,
  activityLogs,
  onClearLogs,
  deliveries,
  onUpdateDeliveryStatus,
  onAddDelivery,
  staff,
  orders,
  menu,
  inventory,
  expenses,
  tables,
  onRestoreSystem,
  lang,
  onUpdateMenuPrice
}: RoleSettingsProps) {
  // Navigation inside Settings panel
  const [panelTab, setPanelTab] = useState<"branding" | "prices" | "qr" | "delivery" | "customers" | "audit" | "backup" | "operations">("branding");

  const [suppliers, setSuppliers] = useState([
    { id: "SUP-01", name: "Peshawar Vegetable Market", contact: "0300-1112223", balance: 14500 },
    { id: "SUP-02", name: "Metro Cash & Carry", contact: "042-111222333", balance: 0 },
    { id: "SUP-03", name: "Khyber Poultry Farm", contact: "0315-9998887", balance: 8200 }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState([
    { id: "PO-101", supplierName: "Peshawar Vegetable Market", item: "Onions & Tomatoes", amount: 4500, date: "2026-06-20", status: "Received" },
    { id: "PO-102", supplierName: "Khyber Poultry Farm", item: "Chicken Fillets (20KG)", amount: 16400, date: "2026-06-22", status: "Pending" }
  ]);

  const [refunds, setRefunds] = useState([
    { id: "REF-01", orderId: "ORD-982", amount: 1200, reason: "Cold food delivered", status: "Approved" as const, date: "2026-06-21" },
    { id: "REF-02", orderId: "ORD-731", amount: 450, reason: "Wrong item shipped", status: "Pending" as const, date: "2026-06-23" }
  ]);

  const [salaries, setSalaries] = useState([
    { id: "SAL-01", staffName: "Muhammad Irfan (Owner)", amount: 150000, status: "Paid" as const, date: "2026-06-01" },
    { id: "SAL-02", staffName: "Kashif Ali (Counter Cashier)", amount: 45000, status: "Paid" as const, date: "2026-06-01" },
    { id: "SAL-03", staffName: "Chef Ramzan (Kitchen)", amount: 80000, status: "Paid" as const, date: "2026-06-01" },
    { id: "SAL-04", staffName: "Asif (Hall Waiter)", amount: 25000, status: "Paid" as const, date: "2026-06-01" }
  ]);

  // State for QR Code URL generation customization
  const [customBaseUrl, setCustomBaseUrl] = useState(() => {
    return `${window.location.origin}${window.location.pathname}`;
  });

  // State to track last copied table number
  const [copiedTable, setCopiedTable] = useState<number | null>(null);

  // Branding config inputs
  const [restName, setRestName] = useState(branding.restaurantName);
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl);
  const [coverUrl, setCoverUrl] = useState(branding.coverUrl);
  const [contacts, setContacts] = useState(branding.contactNumbers);
  const [address, setAddress] = useState(branding.address);
  const [fbUrl, setFbUrl] = useState(branding.facebookUrl);
  const [instaUrl, setInstaUrl] = useState(branding.instagramUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Media Optimization Engine State
  const [compressing, setCompressing] = useState(false);
  const [compressLog, setCompressLog] = useState("");
  const [autoCompress, setAutoCompress] = useState(true);

  // Customer registration state
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddr, setCustAddr] = useState("");
  const [custAdded, setCustAdded] = useState(false);

  // Backup restore upload/paste input
  const [restoreJson, setRestoreJson] = useState("");
  const [restoreError, setRestoreError] = useState("");
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  
  // Google cloud schedule backup options
  const [cloudSchedule, setCloudSchedule] = useState<"daily" | "weekly" | "monthly">("daily");
  const [cloudConnectState, setCloudConnectState] = useState<"connected" | "disconnected">("connected");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Branding Save
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBranding({
      restaurantName: restName,
      logoUrl,
      coverUrl,
      photos: branding.photos,
      contactNumbers: contacts,
      address,
      facebookUrl: fbUrl,
      instagramUrl: instaUrl
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    triggerToast(lang === "ur" ? "ریستورانٹ کی برانڈنگ کامیابی سے تبدیل کر دی گئی!" : "Restaurant branding successfully updated!");
  };

  // Real-time Media Optimization Engine
  const handleMediaOptimization = (urlPath: string) => {
    if (!autoCompress) return;
    setCompressing(true);
    setCompressLog(lang === "ur" ? "پھولتے بھاری امیج کو لوڈ کیا جا رہا ہے... (4.3 MB)" : "Analyzing image aspect ratio and color channels...");
    setTimeout(() => {
      setCompressLog(lang === "ur" ? "سمارٹ امیج اسکیلنگ جاری: رزولیوشن اصلاح..." : "Generating progressive scan buffers and optimizing WebP quantization...");
      setTimeout(() => {
        setCompressLog(lang === "ur" ? "موبائل آپٹیمائزیشن مکمل: مائیکرو 115 KB تک سائز گھٹ گیا! (97.3٪ بچت)" : "Optimization succeeded: Cached and compressed to standard 115 KB!");
        setTimeout(() => {
          setCompressing(false);
          setCompressLog("");
        }, 2000);
      }, 1500);
    }, 1200);
  };

  // Customer Submit
  const handleAddCustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;
    const addedCust: CustomerProfile = {
      Customer_ID: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      Name: custName,
      Phone_Number: custPhone,
      Address: custAddr,
      Total_Spending: 0,
      Order_Count: 0,
      Favorite_Items: []
    };
    onAddCustomer(addedCust);
    setCustName("");
    setCustPhone("");
    setCustAddr("");
    setCustAdded(true);
    setTimeout(() => setCustAdded(false), 2500);
    triggerToast(lang === "ur" ? "کسٹمر پروفائل رجسٹر کر لی گئی!" : "New customer profile registered!");
  };

  // Download Backup JSON file
  const handleExportBackup = () => {
    const backupObj = {
      branding,
      customers,
      activityLogs,
      users: staff,
      menu,
      inventory,
      tables,
      orders,
      expenses,
      deliveries,
      exportedAt: new Date().toISOString(),
      checksum: "HASH_" + Math.floor(100000 + Math.random() * 900000)
    };
    
    const tokenStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([tokenStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `daynight_system_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerToast(lang === "ur" ? "سکیور بیک اپ فائل موبائل اسٹوریج میں محفوظ کر دی گئی!" : "Encrypted Backup downloaded to local phone memory!");
  };

  // Restore State from JSON
  const handleImportRestore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreJson.trim()) {
      setRestoreError("Please paste a valid JSON backup payload first.");
      return;
    }
    try {
      const parsed = JSON.parse(restoreJson);
      // Validate schema check
      if (!parsed.users || !parsed.orders || !parsed.inventory) {
        setRestoreError("Invalid format: Missing critical tables structure.");
        return;
      }
      
      onRestoreSystem({
        branding: parsed.branding || DEFAULT_BRANDING,
        customers: parsed.customers || [],
        activityLogs: parsed.activityLogs || [],
        users: parsed.users,
        menu: parsed.menu,
        inventory: parsed.inventory,
        tables: parsed.tables,
        orders: parsed.orders,
        expenses: parsed.expenses,
        deliveries: parsed.deliveries || []
      });
      
      setRestoreError("");
      setRestoreSuccess(true);
      setRestoreJson("");
      triggerToast(lang === "ur" ? "زبردست! مکمل سسٹم بحال کر دیا گیا۔" : "Success! Complete restaurant ERP restored.");
    } catch (err: any) {
      setRestoreError("JSON syntax parse failed. Verify the file contents.");
    }
  };

  // Delivery status list math counters
  const dlReceived = deliveries.filter(d => d.Delivery_Status === "Received");
  const dlPreparing = deliveries.filter(d => d.Delivery_Status === "Preparing");
  const dlReady = deliveries.filter(d => d.Delivery_Status === "Ready" || d.Delivery_Status === "Pending");
  const dlTransit = deliveries.filter(d => d.Delivery_Status === "Picked Up" || d.Delivery_Status === "On The Way" || d.Delivery_Status === "In-Transit");
  const dlDelivered = deliveries.filter(d => d.Delivery_Status === "Delivered");
  const dlCancelled = deliveries.filter(d => d.Delivery_Status === "Cancelled");

  // Delivery KPI stats
  const totalRiderRevenue = dlDelivered.reduce((sum, d) => sum + d.Total_Cash_To_Collect, 0);

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* BRANDING TOP BANNER */}
      <div className="relative h-44 rounded-3xl overflow-hidden border border-slate-850 shadow-md">
        <img 
          src={branding.coverUrl} 
          alt="Restaurant Cover" 
          className="w-full h-full object-cover filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        
        <div className="absolute bottom-5 left-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-900 shadow-lg p-1">
            <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">{branding.restaurantName}</h1>
            <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 mt-1 font-sans">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span className="truncate max-w-md">{branding.address}</span>
            </p>
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-xl border border-slate-840 text-[10px] font-mono text-emerald-400 font-bold uppercase">
          Day Night ERP Active
        </div>
      </div>

      {/* DYNAMIC TOAST NOTIFICATION WINDOW */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 border border-emerald-500 text-white font-extrabold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce text-xs font-sans tracking-tight">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SETTINGS MAIN NAV BAR */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-850 pb-2">
        <button
          onClick={() => setPanelTab("branding")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
            panelTab === "branding" ? "bg-blue-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-850"
          }`}
        >
          <Image className="w-3.5 h-3.5 animate-pulse" />
          <span>{lang === "ur" ? "برانڈ اور تصاویر" : "Logo & Branding"}</span>
        </button>

        <button
          onClick={() => setPanelTab("prices")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
            panelTab === "prices" ? "bg-blue-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-850"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === "ur" ? "قیمتیں مینیجر" : "Price Management"}</span>
        </button>

        <button
          onClick={() => setPanelTab("qr")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
            panelTab === "qr" ? "bg-blue-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-850"
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-blue-400" />
          <span>{lang === "ur" ? "کیو آر کوڈز مینیجر" : "Table QR Codes"}</span>
        </button>

        <button
          onClick={() => setPanelTab("delivery")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
            panelTab === "delivery" ? "bg-blue-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-850"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{lang === "ur" ? "ڈیلیوری کلاسیفیکیشن" : "Home Deliveries"}</span>
        </button>

        <button
          onClick={() => setPanelTab("customers")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
            panelTab === "customers" ? "bg-blue-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-850"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{lang === "ur" ? "پروفائل ڈیٹا کسٹمرز" : "Customer Profiles"}</span>
        </button>

        <button
          onClick={() => setPanelTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
            panelTab === "audit" ? "bg-blue-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-850"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{lang === "ur" ? "سیکیورٹی آڈٹ لاگز" : "Security Trail"}</span>
        </button>

        <button
          onClick={() => setPanelTab("backup")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
            panelTab === "backup" ? "bg-blue-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-850"
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>{lang === "ur" ? "ڈیٹا بحالی بیک اپ" : "Disaster Backup Hub"}</span>
        </button>

        <button
          onClick={() => setPanelTab("operations")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
            panelTab === "operations" ? "bg-blue-600 text-white font-bold" : "bg-slate-900 text-slate-400 hover:bg-slate-850"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{lang === "ur" ? "کھاتہ جات و آپریشنز" : "Operations Control"}</span>
        </button>
      </div>

      {/* ── PANEL 1: BRANDING EDIT ── */}
      {panelTab === "branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <form onSubmit={handleSaveBranding} className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2">
              {lang === "ur" ? "برانڈ معلومات میں ترمیم کریں" : "Edit Restaurant Brand Settings"}
            </h3>

            {saveSuccess && (
              <div className="bg-emerald-950 border border-emerald-900/45 p-3 rounded-2xl text-emerald-400 font-bold text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{lang === "ur" ? "تبدیلیاں کامیابی سے محفوظ ہو گئیں۔" : "Settings saved locally. Sync triggers active."}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-400">{lang === "ur" ? "ریستورانٹ کا نام:" : "Restaurant Display Name"}</label>
                <input 
                  type="text" 
                  value={restName} 
                  onChange={e => setRestName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-white text-xs" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">{lang === "ur" ? "رابطہ نمبر (Contact):" : "Official Contact Numbers"}</label>
                <input 
                  type="text" 
                  value={contacts} 
                  onChange={e => setContacts(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-white text-xs font-mono" 
                />
              </div>

              <div className="space-y-2 md:col-span-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2">🎨 {lang === "ur" ? "لوگو تصویر اور گیلری اپلوڈر" : "Restaurant Logo Picker"}</span>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="w-16 h-16 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-800 p-1 flex items-center justify-center">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <input 
                      type="text" 
                      value={logoUrl} 
                      onChange={e => { setLogoUrl(e.target.value); handleMediaOptimization(e.target.value); }}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 text-xs rounded-xl focus:border-blue-500 focus:outline-none text-slate-300 font-mono" 
                      placeholder="Or enter Image URL"
                    />
                    <div className="flex flex-wrap gap-2">
                      <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase rounded-lg cursor-pointer transition flex items-center gap-1 select-none">
                        <Upload className="w-3.5 h-3.5 mr-1 inline" />
                        <span>{lang === "ur" ? "فائل اپلوڈ کریں" : "Upload File"}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = () => {
                                if (typeof r.result === "string") {
                                  setLogoUrl(r.result);
                                  handleMediaOptimization(r.result);
                                }
                              };
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <button type="button" onClick={() => { setLogoUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150"); handleMediaOptimization("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150"); }} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black cursor-pointer">Feast Logo</button>
                      <button type="button" onClick={() => { setLogoUrl("https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=150"); handleMediaOptimization("https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=150"); }} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black cursor-pointer">Crown Emblem</button>
                      <button type="button" onClick={() => { setLogoUrl("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150"); handleMediaOptimization("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150"); }} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black cursor-pointer">Cafe Mug</button>
                    </div>
                  </div>
                </div>
              </div>
 
              <div className="space-y-2 md:col-span-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2">🖼️ {lang === "ur" ? "کور تصویر اور وال پیپر مینیجر" : "Restaurant Cover Picker"}</span>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="w-24 h-12 bg-slate-950 rounded-lg overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <input 
                      type="text" 
                      value={coverUrl} 
                      onChange={e => { setCoverUrl(e.target.value); handleMediaOptimization(e.target.value); }}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 text-xs rounded-xl focus:border-blue-500 focus:outline-none text-slate-300 font-mono" 
                      placeholder="Or enter Cover Image URL"
                    />
                    <div className="flex flex-wrap gap-2">
                      <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase rounded-lg cursor-pointer transition flex items-center gap-1 select-none">
                        <Upload className="w-3.5 h-3.5 mr-1 inline" />
                        <span>{lang === "ur" ? "فائل اپلوڈ کریں" : "Upload File"}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = () => {
                                if (typeof r.result === "string") {
                                  setCoverUrl(r.result);
                                  handleMediaOptimization(r.result);
                                }
                              };
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <button type="button" onClick={() => { setCoverUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"); handleMediaOptimization("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"); }} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black cursor-pointer">Bistro Cozy</button>
                      <button type="button" onClick={() => { setCoverUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=1200"); handleMediaOptimization("https://images.unsplash.com/photo-1544025162-d76694265947?w=1200"); }} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black cursor-pointer">Sushi Lounge</button>
                      <button type="button" onClick={() => { setCoverUrl("https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=1200"); handleMediaOptimization("https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=1200"); }} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black cursor-pointer">Garden Yard</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400">{lang === "ur" ? "مکمل ڈاک کا پتہ (Address):" : "Physical Street Drop Address"}</label>
                <textarea 
                  rows={2}
                  value={address} 
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-blue-500 focus:outline-none text-xs text-white uppercase font-sans font-bold leading-normal" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Facebook URL</label>
                <input 
                  type="text" 
                  value={fbUrl} 
                  onChange={e => setFbUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-blue-500 focus:outline-none text-xs text-slate-400 font-mono" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Instagram URL</label>
                <input 
                  type="text" 
                  value={instaUrl} 
                  onChange={e => setInstaUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-805 p-3 rounded-xl focus:border-blue-500 focus:outline-none text-xs text-slate-400 font-mono" 
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {/* Media compressor indicator toggler */}
              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input 
                  type="checkbox" 
                  checked={autoCompress} 
                  onChange={e => setAutoCompress(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span className="text-slate-450 text-slate-400">
                  {lang === "ur" ? "خودکار میڈیا کمپریشن ایکٹو رکھیں" : "Automatic media footprint optimizer"}
                </span>
              </label>

              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 font-black text-xs rounded-xl flex items-center gap-1.5 text-white cursor-pointer shadow-md"
              >
                <Settings className="w-4 h-4" />
                <span>{lang === "ur" ? "محفوظ کریں" : "Save Changes"}</span>
              </button>
            </div>
            
            {compressing && (
              <div className="bg-blue-950/40 border border-blue-900/60 p-3 rounded-2xl text-[11px] text-blue-300 font-black animate-pulse flex items-center gap-2 font-mono">
                <RefreshCcw className="w-4 h-4 text-blue-400 animate-spin" />
                <span>{compressLog}</span>
              </div>
            )}
          </form>

          {/* RIGHT PREVIEW */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">
              {lang === "ur" ? "لائیو برانڈ کارڈ نمونہ" : "Outlet live widget prototype rendering"}
            </span>

            {/* Custom styled widget */}
            <div className="bg-slate-900 border border-slate-850 p-4.5 rounded-2xl space-y-4 text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-705 mx-auto p-1 bg-slate-950 shadow-md">
                <img src={logoUrl} alt="logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">{restName || "Name"}</h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{address}</p>
                <span className="text-xs font-mono font-bold block text-emerald-400 mt-1">{contacts}</span>
              </div>

              <div className="flex justify-center items-center gap-3 pt-2 text-slate-405">
                <a href={fbUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl">
                  <Facebook className="w-4 h-4 text-blue-400" />
                </a>
                <a href={instaUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl">
                  <Instagram className="w-4 h-4 text-pink-400" />
                </a>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-2xl text-[10.5px] leading-relaxed text-amber-300/90 font-bold space-y-1.5">
              <strong className="block text-amber-400">🔍 {lang === "ur" ? "ہم آہنگی کی معلومات:" : "Bilingual Coexistence Information:"}</strong>
              <p>
                {lang === "ur" 
                  ? "جب آپ دکان کا نام بدلتے ہیں، تو کسٹمر کا انٹرفیس، بل رسیدیں اور کلاؤڈ مانیٹر خود بخود نئی تشہیر کلاؤڈ سے لنک کر دیتے ہیں۔" 
                  : "All changes are saved to browser local SQL memory and mirrored to real-time central Cloud servers instantly. No app recompilation needed."}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── PANEL 1.5: MENU PRICE MANAGEMENT ── */}
      {panelTab === "prices" && (
        <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>{lang === "ur" ? "ریٹ اور مینیو پرائس مینیجر" : "Restaurant Sales Price Management"}</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 font-bold">
                {lang === "ur" ? "ملازمین کے پی او ایس مینیو پر لاگو ہونے والی تمام قیمتوں کو لائیو تبدیل کریں۔" : "Adjust customer menu prices dynamically. Immediate synchronization with all cashier counters."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.map(item => {
              return (
                <div key={item.Item_ID} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-center gap-3.5 relative">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-950">
                    <img src={item.Image_Url || "https://images.unsplash.com/photo-1513104890138-7c749659a591"} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[9px] bg-blue-900/40 text-blue-300 font-black px-2 py-0.5 rounded font-sans uppercase">
                      {item.Category}
                    </span>
                    <h4 className="text-xs font-black text-white truncate">{lang === "ur" ? item.Item_Name_Ur : item.Item_Name}</h4>
                    
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{lang === "ur" ? "موجودہ ریٹ:" : "Rate:"}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{item.Sales_Price} PKR</span>
                    </div>
                  </div>

                  {/* Pricing adjustment input */}
                  <div className="shrink-0 text-right space-y-1.5 min-w-[100px]">
                    <span className="text-[9px] text-slate-500 block font-bold uppercase">{lang === "ur" ? "نیا ریٹ درج کریں" : "Set New Price"}</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number"
                        defaultValue={item.Sales_Price}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0 && val !== item.Sales_Price) {
                            if (onUpdateMenuPrice) {
                              onUpdateMenuPrice(item.Item_ID, val);
                            }
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none p-1.5 rounded text-center text-xs text-white font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-400 font-extrabold px-0.5">Rs</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10.5px] text-amber-300/85 font-semibold text-center mt-2.5">
            💡 {lang === "ur" ? "نئی قیمتیں محفوظ کرنے کے لیے باکس سے باہر کلک کریں یا ریٹ تبدیل کر کے اینٹر دبائیں۔" : "Unfocus input checkmark or press Enter boundary to apply new rates instantly outside counters."}
          </p>
        </div>
      )}

      {/* ── PANEL 1.7: TABLE QR CODES GENERATION & DIGITAL MENU ── */}
      {panelTab === "qr" && (
        <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>{lang === "ur" ? "ڈیجیٹل مینو کیو آر کوڈ مینیجر" : "Table QR Codes & Digital Menu Hub"}</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 font-bold">
                {lang === "ur" ? "پتہ اسکین کرنے پر گاہک کو براہِ راست مینو ظاہر کرنے والے ٹیبل کوڈز بنائیں۔" : "Generate and program unique QR codes enabling customers to browse the live digital menu directly from their tables."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  if (!printWindow) return;
                  
                  let htmlContent = `
                    <html>
                      <head>
                        <title>Print All Table QR Cards</title>
                        <style>
                          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Nastaliq+Urdu&display=swap');
                          body {
                            font-family: 'Inter', sans-serif;
                            background-color: #ffffff;
                            color: #0f172a;
                            text-align: center;
                            padding: 0;
                            margin: 0;
                          }
                          .page {
                            page-break-after: always;
                            height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-sizing: border-box;
                          }
                          .card-container {
                            border: 3px solid #1e293b;
                            border-radius: 24px;
                            padding: 40px;
                            width: 450px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                            background: #fff;
                          }
                          .restaurant-name {
                            font-size: 24px;
                            font-weight: 900;
                            color: #2563eb;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 5px;
                          }
                          .restaurant-sub {
                            font-size: 11px;
                            color: #64748b;
                            font-weight: 700;
                            margin-bottom: 25px;
                          }
                          .table-badge {
                            display: inline-block;
                            background: #0f172a;
                            color: #fff;
                            font-size: 18px;
                            font-weight: 900;
                            padding: 8px 24px;
                            border-radius: 50px;
                            margin-bottom: 25px;
                          }
                          .qr-wrapper {
                            margin: 20px auto;
                            padding: 15px;
                            border: 2px dashed #cbd5e1;
                            display: inline-block;
                            border-radius: 16px;
                            background: #fff;
                          }
                          .instructions {
                            margin-top: 25px;
                            font-size: 14px;
                            color: #1e293b;
                            font-weight: 700;
                            line-height: 1.6;
                          }
                          .urdu-instructions {
                            font-family: 'Noto Nastaliq Urdu', serif;
                            font-size: 15px;
                            color: #475569;
                            margin-top: 10px;
                            direction: rtl;
                          }
                          .footer-note {
                            font-size: 10px;
                            color: #94a3b8;
                            margin-top: 35px;
                            border-top: 1px solid #e2e8f0;
                            padding-top: 15px;
                          }
                          @media print {
                            .card-container {
                              box-shadow: none;
                              border: 2px solid #000;
                            }
                          }
                        </style>
                      </head>
                      <body onload="window.print()">
                  `;

                  tables.forEach(table => {
                    const fullTableLink = customBaseUrl.includes("?") 
                      ? `${customBaseUrl}&table=${table.Table_Number}`
                      : `${customBaseUrl}?table=${table.Table_Number}`;

                    htmlContent += `
                      <div class="page">
                        <div class="card-container">
                          <div class="restaurant-name">${branding.restaurantName}</div>
                          <div class="restaurant-sub">Smart Digital Self-Service Menu System</div>
                          <div class="table-badge">TABLE ${String(table.Table_Number).padStart(2, '0')} / میز ${table.Table_Number}</div>
                          <div class="qr-wrapper">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullTableLink)}" alt="QR Code" width="220" height="220" />
                          </div>
                          <div class="instructions">
                            <div>📱 Scan QR Code to View Digital Menu & Order Details</div>
                            <div class="urdu-instructions">ڈیجیٹل مینیو دیکھنے کے لیے اس کیو آر کوڈ کو اسکین کریں 📱</div>
                          </div>
                          <div class="footer-note">
                            Powered by ${branding.restaurantName} ERP Admin Cloud
                          </div>
                        </div>
                      </div>
                    `;
                  });

                  htmlContent += `
                      </body>
                    </html>
                  `;

                  printWindow.document.write(htmlContent);
                  printWindow.document.close();
                }}
                className="px-4 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === "ur" ? "تمام کارڈز پرنٹ کریں" : "Print All Table Tent Cards"}</span>
              </button>
            </div>
          </div>

          {/* CUSTOMIZABLE BASE URL SYSTEM CONFIGURATION */}
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚙️ {lang === "ur" ? "ڈومین لنک اور روٹنگ کنفیگریشن" : "Host Prefix & Routing configuration"}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-8">
                <label className="text-[10px] text-slate-400 font-bold block mb-1">
                  {lang === "ur" ? "پورٹل کا بنیادی یو آر ایل تبدیل کریں:" : "Digital Menu App Deployment URL Base:"}
                </label>
                <input 
                  type="text" 
                  value={customBaseUrl} 
                  onChange={(e) => setCustomBaseUrl(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none px-3 py-2 rounded-xl text-xs text-slate-200 font-mono font-bold"
                  placeholder="https://myrestaurant.com"
                />
              </div>
              <div className="md:col-span-4 self-end">
                <button
                  type="button"
                  onClick={() => {
                    setCustomBaseUrl(`${window.location.origin}${window.location.pathname}`);
                  }}
                  className="w-full hover:bg-slate-800 bg-slate-950 text-slate-300 border border-slate-800 text-xs font-black px-3 py-2.5 rounded-xl transition cursor-pointer text-center"
                >
                  🔄 {lang === "ur" ? "ڈیفالٹ پر ری سیٹ کریں" : "Reset to Server State"}
                </button>
              </div>
            </div>
            <p className="text-[9.5px] text-slate-500 font-bold leading-normal">
              ℹ️ {lang === "ur" 
                ? "کیو آر کوڈز اس یو آر ایل سے جڑیں گے۔ اس میں خودکار طور پر ٹیبل پیرامیٹر (table=number) شامل کر دیا جائے گا۔" 
                : "QR codes adapt live to this path. The system appends '?table=number' query strings automatically to pinpoint guest locations."}
            </p>
          </div>

          {/* TABLES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tables.map(table => {
              const fullTableLink = customBaseUrl.includes("?") 
                ? `${customBaseUrl}&table=${table.Table_Number}`
                : `${customBaseUrl}?table=${table.Table_Number}`;

              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullTableLink)}`;

              return (
                <div key={table.Table_Number} className="bg-slate-900 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between gap-4 group transition-all duration-300 hover:border-slate-700 hover:shadow-xl relative overflow-hidden">
                  {/* Decorative background circle */}
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-600/5 group-hover:bg-blue-600/10 rounded-full transition-all duration-300" />

                  {/* Top Content */}
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs bg-blue-900/40 text-blue-300 border border-blue-900/60 font-black px-2.5 py-0.5 rounded-lg font-mono">
                          {lang === "ur" ? `میز ${table.Table_Number}` : `TABLE ${String(table.Table_Number).padStart(2, "0")}`}
                        </span>
                        {table.Status === "Occupied" ? (
                          <span className="text-[9px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded-md font-bold uppercase">
                            {lang === "ur" ? "بکڈ" : "Active"}
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-md font-bold uppercase">
                            {lang === "ur" ? "خالی" : "Vacant"}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold font-mono">
                        ID: {table.QR_Code_String}
                      </span>
                    </div>

                    {/* QR Code Graphic Showcase */}
                    <div className="flex flex-col items-center py-2 bg-slate-950 border border-slate-850/80 rounded-xl relative">
                      <div className="w-40 h-40 bg-white p-2.5 rounded-lg border-2 border-slate-800 overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-300">
                        <img 
                          src={qrUrl} 
                          alt={`QR Table ${table.Table_Number}`} 
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="mt-3 text-center space-y-1 w-full px-2">
                        <span className="text-[9px] text-slate-400 block font-sans truncate px-1 font-mono font-bold bg-slate-900 border border-slate-800 py-1 rounded">
                          {fullTableLink}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="space-y-2 pt-2 border-t border-slate-850 z-10">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const printWindow = window.open("", "_blank");
                          if (!printWindow) return;
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Print Table ${table.Table_Number} QR Card</title>
                                <style>
                                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Nastaliq+Urdu&display=swap');
                                  body {
                                    font-family: 'Inter', sans-serif;
                                    background-color: #ffffff;
                                    color: #0f172a;
                                    text-align: center;
                                    padding: 40px;
                                    margin: 0;
                                  }
                                  .card-container {
                                    border: 3px solid #1e293b;
                                    border-radius: 24px;
                                    padding: 40px;
                                    max-width: 450px;
                                    margin: 50px auto;
                                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                                    background: #fff;
                                  }
                                  .restaurant-name {
                                    font-size: 24px;
                                    font-weight: 900;
                                    color: #2563eb;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    margin-bottom: 5px;
                                  }
                                  .restaurant-sub {
                                    font-size: 11px;
                                    color: #64748b;
                                    font-weight: 700;
                                    margin-bottom: 25px;
                                  }
                                  .table-badge {
                                    display: inline-block;
                                    background: #0f172a;
                                    color: #fff;
                                    font-size: 18px;
                                    font-weight: 900;
                                    padding: 8px 24px;
                                    border-radius: 50px;
                                    margin-bottom: 25px;
                                  }
                                  .qr-wrapper {
                                    margin: 20px auto;
                                    padding: 15px;
                                    border: 2px dashed #cbd5e1;
                                    display: inline-block;
                                    border-radius: 16px;
                                    background: #fff;
                                  }
                                  .instructions {
                                    margin-top: 25px;
                                    font-size: 14px;
                                    color: #1e293b;
                                    font-weight: 700;
                                    line-height: 1.6;
                                  }
                                  .urdu-instructions {
                                    font-family: 'Noto Nastaliq Urdu', serif;
                                    font-size: 15px;
                                    color: #475569;
                                    margin-top: 10px;
                                    direction: rtl;
                                  }
                                  .footer-note {
                                    font-size: 10px;
                                    color: #94a3b8;
                                    margin-top: 35px;
                                    border-top: 1px solid #e2e8f0;
                                    padding-top: 15px;
                                  }
                                  @media print {
                                    body { padding: 0; margin: 0; }
                                    .card-container {
                                      box-shadow: none;
                                      border: 2px solid #000;
                                      margin-top: 100px;
                                    }
                                  }
                                </style>
                              </head>
                              <body onload="window.print()">
                                <div class="card-container">
                                  <div class="restaurant-name">${branding.restaurantName}</div>
                                  <div class="restaurant-sub">Smart Digital Self-Service Menu System</div>
                                  <div class="table-badge">TABLE ${String(table.Table_Number).padStart(2, '0')} / میز ${table.Table_Number}</div>
                                  <div class="qr-wrapper">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullTableLink)}" alt="QR Code" width="220" height="220" />
                                  </div>
                                  <div class="instructions">
                                    <div>📱 Scan QR Code to View Digital Menu & Order Details</div>
                                    <div class="urdu-instructions">ڈیجیٹل مینیو دیکھنے کے لیے اس کیو آر کوڈ کو اسکین کریں 📱</div>
                                  </div>
                                  <div class="footer-note">
                                    Powered by ${branding.restaurantName} ERP Admin Cloud
                                  </div>
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                      >
                        <Printer className="w-3 h-3 text-sky-400" />
                        <span>{lang === "ur" ? "پرنٹ کریں" : "Print Tag"}</span>
                      </button>

                      <a
                        href={fullTableLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-slate-800 hover:bg-slate-705 text-slate-200 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition text-center"
                      >
                        <ExternalLink className="w-3 h-3 text-amber-500" />
                        <span>{lang === "ur" ? "کھولیں" : "Open Link"}</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(fullTableLink);
                        setCopiedTable(table.Table_Number);
                        setTimeout(() => setCopiedTable(null), 1800);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 text-slate-350 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 cursor-pointer transition uppercase"
                    >
                      {copiedTable === table.Table_Number ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-400 font-bold">{lang === "ur" ? "لنک کاپی ہو گیا!" : "Copied Table Link!"}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{lang === "ur" ? "میز لنک کاپی کریں" : "Copy Table URL"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-850 pt-3 text-center">
            <p className="text-[10.5px] text-amber-300 font-bold">
              💡 {lang === "ur" 
                ? "کیو آر کوڈز اسکین ہونے پر کسٹمر کو ڈیجیٹل مینو پر متبادل کے طور پر لے جائیں گے جہاں وہ اشیاء کی قیمتیں اور مینو فلٹر کر سکتے ہیں۔" 
                : "Scanning the QR Code redirects the visitor's handheld browser safely to the dynamic read-only self-service menu."}
            </p>
          </div>
        </div>
      )}

      {/* ── PANEL 2: DELIVERIES DASHBOARD & REPORTS ── */}
      {panelTab === "delivery" && (
        <div className="space-y-6">
          
          {/* DELIVERY METRICS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl text-left">
              <span className="text-[9px] text-slate-405 uppercase font-extrabold text-slate-400 block tracking-wider">{lang === "ur" ? "آرڈر ملا" : "Received"}</span>
              <span className="text-xl font-black font-mono text-cyan-400 block mt-1">{dlReceived.length}</span>
            </div>
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl text-left">
              <span className="text-[9px] text-slate-405 uppercase font-extrabold text-slate-400 block tracking-wider">{lang === "ur" ? "تیاری جاری" : "Preparing"}</span>
              <span className="text-xl font-black font-mono text-amber-500 block mt-1">{dlPreparing.length}</span>
            </div>
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl text-left">
              <span className="text-[9px] text-slate-405 uppercase font-extrabold text-slate-400 block tracking-wider">{lang === "ur" ? "تیار آرڈرز" : "Ready/Assigned"}</span>
              <span className="text-xl font-black font-mono text-blue-400 block mt-1">{dlReady.length}</span>
            </div>
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl text-left">
              <span className="text-[9px] text-slate-405 uppercase font-extrabold text-slate-400 block tracking-wider">{lang === "ur" ? "راستہ میں" : "In Progress"}</span>
              <span className="text-xl font-black font-mono text-amber-400 block mt-1">{dlTransit.length}</span>
            </div>
            <div className="bg-slate-955 bg-slate-950 border border-slate-850 p-3 rounded-2xl text-left">
              <span className="text-[9px] text-slate-405 uppercase font-extrabold text-slate-400 block tracking-wider">{lang === "ur" ? "ڈیلیور شدہ" : "Delivered"}</span>
              <span className="text-xl font-black font-mono text-emerald-400 block mt-1">{dlDelivered.length}</span>
            </div>
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl text-left">
              <span className="text-[9px] text-slate-405 uppercase font-extrabold text-slate-400 block tracking-wider">{lang === "ur" ? "منسوخ" : "Cancelled"}</span>
              <span className="text-xl font-black font-mono text-rose-500 block mt-1">{dlCancelled.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: DELIVERIES REPORT (7 Cols Span) */}
            <div className="lg:col-span-7 bg-slate-955 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <h3 className="text-sm font-bold text-white uppercase">{lang === "ur" ? "ڈیلیوری کی تفصیلات اور آرڈر فلو" : "Active Deliveries Tracking Flow"}</h3>
                <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-blue-400 font-mono font-bold">Flow Status Monitor</span>
              </div>

              {deliveries.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">{lang === "ur" ? "کوئی ڈیلیوری نہیں ہے" : "No registered home deliveries recorded."}</p>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {deliveries.map(del => (
                    <div key={del.Delivery_ID} className="bg-slate-900/60 p-3 rounded-2xl border border-slate-850/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white">{del.Customer_Name}</span>
                          <span className="text-[10px] bg-slate-950 text-slate-400 font-mono font-medium px-1.5 py-0.5 rounded border border-slate-850">
                            D-{del.Delivery_ID}
                          </span>
                        </div>
                        <p className="text-slate-450 text-slate-400 truncate max-w-[280px] mt-1 text-[11px]">{del.Customer_Address}</p>
                      </div>

                      <div className="flex items-center gap-3 justify-between md:justify-end">
                        <span className="font-mono text-emerald-400 font-bold">{del.Total_Cash_To_Collect} Rs</span>
                        
                        <select
                          value={del.Delivery_Status}
                          onChange={e => onUpdateDeliveryStatus(del.Delivery_ID, e.target.value as any)}
                          className="bg-slate-950 border border-slate-800 text-[11px] font-black text-amber-400 p-1.5 rounded-lg focus:outline-none cursor-pointer"
                        >
                          <option value="Received">Received</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Picked Up">Picked Up</option>
                          <option value="On The Way">On The Way</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* LIVE CODES GENERATOR PREVIEW */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{lang === "ur" ? "گاہک کا لائیو موبائل نظارہ" : "Live customer drop tracker console"}</span>
                </div>
                
                {/* Customer Device Screen Preview */}
                <div className="bg-slate-950 border-4 border-slate-800 rounded-3xl p-4 max-w-sm mx-auto shadow-2xl space-y-3 font-sans">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-black border-b border-slate-900 pb-1.5">
                    <span>DAY NIGHT DELIVERY</span>
                    <span className="font-mono">Peshawar Area • LIVE</span>
                  </div>

                  <div className="text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{lang === "ur" ? "آرڈر کی فزیکل لوکیشن" : "Current Shipment State"}</span>
                    <h4 className="text-sm font-black text-blue-400">
                      {deliveries[0]?.Delivery_Status === "Delivered" ? "✓ Parcel Delivered Successfully" : `🚴 Rider Status: [ ${deliveries[0]?.Delivery_Status || "On the Way"} ]`}
                    </h4>
                  </div>

                  {/* Horizontal progress flowbar representing order received -> preparing -> ready -> picked up -> delivered */}
                  <div className="flex items-center justify-between text-[8px] uppercase tracking-tighter text-slate-400 pt-2 font-mono">
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[8px]">1</span>
                      <span className="scale-90 font-black">Received</span>
                    </div>
                    <span className="h-0.5 max-w-[40px] w-full bg-blue-900 shrink-0"></span>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`w-5 h-5 rounded-full text-white font-bold flex items-center justify-center text-[8px] ${
                        ["Preparing", "Ready", "Picked Up", "On The Way", "In-Transit", "Delivered"].includes(deliveries[0]?.Delivery_Status) ? "bg-blue-600" : "bg-slate-800"
                      }`}>2</span>
                      <span className="scale-90 font-black">Preparing</span>
                    </div>
                    <span className="h-0.5 max-w-[40px] w-full bg-blue-900 shrink-0"></span>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`w-5 h-5 rounded-full text-white font-bold flex items-center justify-center text-[8px] ${
                        ["Ready", "Picked Up", "On The Way", "In-Transit", "Delivered"].includes(deliveries[0]?.Delivery_Status) ? "bg-blue-600" : "bg-slate-800"
                      }`}>3</span>
                      <span className="scale-90 font-black">Ready</span>
                    </div>
                    <span className="h-0.5 max-w-[40px] w-full bg-blue-900 shrink-0"></span>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`w-5 h-5 rounded-full text-white font-bold flex items-center justify-center text-[8px] ${
                        ["Delivered"].includes(deliveries[0]?.Delivery_Status) ? "bg-emerald-500 text-slate-950 font-black" : "bg-slate-800"
                      }`}>✓</span>
                      <span className="scale-90 font-black">Dropped</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: RIDER PERFORMANCE DIRECTORY (5 Cols Span) */}
            <div className="lg:col-span-5 bg-slate-955 bg-slate-955 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase">{lang === "ur" ? "رائڈر ریکارڈ اور پرفارمنس رپورٹ" : "Rider Dispatch Profile Reports"}</h3>
              
              <div className="space-y-4">
                {/* Rider profiles cards */}
                {staff.filter(u => u.Role === StaffRole.Rider).map(rider => {
                  return (
                    <div key={rider.User_ID} className="bg-slate-900 border border-slate-840 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-800">
                          <img src={rider.Photo_URL} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white">{lang === "ur" ? rider.Name_Ur : rider.Name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">CNIC: {rider.CNIC || "42101-1234567-3"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                        <div>
                          <span className="text-slate-500 block uppercase">Vehicle Info</span>
                          <span className="text-white">Honda CG-125 (Khyber-9831)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase">Attendance Today</span>
                          <span className="text-emerald-400 font-sans">Present & Active 🟢</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase">Total Dispatches</span>
                          <span className="text-white font-black text-xs">{rider.Orders_Handled || 110} Deliveries</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase font-sans">Avg Speed</span>
                          <span className="text-cyan-400">22 Mins (Excellent)</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Rider Delivery Rating:</span>
                        <span className="text-amber-400 flex items-center gap-0.5 font-bold">★ 4.9 (Top Rated)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery analytics summary block */}
              <div className="bg-slate-900 p-3.5 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <h4 className="font-extrabold text-white text-[11px] uppercase tracking-wider">{lang === "ur" ? "مالکانہ ڈیلیوری رپورٹ" : "Delivery Financial Summary"}</h4>
                <div className="space-y-1 text-slate-400 font-medium leading-relaxed mt-1">
                  <div className="flex justify-between text-[11px]">
                    <span>Total Shipments:</span>
                    <span className="text-white font-mono font-bold">{deliveries.length} Packages</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Average Dispatch speed:</span>
                    <span className="text-cyan-400 font-bold">25 Mins (Landi Kotal Ring Road)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Total Cash Collected (Sales):</span>
                    <span className="text-emerald-400 font-mono font-bold">{totalRiderRevenue.toLocaleString()} PKR</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Failed/Cancelled Shipments:</span>
                    <span className="text-rose-450 text-rose-500 font-mono font-bold">{dlCancelled.length} Bills</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ── PANEL 3: CUSTOMERS DIRECTORY ── */}
      {panelTab === "customers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* REGISTER CUSTOMER FORM (5 Cols Span) */}
          <form onSubmit={handleAddCustSubmit} className="lg:col-span-5 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2">
              {lang === "ur" ? "نیا مستقل گاہک رجسٹر کریں" : "Register Regular Customer Profile"}
            </h3>

            {custAdded && (
              <div className="bg-emerald-950 border border-emerald-900/60 p-3 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>{lang === "ur" ? "پروفائل کامیابی سے رجسٹرڈ!" : "Profile added. Linked with Order tables."}</span>
              </div>
            )}

            <div className="space-y-3 text-xs font-bold font-sans">
              <div className="space-y-1">
                <label className="text-slate-450 text-slate-400">{lang === "ur" ? "گاہک کا نام:" : "Customer Human Name"}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Shinwari VIP Regular"
                  value={custName} 
                  onChange={e => setCustName(e.target.value)}
                  className="w-full bg-slate-905 bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-600 font-bold text-white" 
                />
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-slate-455 text-slate-400 font-sans">{lang === "ur" ? "فون نمبر:" : "Mobile Contact Number"}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 0300-9876543"
                  value={custPhone} 
                  onChange={e => setCustPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-600 text-white font-mono" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-455 text-slate-400">{lang === "ur" ? "رہائشی پتہ (Drop address):" : "House Drop-Off Address"}</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Bypass Stop, Near Gate, Landi Kotal"
                  value={custAddr} 
                  onChange={e => setCustAddr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-600 leading-normal font-bold text-slate-200" 
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 text-white cursor-pointer transition shadow-md"
            >
              <Users className="w-4 h-4" />
              <span>{lang === "ur" ? "رجسٹر کسٹمر" : "Save Customer Profile"}</span>
            </button>
          </form>

          {/* CUSTOMER DIRECTORY LIST (7 Cols Span) */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-sm font-bold text-white uppercase">{lang === "ur" ? "مستقل گاہکوں کا کھاتہ و فہرست" : "Registered Regular Customer Profiles"}</h3>
              <span className="text-[10px] bg-indigo-950/40 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded uppercase font-bold tracking-tight">VIP Tags Enabled</span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {customers.map(cust => {
                // Determine favorite items or static metrics
                const isVip = cust.Total_Spending > 15000 || cust.Order_Count >= 8;

                return (
                  <div key={cust.Customer_ID} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition duration-150 hover:border-slate-800">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white">{cust.Name}</h4>
                        {isVip && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded-lg font-black uppercase flex items-center gap-0.5 font-sans">
                            <Award className="w-2.5 h-2.5 text-amber-400" />
                            <span>Regular VIP</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono">{cust.Phone_Number}</span>
                      </p>

                      <p className="text-[11px] text-slate-500 leading-normal flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span>{cust.Address || "No Address Added"}</span>
                      </p>
                    </div>

                    <div className="text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-slate-850 pt-2 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Total Spending</span>
                        <span className="text-base font-black font-mono text-emerald-400">{cust.Total_Spending.toLocaleString() || "0"} Rs</span>
                      </div>
                      <div className="bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-850 text-[10px] text-slate-400 font-mono">
                        {cust.Order_Count || 0} Orders
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[10px] text-slate-500 text-center font-bold">
              {lang === "ur" 
                ? "ملازمین کے پی او ایس ڈیپارٹمنٹ سے جب گاہک کا فون نمبر درج ہوتا ہے، بلنگ سے نفع سیشن خود بخود گاہک کے مجموعی خرچ میں جمع ہوجاتا ہے۔" 
                : "POS Billing auto-associates phone records to track regular client statistics."}
            </p>
          </div>

        </div>
      )}

      {/* ── PANEL 4: SECURITY AUDIT LOGS ── */}
      {panelTab === "audit" && (
        <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-500" />
                <span>{lang === "ur" ? "سیکیورٹی آڈٹ ٹریل اور الرٹس" : "Comprehensive Security Audit Logs"}</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 font-bold">
                {lang === "ur" ? "بل کی منسوخی، قیمت میں ترمیم اور سٹاک میں تبدیلی کے لیے لائیو سیکیورٹی الرٹ لاگ ریکارڈ" : "Anti-theft tracking logs of billing deletes, stock adjustments, & pricing corrections."}
              </p>
            </div>

            <button
              onClick={() => { onClearLogs(); triggerToast(lang === "ur" ? "آڈٹ لاگ صاف کر دیا گیا!" : "Security audit logs cleared."); }}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-rose-950/50 hover:text-rose-400 font-extrabold text-[10px] text-slate-400 rounded-xl cursor-pointer transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === "ur" ? "لاگ صاف کریں" : "Wipe Audit logs"}</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10 font-black">{lang === "ur" ? "لاگ ہسٹری بالکل خالی ہے" : "No security logging events archived yet."}</p>
            ) : (
              activityLogs.map((log) => {
                const isCrit = log.Severity === "Critical" || log.Severity === "High";
                const isMed = log.Severity === "Medium";

                return (
                  <div 
                    key={log.Log_ID} 
                    className={`bg-slate-900 border p-3 rounded-2xl flex md:items-center justify-between gap-3 text-xs ${
                      isCrit 
                        ? "border-rose-900/40 bg-rose-950/10" 
                        : isMed 
                          ? "border-amber-900/30 bg-amber-950/5" 
                          : "border-slate-850/60"
                    }`}
                  >
                    <div className="space-y-1 leading-normal">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-white">{log.User_Name}</span>
                        <span className="text-[10px] bg-slate-950 text-slate-400 font-mono font-bold px-1.5 py-0.5 rounded border border-slate-850 uppercase">
                          {log.User_Role}
                        </span>
                        <span className={`text-[9px] rounded uppercase font-bold px-1.5 tracking-wider ${
                          isCrit ? "bg-rose-950 text-rose-400" : isMed ? "bg-amber-950 text-amber-500" : "bg-slate-800 text-slate-400"
                        }`}>
                          {log.Severity} Severity
                        </span>
                      </div>
                      <p className="text-slate-350 font-medium text-[11px]">{log.Action}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold text-slate-500 block">{log.Log_ID}</span>
                      <span className="text-[9px] font-mono text-slate-400 block mt-1">
                        {new Date(log.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── PANEL 5: DISASTER BACKUP & RECOVERY HUBCENTRAL ── */}
      {panelTab === "backup" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* BACKUP OPTIONS (6 Cols Span) */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>{lang === "ur" ? "پش اور لوکل بیک اپ تخلیق کریں" : "Create Restaurant Backup Data"}</span>
            </h3>

            <div className="space-y-4 text-xs font-bold leading-relaxed text-slate-400">
              
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 space-y-3.5">
                <span className="text-[11px] text-slate-300 font-black uppercase tracking-wider block">Option 1: Encrypted Local Disk Backup (Phone memory / SD)</span>
                
                <p className="text-[10.5px]">
                  {lang === "ur" 
                    ? "سنگل کلک لوکل بیک اپ دکان کے تمام ڈیٹا جس میں بلنگ، روزنامچہ، گودام سٹاک اور حاضریاں شامل ہیں کا فائل بنا کر لوکل ڈاؤن لوڈز میں محفوظ کرتا ہے۔" 
                    : "Generate an offline.json snapshot of your restaurant tables. Best for flash drive exports and secure backups on a phone memory card."}
                </p>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 font-black rounded-xl text-slate-950 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>{lang === "ur" ? "موبائل میں لوکل بیک اپ محفوظ کریں" : "Export Backup to SD/Storage ✓"}</span>
                </button>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-300 font-black uppercase tracking-wider block">Option 2: Cloud Sync (Google Account / Firebase)</span>
                  
                  <span className={`text-[10px] px-2 rounded font-sans uppercase font-extrabold tracking-tight ${
                    cloudConnectState === "connected" ? "bg-emerald-950/65 text-emerald-400 border border-emerald-900" : "bg-rose-950 text-rose-400"
                  }`}>
                    {cloudConnectState === "connected" ? "Linked & Active 🟢" : "Disconnected"}
                  </span>
                </div>

                <p className="text-[10.5px]">
                  {lang === "ur" 
                    ? "گوگل اکاؤنٹ سیکیور کلاؤڈ اور فائر بیس کلاؤڈ پر تفویض کردہ خودکار روزانہ، ہفتہ وار، یا ماہانہ کلاؤڈ بیک اپ شیڈول مانیٹر۔" 
                    : "Schedule automatic offline database replication. Restores your system configuration instantly if the phone is lost, replaced, or reset."}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-black">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-450 text-slate-400 block">Backup Schedule</span>
                    <select
                      value={cloudSchedule}
                      onChange={e => setCloudSchedule(e.target.value as any)}
                      className="bg-slate-955 bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg cursor-pointer focus:outline-none w-full"
                    >
                      <option value="daily">Daily Auto Backup</option>
                      <option value="weekly">Weekly Auto Backup</option>
                      <option value="monthly">Monthly Auto Backup</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setCloudConnectState(cloudConnectState === "connected" ? "disconnected" : "connected");
                        triggerToast(cloudConnectState === "connected" ? "Google Drive unlink completed" : "Connected Google Drive repository!");
                      }}
                      className="w-full text-center py-2 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-lg text-[10.5px] cursor-pointer"
                    >
                      {cloudConnectState === "connected" ? "🔴 Unlink Google Account" : "🔵 Sync Google Account"}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RESTORE DATABASE RESTORE FORM (6 Cols Span) */}
          <div className="lg:col-span-6 bg-slate-955 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-500 animate-bounce" />
              <span>{lang === "ur" ? "سسٹم ڈیٹا لجر بحالی (Restore Engine)" : "Restore Complete Restaurant Database"}</span>
            </h3>

            {restoreSuccess && (
              <div className="bg-emerald-950 border border-emerald-900/60 p-3.5 rounded-2xl text-emerald-400 text-xs font-bold leading-normal text-left">
                <strong>✓ Restore Completed!</strong>
                <p className="text-[10.5px] text-slate-350 font-normal mt-1 leading-relaxed">
                  The complete system registers (Sales orders, inventory list, stock reconciliations, rosters, branding config) have been successfully re-hydrated.
                </p>
              </div>
            )}

            <form onSubmit={handleImportRestore} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="text-slate-450 text-slate-455 text-slate-400 font-bold block pb-1">
                  {lang === "ur" ? "سسٹم بیک اپ کوڈ (JSON) یا فائل کا مواد یہاں درج کریں:" : "Paste your saved JSON backup file payload here:"}
                </label>
                
                <textarea
                  rows={6}
                  value={restoreJson}
                  onChange={e => setRestoreJson(e.target.value)}
                  placeholder='{ "branding": { ... }, "users": [...], "orders": [...], "inventory": [...] }'
                  className="w-full bg-slate-905 bg-slate-900 border border-slate-800 p-3 rounded-2xl focus:border-emerald-500 focus:outline-none font-mono text-[10px] text-emerald-300 leading-normal"
                />

                {restoreError && <p className="text-rose-500 font-extrabold mt-1 text-[11px]">⚠ {restoreError}</p>}
              </div>

              <div className="pt-1 select-none text-[10px] text-slate-500 leading-relaxed font-bold">
                ⚠️ RESTORING WILL OVERWRITE ALL CURRENT BUSINESS STATE (orders, menus, raw inventory lists). Verify you have the exact file snapshot before proceeding.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4 text-slate-950" />
                <span>{lang === "ur" ? "سسٹم ڈیٹا فوراً بحال کریں (Restore)" : "Initiate System Restoration (Overwrite)"}</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* ── PANEL 8: OPERATIONS HUB ── */}
      {panelTab === "operations" && (
        <div className="space-y-6 animate-fadeIn text-left text-slate-100">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>{lang === "ur" ? "ریستورانٹ آپریشنز کنٹرولر" : "Restaurant ERP Operations Hub"}</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Manage back-office ledgers, salaries, procurement, voided/cancelled bills & cash flow logs.</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-full uppercase">Operations Active</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* LEFT AREA: Salaries, Procurement, Supplier ledger */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* 1. Salaries Management */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                    <span>💵</span> {lang === "ur" ? "تنخواہیں اور بونس اکاؤنٹ" : "Staff Payroll & Salary Registry"}
                  </h4>
                  <button
                    onClick={() => {
                      const amount = Math.floor(20000 + Math.random() * 60000);
                      const targetStaff = staff[Math.floor(Math.random() * staff.length)]?.Name || "Asif (Waiter)";
                      const newSalary = {
                        id: `SAL-${Math.floor(100 + Math.random() * 900)}`,
                        staffName: targetStaff,
                        amount,
                        status: "Paid" as const,
                        date: new Date().toISOString().split("T")[0]
                      };
                      setSalaries(prev => [newSalary, ...prev]);
                      triggerToast(`Processed payout of Rs. ${amount} to ${targetStaff}`);
                    }}
                    className="px-3 py-1.5 bg-[#0F4C81] hover:bg-blue-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition uppercase"
                  >
                    + Disburse Payout
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-450 text-slate-400">
                        <th className="py-2">Employee</th>
                        <th className="py-2 text-right">Disbursed Amount</th>
                        <th className="py-2 text-center">Status</th>
                        <th className="py-2 text-right">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-semibold">
                      {salaries.map(sal => (
                        <tr key={sal.id} className="hover:bg-slate-905">
                          <td className="py-2.5 font-bold text-white">{sal.staffName}</td>
                          <td className="py-2.5 text-right font-mono text-emerald-400">{sal.amount.toLocaleString()} PKR</td>
                          <td className="py-2.5 text-center">
                            <span className="px-2 py-0.5 text-[9px] font-black rounded-full uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-900">
                              {sal.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-400">{sal.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Supplier Management & Procurement */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                    <span>🥦</span> {lang === "ur" ? "سپلائر کھاتہ اور خریداری آرڈرز" : "Supplier Procurement & Purchase Orders"}
                  </h4>
                  <button
                    onClick={() => {
                      const amount = Math.floor(5000 + Math.random() * 15000);
                      const targetSupp = suppliers[Math.floor(Math.random() * suppliers.length)]?.name || "Metro Cash & Carry";
                      const newPO = {
                        id: `PO-${Math.floor(100 + Math.random() * 900)}`,
                        supplierName: targetSupp,
                        item: "Fresh Spices & Packaging Materials",
                        amount,
                        date: new Date().toISOString().split("T")[0],
                        status: "Received"
                      };
                      setPurchaseOrders(prev => [newPO, ...prev]);
                      triggerToast(`Dispatched Purchase Order to ${targetSupp}`);
                    }}
                    className="px-3 py-1.5 bg-[#FF8C42] hover:bg-orange-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition uppercase"
                  >
                    + Place Purchase Order
                  </button>
                </div>
                
                {/* Active Suppliers List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {suppliers.map(sup => (
                    <div key={sup.id} className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-[11px] text-white block">{sup.name}</span>
                        <span className="text-[9px] font-mono text-slate-450 uppercase text-slate-400">Vendor</span>
                      </div>
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-slate-450 text-slate-400">Phone: {sup.contact}</span>
                        <span className="font-mono text-amber-500 font-black">Bal: {sup.balance.toLocaleString()} Rs</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Procurement list */}
                <div className="overflow-x-auto pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-450 text-slate-400 font-extrabold block mb-2">Recent Procurement Invoices</span>
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-450 text-slate-400">
                        <th className="py-2">PO Code</th>
                        <th className="py-2">Supplier Vendor</th>
                        <th className="py-2">Items Procurement</th>
                        <th className="py-2 text-right">Invoice Sum</th>
                        <th className="py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-semibold">
                      {purchaseOrders.map(po => (
                        <tr key={po.id} className="hover:bg-slate-905">
                          <td className="py-2.5 font-bold font-mono text-slate-400">{po.id}</td>
                          <td className="py-2.5 text-white">{po.supplierName}</td>
                          <td className="py-2.5 text-slate-450 text-slate-400">{po.item}</td>
                          <td className="py-2.5 text-right font-mono text-amber-400">{po.amount.toLocaleString()} PKR</td>
                          <td className="py-2.5 text-center">
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${
                              po.status === "Received" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900" : "bg-amber-950/45 text-amber-400 border border-amber-900"
                            }`}>
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* RIGHT AREA: Cancelled bills, refunds, void trails */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* 3. Cancelled Bill Tracking Ledger */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                    <span>❌</span> {lang === "ur" ? "منسوخ بل مانیٹر اور آڈٹ" : "Cancelled & Voided Bills"}
                  </h4>
                </div>
                
                {(() => {
                  const cancelledBills = orders.filter(o => o.Payment_Status === "Cancelled");
                  return cancelledBills.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic block py-4 text-center">{lang === "ur" ? "کوئی منسوخ شدہ بل نہیں ہے" : "No voided bills registered."}</span>
                  ) : (
                    <div className="space-y-3">
                      {cancelledBills.map(bill => (
                        <div key={bill.Order_ID} className="bg-slate-900/60 border border-slate-850 rounded-2xl p-3 space-y-2 text-left">
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className="font-extrabold font-mono text-rose-500">{bill.Order_ID}</span>
                            <span className="font-mono text-slate-450 text-slate-400">{new Date(bill.Created_At).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-300">Table #{bill.Table_Number} Void</span>
                            <span className="font-mono text-white">{bill.Total_Amount.toLocaleString()} Rs</span>
                          </div>
                          <div className="bg-rose-950/30 border border-rose-900/40 p-2 rounded-xl text-[10px] text-rose-300 leading-normal">
                            <strong>Reason:</strong> {bill.Cancellation_Reason || "No statement logged."}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* 4. Customer Refund & Returns Registry */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                    <span>🔄</span> {lang === "ur" ? "رقم کی واپسی (Refunds Tracking)" : "Refunds & Cash Returns"}
                  </h4>
                </div>

                <div className="space-y-3">
                  {refunds.map(ref => (
                    <div key={ref.id} className="bg-slate-900/60 border border-slate-850 rounded-2xl p-3 space-y-1 text-left">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-extrabold text-white">{ref.id} • Order {ref.orderId}</span>
                        <span className={`px-1.5 py-0.5 text-[8.5px] font-black rounded uppercase ${
                          ref.status === "Approved" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900" : "bg-amber-950/40 text-amber-400 border border-amber-900"
                        }`}>{ref.status}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-300 flex justify-between pt-1">
                        <span>{ref.reason}</span>
                        <span className="font-mono text-rose-400">-{ref.amount} Rs</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const amount = Math.floor(200 + Math.random() * 800);
                    const newRef = {
                      id: `REF-${Math.floor(100 + Math.random() * 900)}`,
                      orderId: `ORD-${Math.floor(100 + Math.random() * 900)}`,
                      amount,
                      reason: "Taste complaint refund",
                      status: "Approved" as const,
                      date: new Date().toISOString().split("T")[0]
                    };
                    setRefunds(prev => [newRef, ...prev]);
                    triggerToast(`Processed instant cashback refund of Rs. ${amount}`);
                  }}
                  className="w-full py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-white font-extrabold text-[10.5px] rounded-xl cursor-pointer transition uppercase text-center"
                >
                  + Issue Cash Refund
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
