import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { KDSOrder, MenuItem, InventoryItem, BatchCookLog, FinishedWasteLog } from "../types";
import { 
  Play, Check, Flame, Clock, Volume2, Timer, Hourglass, Utensils, ShieldAlert, Sparkles, AlertCircle, PlusCircle, 
  ChefHat, Package, Trash2, ArrowRight, TrendingUp, Settings, Edit, Plus, Minus, Info, Save
} from "lucide-react";

interface RoleKitchenKDSProps {
  kdsOrders: KDSOrder[];
  onUpdateKitchenStatus: (kdsId: string, nextStatus: "Pending" | "Cooking" | "Ready" | "Draft" | "Delivered") => void;
  onAddDelay: (kdsId: string, mins: number) => void;
  lang: "ur" | "en";
  menu: MenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  batchCookLogs: BatchCookLog[];
  setBatchCookLogs: React.Dispatch<React.SetStateAction<BatchCookLog[]>>;
  finishedWasteLogs: FinishedWasteLog[];
  setFinishedWasteLogs: React.Dispatch<React.SetStateAction<FinishedWasteLog[]>>;
  currentUserRole?: string;
}

export default function RoleKitchenKDS({ 
  kdsOrders, 
  onUpdateKitchenStatus, 
  onAddDelay, 
  lang,
  menu,
  setMenu,
  inventory,
  setInventory,
  batchCookLogs,
  setBatchCookLogs,
  finishedWasteLogs,
  setFinishedWasteLogs,
  currentUserRole
}: RoleKitchenKDSProps) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize Web Audio API safely
  const initAudio = () => {
    if (!audioContext) {
      setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());
    }
  };

  // Safe synthesized bell tone buzzer
  const playBuzzer = (freq = 880, duration = 0.3) => {
    try {
      const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked by browser safety:", e);
    }
  };

  // Automatically beep whenever a new order comes in
  useEffect(() => {
    if (kdsOrders.length > 0) {
      playBuzzer(950, 0.45);
    }
  }, [kdsOrders.length]);

  // Batch Cook and Waste Management States
  const batchMenuItems = menu.filter((item) => item.Inventory_Method === "Batch");

  const [selectedCookItemId, setSelectedCookItemId] = useState<string>("");
  const [batchesCount, setBatchesCount] = useState<number>(1);
  const [successBatchMsg, setSuccessBatchMsg] = useState<string>("");
  const [errorBatchMsg, setErrorBatchMsg] = useState<string>("");

  const [selectedWasteItemId, setSelectedWasteItemId] = useState<string>("");
  const [wasteQty, setWasteQty] = useState<number>(1);
  const [wasteReason, setWasteReason] = useState<string>("Spoiled / Expired");
  const [successWasteMsg, setSuccessWasteMsg] = useState<string>("");
  const [errorWasteMsg, setErrorWasteMsg] = useState<string>("");

  // Owner Config Local State
  const [selectedEditItemId, setSelectedEditItemId] = useState<string>("");
  const [editYield, setEditYield] = useState<number>(50);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string>("");

  // Set initial select values once menu is populated
  useEffect(() => {
    if (batchMenuItems.length > 0) {
      if (!selectedCookItemId) setSelectedCookItemId(batchMenuItems[0].Item_ID);
      if (!selectedWasteItemId) setSelectedWasteItemId(batchMenuItems[0].Item_ID);
      if (!selectedEditItemId) {
        setSelectedEditItemId(batchMenuItems[0].Item_ID);
        setEditYield(batchMenuItems[0].Batch_Yield || 50);
      }
    }
  }, [menu]);

  // Synchronise edit yield box when selection changes
  const handleEditItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedEditItemId(id);
    const item = menu.find(m => m.Item_ID === id);
    if (item) {
      setEditYield(item.Batch_Yield || 50);
    }
  };

  const handlePrepareBatchClick = () => {
    setErrorBatchMsg("");
    setSuccessBatchMsg("");

    const menuItem = menu.find((item) => item.Item_ID === selectedCookItemId);
    if (!menuItem) {
      setErrorBatchMsg(lang === "ur" ? "⚠️ منتخب آئٹم غائب ہے۔" : "⚠️ Selected batch item is missing.");
      return;
    }

    const currentYield = menuItem.Batch_Yield || 50;
    const totalPortionsProduced = batchesCount * currentYield;

    // Check ingredients stock suitability
    let hasEnough = true;
    const failedIngredients: string[] = [];

    menuItem.Recipe_Ingredients.forEach((recipe) => {
      const rawItem = inventory.find((i) => i.Raw_Item_ID === recipe.Raw_Item_ID);
      if (rawItem) {
        const conversionDivider = (rawItem.Unit === "KG" || rawItem.Unit === "Litre") ? 1000 : 1;
        const rawNeeded = (recipe.Qty * totalPortionsProduced) / conversionDivider;
        if (rawItem.Current_Stock_Qty < rawNeeded) {
          hasEnough = false;
          failedIngredients.push(lang === "ur" ? rawItem.Raw_Item_Name_Ur : rawItem.Raw_Item_Name);
        }
      }
    });

    if (!hasEnough) {
      setErrorBatchMsg(
        lang === "ur"
          ? `⚠️ مندرجہ ذیل خام سٹاک نا کافی ہے: ${failedIngredients.join(", ")}`
          : `⚠️ Insufficient stock for: ${failedIngredients.join(", ")}`
      );
      playBuzzer(440, 0.4); // Error sound tone
      return;
    }

    // Deduct raw materials and increment product count
    setInventory((prevInv) =>
      prevInv.map((invItem) => {
        const recipeDetail = menuItem.Recipe_Ingredients.find((r) => r.Raw_Item_ID === invItem.Raw_Item_ID);
        if (recipeDetail) {
          const conversionDivider = (invItem.Unit === "KG" || invItem.Unit === "Litre") ? 1000 : 1;
          const rawNeeded = (recipeDetail.Qty * totalPortionsProduced) / conversionDivider;
          return {
            ...invItem,
            Current_Stock_Qty: Math.max(0, invItem.Current_Stock_Qty - rawNeeded),
            Last_Updated_Time: new Date().toISOString(),
          };
        }
        return invItem;
      })
    );

    setMenu((prevMenu) =>
      prevMenu.map((m) =>
        m.Item_ID === selectedCookItemId
          ? { ...m, Available_Portions: (m.Available_Portions || 0) + totalPortionsProduced }
          : m
      )
    );

    // Record Log Entry
    const newLog: BatchCookLog = {
      Batch_ID: `B-${Math.floor(1001 + Math.random() * 8999)}`,
      Item_ID: menuItem.Item_ID,
      Item_Name: menuItem.Item_Name,
      Item_Name_Ur: menuItem.Item_Name_Ur,
      Quantity_Batches: batchesCount,
      Yield_Portions: totalPortionsProduced,
      Timestamp: new Date().toISOString(),
    };

    setBatchCookLogs((prev) => [newLog, ...prev]);
    setSuccessBatchMsg(
      lang === "ur"
        ? `🎉 مبارک! ${batchesCount} بیچ کامیابی سے تیار ہوا۔ سٹاک میں +${totalPortionsProduced} پلیٹس کا اضافہ ہو گیا۔`
        : `🎉 Success! Prepared ${batchesCount} batch cooker(s). Mapped +${totalPortionsProduced} portions to sales stock.`
    );
    playBuzzer(1200, 0.35); // Success tone
  };

  const handleLogWasteClick = () => {
    setErrorWasteMsg("");
    setSuccessWasteMsg("");

    const menuItem = menu.find((item) => item.Item_ID === selectedWasteItemId);
    if (!menuItem) {
      setErrorWasteMsg(lang === "ur" ? "⚠️ منتخب آئٹم غائب ہے۔" : "⚠️ Selected batch item is missing.");
      return;
    }

    if ((menuItem.Available_Portions || 0) < wasteQty) {
      setErrorWasteMsg(
        lang === "ur"
          ? `⚠️ ناکافی سٹاک! صرف ${menuItem.Available_Portions || 0} پلیٹیں دستیاب ہیں۔`
          : `⚠️ Insufficient stock! Only ${menuItem.Available_Portions || 0} portion(s) remaining in store.`
      );
      playBuzzer(440, 0.4);
      return;
    }

    // Decrement from portion count
    setMenu((prevMenu) =>
      prevMenu.map((m) =>
        m.Item_ID === selectedWasteItemId
          ? { ...m, Available_Portions: Math.max(0, (m.Available_Portions || 0) - wasteQty) }
          : m
      )
    );

    // Record Waste Log Entry
    const newWasteLog: FinishedWasteLog = {
      Waste_ID: `W-${Math.floor(1001 + Math.random() * 8999)}`,
      Item_ID: menuItem.Item_ID,
      Item_Name: menuItem.Item_Name,
      Item_Name_Ur: menuItem.Item_Name_Ur,
      Quantity_Discarded: wasteQty,
      Reason: wasteReason,
      Timestamp: new Date().toISOString(),
    };

    setFinishedWasteLogs((prev) => [newWasteLog, ...prev]);
    setSuccessWasteMsg(
      lang === "ur"
        ? `✅ ضائع شدہ کھانا کامیابی سے لاگ ہوا۔ ${wasteQty} پلیٹیں سٹاک سے نکال دی گئیں۔`
        : `✅ Cleared! Logged ${wasteQty} wasted portions. Stock successfully adjusted.`
    );
    playBuzzer(780, 0.25);
  };

  const handleSaveConfigClick = () => {
    setEditSuccessMsg("");
    setMenu((prevMenu) =>
      prevMenu.map((m) =>
        m.Item_ID === selectedEditItemId
          ? { ...m, Batch_Yield: editYield }
          : m
      )
    );
    setEditSuccessMsg(
      lang === "ur"
        ? `💾 بچاو کامیاب! بیچ ییلڈ مقدار ${editYield} پلیٹ سیٹ ہو گئی۔`
        : `💾 Updated! Cooker batch yield updated to ${editYield} plates.`
    );
    setTimeout(() => setEditSuccessMsg(""), 4000);
  };

  const getForecastSuggestion = (itemId: string, itemName: string, urName: string) => {
    const dayIndex = new Date().getDay(); // 0 Sunday, 5 Friday, 6 Saturday
    const isWeekend = dayIndex === 0 || dayIndex === 5 || dayIndex === 6;
    const isFriday = dayIndex === 5;
    
    if (itemId === "L08") { // Biryani
      if (isFriday) {
        return lang === "ur" 
          ? "اوسطاً جمعہ کو 80 پلیٹ بریانی فروخت ہوتی ہے، کم از کم 2 دیگ تیار کریں۔" 
          : "Avg sales on Friday is 80 plates. Suggest preparing at least 2 batches (degs).";
      } else if (isWeekend) {
        return lang === "ur"
          ? "ہفتہ اور اتوار کو اوسطاً 110 پلیٹ فروخت ہوتی ہے، کم از کم 3 دیگیں تیار کریں۔"
          : "Avg weekend sales is 110 plates. Suggest preparing at least 3 batches (degs).";
      } else {
        return lang === "ur"
          ? "عام دنوں میں روزانہ فروخت تقریباً 45 پلیٹ ہوتی ہے، 1 دیگ تیار کرنا کافی ہے۔"
          : "General weekdays avg is 45 plates. Suggest preparing 1 batch.";
      }
    } else if (itemId === "L04" || itemId === "L05") { // Kabli Pulao
      if (isWeekend) {
        return lang === "ur"
          ? "تعطیلات میں اوسطاً 60 پلیٹ چلی جاتی ہے، کم از کم 1.5 سے 2 دیگ بنوائیں۔"
          : "Weekend avg sales for Pulao is 60 plates. Prepare 2 batches.";
      } else {
        return lang === "ur"
          ? "پیر تا جمعرات اوسطاً 30 پلیٹ طلب ہوتی ہے، 1 دیگ تیار کریں۔"
          : "Weekday avg sales is 30 plates. Prepare 1 batch.";
      }
    } else if (itemId === "L09") { // Nihari
      if (dayIndex === 0 || dayIndex === 6) { 
        return lang === "ur"
          ? "اتوار کو نہاری کی فروخت بڑھ کر 50 پلیٹ ہوتی ہے، کم از کم 2 دیگ تیار کریں۔"
          : "Sunday Nihari breakfast/dinner is highly popular (50 plates). Prepare 2 batches.";
      } else {
        return lang === "ur"
          ? "عام دنوں میں نہاری کی اوسط طلب 20 پلیٹ ہے، 1 دیگ تیار کریں۔"
          : "Weekday Nihari average is 20 plates. Prepare 1 batch.";
      }
    } else {
      return lang === "ur" 
        ? "آج کے دن اوسطاً 30 پلیٹ فروخت متوقع ہے۔" 
        : "Average expected daily sale is 30 plates.";
    }
  };

  const activeChefOrders = kdsOrders.filter(o => o.Kitchen_Status !== "Delivered");
  const cookingCount = kdsOrders.filter((o) => o.Kitchen_Status === "Cooking").length;
  const pendingCount = kdsOrders.filter((o) => o.Kitchen_Status === "Pending" || o.Kitchen_Status === "Draft").length;
  const readyCount = kdsOrders.filter((o) => o.Kitchen_Status === "Ready").length;

  return (
    <div id="kitchen-kds-view" className="space-y-6">
      
      {/* HEADER CONTROL BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150">
        <div>
          <h2 className="text-2xl font-black text-[#0F4C81] tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-[#FF8C42] animate-pulse" />
            <span>{lang === "ur" ? "باورچی خانہ لائیو بیچ مینیجر اور ڈیجیٹل بورڈ" : "Kitchen Live Batch Manager & KDS Display"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "ur" 
              ? "دیگوں کی تیاری، ویسٹ مینیجر کٹوتی، اور لائیو کیو کے ایس او آرز" 
              : "Track pot batches preparation, raw stock auto deductions, portions waste logging, and live customer orders."}
          </p>
        </div>

        {/* METRICS & BUZZER TEST */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold font-mono">
            <span className="px-3 py-1 bg-[#FF8C42] rounded-xl text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              <span>NEW {pendingCount}</span>
            </span>
            <span className="px-3 py-1 bg-[#FFD700] rounded-xl text-slate-800">
              COOKING {cookingCount}
            </span>
            <span className="px-3 py-1 bg-emerald-600 rounded-xl text-white">
              READY {readyCount}
            </span>
          </div>

          <button
            onClick={() => {
              initAudio();
              playBuzzer(880, 0.25);
            }}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-black border border-slate-200 shadow-sm transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#0F4C81]" />
            <span>{lang === "ur" ? "گھنٹی ٹیسٹ کریں" : "Test Chime"}</span>
          </button>
        </div>
      </div>

      {/* CORE SPLIT VIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (Col Span 7): ACTIVE CHEF ORDER CARDS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm uppercase font-black text-[#0F4C81] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF8C42]" />
              <span>{lang === "ur" ? "کھانا پکانے کے لائیو ٹکٹس" : "Active Cooking queue tickets"}</span>
            </h3>
            <span className="text-[10px] bg-indigo-50 text-[#0F4C81] px-2.5 py-0.5 rounded-full font-bold">
              {activeChefOrders.length} active KOT
            </span>
          </div>

          {activeChefOrders.length === 0 ? (
            <div className="bg-white border border-slate-100 p-16 rounded-3xl text-center space-y-4 shadow-sm">
              <Clock className="w-12 h-12 text-[#0F4C81]/30 mx-auto animate-spin" />
              <h3 className="text-lg font-black text-slate-800">
                {lang === "ur" ? "باورچی خانے کے لیے کوئی نیا آرڈر نہیں ملا!" : "All orders are fully prepared!"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {lang === "ur" 
                  ? "کاؤنٹر کی جانب سے کوئی بھی آرڈر یہاں گھنٹی بجا کر پیش کیا جائے گا۔" 
                  : "Active tickets are synchronized. Ready for incoming kitchen requests!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <AnimatePresence mode="popLayout">
                {activeChefOrders.map((kdsOrder) => (
                  <KDSTicket
                    key={kdsOrder.KDS_ID}
                    order={kdsOrder}
                    onUpdateStatus={onUpdateKitchenStatus}
                    onAddDelay={onAddDelay}
                    playNormalBeep={() => playBuzzer(800, 0.18)}
                    lang={lang}
                    menu={menu}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (Col Span 5): LIVE PRODUCTION DASHBOARD, BATCH PREP, WASTE MANAGER */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECTION 1: TODAY'S STOCK & BATCH PRODUCTION DASHBOARD (موجودہ تیار شدہ کھانا کتوتی) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <ChefHat className="w-4 h-4 text-amber-500" />
              <span>{lang === "ur" ? "لائیو پیداوار اور تیار سٹاک ڈیش بورڈ" : "Live Batch Production & Ready Stock"}</span>
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {batchMenuItems.map((item) => {
                const lowStock = (item.Available_Portions || 0) <= 5;
                return (
                  <div key={item.Item_ID} className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                    lowStock 
                      ? "bg-red-50/50 border-red-200" 
                      : "bg-slate-50 border-slate-150"
                  }`}>
                    <div className="space-y-1">
                      <span className="font-extrabold text-xs text-slate-800 block">
                        {lang === "ur" ? item.Item_Name_Ur : item.Item_Name}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {lang === "ur" ? `بیچ ییلڈ: ${item.Batch_Yield} پلیٹ / دیگ` : `Yield: ${item.Batch_Yield} plates / batch`}
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className={`text-xs font-mono font-black py-1 px-3 rounded-xl block ${
                        lowStock 
                          ? "bg-red-500 text-white animate-pulse" 
                          : "bg-emerald-600 text-white"
                      }`}>
                        {item.Available_Portions || 0} Plates
                      </span>
                      {lowStock && (
                        <span className="text-[8px] text-red-600 font-black animate-bounce uppercase">
                          ⚠️ stock low! Prepare Cooker
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: PREPARE BATCH / COOKER RECIPE DEDUCTION SYSTEM (چولہا لگوائیں / دیگ چڑہائیں) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-[#0F4C81] tracking-wider flex items-center gap-1.5 border-b border-indigo-50 pb-2">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>{lang === "ur" ? "دیگ چڑھائیں (خام مال کی فوری کٹوتی)" : "Cook Batch (Instant Recipe Deduction)"}</span>
            </h3>

            {successBatchMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200 animate-slideUp">
                {successBatchMsg}
              </div>
            )}
            {errorBatchMsg && (
              <div className="p-3 bg-red-50 text-red-800 text-[11px] font-bold rounded-xl border border-red-200 animate-slideUp">
                {errorBatchMsg}
              </div>
            )}

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase">Select Batch Food (کھانے کا انتخاب)</label>
                <select
                  value={selectedCookItemId}
                  onChange={(e) => setSelectedCookItemId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 font-extrabold outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  {batchMenuItems.map((m) => (
                    <option key={m.Item_ID} value={m.Item_ID}>
                      {lang === "ur" ? m.Item_Name_Ur : m.Item_Name} ({m.Item_ID})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batches Counter (No. of Degs) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase">Quantity Batches (دیگیں مقدار)</label>
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1">
                    <button
                      type="button"
                      onClick={() => setBatchesCount(Math.max(1, batchesCount - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-100 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-black text-slate-800 text-sm">
                      {batchesCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBatchesCount(batchesCount + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-100 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase">Yield Output (پیداواری پلیٹس)</label>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono font-black text-slate-700 text-sm text-center">
                    {(() => {
                      const selected = menu.find(m => m.Item_ID === selectedCookItemId);
                      const baseYield = selected?.Batch_Yield || 50;
                      return batchesCount * baseYield;
                    })()}{" "}
                    {lang === "ur" ? "پلیٹیں" : "plates"}
                  </div>
                </div>
              </div>

              {/* Live ingredient requirements list */}
              {(() => {
                const selected = menu.find(m => m.Item_ID === selectedCookItemId);
                if (!selected) return null;
                const totalCookPortions = batchesCount * (selected.Batch_Yield || 50);

                return (
                  <div className="bg-blue-50/50 rounded-2xl p-3.5 border border-indigo-100 space-y-2">
                    <span className="text-[10px] font-black text-[#0F4C81] uppercase tracking-wider block">
                      Required raw materials info (درکار خام سٹاک کٹوتی):
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {selected.Recipe_Ingredients.map((recipe) => {
                        const rawItem = inventory.find((i) => i.Raw_Item_ID === recipe.Raw_Item_ID);
                        if (!rawItem) return null;
                        const divider = (rawItem.Unit === "KG" || rawItem.Unit === "Litre") ? 1000 : 1;
                        const neededAmount = (recipe.Qty * totalCookPortions) / divider;
                        const isUnderStock = rawItem.Current_Stock_Qty < neededAmount;

                        return (
                          <div key={recipe.Raw_Item_ID} className={`flex flex-col p-1.5 rounded-xl border ${
                            isUnderStock ? "bg-red-50 border-red-200" : "bg-white border-slate-100"
                          }`}>
                            <span className="font-extrabold text-slate-700 line-clamp-1">
                              {lang === "ur" ? rawItem.Raw_Item_Name_Ur : rawItem.Raw_Item_Name}
                            </span>
                            <span className="font-mono text-[10px] mt-0.5 text-slate-500">
                              Need: <strong className={isUnderStock ? "text-red-600 font-black" : "text-slate-800"}>
                                {neededAmount.toFixed(1)} {rawItem.Unit}
                              </strong>
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              Stock: {rawItem.Current_Stock_Qty.toFixed(1)} {rawItem.Unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={handlePrepareBatchClick}
                className="w-full py-3 bg-[#10B981] hover:bg-emerald-600 text-white font-black rounded-2xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ChefHat className="w-4 h-4 text-white" />
                <span>{lang === "ur" ? "بیچ تیار کریں (خام سٹاک کم کریں)" : "Assemble & Prepare Batch"}</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: FINISHED WASTE LOGGER (کھانے کی بربادی / ویسٹ کٹوتی) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-rose-600 tracking-wider flex items-center gap-1.5 border-b border-rose-50 pb-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>{lang === "ur" ? "ضائع شدہ کھانا کٹوتی مینیجر" : "Finished Portions Waste Logger"}</span>
            </h3>

            {successWasteMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200 animate-slideUp">
                {successWasteMsg}
              </div>
            )}
            {errorWasteMsg && (
              <div className="p-3 bg-red-50 text-red-800 text-[11px] font-bold rounded-xl border border-red-200 animate-slideUp">
                {errorWasteMsg}
              </div>
            )}

            <div className="space-y-3 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase">Choose Food (کھانا سلیکٹ کریں)</label>
                <select
                  value={selectedWasteItemId}
                  onChange={(e) => setSelectedWasteItemId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 font-extrabold outline-none focus:border-red-500 transition cursor-pointer"
                >
                  {batchMenuItems.map((m) => (
                    <option key={m.Item_ID} value={m.Item_ID}>
                      {lang === "ur" ? m.Item_Name_Ur : m.Item_Name} ({m.Item_ID})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase">Portions Wasted (ضائع پلیٹیں)</label>
                  <input
                    type="number"
                    min="1"
                    value={wasteQty}
                    onChange={(e) => setWasteQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 text-slate-800 font-mono font-black p-2.5 rounded-xl border border-slate-200 outline-none text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase">Reason (وجہ بربادی)</label>
                  <select
                    value={wasteReason}
                    onChange={(e) => setWasteReason(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 font-extrabold outline-none focus:border-red-500 transition"
                  >
                    <option value="Spoiled / Expired">Expired (خراب شدہ)</option>
                    <option value="Burned">Burned (جل گیا ہے)</option>
                    <option value="Dropped / Spilled">Spilled (گر گیا ہے)</option>
                    <option value="Customer Rejection">Rejected (واپس ریجیکٹ)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogWasteClick}
                className="w-full py-3 bg-[#EF4444] hover:bg-red-650 text-white font-black rounded-2xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4 text-white" />
                <span>{lang === "ur" ? "ویسٹ لاگ کریں (سٹاک سبٹریکٹ)" : "Deduct & Register Waste"}</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: DEMAND & SALES FORECAST PREDICTIONS (تخمینہ فروخت گائیڈ) */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-15 transform translate-x-3 translate-y-3 select-none">
              <TrendingUp className="w-28 h-28 text-amber-400" />
            </div>

            <h3 className="text-xs uppercase font-extrabold text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-indigo-950 pb-2.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>{lang === "ur" ? "سمارٹ سیلز پیشن گوئی اور رہنمائی" : "Smart Sales Forecasting Suggestions"}</span>
            </h3>

            <div className="space-y-2 text-xs leading-relaxed relative z-10">
              <p className="text-slate-300">
                {lang === "ur"
                  ? "سابقہ 30 دن کی تاریخی سیلز ٹرانزیکشن کی بنیاد پر، آج کے دن کے لیے بہترین پیداواری مشورہ:"
                  : "Based on restaurant historical sales data matrix, recommended batch prep suggestion for today:"}
              </p>

              {(() => {
                const selected = menu.find(m => m.Item_ID === selectedCookItemId) || batchMenuItems[0];
                if (!selected) return null;
                return (
                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-indigo-800 space-y-1 mt-2 mb-1">
                    <span className="text-[10px] uppercase font-black text-emerald-400 block font-mono">
                      {lang === "ur" ? selected.Item_Name_Ur : selected.Item_Name} Forecast:
                    </span>
                    <p className="text-xs font-semibold text-white leading-normal">
                      {getForecastSuggestion(selected.Item_ID, selected.Item_Name, selected.Item_Name_Ur)}
                    </p>
                  </div>
                );
              })()}
              
              <span className="text-[8.5px] text-slate-400 font-bold block bg-black/30 p-2 rounded-lg leading-normal uppercase">
                💡 Friday (جمعہ) and weekend breakfast represent 2.5x standard volume multipliers. Log cooker early!
              </span>
            </div>
          </div>

          {/* SECTION 5: OWNER EDIT RECIPE CONFIGURATOR (مالک / مینیجر ترجیحات) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs uppercase font-extrabold text-slate-800 tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>{lang === "ur" ? "اونر پینل: بیچ ییلڈ فارمولا سیٹ" : "Owner Settings: Batch Formula Spec"}</span>
              </h3>
              <span className="text-[8.5px] uppercase font-black px-2 py-0.5 bg-indigo-50 text-[#0F4C81] border border-blue-100 rounded-md">
                Admin Settings Only
              </span>
            </div>

            {/* Shield restriction warning for non-admin crew */}
            {currentUserRole !== "Admin" && currentUserRole !== "SuperAdmin" && currentUserRole !== undefined ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                <ShieldAlert className="w-8 h-8 text-amber-500 animate-pulse" />
                <span className="text-xs font-black text-slate-700">
                  {lang === "ur" ? "رسائی ممنوع ہے!" : "Access Restricted!"}
                </span>
                <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                  {lang === "ur"
                    ? "دیگ سے نکلنے والی پلیٹوں کی تعداد (ییلڈ فارمولا) صرف مینیجر یا اونر تبدیل کرنے کے مجاز ہیں۔"
                    : "Only Owner / Restaurant managers have write privileges to mutate product yield spec models."}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                {editSuccessMsg && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 text-[10.5px] font-bold rounded-xl border border-emerald-200">
                    {editSuccessMsg}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] label text-slate-400 font-extrabold uppercase">Formula Target Dish (آئٹم)</label>
                  <select
                    value={selectedEditItemId}
                    onChange={handleEditItemChange}
                    className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 font-extrabold outline-none"
                  >
                    {batchMenuItems.map((m) => (
                      <option key={m.Item_ID} value={m.Item_ID}>
                        {lang === "ur" ? m.Item_Name_Ur : m.Item_Name} ({m.Item_ID})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase flex justify-between">
                    <span>Batch yield portions (پلیٹیں کل فی دیگ)</span>
                    <span className="text-[#0F4C81] font-mono">Current: {(menu.find(m => m.Item_ID === selectedEditItemId)?.Batch_Yield || 50)}</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      value={editYield}
                      onChange={(e) => setEditYield(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50 text-slate-800 font-mono font-black p-2.5 rounded-xl border border-slate-200 outline-none"
                    />
                    <span className="absolute right-3.5 font-black text-slate-400">plates</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveConfigClick}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{lang === "ur" ? "تبدیلیاں محفوظ کریں" : "Apply formula change"}</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

interface KDSTicketProps {
  key?: string;
  order: KDSOrder;
  onUpdateStatus: (kdsId: string, nextStatus: "Pending" | "Cooking" | "Ready" | "Delivered" | "Draft") => void;
  onAddDelay: (kdsId: string, mins: number) => void;
  playNormalBeep: () => void;
  lang: "ur" | "en";
  menu: MenuItem[];
}

function KDSTicket({ order, onUpdateStatus, onAddDelay, playNormalBeep, lang, menu }: KDSTicketProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const targetTime = new Date(order.Target_Time).getTime();
      const finalTargetTime = targetTime + order.Delay_Time_Added * 60 * 1000;
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((finalTargetTime - now) / 1000));
      setSecondsRemaining(diffSecs);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [order.Target_Time, order.Delay_Time_Added]);

  const minsLeft = Math.floor(secondsRemaining / 60);
  const secsLeft = secondsRemaining % 60;
  const isLate = secondsRemaining === 0 && order.Kitchen_Status !== "Ready" && order.Kitchen_Status !== "Delivered";

  const getStatusStyle = () => {
    switch (order.Kitchen_Status) {
      case "Ready":
        return { 
          border: "border-emerald-500 bg-emerald-50/5", 
          label: lang === "ur" ? "تیار ہے" : "Ready", 
          color: "text-emerald-700 bg-emerald-50 border border-emerald-200",
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
        };
      case "Cooking":
        return { 
          border: "border-amber-400 bg-amber-50/5", 
          label: lang === "ur" ? "پک رہا ہے" : "Cooking", 
          color: "text-amber-700 bg-amber-50 border border-amber-200",
          icon: <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        };
      default:
        return { 
          border: "border-[#FF8C42] bg-orange-50/5", 
          label: lang === "ur" ? "انتظار" : "Pending", 
          color: "text-[#FF8C42] bg-orange-50 border border-orange-100",
          icon: <Clock className="w-3.5 h-3.5 text-[#FF8C42] animate-spin" style={{ animationDuration: "6s" }} />
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.25 } }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30,
        layout: { duration: 0.3 }
      }}
      className={`bg-white border-2 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-colors duration-500 flex flex-col justify-between ${statusStyle.border}`}
    >
      
      {/* TICKET HEADER */}
      <div className="space-y-3 pb-3 border-b border-slate-100 text-xs">
        <div className="flex justify-between items-center h-7">
          <span className="font-mono text-slate-400 font-extrabold uppercase">Ticket #{order.KDS_ID}</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={statusStyle.label}
              initial={{ scale: 0.8, opacity: 0, x: -10 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.8, opacity: 0, x: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`p-1 px-2.5 rounded-full text-[10px] uppercase font-black flex items-center gap-1.5 shadow-sm ${statusStyle.color}`}
            >
              {statusStyle.icon}
              <span>{statusStyle.label}</span>
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-bold text-xs">
              T{order.Table_Number}
            </span>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Location</span>
              <span className="font-extrabold text-slate-800">Dining Table #{order.Table_Number}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block font-bold">Steward ID</span>
            <span className="font-mono font-black text-slate-700">{(order as any).Waiter_ID || "ST04"}</span>
          </div>
        </div>
      </div>

      {/* DISH FLOW list */}
      <div className="my-4 flex-1 space-y-3 text-xs leading-normal">
        <p className="text-[9px] text-[#0F4C81] uppercase font-black tracking-wider">Kitchen Order Items:</p>
        <div className="space-y-2">
          {order.Items.map((item, idx) => {
            const menuRaw = menu.find(m => m.Item_ID === item.Item_ID);
            
            return (
              <div key={idx} className="flex gap-2.5 items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-205">
                    <img 
                      src={menuRaw?.Image_Url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120"} 
                      alt={item.Item_Name}
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="text-slate-800 font-extrabold text-xs">{lang === "ur" ? item.Item_Name_Ur : item.Item_Name}</div>
                    <div className="text-[9px] font-mono text-slate-400">ID: {item.Item_ID}</div>
                  </div>
                </div>
                <span className="text-[#FF8C42] font-black text-xs font-mono bg-white px-2 py-1 rounded-xl border border-slate-200">
                  x{item.Quantity}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TIMER & CHEF CONTROLS */}
      <div className="border-t border-slate-150 pt-3 space-y-3">
        
        {/* Real Countdown timer explicitly requested */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 uppercase font-black">
            <Hourglass className="w-4 h-4 text-[#FF8C42]" />
            <span>{lang === "ur" ? "تیاری کا وقت باقی:" : "Countdown:"}</span>
          </div>
          <div className={`font-mono font-black text-xs ${isLate && order.Kitchen_Status !== "Ready" ? "text-red-650 animate-pulse" : "text-slate-800"}`}>
            {order.Kitchen_Status === "Ready" ? (
              <span className="text-emerald-600 text-xs uppercase">{lang === "ur" ? "تَیار ہے" : "Prepared"}</span>
            ) : isLate ? (
              <span className="text-rose-650">OVERTIME LATE</span>
            ) : (
              `${minsLeft.toString().padStart(2, "0")}:${secsLeft.toString().padStart(2, "0")}`
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={order.Kitchen_Status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2"
            >
              {order.Kitchen_Status === "Pending" || order.Kitchen_Status === "Draft" ? (
                <button
                  onClick={() => {
                    playNormalBeep();
                    onUpdateStatus(order.KDS_ID, "Cooking");
                  }}
                  className="w-full py-3 bg-[#FF8C42] hover:bg-[#ff7b25] text-white font-black rounded-xl text-xs uppercase transition tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-orange-100"
                >
                  <span>🔥 Start Cooking</span>
                </button>
              ) : order.Kitchen_Status === "Cooking" ? (
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => {
                      playNormalBeep();
                      onUpdateStatus(order.KDS_ID, "Ready");
                    }}
                    className="col-span-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-100"
                  >
                    <span>✓ Ready</span>
                  </button>
                  <button
                    onClick={() => {
                      playNormalBeep();
                      onAddDelay(order.KDS_ID, 5);
                    }}
                    className="col-span-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] transition border border-slate-200"
                  >
                    +5 Mins
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    playNormalBeep();
                    onUpdateStatus(order.KDS_ID, "Delivered");
                  }}
                  className="w-full py-3 bg-[#0F4C81] hover:bg-[#0c3e69] text-white font-black rounded-xl text-xs uppercase transition tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#0F4C81]/20"
                >
                  <span>🍽 Completed (To Waiter)</span>
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </motion.div>
  );
}
