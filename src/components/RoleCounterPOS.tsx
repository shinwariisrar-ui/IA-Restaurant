import React, { useState } from "react";
import { MenuItem, TableStatus, OrderBill, OrderItem, UserRow, InventoryItem } from "../types";
import Pagination from "./Pagination";
import { 
  Plus, Minus, ShoppingBag, CheckCircle, Trash2, Sliders, Play, 
  XCircle, AlertTriangle, HelpCircle, Utensils, QrCode, Phone, Bell, Check, DollarSign, RefreshCw, MessageSquare, Printer, Award, FileText, Undo2
} from "lucide-react";

interface RoleCounterPOSProps {
  tables: TableStatus[];
  menu: MenuItem[];
  inventory?: InventoryItem[]; // Recipe Cost Dynamic Calculation
  onPlaceOrder: (tableNum: number, items: OrderItem[]) => void;
  onModifyOrder: (orderId: string, items: OrderItem[]) => void;
  onCheckout: (orderId: string, method: "Cash" | "Online" | "Credit", creditHolder: string | null) => void;
  onCancelOrder: (orderId: string, reason: string) => void;
  onApproveCancellation?: (orderId: string) => void;
  onRejectCancellation?: (orderId: string) => void;
  onClearTableRequest?: (tableNum: number) => void;
  activeOrders: OrderBill[];
  staff: UserRow[];
  lang: "ur" | "en";
}

export default function RoleCounterPOS({
  tables,
  menu,
  inventory = [],
  onPlaceOrder,
  onModifyOrder,
  onCheckout,
  onCancelOrder,
  onApproveCancellation,
  onRejectCancellation,
  onClearTableRequest,
  activeOrders,
  staff,
  lang
}: RoleCounterPOSProps) {
  // Cashier Tabs as requested: "New Bill", "Pending Bills", "Completed Bills", "Print Receipt", "Refund Requests"
  const [cashierMode, setCashierMode] = useState<"new_bill" | "pending" | "completed" | "print" | "refunds">("new_bill");

  const [selectedTable, setSelectedTable] = useState<TableStatus | null>(null);
  const [currentCart, setCurrentCart] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online" | "Credit">("Cash");
  const [creditHolder, setCreditHolder] = useState("");
  
  // Anti-theft cancel dialog
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelError, setShowCancelError] = useState(false);

  // Print popup layout preview
  const [printBillOrder, setPrintBillOrder] = useState<OrderBill | null>(null);
  const [printType, setPrintType] = useState<"KOT" | "INVOICE">("INVOICE");

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

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [posMenuPage, setPosMenuPage] = useState<number>(1);

  const runningBill = selectedTable
    ? activeOrders.find((o) => o.Table_Number === selectedTable.Table_Number && o.Payment_Status === "Pending")
    : null;

  // Categories for dish filtration
  const categories = [
    { id: "All", en: "All Dishes 🍽️", ur: "سب کھانے" },
    { id: "Pizzas", en: "Pizzas 🍕", ur: "پیزا" },
    { id: "Burgers", en: "Burgers 🍔", ur: "برگر" },
    { id: "Shorma & Rolls", en: "Shorma & Rolls 🌯", ur: "شوارما" },
    { id: "Wings & Sides", en: "Sides 🍗", ur: "ونگز / سائڈز" },
    { id: "Quetta Chai & Paratha", en: "Tea & Paratha ☕", ur: "چائے پراٹھا" },
    { id: "Deals", en: "Special Deals 🎁", ur: "سپیشل ڈیلز" }
  ];

  const handleTableClick = (tab: TableStatus) => {
    setSelectedTable(tab);
    
    const existingBill = activeOrders.find(
      (o) => o.Table_Number === tab.Table_Number && o.Payment_Status === "Pending"
    );
    if (existingBill) {
      setCurrentCart([...existingBill.Order_Items]);
    } else {
      setCurrentCart([]);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    const existing = currentCart.find((ci) => ci.Item_ID === item.Item_ID);
    if (existing) {
      setCurrentCart(
        currentCart.map((ci) =>
          ci.Item_ID === item.Item_ID ? { ...ci, Quantity: ci.Quantity + 1 } : ci
        )
      );
    } else {
      setCurrentCart([
        ...currentCart,
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

  const handleQuantityChange = (itemId: string, diff: number) => {
    setCurrentCart(
      currentCart
        .map((ci) => {
          if (ci.Item_ID === itemId) {
            const nextQty = ci.Quantity + diff;
            return { ...ci, Quantity: nextQty };
          }
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
    
    setCurrentCart(
      currentCart.map((ci) => 
        ci.Item_ID === itemId 
          ? { ...ci, Serving_Size: size, Price: targetPrice }
          : ci
      )
    );
  };

  const filteredMenu = selectedCategory === "All"
    ? menu
    : menu.filter((item) => item.Category === selectedCategory);

  const calculateTotal = () => {
    return currentCart.reduce((sum, item) => sum + item.Price * item.Quantity, 0);
  };

  const handleSaveOrder = () => {
    if (!selectedTable) return;
    if (currentCart.length === 0) return;

    const existingBill = activeOrders.find(
      (o) => o.Table_Number === selectedTable.Table_Number && o.Payment_Status === "Pending"
    );

    if (existingBill) {
      onModifyOrder(existingBill.Order_ID, currentCart);
    } else {
      onPlaceOrder(selectedTable.Table_Number, currentCart);
    }
    setSelectedTable(null);
    setCurrentCart([]);
  };

  const handleCartCheckout = () => {
    if (!runningBill) return;
    onCheckout(runningBill.Order_ID, paymentMethod, paymentMethod === "Credit" ? creditHolder : null);
    
    // Print receipt immediately on checkout for premium feel
    setPrintBillOrder(runningBill);
    setPrintType("INVOICE");

    setCreditHolder("");
    setSelectedTable(null);
    setCurrentCart([]);
  };

  const triggerCancelDialog = (orderId: string) => {
    setCancelModalOrderId(orderId);
    setCancelReason("");
    setShowCancelError(false);
  };

  const submitCancellation = () => {
    if (!cancelReason || cancelReason.trim().length < 4) {
      setShowCancelError(true);
      return;
    }
    if (cancelModalOrderId) {
      onCancelOrder(cancelModalOrderId, cancelReason);
      setCancelModalOrderId(null);
      setCancelReason("");
      setSelectedTable(null);
      setCurrentCart([]);
    }
  };

  const handlePrintCurrentTableBill = () => {
    if (!selectedTable) return;
    const bill = activeOrders.find(o => o.Table_Number === selectedTable.Table_Number && o.Payment_Status === "Pending");
    if (bill) {
      setPrintBillOrder(bill);
      setCashierMode("print");
    } else if (currentCart.length > 0) {
      const sub = currentCart.reduce((sum, item) => sum + item.Price * item.Quantity, 0);
      const currentBill: OrderBill = {
        Order_ID: `TRA-${Math.floor(1000 + Math.random() * 9000)}`,
        Table_Number: selectedTable.Table_Number,
        Order_Items: [...currentCart],
        Total_Amount: sub,
        Payment_Status: "Pending",
        Payment_Method: null,
        Credit_Holder_Name: null,
        Cancellation_Reason: null,
        Cancellation_Approved_By: null,
        Sync_Status: "Local Only",
        Created_At: new Date().toISOString()
      };
      setPrintBillOrder(currentBill);
      setCashierMode("print");
    } else {
      alert(lang === "ur" ? "آپ کو پرنٹ کرنے سے پہلے کم از کم ایک آئٹم شامل کرنا ہوگا۔" : "You must add at least one item to cart before printing thermal receipt.");
    }
  };

  // Divide orders
  const pendingBillsList = activeOrders.filter(o => o.Payment_Status === "Pending");
  const completedBillsList = activeOrders.filter(o => o.Payment_Status === "Paid");
  const cancelledBillsList = activeOrders.filter(o => o.Payment_Status === "Cancelled" || o.Cancellation_Status === "PendingApproval");

  return (
    <div className="space-y-6">
      
      {/* 5 CUSTOM TABS FOR CASHIER CONSOLE */}
      <div className="bg-slate-900 p-2.5 border border-slate-800 rounded-3xl flex flex-wrap gap-2 shadow-lg">
        <button
          onClick={() => { setCashierMode("new_bill"); setSelectedTable(null); }}
          className={`px-4.5 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition cursor-pointer ${
            cashierMode === "new_bill"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
              : "bg-slate-950 hover:bg-slate-850 text-slate-300"
          }`}
        >
          <span>🛒</span>
          <span>{lang === "ur" ? "نیا بل بنائیں" : "New Bill"}</span>
        </button>

        <button
          onClick={() => setCashierMode("pending")}
          className={`px-4.5 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition cursor-pointer relative ${
            cashierMode === "pending"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
              : "bg-slate-950 hover:bg-slate-850 text-slate-300"
          }`}
        >
          <span>⏳</span>
          <span>{lang === "ur" ? "بقایا جات بلز" : "Pending Bills"}</span>
          {pendingBillsList.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-mono text-[9px] font-black flex items-center justify-center animate-bounce">
              {pendingBillsList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCashierMode("completed")}
          className={`px-4.5 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition cursor-pointer ${
            cashierMode === "completed"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
              : "bg-slate-950 hover:bg-slate-850 text-slate-300"
          }`}
        >
          <span>✓</span>
          <span>{lang === "ur" ? "مکمل شدہ بلز" : "Completed Bills"}</span>
        </button>

        <button
          onClick={() => {
            setCashierMode("print");
            if (activeOrders.length > 0) {
              setPrintBillOrder(activeOrders[0]);
            }
          }}
          className={`px-4.5 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition cursor-pointer ${
            cashierMode === "print"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
              : "bg-slate-950 hover:bg-slate-850 text-slate-300"
          }`}
        >
          <span>🖨</span>
          <span>{lang === "ur" ? "پرنٹ کی رسید" : "Print Receipt"}</span>
        </button>

        <button
          onClick={() => setCashierMode("refunds")}
          className={`px-4.5 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition cursor-pointer ${
            cashierMode === "refunds"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
              : "bg-slate-950 hover:bg-slate-850 text-slate-300"
          }`}
        >
          <span>↩</span>
          <span>{lang === "ur" ? "ریفنڈ اور کینسل" : "Refund Requests"}</span>
        </button>
      </div>

      {/* RENDER DYNAMIC MODE SUBVIEWS */}
      {cashierMode === "new_bill" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          {/* LEFT BILL CREATOR AREA */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
              <h3 className="text-xs text-orange-400 font-extrabold uppercase tracking-wider block">
                {lang === "ur" ? "ٹیبل منتخب کر کے کھانا آرڈر درج کریں" : "Select Table & Feed Customer Order Items"}
              </h3>
              
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {tables.map((tab) => {
                  const bill = activeOrders.find(
                    (o) => o.Table_Number === tab.Table_Number && o.Payment_Status === "Pending"
                  );
                  const isSelected = selectedTable?.Table_Number === tab.Table_Number;

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
                      onClick={() => handleTableClick(tab)}
                      className={`p-4 rounded-2xl flex flex-col items-center justify-center border-2 transition text-center cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? "bg-amber-500 border-white text-slate-950 font-black shadow-lg"
                          : bill
                          ? "bg-rose-950/40 border-rose-500/60 text-rose-300"
                          : "bg-slate-950/80 border-slate-850 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      <span className="text-xs font-black font-mono">T-{tab.Table_Number}</span>
                      <span className="text-[8px] font-bold mt-1 block">
                        {bill ? `${bill.Total_Amount} Rs` : "FREE 🟢"}
                      </span>
                      {bill && (
                        <span className={`text-[7px] font-mono font-black block mt-0.5 ${isOverdue ? "text-rose-400 animate-pulse font-black" : "text-slate-400"}`}>
                          ⏱️ {minutesOccupied}m
                        </span>
                      )}

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

            {/* categories & items grid */}
            <div className="space-y-4">
              <div className="flex gap-2 pb-1 bg-slate-900 p-2 rounded-2xl overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setPosMenuPage(1);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition cursor-pointer flex-shrink-0 border ${
                      selectedCategory === cat.id
                        ? "bg-orange-500 text-slate-950 border-orange-550 shadow-md"
                        : "bg-slate-950 hover:bg-slate-850 text-slate-300 border-slate-850"
                    }`}
                  >
                    {lang === "ur" ? cat.ur : cat.en}
                  </button>
                ))}
              </div>

              {(() => {
                const itemsPerPage = 8;
                const totalPages = Math.ceil(filteredMenu.length / itemsPerPage) || 1;
                const validPage = Math.min(posMenuPage, totalPages);
                const paginatedMenu = filteredMenu.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                      {paginatedMenu.map((item) => (
                        <div 
                          key={item.Item_ID}
                          onClick={() => selectedTable && handleAddToCart(item)}
                          className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xs transition duration-150 flex flex-col justify-between cursor-pointer ${
                            selectedTable 
                              ? "border-slate-800 hover:border-amber-500/50 hover:bg-slate-850" 
                              : "border-slate-850 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="h-18 relative bg-slate-950">
                            <img
                              src={item.Image_Url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120"}
                              alt={item.Item_Name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 bg-slate-950 text-[9px] font-black font-mono px-1 py-0.5 rounded text-amber-400">
                              {item.Sales_Price} Rs
                            </span>
                          </div>

                          <div className="p-2 flex flex-col justify-between flex-1">
                            <div>
                              <h4 className="text-[11px] font-black text-white leading-tight truncate">{item.Item_Name}</h4>
                              <div className="flex items-center justify-between mt-0.5">
                                <p className="text-[9px] text-slate-400 truncate">{item.Item_Name_Ur}</p>
                                {item.Inventory_Method === "Batch" && (
                                  <span className={`text-[8px] font-mono font-black px-1 py-0.2 rounded ${
                                    (item.Available_Portions || 0) <= 5
                                      ? "bg-red-500 text-white animate-pulse" 
                                      : "bg-emerald-600 text-white"
                                  }`}>
                                    {item.Available_Portions || 0} Pl
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-slate-900/60 text-[8.5px] text-slate-400">
                              <span>{lang === "ur" ? "لاگت" : "Cost"}:</span>
                              <span className="font-mono font-black text-emerald-400">
                                {getRecipeCost(item).toFixed(0)} PKR
                              </span>
                            </div>

                            {selectedTable && (
                              <button className="w-full mt-2 bg-slate-950 hover:bg-amber-500 text-slate-350 hover:text-slate-950 py-1 text-[9px] font-black rounded-lg transition cursor-pointer border border-slate-800">
                                + Add Item
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Pagination
                      currentPage={validPage}
                      totalPages={totalPages}
                      onPageChange={setPosMenuPage}
                      lang={lang}
                    />
                  </div>
                );
              })()}
            </div>

          </div>

          {/* RIGHT CHECKOUT CART */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-tight flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-orange-500" />
                  <span>{lang === "ur" ? "بل کی کٹوتی چارج" : "Current Active Bill View"}</span>
                </h3>
                {selectedTable && (
                  <span className="text-[10px] text-amber-400 font-extrabold mt-1.5 inline-block bg-slate-950 px-2 py-0.5 rounded">
                    Selected Table: T-{selectedTable.Table_Number}
                  </span>
                )}
              </div>

              {selectedTable ? (
                <div className="space-y-4">
                  {currentCart.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      Cart is empty. Click dishes to add.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentCart.map((item) => {
                        const menuItem = menu.find((m) => m.Item_ID === item.Item_ID);
                        const isBatchItem = menuItem?.Inventory_Method === "Batch";
                        
                        return (
                          <div key={item.Item_ID} className="flex flex-col gap-2 bg-slate-950 p-3 rounded-2xl text-xs border border-slate-850">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-extrabold text-white block">
                                  {lang === "ur" ? item.Item_Name_Ur : item.Item_Name}
                                  {item.Serving_Size === "Half" && (
                                    <span className="text-[10px] ml-1 text-emerald-400 font-bold">
                                      (Half Plate)
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {item.Price} Rs {isBatchItem ? `× ${item.Serving_Size || "Full"}` : ""}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(item.Item_ID, -1)}
                                  className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold"
                                >
                                  -
                                </button>
                                <span className="font-mono font-black text-slate-200">{item.Quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(item.Item_ID, 1)}
                                  className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Serving size toggle for plate-based batch items (e.g. Biryani, Pulao) */}
                            {isBatchItem && (
                              <div className="flex items-center justify-between pt-1 border-t border-slate-900/60 text-[10px]">
                                <span className="text-slate-450 font-medium">Serving:</span>
                                <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSize(item.Item_ID, "Full")}
                                    className={`px-2 py-1 rounded-md text-[9px] font-black tracking-wider transition ${
                                      (!item.Serving_Size || item.Serving_Size === "Full")
                                        ? "bg-amber-500 text-slate-950 font-black"
                                        : "text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    Full Plate (1.0)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSize(item.Item_ID, "Half")}
                                    className={`px-2 py-1 rounded-md text-[9px] font-black tracking-wider transition ${
                                      item.Serving_Size === "Half"
                                        ? "bg-amber-500 text-slate-950 font-black"
                                        : "text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    Half Plate (0.5)
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        <div className="flex justify-between font-black text-sm text-white font-mono bg-slate-950 p-3 rounded-2xl">
                          <span>Total to Pay:</span>
                          <span className="text-amber-400">{calculateTotal()} PKR</span>
                        </div>

                        {/* Payment method selector */}
                        {runningBill && (
                          <div className="space-y-2 pt-2">
                            <label className="block text-[10px] text-slate-400 uppercase font-black">Method of checkout</label>
                            <div className="grid grid-cols-3 gap-2">
                              {["Cash", "Online", "Credit"].map(m => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setPaymentMethod(m as any)}
                                  className={`py-2 rounded-xl text-[10px] font-black cursor-pointer transition ${
                                    paymentMethod === m 
                                      ? "bg-emerald-500 text-slate-950 font-black shadow" 
                                      : "bg-slate-950 text-slate-400"
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>

                            {paymentMethod === "Credit" && (
                              <input
                                type="text"
                                placeholder="Enter creditor ledger name..."
                                value={creditHolder}
                                onChange={(e) => setCreditHolder(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                              />
                            )}
                          </div>
                        )}

                        {/* Checkout or place bill */}
                        <div className="flex gap-2 pt-3">
                          <button
                            type="button"
                            onClick={handleSaveOrder}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl uppercase transition cursor-pointer"
                          >
                            Save & Send order
                          </button>

                          {runningBill && (
                            <button
                              type="button"
                              onClick={handleCartCheckout}
                              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl uppercase transition cursor-pointer"
                            >
                              Pay bill
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handlePrintCurrentTableBill}
                          className="w-full mt-2 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-amber-400 font-black text-xs rounded-xl uppercase transition cursor-pointer flex items-center justify-center gap-2 animate-pulse"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                          <span>{lang === "ur" ? "بل کا پرنٹ حاصل کریں (تھرمل سیم)" : "Print Bill / Receipt (Sim)"}</span>
                        </button>

                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Please select a dining table from the left floor grid to edit or checkout their bill.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {cashierMode === "pending" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>⏳</span>
              <span>Pending Billing Registers ({pendingBillsList.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Awaiting cash drawer settlement</span>
          </div>

          {pendingBillsList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No active bills are currently unpaid. All tables are cleared.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pendingBillsList.map((bill) => (
                <div key={bill.Order_ID} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-amber-400 font-extrabold font-mono">Table #{bill.Table_Number}</span>
                    <span className="text-[9px] font-mono text-slate-505 text-slate-500 font-bold">{bill.Order_ID}</span>
                  </div>

                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {bill.Order_Items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-slate-350">
                        <span>{lang === "ur" ? item.Item_Name_Ur : item.Item_Name}</span>
                        <span className="font-mono text-slate-450">x{item.Quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-900 pt-2 flex items-center justify-between font-mono font-black text-xs text-slate-200">
                    <span>Total Bill:</span>
                    <span className="text-amber-400">{bill.Total_Amount} Rs</span>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleTableClick(tables.find(t => t.Table_Number === bill.Table_Number) || tables[0])}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg uppercase"
                    >
                      Adjust / Pay
                    </button>
                    <button
                      onClick={() => triggerCancelDialog(bill.Order_ID)}
                      className="p-1.5 bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-850 rounded-lg text-xs"
                      title="Cancel invoice"
                    >
                      🗑 Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {cashierMode === "completed" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>✓</span>
              <span>Fully Settled Ledger ({completedBillsList.length})</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Funds secure in active cash safe</span>
          </div>

          {completedBillsList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No bills checked out yet today.</div>
          ) : (
            <div className="space-y-3">
              {completedBillsList.map((bill) => (
                <div key={bill.Order_ID} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm font-black font-mono">
                      #{bill.Table_Number}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">{bill.Order_ID}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{bill.Payment_Method} checkout • Handled by cashier</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-mono font-black text-emerald-400">+{bill.Total_Amount} Rs</div>
                      <div className="text-[9px] text-slate-500">Collected</div>
                    </div>

                    <button
                      onClick={() => {
                        setPrintBillOrder(bill);
                        setCashierMode("print");
                      }}
                      className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-350 border border-slate-800 rounded-xl"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {cashierMode === "print" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* SELECT BILL */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Select Bill Invoice to render</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {activeOrders.map(o => (
                <button
                  key={o.Order_ID}
                  onClick={() => setPrintBillOrder(o)}
                  className={`w-full text-left p-3 rounded-2xl border transition flex justify-between items-center ${
                    printBillOrder?.Order_ID === o.Order_ID 
                      ? "bg-amber-500 text-slate-950 border-white font-black" 
                      : "bg-slate-950 hover:bg-slate-850 text-slate-300 border-slate-850"
                  }`}
                >
                  <div>
                    <span className="text-xs font-extrabold block">Table {o.Table_Number} - {o.Order_ID}</span>
                    <span className="text-[9px] font-bold block opacity-70">Payment Status: {o.Payment_Status}</span>
                  </div>
                  <span className="font-mono text-xs font-black">{o.Total_Amount} Rs</span>
                </button>
              ))}
            </div>
          </div>

          {/* RENDER BILL */}
          <div className="md:col-span-7 bg-white p-6 rounded-3xl text-slate-950 font-sans shadow-2xl relative max-w-sm mx-auto w-full">
            {printBillOrder ? (
              <div className="space-y-4 text-xs">
                
                {/* Official thermal ticket receipt */}
                <div className="text-center space-y-1.5 border-b-2 border-dashed border-slate-300 pb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Barg-e-Gul ERP System</h2>
                  <p className="text-[10px] text-slate-500 leading-none">Main Peshawar Bypass Expressway, PK</p>
                  <p className="text-[9px] text-slate-450 leading-none">Tel: +92 300 1234567 • Cash Register 01</p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-600 font-mono">
                  <span>BILL-ID: {printBillOrder.Order_ID}</span>
                  <span>TABLE: T-{printBillOrder.Table_Number}</span>
                </div>

                <div className="border-b border-slate-200 pb-3.5 pt-1 space-y-2">
                  <div className="grid grid-cols-12 text-[9px] font-black text-slate-705 text-slate-800 uppercase pb-1 border-b border-slate-100">
                    <span className="col-span-6">Item</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-4 text-right">Price</span>
                  </div>

                  {printBillOrder.Order_Items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-[10px] text-slate-800 font-mono">
                      <span className="col-span-6 font-bold truncate">{item.Item_Name}</span>
                      <span className="col-span-2 text-center">x{item.Quantity}</span>
                      <span className="col-span-4 text-right font-black">{item.Price * item.Quantity} Rs</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 font-mono text-right pb-3 border-b-2 border-dashed border-slate-200 text-[10px]">
                  <div className="flex justify-between">
                    <span>SUBTOTAL AMOUNT:</span>
                    <span>{printBillOrder.Total_Amount.toFixed(2)} Rs</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-extrabold">
                    <span>GST TAX (16.0%):</span>
                    <span>{(printBillOrder.Total_Amount * 0.16).toFixed(2)} Rs</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-slate-950 pt-1.5 border-t border-slate-200">
                    <span>NET FINAL TOTAL:</span>
                    <span>{(printBillOrder.Total_Amount * 1.16).toFixed(2)} Rs</span>
                  </div>
                </div>

                <div className="text-center space-y-1 pt-1">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">✓ Thank you for Dining ! ✓</span>
                  <span className="text-[8px] text-slate-400 font-mono block">Powered by Antigravity Core ERP</span>
                </div>

                <button
                  onClick={() => alert("Thermal raw printing commands transmitted successfully.")}
                  className="w-full mt-4 py-3 bg-slate-950 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-850"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>TRANSMIT PRINT COMMAND TO USB THERMAL DRIVER</span>
                </button>

              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">Select a bill from the left collection to preview its tax invoice thermal print representation.</div>
            )}
          </div>
        </div>
      )}

      {cashierMode === "refunds" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>↩</span>
              <span>Anti-Theft Void Logs & Refund Approvals</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Real-time fraud audit ledger</span>
          </div>

          {cancelledBillsList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No cancelled or voided orders exist in the registries for today.</div>
          ) : (
            <div className="space-y-3">
              {cancelledBillsList.map((bill) => (
                <div key={bill.Order_ID} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-red-950 border border-red-900/40 text-red-400 font-extrabold px-2.5 py-0.5 rounded-lg font-mono">T-{bill.Table_Number}</span>
                      <span className="text-xs font-black text-white">{bill.Order_ID}</span>
                    </div>
                    {/* Cancellation details */}
                    <p className="text-[10px] text-slate-450 mt-1.5">
                      <span className="text-rose-400">Reason for Cancellation: </span>
                      {bill.Cancellation_Reason || "No explanation of loss recorded"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs font-mono font-black text-rose-500">-{bill.Total_Amount} Rs</div>
                      <span className="text-[9px] text-slate-500 block">Original Value</span>
                    </div>

                    {bill.Cancellation_Status === "PendingApproval" ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onApproveCancellation && onApproveCancellation(bill.Order_ID)}
                          className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-lg cursor-pointer hover:bg-emerald-600"
                        >
                          Approve Refund
                        </button>
                        <button
                          onClick={() => onRejectCancellation && onRejectCancellation(bill.Order_ID)}
                          className="px-3 py-1.5 bg-slate-900 text-slate-400 font-black text-[10px] rounded-lg cursor-pointer hover:bg-slate-850"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] bg-red-500/15 border border-red-500/30 text-rose-400 px-2 py-1 rounded font-black uppercase">
                        VOIDED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAILED VOID/CANCEL INPUT DIALOG */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-sm text-red-500 uppercase tracking-tight">Void Invoice Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anti-Theft Regulation: Any cancelled sales must carry a valid operational reason to maintain database integrity.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-450 uppercase font-black">Reason for Voider</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Guest changed mind, error typing ticket..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600"
                />
              </div>

              {showCancelError && (
                <div className="text-[10px] text-red-400 font-extrabold">Please enter a reason with at least 4 letters.</div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={submitCancellation}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  Authorized Refund Void
                </button>
                <button
                  type="button"
                  onClick={() => setCancelModalOrderId(null)}
                  className="py-2 px-4 bg-slate-955 text-slate-400 text-xs font-bold rounded-xl"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
