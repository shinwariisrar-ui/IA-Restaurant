import React, { useState } from "react";
import { 
  TableStatus, StaffRole, UserRow, OrderBill, MenuItem, KDSOrder, InventoryItem, OrderItem 
} from "../types";
import { 
  Plus, Trash2, Edit, QrCode, Clipboard, User, Calendar, Check, 
  Download, Printer, X, RefreshCw, Layers, Shield, Sparkles, ChefHat, 
  Clock, CreditCard, ArrowLeftRight, CheckCircle2, ShoppingBag, Coins, Users, AlertTriangle
} from "lucide-react";
import Pagination from "./Pagination";

interface RoleTableManagementProps {
  tables: TableStatus[];
  staff: UserRow[];
  onAddTable: (tableNum: number, waiterId: string) => void;
  onUpdateTable: (tableNum: number, updates: Partial<TableStatus>) => void;
  onDeleteTable: (tableNum: number) => void;
  onOpenCustomerMenu: (tableNum: number) => void;
  lang: "ur" | "en";
  orders: OrderBill[];
  setOrders: React.Dispatch<React.SetStateAction<OrderBill[]>>;
  menu: MenuItem[];
  kds: KDSOrder[];
  setKds: React.Dispatch<React.SetStateAction<KDSOrder[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export default function RoleTableManagement({
  tables,
  staff,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  onOpenCustomerMenu,
  lang,
  orders,
  setOrders,
  menu,
  kds,
  setKds,
  inventory,
  setInventory
}: RoleTableManagementProps) {
  const [newTableNum, setNewTableNum] = useState<number>(tables.length > 0 ? Math.max(...tables.map(t => t.Table_Number)) + 1 : 9);
  const [selectedWaiter, setSelectedWaiter] = useState<string>(staff.find(u => u.Role === StaffRole.Waiter)?.User_ID || "ST04");
  const [editingTableNum, setEditingTableNum] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<"Empty" | "Occupied" | "WaitingForBill" | "Reserved">("Empty");
  const [editWaiter, setEditWaiter] = useState<string>("");
  const [showQRModal, setShowQRModal] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Table Details Screen Active Table
  const [tablePage, setTablePage] = useState<number>(1);
  const [selectedTableNum, setSelectedTableNum] = useState<number | null>(null);
  const [showAddItemPopup, setShowAddItemPopup] = useState<boolean>(false);
  const [showTransferPopup, setShowTransferPopup] = useState<boolean>(false);
  const [transferTargetTable, setTransferTargetTable] = useState<number>(0);
  const [showPrintBillPopup, setShowPrintBillPopup] = useState<boolean>(false);

  // Search/Filter for inserting items
  const [searchItemQuery, setSearchItemQuery] = useState<string>("");
  const [activeItemCategory, setActiveItemCategory] = useState<string>("All");

  const waiters = staff.filter(u => u.Role === StaffRole.Waiter || u.Role === StaffRole.SuperAdmin);

  // Table Status Coloring Configuration
  const statusColors = {
    Empty: { bg: "bg-[#10b981]/5 border-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/15 shadow-sm", bulb: "bg-[#10b981]", label: "Empty / Available", labelUr: "خالی / دستیاب" },
    Occupied: { bg: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/75 shadow-sm", bulb: "bg-rose-500", label: "Occupied / Dining", labelUr: "مصروف" },
    WaitingForBill: { bg: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100/70 shadow-sm", bulb: "bg-amber-500", label: "Request Bill", labelUr: "بل درکار ہے" },
    Reserved: { bg: "bg-[#0F4C81]/5 border-blue-200 text-[#0F4C81] hover:bg-[#0F4C81]/10 shadow-sm", bulb: "bg-[#0F4C81]", label: "Reserved Table", labelUr: "مخصوص بکنگ" }
  };

  const categories = ["All", "Pizzas", "Burgers", "Shorma & Rolls", "Wings & Sides", "Quetta Chai & Paratha", "Lunch & BBQ", "Desserts"];

  // Create Table
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTableNum <= 0) {
      setErrorMsg(lang === "ur" ? "براہ کرم درست نمبر درج کریں۔" : "Please enter a valid table number.");
      return;
    }
    if (tables.some(t => t.Table_Number === newTableNum)) {
      setErrorMsg(lang === "ur" ? "یہ میز پہلے سے موجود ہے۔" : "Table number already exists.");
      return;
    }
    setErrorMsg("");
    onAddTable(newTableNum, selectedWaiter);
    setNewTableNum(prev => prev + 1);
  };

  const handleStartEdit = (t: TableStatus) => {
    setEditingTableNum(t.Table_Number);
    setEditStatus(t.Status);
    setEditWaiter(t.Assigned_Waiter_ID);
  };

  const handleSaveEdit = (tableNum: number) => {
    onUpdateTable(tableNum, {
      Status: editStatus,
      Assigned_Waiter_ID: editWaiter
    });
    setEditingTableNum(null);
  };

  // -----------------------------------------------------------------
  // automatic stock helper
  // -----------------------------------------------------------------
  const processStockAdjustment = (itemId: string, direction: "deduct" | "add_back", qty: number) => {
    const menuItem = menu.find(m => m.Item_ID === itemId);
    if (!menuItem) return;

    setInventory(prev => prev.map(invItem => {
      const ingredientMatch = menuItem.Recipe_Ingredients.find(r => r.Raw_Item_ID === invItem.Raw_Item_ID);
      if (ingredientMatch) {
        const formulaQty = ingredientMatch.Qty * qty; // standard in grams/units
        // Convert Grams to KG, ML to Litre if needed based on Unit
        const divider = (invItem.Unit === "KG" || invItem.Unit === "Litre") ? 1000 : 1;
        const netAdjustment = formulaQty / divider;

        if (direction === "deduct") {
          return {
            ...invItem,
            Current_Stock_Qty: Math.max(0, invItem.Current_Stock_Qty - netAdjustment),
            Expected_Usage_Qty: Number((invItem.Expected_Usage_Qty + netAdjustment).toFixed(3)),
            Last_Updated_Time: new Date().toISOString()
          };
        } else {
          return {
            ...invItem,
            Current_Stock_Qty: Number((invItem.Current_Stock_Qty + netAdjustment).toFixed(3)),
            Expected_Usage_Qty: Math.max(0, Number((invItem.Expected_Usage_Qty - netAdjustment).toFixed(3))),
            Last_Updated_Time: new Date().toISOString()
          };
        }
      }
      return invItem;
    }));
  };

  // -----------------------------------------------------------------
  // find table order & customer info
  // -----------------------------------------------------------------
  const activeOrder = selectedTableNum !== null 
    ? orders.find(o => o.Table_Number === selectedTableNum && o.Payment_Status === "Pending") 
    : null;

  const tableObj = selectedTableNum !== null 
    ? tables.find(t => t.Table_Number === selectedTableNum) 
    : null;

  const orderTimeStr = activeOrder ? new Date(activeOrder.Created_At).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";

  const currentBillAmount = activeOrder ? activeOrder.Total_Amount : 0;
  const discountAmount = Math.round(currentBillAmount * 0.10); // 10% complimentary discount
  const gstTax = Math.round((currentBillAmount - discountAmount) * 0.16); // 16% Sindh/Punjab GST
  const finalBillAmount = Math.max(0, currentBillAmount - discountAmount + gstTax);

  // -----------------------------------------------------------------
  // operations functions
  // -----------------------------------------------------------------
  const handleInitiateSession = () => {
    if (selectedTableNum === null) return;
    
    // Create new order draft
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderBill = {
      Order_ID: newOrderId,
      Table_Number: selectedTableNum,
      Order_Items: [],
      Total_Amount: 0,
      Payment_Status: "Pending",
      Payment_Method: null,
      Credit_Holder_Name: null,
      Cancellation_Reason: null,
      Cancellation_Approved_By: null,
      Sync_Status: "Local Only",
      Created_At: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    onUpdateTable(selectedTableNum, {
      Status: "Occupied",
      Current_Order_ID: newOrderId,
      Customer_Name: "Irshad Khan",
      People_Count: 4
    });

    // Create KDS ticket
    const newKDS: KDSOrder = {
      KDS_ID: `KDS-${Math.floor(300 + Math.random() * 700)}`,
      Order_ID: newOrderId,
      Table_Number: selectedTableNum,
      Kitchen_Status: "Pending",
      Target_Time: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      Delay_Time_Added: 0,
      Customer_Notified: "No",
      Items: []
    };
    setKds(prev => [newKDS, ...prev]);
  };

  const handleAddItemToActiveOrder = (menuItem: MenuItem) => {
    if (selectedTableNum === null || !activeOrder) return;

    const existingItem = activeOrder.Order_Items.find(i => i.Item_ID === menuItem.Item_ID);
    let updatedItems: OrderItem[] = [];

    if (existingItem) {
      updatedItems = activeOrder.Order_Items.map(i => 
        i.Item_ID === menuItem.Item_ID ? { ...i, Quantity: i.Quantity + 1 } : i
      );
    } else {
      updatedItems = [
        ...activeOrder.Order_Items,
        {
          Item_ID: menuItem.Item_ID,
          Item_Name: menuItem.Item_Name,
          Item_Name_Ur: menuItem.Item_Name_Ur,
          Price: menuItem.Sales_Price,
          Quantity: 1
        }
      ];
    }

    const total = updatedItems.reduce((sum, current) => sum + (current.Price * current.Quantity), 0);

    // Update Order State
    setOrders(prev => prev.map(o => 
      o.Order_ID === activeOrder.Order_ID ? { ...o, Order_Items: updatedItems, Total_Amount: total } : o
    ));

    // Update KDS State
    setKds(prev => prev.map(k => 
      k.Order_ID === activeOrder.Order_ID ? { ...k, Items: updatedItems } : k
    ));

    // AUTOMATIC STOCK DEDUCTION
    processStockAdjustment(menuItem.Item_ID, "deduct", 1);
  };

  const handleRemoveItemFromActiveOrder = (item_id: string) => {
    if (selectedTableNum === null || !activeOrder) return;

    const item = activeOrder.Order_Items.find(i => i.Item_ID === item_id);
    if (!item) return;

    let updatedItems: OrderItem[] = [];
    if (item.Quantity > 1) {
      updatedItems = activeOrder.Order_Items.map(i => 
        i.Item_ID === item_id ? { ...i, Quantity: i.Quantity - 1 } : i
      );
    } else {
      updatedItems = activeOrder.Order_Items.filter(i => i.Item_ID !== item_id);
    }

    const total = updatedItems.reduce((sum, current) => sum + (current.Price * current.Quantity), 0);

    // Update Order state
    setOrders(prev => prev.map(o => 
      o.Order_ID === activeOrder.Order_ID ? { ...o, Order_Items: updatedItems, Total_Amount: total } : o
    ));

    // Update KDS state
    setKds(prev => prev.map(k => 
      k.Order_ID === activeOrder.Order_ID ? { ...k, Items: updatedItems } : k
    ));

    // RESTORE INVENTORY
    processStockAdjustment(item_id, "add_back", 1);
  };

  const handleCallWaiterAction = () => {
    if (selectedTableNum === null) return;
    onUpdateTable(selectedTableNum, { Customer_Request: "Waiter" });
    alert(lang === "ur" ? "ویٹر الرٹ ارسال کر دیا گیا۔" : "Steward summon notification dispatched!");
  };

  const handleRequestBillAction = () => {
    if (selectedTableNum === null) return;
    onUpdateTable(selectedTableNum, { Status: "WaitingForBill", Customer_Request: "None" });
  };

  const handleTransferTableAction = () => {
    if (selectedTableNum === null || !activeOrder) return;
    if (transferTargetTable <= 0 || transferTargetTable === selectedTableNum) return;

    const targetTableObj = tables.find(t => t.Table_Number === transferTargetTable);
    if (!targetTableObj) {
      alert("Invalid target table. Doesn't exist!");
      return;
    }
    if (targetTableObj.Status !== "Empty") {
      alert("Selected target table is busy! Choose an Empty table.");
      return;
    }

    // 1. Move Order details to target table
    setOrders(prev => prev.map(o => 
      o.Order_ID === activeOrder.Order_ID ? { ...o, Table_Number: transferTargetTable } : o
    ));

    // 2. Move KDS items
    setKds(prev => prev.map(k => 
      k.Order_ID === activeOrder.Order_ID ? { ...k, Table_Number: transferTargetTable } : k
    ));

    // 3. Mark old table Empty
    onUpdateTable(selectedTableNum, { Status: "Empty", Current_Order_ID: null, Customer_Name: "", People_Count: 0 });

    // 4. Mark target Table Busy with this order ID
    onUpdateTable(transferTargetTable, {
      Status: "Occupied",
      Current_Order_ID: activeOrder.Order_ID,
      Customer_Name: tableObj?.Customer_Name || "Transferred Guest",
      People_Count: tableObj?.People_Count || 4,
      Assigned_Waiter_ID: tableObj?.Assigned_Waiter_ID || "ST04"
    });

    setSelectedTableNum(transferTargetTable);
    setShowTransferPopup(false);
    alert(`Successfully transferred Order to Table #${transferTargetTable}`);
  };

  const handleCloseTableSettle = () => {
    if (selectedTableNum === null || !activeOrder) return;

    // Settle Order payment status
    setOrders(prev => prev.map(o => 
      o.Order_ID === activeOrder.Order_ID 
        ? { ...o, Payment_Status: "Paid", Payment_Method: "Cash", Sync_Status: "Synced to Cloud" } 
        : o
    ));

    // Mark table Green / Empty
    onUpdateTable(selectedTableNum, {
      Status: "Empty",
      Current_Order_ID: null,
      Customer_Name: "",
      People_Count: 0,
      Customer_Request: "None"
    });

    // Mark KDS Ready & Delivered
    setKds(prev => prev.map(k => 
      k.Order_ID === activeOrder.Order_ID ? { ...k, Kitchen_Status: "Delivered" } : k
    ));

    setSelectedTableNum(null);
    alert(lang === "ur" ? "میز کامیابی سے بند ہو گئی اور ادائیگی درج ہو گئی۔" : "Receipt printed. Table cleaned & available.");
  };

  // Get active cook tickets for this specific active order
  const activeKDSTicket = activeOrder ? kds.find(k => k.Order_ID === activeOrder.Order_ID) : null;
  const kitchenPreparingStatus = activeKDSTicket ? activeKDSTicket.Kitchen_Status : "N/A";
  const filteredMenuItems = menu.filter(item => {
    const matchesCategory = activeItemCategory === "All" || item.Category === activeItemCategory;
    const matchesSearch = item.Item_Name.toLowerCase().includes(searchItemQuery.toLowerCase()) || 
                          item.Item_Name_Ur.includes(searchItemQuery);
    return matchesCategory && matchesSearch;
  });

  if (selectedTableNum !== null && tableObj) {
    return (
      <div className="w-full bg-slate-900 text-slate-100 min-h-screen rounded-3xl overflow-hidden shadow-2xl relative font-sans animate-fadeIn p-4 sm:p-6 space-y-6">
        
        {/* Back and Title Row */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedTableNum(null);
                setShowAddItemPopup(false);
              }}
              className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white transition active:scale-95 text-xs font-black flex items-center gap-1 cursor-pointer font-sans"
            >
              ◀ Tables
            </button>
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-sm font-black font-sans shadow-lg shadow-amber-500/10 shrink-0">
              T{tableObj.Table_Number}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 leading-none">
                <span>{lang === "ur" ? `میز کنٹرول سینٹر` : `Table Workspace`}</span>
                <span className={`w-2 h-2 rounded-full ${statusColors[tableObj.Status]?.bulb || "bg-emerald-400"}`} />
              </h3>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-1">
                Order Sheet: {activeOrder ? activeOrder.Order_ID : "No Active Sessions"}
              </p>
            </div>
          </div>

          {/* Quick Edit table properties directly in details */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm(lang === "ur" ? "کیا آپ واقعی حذف کرنا چاہتے ہیں؟" : "Confirm removing table?")) {
                  onDeleteTable(tableObj.Table_Number);
                  setSelectedTableNum(null);
                }
              }}
              className="p-2 bg-slate-950 border border-slate-850 hover:bg-rose-955 text-slate-500 hover:text-rose-500 rounded-xl transition cursor-pointer"
              title="Delete Table"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowQRModal(tableObj.Table_Number)}
              className="p-2 bg-slate-950 border border-slate-850 hover:border-amber-500 text-amber-500 rounded-xl transition flex items-center gap-1.5 text-[10px] font-bold cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR Menu</span>
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
          {/* Metadata Cards */}
          <div className="lg:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
            <div className="bg-slate-955 p-3.5 rounded-2xl border border-slate-850">
              <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">Waiter assigned</span>
              <span className="font-extrabold text-xs text-slate-200 block mt-1">
                {staff.find(u => u.User_ID === tableObj.Assigned_Waiter_ID)?.Name || "Unassigned"}
              </span>
            </div>
            <div className="bg-slate-955 p-3.5 rounded-2xl border border-slate-850">
              <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">Guest Headcount</span>
              <span className="font-extrabold text-xs text-slate-200 block mt-1">
                {tableObj.People_Count || 4} Guests
              </span>
            </div>
            <div className="bg-slate-955 p-3.5 rounded-2xl border border-slate-850">
              <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">Kitchen Queue</span>
              <span className="font-mono text-xs text-amber-400 font-extrabold block mt-1 uppercase leading-none mt-1.5">{kitchenPreparingStatus}</span>
            </div>
            <div className="bg-slate-955 p-3.5 rounded-2xl border border-slate-850">
              <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">Order Timestamp</span>
              <span className="font-mono text-xs text-slate-355 font-bold block mt-1">{orderTimeStr}</span>
            </div>
          </div>

          {/* Table Items receipt column (or empty) */}
          <div className="lg:col-span-7 bg-slate-950/40 border border-slate-850 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center justify-between">
              <span>🍽️ {lang === "ur" ? "آرڈر کیے گئے پکوان" : "Ordered Items List"}</span>
              {activeOrder && (
                <span className="text-[10px] font-mono text-slate-505 font-bold">{activeOrder.Order_Items.length} items logged</span>
              )}
            </h4>

            {!activeOrder ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[220px]">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                  <ShoppingBag className="w-5 h-5 text-slate-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400">This table has no active order session.</p>
                  <p className="text-[10px] text-slate-500">Initiate a new order session to register dining guests.</p>
                </div>
                <button
                  type="button"
                  onClick={handleInitiateSession}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95 duration-100"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Session / Order</span>
                </button>
              </div>
            ) : activeOrder.Order_Items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 min-h-[220px]">
                <p className="text-xs text-slate-450 font-bold">This receipt draft is currently empty.</p>
                <button
                  type="button"
                  onClick={() => setShowAddItemPopup(true)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer uppercase active:scale-95 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert First Item</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {activeOrder.Order_Items.map((item) => {
                  const totalItemVal = item.Price * item.Quantity;
                  return (
                    <div 
                      key={item.Item_ID}
                      className="bg-slate-955 border border-slate-850 p-3 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-900 transition"
                    >
                      <div className="space-y-0.5 max-w-[50%]">
                        <p className="font-extrabold text-slate-105 truncate">{item.Item_Name}</p>
                        <p className="text-[9px] text-slate-500 truncate font-semibold font-serif text-right">{item.Item_Name_Ur}</p>
                      </div>

                      {/* Micro inline increment decrement keys */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[9px] text-slate-500 font-bold">{item.Price} PKR</span>
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromActiveOrder(item.Item_ID)}
                            className="w-5 h-5 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-md active:scale-90"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-mono text-[10px] font-black text-slate-300">
                            {item.Quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const sourceDish = menu.find(d => d.Item_ID === item.Item_ID);
                              if (sourceDish) handleAddItemToActiveOrder(sourceDish);
                            }}
                            className="w-5 h-5 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-md active:scale-90"
                          >
                            +
                          </button>
                        </div>
                        <span className="w-16 text-right font-mono text-[11px] font-extrabold text-indigo-400">
                          {totalItemVal.toLocaleString()} PKR
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bill Settle column side panel with active action tools */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-955 p-5 rounded-3xl border border-slate-850 space-y-4">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                💰 {lang === "ur" ? "بل کا تخمینہ اور ادائیگی" : "Receipt Computation Summary"}
              </h4>

              <div className="space-y-2 text-xs font-sans text-slate-350">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium font-sans">Subtotal Order sum:</span>
                  <span className="font-mono text-slate-105 font-extrabold">{currentBillAmount.toLocaleString()} Rs</span>
                </div>
                <div className="flex justify-between text-emerald-450 font-sans">
                  <span className="text-emerald-500 font-bold">Complimentary Disc (10%):</span>
                  <span className="font-mono font-bold">- {discountAmount.toLocaleString()} Rs</span>
                </div>
                <div className="flex justify-between font-sans">
                  <span className="text-slate-500 font-medium">Sales Tax GST (16%):</span>
                  <span className="font-mono text-slate-350 font-bold">{gstTax.toLocaleString()} Rs</span>
                </div>
                <div className="border-t border-dashed border-slate-850 my-2 pt-2" />
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-900">
                  <span className="text-xs text-slate-400 uppercase font-black font-sans">Final Payable Total:</span>
                  <span className="font-mono font-black text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-950/30 px-2 py-1 rounded-lg">
                    {finalBillAmount.toLocaleString()} PKR
                  </span>
                </div>
              </div>

              {/* Action Buttons Column */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={!activeOrder}
                  onClick={() => setShowAddItemPopup(true)}
                  className="py-3 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-45 text-white text-xs font-black rounded-xl uppercase flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-600/5 cursor-pointer active:scale-95 duration-75 col-span-2 text-center font-sans"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add/Insert Dishes</span>
                </button>

                <button
                  type="button"
                  disabled={!activeOrder}
                  onClick={handleRequestBillAction}
                  className="py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-45 text-slate-950 text-xs font-black rounded-xl uppercase flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/5 cursor-pointer active:scale-95 duration-75 col-span-1 text-center font-sans"
                >
                  <span>💵</span>
                  <span>Request Bill</span>
                </button>

                <button
                  type="button"
                  disabled={!activeOrder}
                  onClick={() => setShowPrintBillPopup(true)}
                  className="py-3 bg-slate-950 hover:bg-slate-850 disabled:opacity-45 text-slate-300 text-xs font-semibold rounded-xl uppercase flex items-center justify-center gap-1.5 transition border border-slate-850 active:scale-95 duration-75 col-span-1 text-center font-sans"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print Bill</span>
                </button>

                <button
                  type="button"
                  disabled={!activeOrder}
                  onClick={() => {
                    setTransferTargetTable(tables.find(t => t.Status === "Empty" && t.Table_Number !== selectedTableNum)?.Table_Number || 0);
                    setShowTransferPopup(true);
                  }}
                  className="py-2.5 bg-slate-950 hover:bg-slate-850 disabled:opacity-45 text-slate-400 text-[10px] font-bold rounded-xl uppercase col-span-2 flex items-center justify-center gap-1.5 transition border border-slate-850 active:scale-95 text-center font-sans"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Transfer Table Order</span>
                </button>

                <button
                  type="button"
                  disabled={!activeOrder || activeOrder.Order_Items.length === 0}
                  onClick={handleCloseTableSettle}
                  className="py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-40 text-slate-950 text-xs font-black rounded-xl uppercase col-span-2 flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/5 cursor-pointer active:scale-95 duration-75 text-center font-sans"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settle & Close Table</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Render child popups if active so early return has them! */}
        {showAddItemPopup && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-scaleIn">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-2xl w-full space-y-4 text-slate-100 font-sans">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-black text-sm text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <span>➕ Add Items to Table #{selectedTableNum}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddItemPopup(false)}
                  className="bg-slate-950 p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  {categories.slice(0, 5).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveItemCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition ${
                        activeItemCategory === cat ? "bg-indigo-650 text-white" : "bg-slate-950 text-slate-400 hover:bg-slate-850"
                      }`}
                    >
                      {cat === "All" ? "ALL" : cat.split(" ")[0]}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Search item..."
                  value={searchItemQuery}
                  onChange={(e) => setSearchItemQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 w-44 placeholder-slate-650"
                />
              </div>

              {/* Fast-tap Menu Dishes List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto pr-1 font-sans">
                {filteredMenuItems.map(dish => {
                  const countPresent = activeOrder.Order_Items.find(i => i.Item_ID === dish.Item_ID)?.Quantity || 0;
                  return (
                    <button
                      key={dish.Item_ID}
                      type="button"
                      onClick={() => handleAddItemToActiveOrder(dish)}
                      className={`bg-slate-955 border hover:border-indigo-505 p-2 px-3 rounded-2xl text-left flex items-center justify-between transition group relative ${
                        countPresent > 0 ? "border-indigo-500 bg-indigo-950/20 text-indigo-100" : "border-slate-850 text-slate-450"
                      }`}
                    >
                      <div className="space-y-0.5 truncate pr-2 font-sans">
                        <p className="text-[11px] font-black truncate group-hover:text-indigo-400">{dish.Item_Name}</p>
                        <p className="text-[9px] text-slate-500 truncate font-mono">{dish.Sales_Price} Rs</p>
                      </div>

                      <div className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center font-mono text-[9px] text-indigo-400 font-extrabold font-mono shrink-0">
                        {countPresent > 0 ? `x${countPresent}` : "+"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-right pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddItemPopup(false)}
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition cursor-pointer active:scale-95 font-sans"
                >
                  Close & Return
                </button>
              </div>
            </div>
          </div>
        )}

        {showTransferPopup && (
          <div className="fixed inset-0 bg-slate-955/90 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans text-slate-100">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-tight flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-slate-400" />
                <span>Transfer Order Table</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Shift the active order from Table #{selectedTableNum} to:
              </p>

              <div className="space-y-1">
                <label className="block text-[8px] text-slate-500 uppercase font-black font-sans">Target Table Number</label>
                <select
                  value={transferTargetTable}
                  onChange={(e) => setTransferTargetTable(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white cursor-pointer font-sans"
                >
                  <option value={0}>Select a table...</option>
                  {tables.filter(t => t.Status === "Empty" && t.Table_Number !== selectedTableNum).map(t => (
                    <option key={t.Table_Number} value={t.Table_Number}>
                      Table #{t.Table_Number} (Available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={transferTargetTable <= 0}
                  onClick={handleTransferTableAction}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-black rounded-xl cursor-pointer uppercase active:scale-95 text-center font-sans"
                >
                  Confirm Move
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransferPopup(false)}
                  className="py-2 px-4 bg-slate-800 text-slate-450 text-xs font-bold rounded-xl active:scale-95 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Visual Header Block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5 text-slate-800">
        <div>
          <span className="text-[10px] bg-[#FF8C42]/10 border border-[#FF8C42]/20 text-[#FF8C42] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider block w-fit mb-2">
            Realtime Operational Hall
          </span>
          <h2 className="text-xl font-black text-[#0F4C81] uppercase tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF8C42]" />
            <span>{lang === "ur" ? "سیٹ اپ اور میزوں کا کنٹرول" : "Restaurant Floor & Table Console"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "ur"
              ? "برگِ گل ہال لے آؤٹ۔ براہِ راست میز پر ٹیپ کریں اور آرڈرز اپ ڈیٹ کریں۔"
              : "Live visual grid of dine-in tables. Click any table card to open the operational workspace."}
          </p>
        </div>

        {/* Quick Add Form Section */}
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-3.5 rounded-3xl flex flex-wrap items-center gap-3 shadow-sm">
          <div className="space-y-0.5">
            <label className="block text-[9px] text-slate-400 uppercase font-black tracking-wide">{lang === "ur" ? "میز نمبر" : "Table ID"}</label>
            <input
              type="number"
              value={newTableNum}
              onChange={(e) => setNewTableNum(parseInt(e.target.value) || 0)}
              className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-sm text-center font-bold text-slate-800 focus:outline-[#0F4C81] h-9"
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-[9px] text-slate-400 uppercase font-black tracking-wide">{lang === "ur" ? "منتخب ویٹر" : "Steward Assigned"}</label>
            <select
              value={selectedWaiter}
              onChange={(e) => setSelectedWaiter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-slate-700 focus:outline-[#0F4C81] h-9"
            >
              {waiters.map(w => (
                <option key={w.User_ID} value={w.User_ID}>
                  {lang === "ur" ? w.Name_Ur : w.Name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#FF8C42] hover:bg-[#e07b36] text-white text-xs font-black rounded-xl transition shadow-sm h-9 flex items-center gap-1.5 cursor-pointer uppercase"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === "ur" ? "میز بنائیں" : "Add Table"}</span>
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-150 text-rose-750 text-xs rounded-xl font-bold animate-pulse">
          {errorMsg}
        </div>
      )}

      {/* Colour indicators reference */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 p-4 rounded-3xl text-[11px] text-slate-500 shadow-sm">
        <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400 mr-2">Color Codes:</span>
        <div className="flex items-center gap-1.5 bg-[#10b981]/5 px-2 py-1 rounded-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span className="text-[#10b981] font-bold">Green = Empty</span>
        </div>
        <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-md">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-rose-750 font-bold">Red = Occupied</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-amber-800 font-bold">Yellow = Waiting For Bill</span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C81]" />
          <span className="text-[#0F4C81] font-bold">Blue = Reserved</span>
        </div>
      </div>

      {/* Visual Tables Layout in Compact Mobile Grid */}
      {(() => {
        const itemsPerPage = 12;
        const totalPages = Math.ceil(tables.length / itemsPerPage) || 1;
        const validPage = Math.min(tablePage, totalPages);
        const paginatedTables = tables.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 px-1">
              {paginatedTables.map((t) => {
                const statusConfig = statusColors[t.Status] || statusColors.Empty;
                
                // Look up active order if any
                const tableActiveBill = orders.find(o => o.Table_Number === t.Table_Number && o.Payment_Status === "Pending");
                const totalAccumulated = tableActiveBill ? tableActiveBill.Total_Amount : 0;

                // Calculate occupancy minutes and overdue status
                let minutesOccupied = 0;
                if (tableActiveBill && tableActiveBill.Created_At) {
                  const createdTime = new Date(tableActiveBill.Created_At).getTime();
                  const curTime = new Date().getTime();
                  minutesOccupied = Math.max(0, Math.floor((curTime - createdTime) / 60000));
                }
                const OVERDUE_LIMIT_MINS = 45;
                const isOverdue = tableActiveBill && minutesOccupied >= OVERDUE_LIMIT_MINS;

                return (
                  <button 
                    key={t.Table_Number}
                    type="button"
                    onClick={() => {
                      setSelectedTableNum(t.Table_Number);
                    }}
                    className={`h-20 rounded-2xl p-1.5 border flex flex-col justify-center items-center text-center transition-all duration-100 ease-out active:scale-95 cursor-pointer shadow-xs select-none relative group overflow-hidden ${statusConfig.bg}`}
                  >
                    
                    {/* Help Alarm Indicator Badge */}
                    {t.Customer_Request !== "None" && (
                      <div className="absolute top-1 right-1 bg-red-650 h-2 w-2 rounded-full animate-ping" />
                    )}

                    {/* Table ID Large display */}
                    <div className="font-sans text-xs font-black text-slate-800 leading-none">
                      T{t.Table_Number}
                    </div>

                    {/* Status and Active Bill info block */}
                    <div className="w-full flex flex-col items-center mt-1 text-slate-800 font-sans">
                      <span className="text-[8px] font-extrabold tracking-wide uppercase leading-none opacity-90 truncate max-w-full">
                        {lang === "ur" ? statusConfig.labelUr.split(" ")[0] : statusConfig.label.split(" ")[0]}
                      </span>
                      
                      {totalAccumulated > 0 ? (
                        <div className="flex flex-col items-center gap-0.5 mt-0.5">
                          <span className="text-[7.5px] font-mono font-bold leading-none text-indigo-650 bg-indigo-50 px-1 py-0.2 rounded">
                            {totalAccumulated} Rs
                          </span>
                          <span className={`text-[6.5px] font-mono font-black flex items-center gap-0.5 mt-0.5 ${isOverdue ? "text-rose-600 animate-pulse font-extrabold" : "text-slate-500"}`}>
                            ⏱️ {minutesOccupied}m {isOverdue ? (lang === "ur" ? "(لیٹ)" : "(LATE)") : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[7px] opacity-45 leading-none mt-1 uppercase tracking-wide">
                          Clean
                        </span>
                      )}
                    </div>

                    {/* Occupied / Overdue Progress Bar indicator */}
                    {tableActiveBill && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-200/50">
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

            <Pagination
              currentPage={validPage}
              totalPages={totalPages}
              onPageChange={setTablePage}
              lang={lang}
            />
          </div>
        );
      })()}

      {/* -------------------------------------------------------------
          TABLE DETAIL MODAL / WORKSPACE (THE REVOLUTIONARY OPERATIONS PANEL)
          ------------------------------------------------------------- */}
      {selectedTableNum !== null && tableObj && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-45 p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full my-8 overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="bg-slate-950/60 p-5 px-6 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg font-black font-sans shadow-lg shadow-amber-500/10">
                  T{tableObj.Table_Number}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-1.5">
                    <span>{lang === "ur" ? `میز کنٹرول سینٹر` : `Table Control Workspace`}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </h3>
                  <p className="text-[10px] text-slate-450 uppercase tracking-widest font-mono mt-0.5">
                    Order Sheet: {activeOrder ? activeOrder.Order_ID : "No Active Sessions"}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTableNum(null);
                  setShowAddItemPopup(false);
                }}
                className="bg-slate-950 border border-slate-850 p-2 rounded-full text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Operations Grid */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: ACTIVE DATA BLOCK */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Meta Metadata Pill-box */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-950/60 p-3 rounded-2xl text-center border border-slate-950">
                    <span className="block text-[8px] text-slate-500 uppercase tracking-wider">Waiter assigned</span>
                    <span className="font-extrabold text-xs text-slate-200 block mt-1">
                      {staff.find(u => u.User_ID === tableObj.Assigned_Waiter_ID)?.Name || "Unassigned"}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-2xl text-center border border-slate-950">
                    <span className="block text-[8px] text-slate-500 uppercase tracking-wider">Guest Headcount</span>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Users className="w-3 h-3 text-amber-500" />
                      <span className="font-extrabold text-xs text-slate-200">{tableObj.People_Count || 4} Guest(s)</span>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-2xl text-center border border-slate-950">
                    <span className="block text-[8px] text-slate-500 uppercase tracking-wider">Kitchen Queue</span>
                    <span className="font-mono text-xs text-amber-400 font-extrabold block mt-1">{kitchenPreparingStatus}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-2xl text-center border border-slate-950">
                    <span className="block text-[8px] text-slate-500 uppercase tracking-wider">Order Timestamp</span>
                    <span className="font-mono text-xs text-slate-400 font-bold block mt-1">{orderTimeStr}</span>
                  </div>
                </div>

                {/* Sub-item Grid list */}
                <div className="bg-slate-950/40 border border-slate-950 p-4 rounded-3xl space-y-3 min-h-[220px]">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider border-b border-slate-950 pb-2">
                    🍽️ {lang === "ur" ? "آرڈر کیے گئے پکوان" : "Ordered Items List"}
                  </h4>

                  {!activeOrder ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                        <ShoppingBag className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400">This table has no active order session.</p>
                        <p className="text-[10px] text-slate-500">Kick off a new guest bill or print QR menu.</p>
                      </div>
                      <button
                        onClick={handleInitiateSession}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Start Session / Order</span>
                      </button>
                    </div>
                  ) : activeOrder.Order_Items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-3">
                      <p className="text-xs text-slate-450 font-bold">This receipt draft is currently empty.</p>
                      <button
                        onClick={() => setShowAddItemPopup(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer uppercase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert First Item</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {activeOrder.Order_Items.map((item) => {
                        const totalItemVal = item.Price * item.Quantity;
                        return (
                          <div 
                            key={item.Item_ID}
                            className="bg-slate-950/70 border border-slate-950/50 p-2.5 px-3 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-950 transition"
                          >
                            <div className="space-y-0.5 max-w-[50%]">
                              <p className="font-extrabold text-slate-100 truncate">{item.Item_Name}</p>
                              <p className="text-[10px] text-slate-450 text-right truncate font-medium">{item.Item_Name_Ur}</p>
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Quantity adjustments */}
                              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                                <button
                                  onClick={() => handleRemoveItemFromActiveOrder(item.Item_ID)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white font-bold bg-slate-950 hover:bg-slate-850"
                                >
                                  -
                                </button>
                                <span className="px-2.5 font-mono font-black text-slate-200 text-center select-none w-8">
                                  {item.Quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    const metaMenu = menu.find(m => m.Item_ID === item.Item_ID);
                                    if (metaMenu) handleAddItemToActiveOrder(metaMenu);
                                  }}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white font-bold bg-slate-950 hover:bg-slate-850"
                                >
                                  +
                                </button>
                              </div>

                              {/* Price summary */}
                              <div className="text-right w-16">
                                <span className="font-mono text-[10px] text-slate-450 block">{item.Price} Rs</span>
                                <span className="font-mono font-black text-slate-100 block">{totalItemVal} Rs</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

              </div>

              {/* RIGHT COLUMN: CONSOLIDATED PRICING SLATE */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-5 bg-slate-950 p-5 rounded-3xl border border-slate-950">
                
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2">
                    🏦 Billing Consolidated Breakdown
                  </h4>

                  <div className="space-y-2.5 text-xs text-slate-350">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order Subtotal:</span>
                      <span className="font-mono text-slate-200 font-bold">{currentBillAmount.toLocaleString()} PKR</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">VIP Discount (10% Complimentary):</span>
                      <span className="font-mono text-emerald-450 font-semibold">- {discountAmount.toLocaleString()} PKR</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Sindh/Punjab GST Tax (16%):</span>
                      <span className="font-mono text-slate-400">{gstTax.toLocaleString()} PKR</span>
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex justify-between items-center">
                      <span className="font-black text-slate-100">Final Settled Amount:</span>
                      <span className="font-mono text-lg font-black text-amber-500">
                        {finalBillAmount.toLocaleString()} PKR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operations Actions Buttons Layout */}
                <div className="grid grid-cols-2 gap-2.5 pt-4">
                  
                  <button
                    disabled={!activeOrder}
                    onClick={() => setShowAddItemPopup(true)}
                    className="py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white text-xs font-black rounded-xl uppercase flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>

                  <button
                    onClick={handleCallWaiterAction}
                    className="py-3 bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-bold rounded-xl uppercase flex items-center justify-center gap-1.5 transition border border-slate-800"
                  >
                    <span>🔔</span>
                    <span>Call Waiter</span>
                  </button>

                  <button
                    disabled={!activeOrder}
                    onClick={handleRequestBillAction}
                    className="py-3 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-45 text-amber-500 text-xs font-bold rounded-xl uppercase flex items-center justify-center gap-1.5 transition border border-amber-500/20"
                  >
                    <span>💵</span>
                    <span>Request Bill</span>
                  </button>

                  <button
                    disabled={!activeOrder}
                    onClick={() => setShowPrintBillPopup(true)}
                    className="py-3 bg-slate-900 hover:bg-slate-850 disabled:opacity-45 text-slate-300 text-xs font-semibold rounded-xl uppercase flex items-center justify-center gap-1.5 transition border border-slate-800"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>Print Bill</span>
                  </button>

                  <button
                    disabled={!activeOrder}
                    onClick={() => {
                      setTransferTargetTable(tables.find(t => t.Status === "Empty" && t.Table_Number !== selectedTableNum)?.Table_Number || 0);
                      setShowTransferPopup(true);
                    }}
                    className="py-2.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-45 text-slate-350 text-[10px] font-medium rounded-xl uppercase col-span-2 flex items-center justify-center gap-1.5 transition border border-slate-800"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Transfer Table Order</span>
                  </button>

                  <button
                    disabled={!activeOrder || activeOrder.Order_Items.length === 0}
                    onClick={handleCloseTableSettle}
                    className="py-3.5 bg-gradient-to-r from-orange-550 to-amber-500 hover:from-orange-655 hover:to-amber-600 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-40 text-slate-950 text-xs font-black rounded-xl uppercase col-span-2 flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Settle & Close Table</span>
                  </button>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* NESTED MODAL: ITEM ADDER POPUP */}
      {showAddItemPopup && selectedTableNum !== null && activeOrder && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-scaleIn">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-2xl w-full space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>➕ Add Items to Table #{selectedTableNum}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddItemPopup(false)}
                className="bg-slate-950 p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1">
                {categories.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveItemCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition ${
                      activeItemCategory === cat ? "bg-indigo-650 text-white" : "bg-slate-950 text-slate-400 hover:bg-slate-850"
                    }`}
                  >
                    {cat === "All" ? "ALL" : cat.split(" ")[0]}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search food item..."
                value={searchItemQuery}
                onChange={(e) => setSearchItemQuery(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-200 w-44 placeholder-slate-650"
              />
            </div>

            {/* Fast-tap Menu Dishes List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto pr-1">
              {filteredMenuItems.map(dish => {
                const countPresent = activeOrder.Order_Items.find(i => i.Item_ID === dish.Item_ID)?.Quantity || 0;
                return (
                  <button
                    key={dish.Item_ID}
                    onClick={() => handleAddItemToActiveOrder(dish)}
                    className={`bg-slate-955 border hover:border-indigo-500/55 p-2 rounded-2xl text-left flex items-center justify-between transition-all group relative ${
                      countPresent > 0 ? "border-indigo-500/40 bg-indigo-950/10" : "border-slate-850"
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <p className="text-[11px] font-black text-slate-100 truncate group-hover:text-indigo-400">{dish.Item_Name}</p>
                      <p className="text-[9px] text-slate-500 truncate">{dish.Sales_Price} PKR</p>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center font-mono text-[10px] text-indigo-400 font-extrabold">
                      {countPresent > 0 ? `x${countPresent}` : "+"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setShowAddItemPopup(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition cursor-pointer"
              >
                Close & Return
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NESTED MODAL: TRANSFER TABLE POPUP */}
      {showTransferPopup && selectedTableNum !== null && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl max-w-sm w-full space-y-4">
            
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-tight flex items-center gap-1.5">
              <ArrowLeftRight className="w-4 h-4 text-slate-400" />
              <span>Transfer Order Table</span>
            </h3>
            <p className="text-xs text-slate-400">
              Shift the active session from Table #{selectedTableNum} to:
            </p>

            <div className="space-y-1">
              <label className="block text-[8px] text-slate-500 uppercase font-black">Target Table Number</label>
              <select
                value={transferTargetTable}
                onChange={(e) => setTransferTargetTable(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              >
                {tables.filter(t => t.Status === "Empty" && t.Table_Number !== selectedTableNum).map(t => (
                  <option key={t.Table_Number} value={t.Table_Number}>
                    Table #{t.Table_Number} (Available)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleTransferTableAction}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl cursor-pointer uppercase"
              >
                Confirm Move
              </button>
              <button
                type="button"
                onClick={() => setShowTransferPopup(false)}
                className="py-2 px-4 bg-slate-955 text-slate-400 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: PREMIUM THERMAL PRINTER RECEIPT MOCKUP */}
      {showPrintBillPopup && selectedTableNum !== null && activeOrder && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 font-mono p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-5 relative text-xs">
            
            <button
              onClick={() => setShowPrintBillPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 border border-slate-200 rounded-full w-7 h-7 flex items-center justify-center"
            >
              ✕
            </button>

            {/* Receipt Header */}
            <div className="text-center space-y-1.5">
              <div className="text-base font-black tracking-wide">*** DAY NIGHT RESTAURANT ***</div>
              <p className="text-[10px] text-slate-500 leading-tight">Landi Kotal Branch, Main Khyber Pass Highway</p>
              <p className="text-[10px] text-slate-500 leading-tight">Phone: 0313-9200334</p>
              <div className="border-b border-dashed border-slate-400 py-1" />
            </div>

            {/* Invoice Meta */}
            <div className="space-y-1 text-[10px] text-slate-600">
              <div className="flex justify-between">
                <span>INVOICE NO:</span>
                <span>{activeOrder.Order_ID}</span>
              </div>
              <div className="flex justify-between">
                <span>TABLE ID:</span>
                <span>TABLE {selectedTableNum}</span>
              </div>
              <div className="flex justify-between">
                <span>STEWARD ID:</span>
                <span>{tableObj?.Assigned_Waiter_ID}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE / TIME:</span>
                <span>{new Date().toLocaleDateString()} {orderTimeStr}</span>
              </div>
              <div className="border-b border-dashed border-slate-400 py-1" />
            </div>

            {/* Items grid */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-slate-705">
                <span>ITEM NAME</span>
                <span>QTY x PRICE = TOTAL</span>
              </div>
              <div className="border-b border-dashed border-slate-300" />
              
              {activeOrder.Order_Items.map(item => (
                <div key={item.Item_ID} className="flex justify-between text-[11px] leading-tight text-slate-800">
                  <div className="flex flex-col">
                    <span className="font-extrabold">{item.Item_Name}</span>
                    <span className="text-[9px] text-slate-500">{item.Item_Name_Ur}</span>
                  </div>
                  <span>{item.Quantity} x {item.Price} = {item.Quantity * item.Price} Rs</span>
                </div>
              ))}
              <div className="border-b border-dashed border-slate-400 py-1" />
            </div>

            {/* Settle breakdown */}
            <div className="space-y-1.5 text-right font-bold text-[11px] text-slate-800">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>{currentBillAmount.toLocaleString()} Rs</span>
              </div>
              <div className="flex justify-between text-emerald-650">
                <span>VIP DISCOUNT (10%):</span>
                <span>- {discountAmount.toLocaleString()} Rs</span>
              </div>
              <div className="flex justify-between">
                <span>SINDH SALES TAX (16%):</span>
                <span>{gstTax.toLocaleString()} Rs</span>
              </div>
              <div className="border-b border-dashed border-slate-400" />
              <div className="flex justify-between text-[13px] font-black text-slate-900 mt-1">
                <span>TOTAL SETTLED:</span>
                <span>{finalBillAmount.toLocaleString()} PKR</span>
              </div>
            </div>

            <div className="text-center pt-2 leading-tight text-[9px] text-slate-500 border-t border-dashed border-slate-300">
              <p className="font-bold">*** DAY NIGHT RESTAURANT ***</p>
              <p className="mt-1 font-semibold">Thank you for dining with us, for feedback call 0313-9200334</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  alert("Successfully printed invoice receipt to thermal network printer.");
                  setShowPrintBillPopup(false);
                }}
                className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold uppercase transition"
              >
                Send to Thermal Printer 🖨️
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QR Code Modal for customer menu access */}
      {showQRModal && (() => {
        const tableObjRepr = tables.find(t => t.Table_Number === showQRModal);
        if (!tableObjRepr) return null;
        
        return (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-sm w-full p-6 text-center space-y-6 relative shadow-2xl">
              
              <button
                type="button"
                onClick={() => setShowQRModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950 p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-amber-400 text-[10px] uppercase tracking-widest font-black block">Digital QR Certification</span>
                <h3 className="text-lg font-black text-white">Table #{tableObjRepr.Table_Number} Verified QR</h3>
                <p className="text-[10px] text-slate-450">Barg-e-Gul Premium Restaurant Edition</p>
              </div>

              {/* The "Printable" Frame */}
              <div className="bg-white p-5 rounded-2xl shadow-xl w-48 h-48 mx-auto flex flex-col justify-between items-center border-4 border-amber-500 relative">
                <div className="w-full flex-1 flex items-center justify-center relative">
                  <div className="grid grid-cols-5 gap-1.5 w-32 h-32 opacity-90 relative">
                    {Array.from({ length: 25 }).map((_, idx) => {
                      const isActive = (idx * tableObjRepr.Table_Number + 11) % 3 === 0 || (idx + 2) % 4 === 0 || idx < 5 || idx % 5 === 0;
                      return (
                        <div 
                          key={idx} 
                          className={`w-full h-full rounded-[2px] ${
                            isActive ? "bg-slate-950" : "bg-transparent"
                          }`}
                        />
                      );
                    })}
                    {/* QR Code corner anchors */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-4 border-slate-950 bg-white" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-4 border-slate-950 bg-white" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-4 border-slate-950 bg-white" />
                  </div>
                  <div className="absolute w-8 h-8 bg-amber-500 text-slate-950 rounded-lg flex items-center justify-center text-[8px] font-black tracking-tighter">
                    BEG
                  </div>
                </div>
                <div className="text-[9px] text-slate-950 font-black tracking-widest uppercase mt-2">
                  TABLE-№{tableObjRepr.Table_Number}
                </div>
              </div>

              {/* Self-Order Launch Trigger */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenCustomerMenu(tableObjRepr.Table_Number);
                    setShowQRModal(null);
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                >
                  <span>📷</span>
                  <span>Open Self-Order Portal (Customer view)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(lang === "ur" ? "تھرمل پرنٹر تیار ہے اور کیو پرنٹنگ کا انتظار کر رہا ہے۔" : "Thermal printer is online. Sticker printing job successfully dispatched to network queue.");
                  }}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-350 text-[10px] font-bold rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print Sticker Receipt</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
