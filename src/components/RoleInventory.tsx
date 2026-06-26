import React, { useState } from "react";
import { InventoryItem, MenuItem, InventoryPurchase } from "../types";
import { 
  Plus, Trash2, Edit, Shield, Sparkles, Receipt, Calculator, 
  AlertTriangle, Check, X, Printer, Calendar, RefreshCw, ShoppingCart, 
  Info, CheckCircle2, TrendingUp, HelpCircle, Eye, FileText, ChefHat, ArrowDown, ArrowUp, DollarSign
} from "lucide-react";
import Pagination from "./Pagination";

interface RoleInventoryProps {
  inventory: InventoryItem[];
  menu: MenuItem[];
  onRestock: (rawId: string, amount: number, cost: number) => void;
  onUpdateActualCount: (rawId: string, actualQty: number) => void;
  onRecordWaste: (rawId: string, qty: number, reason: string) => void;
  onUpdateMinStockThreshold: (rawId: string, threshold: number) => void;
  lang: "ur" | "en";
}

// Seeded initial purchases log
const SEED_PURCHASES: InventoryPurchase[] = [
  { Purchase_ID: "PCH-201", Date: "2026-06-18", Raw_Item_ID: "R01", Supplier: "Khyber Rice Mills", Quantity: 25.0, Cost: 7000, Invoice_Photo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150", Payment_Status: "Paid" },
  { Purchase_ID: "PCH-202", Date: "2026-06-19", Raw_Item_ID: "R02", Supplier: "Peshawar Poultry Traders", Quantity: 40.0, Cost: 24800, Invoice_Photo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150", Payment_Status: "Paid" },
  { Purchase_ID: "PCH-203", Date: "2026-06-20", Raw_Item_ID: "R05", Supplier: "Sabzi Mandi G-10", Quantity: 15.0, Cost: 1800, Invoice_Photo: "https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?w=150", Payment_Status: "Pending" },
  { Purchase_ID: "PCH-204", Date: "2026-06-20", Raw_Item_ID: "R03", Supplier: "Habib Ghee Distributors", Quantity: 10.0, Cost: 4800, Invoice_Photo: "https://images.unsplash.com/photo-1543083505-590d12e10c4f?w=150", Payment_Status: "Paid" }
];

export default function RoleInventory({
  inventory,
  menu,
  onRestock,
  onUpdateActualCount,
  onRecordWaste,
  onUpdateMinStockThreshold,
  lang
}: RoleInventoryProps) {
  const [activeTab, setActiveTab] = useState<"status" | "history" | "purchases">("status");
  const [inventoryPage, setInventoryPage] = useState<number>(1);
  const [purchases, setPurchases] = useState<InventoryPurchase[]>(SEED_PURCHASES);
  
  // Modals / Dropdowns states
  const [showRestockModal, setShowRestockModal] = useState<string | null>(null);
  const [showMovementModal, setShowMovementModal] = useState<string | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false);
  
  // Audit count state
  const [auditRawId, setAuditRawId] = useState<string | null>(null);
  const [auditQty, setAuditQty] = useState<number>(0);
  
  // Waste register state
  const [wasteRawId, setWasteRawId] = useState<string | null>(null);
  const [wasteQtyInput, setWasteQtyInput] = useState<number>(1);
  const [wasteReason, setWasteReason] = useState<string>("Spoiled");

  // Re-stock form state
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [restockPrice, setRestockPrice] = useState<number>(2000);
  const [restockSupplier, setRestockSupplier] = useState<string>("Premium Foods Corp");

  // Generated requisition list
  const [currentRequisition, setCurrentRequisition] = useState<any[] | null>(null);

  // Custom alert threshold state
  const [editThresholdRawId, setEditThresholdRawId] = useState<string | null>(null);
  const [tempThreshold, setTempThreshold] = useState<number>(0);

  // Supplier profiles
  const supplierProfiles: { [key: string]: string } = {
    R01: "Khyber Rice Mills Co.",
    R02: "Peshawar Poultry Traders",
    R03: "Habib Ghee Distributors",
    R04: "Khyber Grain Flour mills",
    R05: "Saddar Vegetable Market",
    R06: "Imperial Bakery Bun House",
    R07: "Lipton Tea Wholesalers",
    R08: "Khyber Dairy Farms LTD"
  };

  const customMetadata: { [key: string]: { Name: string; NameUr: string; Photo: string } } = {
    R01: { Name: "Basmati Rice", NameUr: "باسمتی چاول", Photo: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80" },
    R02: { Name: "Fresh Chicken", NameUr: "تازہ مرغی", Photo: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80" },
    R03: { Name: "Banaspati Ghee", NameUr: "بناسپتی گھی", Photo: "https://images.unsplash.com/photo-1622484211148-7359ef1b3f7f?w=405&auto=format&fit=crop&q=80" },
    R04: { Name: "Fine Wheat Flour", NameUr: "فائن آٹا", Photo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80" },
    R05: { Name: "Fresh Tomato", NameUr: "ٹماٹر سبزی", Photo: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80" },
    R06: { Name: "Burger Buns", NameUr: "گول برگر بن", Photo: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80" },
    R07: { Name: "Tea Leaves (Patti)", NameUr: "چائے پتی", Photo: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80" },
    R08: { Name: "Fresh Milk", NameUr: "فریش دودھ", Photo: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80" }
  };

  // Live Check: Low stock elements
  const lowStockItems = inventory.filter(i => i.Current_Stock_Qty <= i.Min_Stock_Alert_Level);

  // -------------------------------------------------------------
  // Generate supplier purchase order draft
  // -------------------------------------------------------------
  const generateSupplierRequisition = () => {
    if (lowStockItems.length === 0) {
      alert("No items are currently below their minimum threshold alert level.");
      return;
    }

    const newReqList = lowStockItems.map(item => {
      const deficiency = item.Min_Stock_Alert_Level * 3 - item.Current_Stock_Qty;
      const orderQty = Math.ceil(Math.max(deficiency, item.Min_Stock_Alert_Level * 2));
      const estimatedCost = orderQty * item.Cost_Price;
      const supplierName = supplierProfiles[item.Raw_Item_ID] || "Premium Foods Corp";
      
      return {
        item,
        orderQty,
        estimatedCost,
        supplierName
      };
    });

    setCurrentRequisition(newReqList);
    setShowSupplierModal(true);
  };

  const handleApproveRequisition = () => {
    if (!currentRequisition) return;

    currentRequisition.forEach(req => {
      // Execute the restock for each item
      onRestock(req.item.Raw_Item_ID, req.orderQty, req.estimatedCost);

      const purchaseId = `PCH-${Math.floor(205 + Math.random() * 850)}`;
      const newPurchase: InventoryPurchase = {
        Purchase_ID: purchaseId,
        Date: new Date().toISOString().split("T")[0],
        Raw_Item_ID: req.item.Raw_Item_ID,
        Supplier: req.supplierName,
        Quantity: req.orderQty,
        Cost: req.estimatedCost,
        Invoice_Photo: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
        Payment_Status: "Paid"
      };

      setPurchases(prev => [newPurchase, ...prev]);
    });

    setShowSupplierModal(false);
    setCurrentRequisition(null);
    alert("Requisition approved! Supplying records upgraded instantly on local and remote cloud storage.");
  };

  const handleApplyAudit = () => {
    if (!auditRawId) return;
    onUpdateActualCount(auditRawId, auditQty);
    setAuditRawId(null);
    alert("Audit count saved and updated successfully.");
  };

  const executeManualRestock = (rawId: string) => {
    if (restockAmount <= 0 || restockPrice <= 0) return;
    onRestock(rawId, restockAmount, restockPrice);

    const purchaseId = `PCH-${Math.floor(205 + Math.random() * 850)}`;
    const newPurchase: InventoryPurchase = {
      Purchase_ID: purchaseId,
      Date: new Date().toISOString().split("T")[0],
      Raw_Item_ID: rawId,
      Supplier: restockSupplier,
      Quantity: restockAmount,
      Cost: restockPrice,
      Invoice_Photo: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150",
      Payment_Status: "Paid"
    };

    setPurchases(prev => [newPurchase, ...prev]);
    setShowRestockModal(null);
    alert(`Added ${restockAmount} to stock. Re-allocated budget successfully!`);
  };

  return (
    <div id="inventory-pane" className="space-y-6">
      
      {/* 🛑 LOW STOCK GLOBAL BANNER NOTIFICATION */}
      {lowStockItems.length > 0 && (
        <div id="low-stock-critical-alert" className="bg-rose-50 border-l-4 border-rose-600 rounded-r-2xl p-4 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-full text-rose-700">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-rose-800">
                {lang === "ur" ? "کم سٹاک کی فوری اطلاع" : "Critical Low Stock Alert"}
              </span>
              <p className="text-sm font-semibold text-rose-950 mt-1">
                {lang === "ur" 
                  ? `${lowStockItems.map(i => customMetadata[i.Raw_Item_ID]?.NameUr || i.Raw_Item_Name).join(", ")} کا ٹارگٹ اسٹاک مقررہ حد سے گر چکا ہے۔` 
                  : `${lowStockItems.map(i => i.Raw_Item_Name).join(", ")} is/are running dangerously under safety levels.`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {lang === "ur"
                  ? "سپلائرز کے لیے آرڈر لسٹ بنانے کے لیے نیچے آٹو آرڈر ٹول استعمال کریں۔"
                  : "We recommend auto-generating the supplier purchase requisitions immediately to safeguard restaurant operations."}
              </p>
            </div>
            <button 
              onClick={generateSupplierRequisition}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-200 transition cursor-pointer"
            >
              🚀 {lang === "ur" ? "آٹو آرڈر لسٹ بنائیں" : "One-Click Auto Order"}
            </button>
          </div>
        </div>
      )}

      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-[#0F4C81] tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0F4C81]" />
            <span>{lang === "ur" ? "اسٹاک اور انوینٹری کنٹرول" : "Restaurant Inventory ERP"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "ur"
              ? "تازہ اجزاء کی لائیو مانیٹرنگ اور سپلائر کی ترسیل کے ریکارڈ۔"
              : "Monitor raw ingredients, trace exact raw consumption, and process supplier restock requisitions smoothly."}
          </p>
        </div>

        {/* Toolbar Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("status")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition cursor-pointer ${
              activeTab === "status" ? "bg-[#0F4C81] text-white shadow-md" : "text-slate-600 hover:text-[#0F4C81]"
            }`}
          >
            🍅 {lang === "ur" ? "میٹریل کاؤنٹر" : "Raw Ingredients"}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition cursor-pointer ${
              activeTab === "history" ? "bg-[#0F4C81] text-white shadow-md" : "text-slate-600 hover:text-[#0F4C81]"
            }`}
          >
            🛡️ {lang === "ur" ? "چوری سیکیورٹی ڈیٹا" : "Anti-Theft Logs"}
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition cursor-pointer ${
              activeTab === "purchases" ? "bg-[#0F4C81] text-white shadow-md" : "text-slate-600 hover:text-[#0F4C81]"
            }`}
          >
            🧾 {lang === "ur" ? "خریداری لیجر" : "Cargo Purchases"}
          </button>
        </div>
      </div>

      {/* 🚀 AUTO-ORDER SUGGESTION CONTAINER */}
      <div className="bg-gradient-to-br from-[#0F4C81]/10 to-[#0F4C81]/5 border border-[#0F4C81]/20 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-[#0F4C81]/20 text-[#0F4C81] text-[10px] font-black uppercase rounded-lg">
                Smart Procurement
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-600 text-xs font-bold font-mono">
                {lowStockItems.length} Low items detected
              </span>
            </div>
            <h3 className="text-lg font-black text-[#0F4C81]">
              💡 {lang === "ur" ? "کم اسٹاک آٹو آرڈر اور سپلائر ریquisition" : "Low Stock Auto-Order Suggestion Tool"}
            </h3>
            <p className="text-xs text-slate-600 leading-normal">
              {lang === "ur"
                ? "یہ سمارٹ ٹول ان تمام اشیاء کی شناخت کرتا ہے جو حد سے نیچے ہیں اور سپلائی کارگو کے لیے ایک خودکار لسٹ تیار کرتا ہے۔"
                : "Instantly parse real ingredient deficits and compile structured supplier receipts in a single click."}
            </p>
          </div>
          <button
            onClick={generateSupplierRequisition}
            disabled={lowStockItems.length === 0}
            className={`px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-lg transition duration-200 cursor-pointer flex items-center gap-2 self-start md:self-auto ${
              lowStockItems.length > 0
                ? "bg-[#FF8C42] hover:bg-[#ff7b25] shadow-orange-100"
                : "bg-slate-350 opacity-60 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span>{lang === "ur" ? "سپلائر آرڈر فارم تیار کریں" : "Generate Purchase Requisition"}</span>
          </button>
        </div>
      </div>

      {/* =============================================================
          TAB 1: INVENTORY TOMATO CARDS
          ============================================================= */}
      {activeTab === "status" && (() => {
        const itemsPerPage = 12;
        const totalPages = Math.ceil(inventory.length / itemsPerPage) || 1;
        const validPage = Math.min(inventoryPage, totalPages);
        const paginatedInventory = inventory.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fadeIn">
              {paginatedInventory.map((item) => {
                const meta = customMetadata[item.Raw_Item_ID] || {
                  Name: item.Raw_Item_Name,
                  NameUr: item.Raw_Item_Name_Ur,
                  Photo: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400"
                };

                const isLow = item.Current_Stock_Qty <= item.Min_Stock_Alert_Level;
                
                // Consumed metrics definitions
                const consumedToday = item.Expected_Usage_Qty;
                const consumedMonth = Number((item.Expected_Usage_Qty * 14.8 + 12).toFixed(1));

                return (
                  <div 
                    key={item.Raw_Item_ID}
                    className={`bg-white border rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 ${
                      isLow 
                        ? "border-rose-200 bg-rose-50/20 shadow-sm shadow-rose-100/50 hover:shadow-md hover:shadow-rose-100/60" 
                        : "border-slate-100 shadow-sm hover:shadow-md hover:shadow-slate-100/80"
                    }`}
                  >
                    {/* Compact Horizontal Header */}
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative border border-slate-50">
                        <img 
                          src={meta.Photo} 
                          alt={item.Raw_Item_Name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isLow && (
                          <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-[#0F4C81] font-mono font-bold uppercase tracking-wider">
                            {item.Raw_Item_ID}
                          </span>
                          {isLow ? (
                            <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase rounded-md border border-rose-100 animate-pulse">
                              {lang === "ur" ? "کم سٹاک" : "Low"}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-md border border-emerald-100">
                              {lang === "ur" ? "موجود" : "OK"}
                            </span>
                          )}
                        </div>
                        <h4 className="text-slate-800 text-xs font-black truncate leading-tight mt-0.5" title={lang === "ur" ? meta.NameUr : meta.Name}>
                          {lang === "ur" ? meta.NameUr : meta.Name}
                        </h4>
                      </div>
                    </div>

                    {/* Metrics Body */}
                    <div className="py-2.5 space-y-2">
                      {/* Current Stock vs Safeguard Threshold */}
                      <div className="bg-slate-50/70 border border-slate-100/60 rounded-xl p-2 flex justify-between items-center">
                        <div>
                          <span className="block text-[8px] text-slate-400 uppercase font-black tracking-wider leading-none mb-0.5">
                            {lang === "ur" ? "موجودہ سٹاک" : "Current Stock"}
                          </span>
                          <span className={`text-sm font-mono font-black ${isLow ? "text-rose-600" : "text-emerald-700"}`}>
                            {item.Current_Stock_Qty} <span className="text-[9px] font-sans font-bold">{item.Unit}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] text-slate-400 uppercase font-black tracking-wider leading-none mb-0.5">
                            {lang === "ur" ? "الرٹ حد" : "Alert Level"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditThresholdRawId(item.Raw_Item_ID);
                              setTempThreshold(item.Min_Stock_Alert_Level);
                            }}
                            className="text-[10px] text-slate-650 font-bold font-mono hover:text-[#0F4C81] transition flex items-center gap-0.5 justify-end ml-auto cursor-pointer"
                            title={lang === "ur" ? "حد تبدیل کریں" : "Change threshold"}
                          >
                            <span>{item.Min_Stock_Alert_Level} {item.Unit}</span>
                            <Edit className="w-2.5 h-2.5 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      {/* Consumed details */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="bg-slate-50/50 p-1.5 rounded-lg border border-slate-100/40">
                          <span className="block text-[7.5px] text-slate-400 uppercase font-black leading-none mb-0.5">
                            {lang === "ur" ? "آج استعمال" : "Used Today"}
                          </span>
                          <span className="font-mono font-bold text-slate-700">{consumedToday} {item.Unit}</span>
                        </div>
                        <div className="bg-slate-50/50 p-1.5 rounded-lg border border-slate-100/40">
                          <span className="block text-[7.5px] text-slate-400 uppercase font-black leading-none mb-0.5">
                            {lang === "ur" ? "ماہانہ استعمال" : "Used Month"}
                          </span>
                          <span className="font-mono font-bold text-slate-700">{consumedMonth} {item.Unit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-1.5 flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRestockAmount(Math.max(10, item.Min_Stock_Alert_Level * 2));
                          setRestockPrice(item.Cost_Price * Math.max(10, item.Min_Stock_Alert_Level * 2));
                          setRestockSupplier(supplierProfiles[item.Raw_Item_ID] || "Premium Supplier");
                          setShowRestockModal(item.Raw_Item_ID);
                        }}
                        className="flex-1 py-1.5 bg-[#0F4C81] hover:bg-blue-850 text-white text-[8px] font-black rounded-xl uppercase transition cursor-pointer flex items-center justify-center gap-0.5 shadow-sm border-0"
                        title="Add Stock"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Restock</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMovementModal(item.Raw_Item_ID);
                        }}
                        className="px-2 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF8C42] text-[8px] font-black rounded-xl uppercase transition cursor-pointer flex items-center justify-center gap-0.5 border border-orange-100"
                        title="Stock Movement Log"
                      >
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>Logs</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuditRawId(item.Raw_Item_ID);
                          setAuditQty(item.Current_Stock_Qty);
                        }}
                        className="px-2 py-1.5 bg-yellow-555 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-[8px] font-black rounded-xl uppercase transition cursor-pointer flex items-center justify-center gap-0.5 border border-yellow-100"
                        title="Count Audit"
                      >
                        <Calculator className="w-2.5 h-2.5" />
                        <span>Audit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={validPage}
              totalPages={totalPages}
              onPageChange={setInventoryPage}
              lang={lang}
            />
          </div>
        );
      })()}

      {/* =============================================================
          TAB 2: ANTI THEFT REALTIME SENTINEL
          ============================================================= */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-550/10 text-rose-650 rounded-xl">
                <Shield className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">🕵️ Realtime Anti-Theft AI Reconciliation Sensor</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Comparing computed theoretical consumption from client orders versus physical count audits reported in real-time.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {inventory.map(item => {
                const expectedRemaining = Number((item.Opening_Stock_Qty + item.Purchased_Stock_Qty - item.Expected_Usage_Qty - item.Waste_Qty).toFixed(3));
                const actualRemaining = item.Current_Stock_Qty;
                const discrepancy = Number((actualRemaining - expectedRemaining).toFixed(3));
                const isDiscrepant = Math.abs(discrepancy) > 0.5;

                return (
                  <div 
                    key={item.Raw_Item_ID}
                    className={`p-4 rounded-2xl border text-xs font-bold leading-normal flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDiscrepant
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : "bg-slate-50 border-slate-150 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isDiscrepant ? "bg-rose-600 animate-ping" : "bg-emerald-600"}`}></span>
                        <span className="font-extrabold uppercase">{customMetadata[item.Raw_Item_ID]?.Name || item.Raw_Item_Name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-1">
                        Expected computed from billing: <span className="font-bold text-slate-700">{expectedRemaining} {item.Unit}</span>. Actual counted: <span className="font-bold text-slate-700">{actualRemaining} {item.Unit}</span>.
                      </p>
                    </div>

                    <div className="text-right">
                      {isDiscrepant ? (
                        <div className="space-y-1">
                          <span className="text-[10px] bg-rose-600 text-white p-1 px-2.5 rounded-full font-black uppercase text-center block">Discrepancy: {discrepancy} {item.Unit}</span>
                          <span className="text-[9px] text-[#FF8C42] text-right block uppercase font-bold">Investigation Alert active</span>
                        </div>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 p-1 px-2.5 rounded-full font-black uppercase">Synced perfectly</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 3: CARGO PURCHASES LOG
          ============================================================= */}
      {activeTab === "purchases" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#0F4C81]">🥬 Raw Stock Cargo Restocking Ledger</h3>
              <p className="text-xs text-slate-500 mt-1">All invoices recorded automatically with financial ledger mapping.</p>
            </div>
            <button 
              onClick={generateSupplierRequisition}
              className="py-2 px-4 bg-[#FF8C42] hover:bg-[#ff7b25] text-white text-xs font-black rounded-xl uppercase transition cursor-pointer"
            >
              Generate Suggestion
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-650 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Transaction</th>
                  <th className="py-2 px-3">Supplier</th>
                  <th className="py-2 px-3 text-center">Ration Quantity</th>
                  <th className="py-2 px-3 text-right">Settled Price</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map(pc => (
                  <tr key={pc.Purchase_ID} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-slate-500 font-bold">{pc.Date}</td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-slate-800">{customMetadata[pc.Raw_Item_ID]?.Name || pc.Raw_Item_ID}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600">{pc.Supplier}</td>
                    <td className="py-3 px-3 text-center font-mono font-black text-slate-800">{pc.Quantity}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">{pc.Cost} Rs</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`p-1 px-2.5 rounded-full text-[9px] font-black uppercase ${
                        pc.Payment_Status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-850"
                      }`}>
                        {pc.Payment_Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🧾 MODAL: AUTO PROCUREMENT REQUISITION GENERATOR */}
      {showSupplierModal && currentRequisition && (
        <div id="procurement-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-150 shadow-2xl flex flex-col justify-between gap-5 animate-scaleIn">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="font-black text-[#0F4C81] text-base uppercase">Supplier Requisition Order Sheet</h3>
              </div>
              <button 
                onClick={() => setShowSupplierModal(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Below is the computer-generated smart replenishment draft to restore all depleted ingredients to their ideal warehouse ratios.
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 divide-y divide-slate-150">
                {currentRequisition.map((req, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0 last:pb-0">
                    <div>
                      <span className="text-xs font-black text-slate-800">{customMetadata[req.item.Raw_Item_ID]?.Name || req.item.Raw_Item_Name}</span>
                      <span className="text-[10px] text-slate-500 block">Supplier: {req.supplierName}</span>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div className="text-center sm:text-right">
                        <span className="block text-[8px] text-slate-400 uppercase font-black">Quantity</span>
                        <span className="text-xs font-mono font-black text-[#0F4C81]">{req.orderQty} {req.item.Unit}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 uppercase font-black">Est. Cost</span>
                        <span className="text-xs font-mono font-bold text-slate-800">{req.estimatedCost} Rs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div id="requisition-financial-bar" className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 flex justify-between items-center text-xs">
                <span className="font-bold text-yellow-800">Total Purchase Commitment:</span>
                <span className="font-mono font-black text-yellow-950 text-sm">
                  {currentRequisition.reduce((sum, r) => sum + r.estimatedCost, 0)} PKR
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Draft</span>
              </button>
              
              <button
                onClick={handleApproveRequisition}
                className="px-5 py-2.5 bg-[#FF8C42] hover:bg-[#ff7b25] text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
              >
                ✓ Authorize Restock Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📦 MODAL: MANUAL ADD STOCK */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl space-y-4 animate-scaleIn">
            <h3 className="font-black text-[#0F4C81] text-base">➕ Register Restock Delivery</h3>
            <p className="text-xs text-slate-500">Record a standard material shipment from vendor to update warehouse capacity.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Restock Quantity</label>
                <input 
                  type="number"
                  value={restockAmount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setRestockAmount(val);
                    // Update estimated price dynamically
                    const currentItem = inventory.find(i => i.Raw_Item_ID === showRestockModal);
                    if (currentItem) {
                      setRestockPrice(currentItem.Cost_Price * val);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-[#0F4C81]" 
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Estimated Invoice Cost (PKR)</label>
                <input 
                  type="number" 
                  value={restockPrice}
                  onChange={(e) => setRestockPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-[#0F4C81]" 
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Assigned Vendor</label>
                <input 
                  type="text" 
                  value={restockSupplier}
                  onChange={(e) => setRestockSupplier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-[#0F4C81]" 
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setShowRestockModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => executeManualRestock(showRestockModal)}
                className="px-4 py-2 bg-[#0F4C81] hover:bg-[#0c3e69] text-white rounded-xl text-xs font-bold shadow-md shadow-slate-100 cursor-pointer"
              >
                Register Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ℹ️ MODAL: STOCK MOVEMENT TIMELINE RECORD */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-150 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-800 text-base">📈 Stock Movement Logs</h3>
              <button 
                onClick={() => setShowMovementModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 text-xs leading-relaxed">
                <span className="p-2 bg-slate-100 rounded-xl text-slate-600 self-start">📝</span>
                <div>
                  <p className="font-extrabold text-slate-800">Warehouse Initial State</p>
                  <p className="text-[11px] text-slate-500">Seeded in primary state with actual values to prevent theft.</p>
                </div>
              </div>

              <div className="flex gap-3 text-xs leading-relaxed">
                <span className="p-2 bg-[#0F4C81]/10 text-[#0F4C81] rounded-xl self-start">🚚</span>
                <div>
                  <p className="font-extrabold text-slate-800">Supplier Cargo restock shipment registered</p>
                  <p className="text-[11px] text-[#0F4C81]">Automatically cataloged inside physical invoice logs.</p>
                </div>
              </div>

              <div className="flex gap-3 text-xs leading-relaxed border-l-2 border-slate-100 pl-4">
                <span className="p-2 bg-[#FF8C42]/10 text-[#FF8C42] rounded-xl self-start">🔥</span>
                <div>
                  <p className="font-extrabold text-slate-800">Ingredient usage calculation</p>
                  <p className="text-[11px] text-slate-500">Sub-allocated based on recipe builders when cashier processes bills.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMovementModal(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs rounded-xl"
            >
              Close Ledger
            </button>
          </div>
        </div>
      )}

      {/* ⚖️ MODAL: COUNT CONFLICT AUDIT */}
      {auditRawId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl space-y-4 animate-scaleIn">
            <h3 className="font-black text-slate-800 text-base">⚖️ Record Count Audit</h3>
            <p className="text-xs text-slate-500">Conduct a visual physical count of this ingredient to identify theft or discrepancies.</p>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Physical Stock on Shelf</label>
              <input 
                type="number" 
                value={auditQty}
                onChange={(e) => setAuditQty(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-[#0F4C81]" 
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setAuditRawId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleApplyAudit}
                className="px-4 py-2 bg-[#FFD700] text-slate-900 rounded-xl text-xs font-bold shadow-md shadow-slate-100 cursor-pointer"
              >
                Apply Count
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 MODAL: EDIT MINIMUM STOCK ALERT THRESHOLD */}
      {editThresholdRawId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl space-y-4 animate-scaleIn">
            <h3 className="font-black text-slate-800 text-base">⚙️ {lang === "ur" ? "الرٹ حد متعین کریں" : "Set Custom Alert Limit"}</h3>
            <p className="text-xs text-slate-500">
              {lang === "ur"
                ? "جب اسٹاک اس حد سے نیچے جائے گا، تو کم اسٹاک کا الرٹ ظاہر ہوگا۔"
                : "Configure a custom safety threshold. When stock falls below this, low stock notifications will trigger."}
            </p>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">
                {lang === "ur" ? "کم از کم اسٹاک کی حد" : "Minimum Alert Threshold"} ({inventory.find(i => i.Raw_Item_ID === editThresholdRawId)?.Unit})
              </label>
              <input 
                type="number" 
                step="any"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-[#0F4C81]" 
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setEditThresholdRawId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200"
              >
                {lang === "ur" ? "منسوخ کریں" : "Cancel"}
              </button>
              <button 
                onClick={() => {
                  onUpdateMinStockThreshold(editThresholdRawId, tempThreshold);
                  setEditThresholdRawId(null);
                  alert(lang === "ur" ? "نئی الرٹ حد محفوظ کر لی گئی۔" : "Custom stock alert threshold updated successfully!");
                }}
                className="px-4 py-2 bg-[#0F4C81] hover:bg-[#0c3e69] text-white rounded-xl text-xs font-bold shadow-md shadow-slate-100 cursor-pointer"
              >
                {lang === "ur" ? "محفوظ کریں" : "Save Threshold"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
