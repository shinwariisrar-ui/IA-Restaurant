import React, { useState } from "react";
import { TableStatus, MenuItem, OrderItem, OrderBill, UserRow, StaffRole, InventoryItem } from "../types";
import { 
  Plus, Minus, ShoppingBag, Utensils, QrCode, Phone, Bell, Check, DollarSign, MessageSquare, Flame, CheckCircle, Send, Camera
} from "lucide-react";
import CameraQRScanner from "./CameraQRScanner";

interface RoleWaiterProps {
  tables: TableStatus[];
  menu: MenuItem[];
  activeOrders: OrderBill[];
  staff: UserRow[];
  loggedInUser: UserRow;
  inventory?: InventoryItem[]; // Recipe Cost computation integration
  onPlaceOrder: (tableNum: number, items: OrderItem[]) => void;
  onModifyOrder: (orderId: string, items: OrderItem[]) => void;
  onCallHelp?: (tableNum: number, type: "Waiter" | "Bill") => void;
  onClearTableRequest?: (tableNum: number) => void;
  lang: "ur" | "en";
}

export default function RoleWaiter({
  tables,
  menu,
  activeOrders,
  staff,
  loggedInUser,
  inventory = [],
  onPlaceOrder,
  onModifyOrder,
  onCallHelp,
  onClearTableRequest,
  lang
}: RoleWaiterProps) {
  const [activeTable, setActiveTable] = useState<TableStatus | null>(null);
  const [waiterCart, setWaiterCart] = useState<OrderItem[]>([]);
  const [waiterSelectedCat, setWaiterSelectedCat] = useState<string>("All");
  const [showCamScanner, setShowCamScanner] = useState<boolean>(false);

  const handleQRScan = (decoded: string) => {
    let foundNum: number | null = null;
    const regexes = [
      /table(?:_number)?(?:[=\/_\-\s]+)?(\d+)/i,
      /T(?:[\-\s]+)?(\d+)/i,
      /BEG(?:[\-\s]+)?TABLE(?:[\-\s]+)?(\d+)/i,
      /(\d+)/
    ];
    for (const r of regexes) {
      const match = decoded.match(r);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (tables.some(t => t.Table_Number === parsed)) {
          foundNum = parsed;
          break;
        }
      }
    }

    if (foundNum !== null) {
      const tab = tables.find(t => t.Table_Number === foundNum);
      if (tab) {
        handleTableSelect(tab);
        setShowCamScanner(false);
      }
    } else {
      alert(lang === "ur" ? "غلط کیو آر کوڈ! برائے مہربانی درست کیو آر اسکین کریں۔" : "Invalid Table QR Code! Please verify you are scanning a table's QR sticker.");
    }
  };

  // Chat/Messaging
  const [broadcastList, setBroadcastList] = useState<{ id: string; from: string; text: string; time: string }[]>([
    { id: "1", from: "Super Admin", text: "کھانا گرم پیش کریں اور ڈیلز کی تشہیر کریں۔", time: "11:25 AM" },
    { id: "2", from: "Chef Ramzan", text: "چکن کڑھائی تیار ہے۔ ٹیبل 2 کا ویٹر آ کر اٹھا لے۔", time: "11:40 AM" }
  ]);
  const [messageInput, setMessageInput] = useState("");

  const getRecipeCost = (item: MenuItem) => {
    if (!item.Recipe_Ingredients || item.Recipe_Ingredients.length === 0) return 0;
    return item.Recipe_Ingredients.reduce((total, ing) => {
      const raw = inventory.find(r => r.Raw_Item_ID === ing.Raw_Item_ID);
      if (!raw) return total;
      const price = raw.Cost_Price || 0;
      if (raw.Unit === "KG" || raw.Unit === "Litre") {
        return total + (ing.Qty / 1000) * price;
      }
      return total + ing.Qty * price;
    }, 0);
  };

  const categories = [
    { id: "All", en: "All", ur: "سب کھا" },
    { id: "Pizzas", en: "🍕 Pizza", ur: "پیزا" },
    { id: "Burgers", en: "🍔 Burger", ur: "برگر" },
    { id: "Shorma & Rolls", en: "🌯 Roll", ur: "رول" },
    { id: "Quetta Chai & Paratha", en: "☕ Tea", ur: "چائے" },
    { id: "Lunch & BBQ", en: "🍲 BBQ", ur: "لنچ" }
  ];

  const runningBill = activeTable
    ? activeOrders.find((o) => o.Table_Number === activeTable.Table_Number && o.Payment_Status === "Pending")
    : null;

  const handleTableSelect = (tab: TableStatus) => {
    setActiveTable(tab);
    const existingBill = activeOrders.find(
      (o) => o.Table_Number === tab.Table_Number && o.Payment_Status === "Pending"
    );
    if (existingBill) {
      setWaiterCart([...existingBill.Order_Items]);
    } else {
      setWaiterCart([]);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    const existing = waiterCart.find((ci) => ci.Item_ID === item.Item_ID);
    if (existing) {
      setWaiterCart(
        waiterCart.map((ci) =>
          ci.Item_ID === item.Item_ID ? { ...ci, Quantity: ci.Quantity + 1 } : ci
        )
      );
    } else {
      setWaiterCart([
        ...waiterCart,
        { 
          Item_ID: item.Item_ID, 
          Item_Name: item.Item_Name, 
          Item_Name_Ur: item.Item_Name_Ur, 
          Price: item.Sales_Price, 
          Quantity: 1 
        }
      ]);
    }
  };

  const handleQtyChange = (itemId: string, diff: number) => {
    setWaiterCart(
      waiterCart
        .map((ci) => {
          if (ci.Item_ID === itemId) return { ...ci, Quantity: ci.Quantity + diff };
          return ci;
        })
        .filter((ci) => ci.Quantity > 0)
    );
  };

  const handleToggleSize = (itemId: string, size: "Full" | "Half") => {
    const menuItem = menu.find((m) => m.Item_ID === itemId);
    if (!menuItem) return;
    const basePrice = menuItem.Sales_Price;
    const targetPrice = size === "Half" ? Math.round(basePrice / 2) : basePrice;
    
    setWaiterCart(
      waiterCart.map((ci) => 
        ci.Item_ID === itemId 
          ? { ...ci, Serving_Size: size, Price: targetPrice }
          : ci
      )
    );
  };

  const handleDispatchOrder = () => {
    if (!activeTable || waiterCart.length === 0) return;
    if (runningBill) {
      onModifyOrder(runningBill.Order_ID, waiterCart);
    } else {
      onPlaceOrder(activeTable.Table_Number, waiterCart);
    }
    setActiveTable(null);
    setWaiterCart([]);
    alert(lang === "ur" ? "آرڈر کامیابی سے کیشیر اور کچن اسکرین پر ڈیلیور ہو گیا!" : "Order dispatched to Kitchen KDS and Cashier!");
  };

  const handleSendTeamMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    setBroadcastList(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        from: loggedInUser.Name.split(" ")[0],
        text: messageInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setMessageInput("");
  };

  const filteredMenu = waiterSelectedCat === "All"
    ? menu
    : menu.filter((item) => item.Category === waiterSelectedCat);

  return (
    <div className="space-y-6">
      
      {/* WAITER TOP BAR PROFILE INFO */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-850 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-800">
            <img src={loggedInUser.Photo_URL} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-[10px] bg-slate-800 text-amber-500 font-extrabold px-2.5 py-0.5 rounded-lg border border-slate-700 font-mono">
              STATION AREA A
            </span>
            <h3 className="text-base font-black mt-1">
              {lang === "ur" ? loggedInUser.Name_Ur : loggedInUser.Name}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-emerald-400 font-black tracking-wider block">Local WiFi Connected 🟢</span>
          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Device IP: 192.168.10.15</span>
        </div>
      </div>

      {/* CORE GRID SPREAD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ACTIVE SECTION FLOOR MAP (8 Cols Span) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h4 className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                {lang === "ur" ? "ہال کی لائیو کرسی میزیں (ٹچ کریں)" : "Dining Hall Seating Map (Touch Table to Order)"}
              </h4>
              <button
                type="button"
                onClick={() => setShowCamScanner(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{lang === "ur" ? "کیمرہ اسکین" : "Scan Table QR (Cam)"}</span>
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {tables.map((tab) => {
                const isSelected = activeTable?.Table_Number === tab.Table_Number;
                const bill = activeOrders.find(
                  (o) => o.Table_Number === tab.Table_Number && o.Payment_Status === "Pending"
                );

                // Calculate occupancy minutes and overdue status
                let minutesOccupied = 0;
                if (bill && bill.Created_At) {
                  const createdTime = new Date(bill.Created_At).getTime();
                  const curTime = new Date().getTime();
                  minutesOccupied = Math.max(0, Math.floor((curTime - createdTime) / 60000));
                }
                const OVERDUE_LIMIT_MINS = 45;
                const isOverdue = bill && minutesOccupied >= OVERDUE_LIMIT_MINS;

                return (
                  <button
                    key={tab.Table_Number}
                    onClick={() => handleTableSelect(tab)}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center border-2 transition text-center relative cursor-pointer overflow-hidden ${
                      isSelected
                        ? "bg-blue-600 border-white text-white scale-102 shadow-md"
                        : bill
                        ? "bg-rose-950/40 border-rose-500/50 text-rose-300"
                        : tab.Customer_Request && tab.Customer_Request !== "None"
                        ? "bg-amber-950/40 border-amber-500/50 text-amber-300"
                        : "bg-slate-950/60 border-slate-850 hover:border-slate-800 text-slate-400"
                    }`}
                  >
                    {/* Live Digital QR scanned assistance alert indicator */}
                    {tab.Customer_Request && tab.Customer_Request !== "None" && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] text-slate-950 font-black items-center justify-center">
                          {tab.Customer_Request === "Waiter" ? "🔔" : "💵"}
                        </span>
                      </span>
                    )}

                    <span className="text-sm font-black font-mono">T-{tab.Table_Number}</span>
                    <span className="text-[8px] font-bold mt-1 uppercase flex flex-col items-center gap-0.5">
                      {bill ? (
                        <>
                          <span>{bill.Total_Amount} Rs</span>
                          <span className={`text-[7px] font-mono font-black flex items-center gap-0.5 mt-0.5 ${isOverdue ? "text-rose-400 animate-pulse font-black" : "text-slate-400"}`}>
                            ⏱️ {minutesOccupied}m
                          </span>
                        </>
                      ) : (
                        "Free"
                      )}
                    </span>

                    {/* Occupied / Overdue Progress Bar indicator */}
                    {bill && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/40">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isOverdue 
                              ? "bg-rose-500 animate-pulse" 
                              : minutesOccupied >= OVERDUE_LIMIT_MINS * 0.7 
                              ? "bg-amber-500" 
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, (minutesOccupied / OVERDUE_LIMIT_MINS) * 100)}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC MENU PANEL (Only if selected a table) */}
          {activeTable ? (
            <div className="space-y-4 animate-scaleIn">
              
              {/* Live Digital Customer QR scanned Request Header alert banner */}
              {(() => {
                const refreshedTab = tables.find(t => t.Table_Number === activeTable.Table_Number);
                if (refreshedTab?.Customer_Request && refreshedTab.Customer_Request !== "None") {
                  return (
                    <div className="bg-amber-950/70 border border-amber-600/50 p-3 rounded-2xl flex items-center justify-between text-amber-300 animate-pulse">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {refreshedTab.Customer_Request === "Waiter" ? "🔔" : "💵"}
                        </span>
                        <div className="text-left">
                          <span className="text-[10px] font-black uppercase tracking-wider block">
                            {lang === "ur" ? "کیو آر کسٹمر الرٹ" : "Digital Customer QR Request"}
                          </span>
                          <span className="text-xs font-bold leading-none">
                            {refreshedTab.Customer_Request === "Waiter" 
                              ? (lang === "ur" ? "کسٹمر کو ویٹر کی مدد کی ضرورت ہے۔" : "Guest has scanning-requested Waiter help!") 
                              : (lang === "ur" ? "کسٹمر بل نکلوانا چاہتا ہے۔" : "Guest scanning-requested the table bill!")}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onClearTableRequest) {
                            onClearTableRequest(activeTable.Table_Number);
                          }
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-lg transition"
                      >
                        {lang === "ur" ? "مکمل / صاف" : "Acknowledge"}
                      </button>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-xs text-slate-350 font-black uppercase">
                  {lang === "ur" ? `ٹیبل ${activeTable.Table_Number} پر کھانا لکھیں:` : `Choose dishes for Table ${activeTable.Table_Number}`}
                </span>
                
                <div className="flex gap-1 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setWaiterSelectedCat(cat.id)}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg whitespace-nowrap cursor-pointer ${
                        waiterSelectedCat === cat.id ? "bg-amber-500 text-slate-950" : "bg-slate-850 text-slate-400"
                      }`}
                    >
                      {lang === "ur" ? cat.ur : cat.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-h-[350px] overflow-y-auto pr-1">
                {filteredMenu.map((item) => (
                  <div
                    key={item.Item_ID}
                    onClick={() => handleAddToCart(item)}
                    className="bg-slate-900 border border-slate-850 rounded-2xl p-3 hover:border-blue-500 hover:bg-slate-905 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex gap-2 items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800">
                        <img src={item.Image_Url} alt="" className="w-full h-full object-cover animate-pulse" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-white line-clamp-1">{item.Item_Name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="text-[11px] text-slate-450 text-slate-400 text-left">{item.Sales_Price} PKR</div>
                          <div className="text-[9px] text-[#10B981] font-bold font-mono">Cost: {getRecipeCost(item).toFixed(0)} PKR</div>
                          {item.Inventory_Method === "Batch" && (
                            <span className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded ${
                              (item.Available_Portions || 0) <= 5
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-emerald-600 text-white"
                            }`}>
                              {item.Available_Portions || 0} Plates
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="p-1 px-2.5 bg-blue-600 text-white font-black text-xs rounded-lg cursor-pointer">
                      +
                    </button>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-xs text-slate-650 flex flex-col items-center justify-center border border-dashed border-slate-800 bg-slate-950/60 rounded-3xl">
              <Utensils className="w-10 h-10 text-slate-700 mb-2.5" />
              <span className="font-black max-w-[280px] leading-relaxed">
                {lang === "ur" 
                  ? "آرڈر لینے کے لیے براہ کرم اوپر ہال میپ سے کسٹمر میز/سیٹ کو ٹچ کریں۔" 
                  : "Touch an active seat or table on the layout floor map to instantly begin order."}
              </span>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: ACTIVE ORDER CART & TEAM DISCUSSIONS (4 Cols Span) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CART VIEW */}
          {activeTable && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3 shadow-xl animate-scaleIn">
              <h4 className="text-xs uppercase font-extrabold text-white flex items-center gap-1.5 border-b border-slate-850 pb-2.5">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Active Table Cart (T-{activeTable.Table_Number})</span>
              </h4>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {waiterCart.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-605 italic font-bold text-slate-500">
                    No items selected yet.
                  </div>
                ) : (
                  waiterCart.map((item) => {
                    const menuItem = menu.find((m) => m.Item_ID === item.Item_ID);
                    const isBatchItem = menuItem?.Inventory_Method === "Batch";
                    
                    return (
                      <div key={item.Item_ID} className="flex flex-col gap-2 bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                        <div className="flex justify-between items-center">
                          <div className="max-w-[130px]">
                            <div className="text-white font-black text-xs truncate leading-tight">
                              {lang === "ur" ? item.Item_Name_Ur : item.Item_Name}
                              {item.Serving_Size === "Half" && (
                                <span className="text-[10px] text-emerald-400 font-bold ml-1">(Half)</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-bold">
                              {item.Price} PKR {isBatchItem ? `× ${item.Serving_Size || "Full"}` : ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => handleQtyChange(item.Item_ID, -1)} className="p-0.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-750 cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="text-white font-mono text-[11px] font-black w-6 text-center">{item.Quantity}</span>
                            <button type="button" onClick={() => handleQtyChange(item.Item_ID, 1)} className="p-0.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-755 cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>

                        {/* Portion selector helper inside waiter cart */}
                        {isBatchItem && (
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
                            <span className="text-slate-500 font-bold">Serving size:</span>
                            <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-850">
                              <button
                                type="button"
                                onClick={() => handleToggleSize(item.Item_ID, "Full")}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-tight transition ${
                                  (!item.Serving_Size || item.Serving_Size === "Full")
                                    ? "bg-blue-600 text-white font-black"
                                    : "text-slate-500 hover:text-slate-350"
                                }`}
                              >
                                Full
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSize(item.Item_ID, "Half")}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-tight transition ${
                                  item.Serving_Size === "Half"
                                    ? "bg-blue-600 text-white font-black"
                                    : "text-slate-500 hover:text-slate-350"
                                }`}
                              >
                                Half
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-850 pt-3 text-xs flex flex-col gap-2.5">
                <div className="flex justify-between font-black font-sans text-white text-sm">
                  <span>Draft Subtotal:</span>
                  <span className="font-mono text-emerald-400">
                    {waiterCart.reduce((sum, ci) => sum + ci.Price * ci.Quantity, 0)} PKR
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  <button
                    onClick={() => setActiveTable(null)}
                    className="py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 font-black rounded-lg text-[10px] cursor-pointer"
                  >
                    Close Sheet
                  </button>
                  <button
                    onClick={handleDispatchOrder}
                    disabled={waiterCart.length === 0}
                    className="py-3 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white font-black rounded-lg text-[10px] shadow cursor-pointer"
                  >
                    Confirm KOT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INTER COM TEAM BROADCAST (Anti theft staff cooperation channel) */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3.5 shadow-xl">
            <h4 className="text-xs uppercase font-extrabold text-white flex items-center gap-1.5 border-b border-slate-850 pb-2.5 text-blue-400">
              <MessageSquare className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>{lang === "ur" ? "اسٹاف برائے باہمی میسنجر" : "Internal Staff Messaging"}</span>
            </h4>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {broadcastList.map((chat) => (
                <div key={chat.id} className="bg-slate-900 p-2.5 rounded-xl border border-slate-855 leading-relaxed text-[11px] border-slate-850">
                  <div className="flex justify-between text-[10px] font-black font-sans text-blue-400">
                    <span>{chat.from}</span>
                    <span className="text-slate-500 font-mono font-bold">{chat.time}</span>
                  </div>
                  <p className="text-slate-105 text-slate-300 font-medium mt-1">{chat.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendTeamMessage} className="flex gap-2.5 mt-1.5">
              <input
                type="text"
                required
                placeholder={lang === "ur" ? "پورے عملے کو میسج لکھیں..." : "Broadcast message to kds/cashier..."}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-medium"
              />
              <button
                type="submit"
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>

        </div>

      </div>

      {showCamScanner && (
        <CameraQRScanner
          lang={lang}
          onScan={handleQRScan}
          onClose={() => setShowCamScanner(false)}
        />
      )}

    </div>
  );
}
