import React, { useState } from "react";
import { UserRow, MenuItem, InventoryItem, TableStatus, OrderBill, KDSOrder, DailyExpense } from "../types";
import { Database, AlertCircle, Sparkles, RefreshCcw, Layers, Search, Check, CloudLightning } from "lucide-react";

interface LocalDBViewerProps {
  users: UserRow[];
  menu: MenuItem[];
  inventory: InventoryItem[];
  tables: TableStatus[];
  orders: OrderBill[];
  kds: KDSOrder[];
  expenses: DailyExpense[];
  syncQueueLength: number;
}

export default function LocalDBViewer({
  users,
  menu,
  inventory,
  tables,
  orders,
  kds,
  expenses,
  syncQueueLength,
}: LocalDBViewerProps) {
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [dbSearch, setDbSearch] = useState<string>("");

  const dbTabs = [
    { key: "users", label: "1. Users (اسٹاف)", count: users.length },
    { key: "menu", label: "2. Menu & Recipe (مینو)", count: menu.length },
    { key: "inventory", label: "3. Inventory (اسٹاک)", count: inventory.length },
    { key: "tables", label: "4. Tables Status (میز سٹیٹس)", count: tables.length },
    { key: "orders", label: "5. Orders & Bills (بلنگ)", count: orders.length },
    { key: "kds", label: "6. Kitchen KDS (باورچی خانہ)", count: kds.length },
    { key: "expenses", label: "7. Financial BI Ledger (روزنامچہ)", count: expenses.length },
  ];

  const filteredData = () => {
    const s = dbSearch.toLowerCase();
    switch (activeTab) {
      case "users":
        return users.filter(u => u.Name.toLowerCase().includes(s) || u.Role.toLowerCase().includes(s));
      case "menu":
        return menu.filter(m => m.Item_Name.toLowerCase().includes(s) || m.Category.toLowerCase().includes(s));
      case "inventory":
        return inventory.filter(i => i.Raw_Item_Name.toLowerCase().includes(s));
      case "tables":
        return tables.filter(t => t.Table_Number.toString().includes(s) || t.Status.toLowerCase().includes(s));
      case "orders":
        return orders.filter(o => o.Order_ID.toLowerCase().includes(s) || o.Payment_Status.toLowerCase().includes(s) || (o.Credit_Holder_Name && o.Credit_Holder_Name.toLowerCase().includes(s)));
      case "kds":
        return kds.filter(k => k.KDS_ID.toLowerCase().includes(s) || k.Kitchen_Status.toLowerCase().includes(s));
      case "expenses":
        return expenses.filter(e => e.Description.toLowerCase().includes(s) || e.Category.toLowerCase().includes(s));
      default:
        return [];
    }
  };

  return (
    <div className="bg-white border border-slate-205 rounded-xl p-5 shadow-sm text-slate-800 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600 animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              مقامی ڈیٹا بیس مانیٹر (Local SQLite Schema & Data Tables)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              ڈاؤن ٹائم کے دوران موبائل یا کمپیوٹر کے لوکل فولڈر میں محفوظ ہونے والے 7 بنیادی ڈیٹا بیس ٹیبلز کا براہِ راست نظارہ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 border border-slate-200">
            <span className="text-slate-500 font-semibold font-sans">Sync Status:</span>
            <span className={syncQueueLength > 0 ? "text-amber-600 font-bold" : "text-emerald-700 font-bold"}>
              {syncQueueLength > 0 ? `${syncQueueLength} Local Files Locked` : "All Synced to Cloud"}
            </span>
          </div>
        </div>
      </div>

      {/* Database Tabs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {dbTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setDbSearch(""); }}
            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
              activeTab === tab.key
                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-sm"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
            }`}
          >
            <span className="text-[10px] leading-tight line-clamp-1">{tab.label}</span>
            <span className={`text-sm font-mono mt-1 w-full text-right ${activeTab === tab.key ? "text-white" : "text-slate-505"}`}>{tab.count} Rows</span>
          </button>
        ))}
      </div>

      {/* Table search & row view */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={`${dbTabs.find(t=>t.key === activeTab)?.label} میں سرچ کریں...`}
              value={dbSearch}
              onChange={(e) => setDbSearch(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded-md pl-8 pr-3 py-1.5 w-full focus:outline-none focus:border-blue-500"
            />
          </div>
          <span className="text-[11px] text-slate-500 font-mono font-semibold">
            Showing {filteredData().length} of {dbTabs.find(t=>t.key === activeTab)?.count} rows
          </span>
        </div>

        {/* Dynamic JSON / Table schema view */}
        <div className="bg-slate-900 p-3.5 rounded font-mono text-xs text-sky-400 border border-slate-950 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-750">
          {filteredData().length === 0 ? (
            <div className="text-slate-600 text-center py-6 italic font-sans font-semibold">
              کوئی ریکارڈ نہیں ملا (Empty Table Row Query Response)
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData().map((row: any, idx: number) => (
                <div key={idx} className="border-b border-slate-850 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 font-bold font-sans">
                    <span>ROW #{idx + 1}</span>
                    {row.Sync_Status && (
                      <span className={`px-1.5 py-0.5 rounded font-bold border ${
                        row.Sync_Status === "Synced to Cloud" ? "bg-emerald-950/80 text-emerald-300 border-emerald-555/20" : "bg-amber-950/85 text-amber-300 border-amber-555/20 animate-pulse"
                      }`}>
                        {row.Sync_Status}
                      </span>
                    )}
                  </div>
                  <pre className="text-sky-300/90 whitespace-pre-wrap select-all font-mono leading-relaxed text-[11px]">
                    {JSON.stringify(row, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
