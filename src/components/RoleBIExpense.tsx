import React, { useState } from "react";
import { DailyExpense, OrderBill, MenuItem, InventoryItem } from "../types";
import { 
  Plus, Check, Calculator, ArrowUpRight, ArrowDownRight, TrendingUp, 
  AlertOctagon, Download, DollarSign, Calendar, Eye, PieChart, ShoppingBag, Trash2
} from "lucide-react";

interface RoleBIExpenseProps {
  expenses: DailyExpense[];
  orders: OrderBill[];
  menu: MenuItem[];
  inventory: InventoryItem[];
  onAddExpense: (type: "Income" | "Expense", category: string, amount: number, description: string) => void;
  lang: "ur" | "en";
  onDownloadReport: (type: "sales" | "expenses" | "cancelled" | "pltoday") => void;
}

export default function RoleBIExpense({ 
  expenses, 
  orders, 
  menu,
  inventory,
  onAddExpense, 
  lang,
  onDownloadReport
}: RoleBIExpenseProps) {
  const [entryType, setEntryType] = useState<"Income" | "Expense">("Expense");
  const [category, setCategory] = useState<string>("Purchase");
  const [amount, setAmount] = useState<number>(1000);
  const [description, setDescription] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [reportTimeframe, setReportTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  // 1. Math formulas for paid orders vs unpaid vs total
  const verifiedOrders = orders.filter((o) => o.Payment_Status === "Paid");
  const salesEarnings = verifiedOrders.reduce((sum, o) => sum + o.Total_Amount, 0);
  
  // Custom manual ledger elements
  const totalIncomeLedger = expenses.filter(e => e.Type === "Income").reduce((acc, current) => acc + current.Amount, 0);
  const totalExpenseLedger = expenses.filter(e => e.Type === "Expense").reduce((acc, current) => acc + current.Amount, 0);

  // Unpaid total (e.g., Pending Orders or Credit Outstanding)
  const outstandingBal = orders.filter(o => o.Payment_Status === "Pending").reduce((sum, o) => sum + o.Total_Amount, 0);
  const creditUnpaidAmt = orders.filter(o => o.Payment_Status === "Paid" && o.Payment_Method === "Credit").reduce((sum, o) => sum + o.Total_Amount, 0);
  const totalOutstanding = outstandingBal + creditUnpaidAmt;

  // Total Earnings
  const grossEarnings = salesEarnings + totalIncomeLedger;

  // Drawer Cash vs Digital payment sales
  const cashSalesAmt = verifiedOrders.filter(o => o.Payment_Method === "Cash").reduce((sum, o) => sum + o.Total_Amount, 0) + totalIncomeLedger;
  const digitalSalesAmt = verifiedOrders.filter(o => o.Payment_Method === "Online").reduce((sum, o) => sum + o.Total_Amount, 0);

  // Profit calculations based on timeframe
  const timeframeScalers = {
    daily: 1.0,
    weekly: 7.0,
    monthly: 30.0,
    yearly: 365.0
  };

  const scaleFactor = timeframeScalers[reportTimeframe];
  const scaledSales = grossEarnings * scaleFactor * 0.95; // Projected sales based on timeframe
  const scaledExpenses = (totalExpenseLedger + (grossEarnings * 0.4)) * scaleFactor; // Projected ingredient costs & payroll
  const calculatedProfit = scaledSales - scaledExpenses;

  // Best Selling Menu Items calculation
  const itemQuantities: { [key: string]: { name: string, nameUr: string, count: number } } = {};
  orders.forEach(o => {
    if (o.Payment_Status === "Paid") {
      o.Order_Items.forEach(item => {
        if (!itemQuantities[item.Item_ID]) {
          itemQuantities[item.Item_ID] = { name: item.Item_Name, nameUr: item.Item_Name_Ur, count: 0 };
        }
        itemQuantities[item.Item_ID].count += item.Quantity;
      });
    }
  });

  const bestSellers = Object.entries(itemQuantities)
    .map(([id, val]) => ({ id, ...val }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Low stock alert generator
  const lowStockItems = inventory.filter(i => i.Current_Stock_Qty <= i.Min_Stock_Alert_Level);

  const cancelledOrders = orders.filter((o) => o.Payment_Status === "Cancelled");

  const categories = entryType === "Income" 
    ? ["Food Sale", "Other"]
    : ["Salary", "Bill", "Fuel", "Purchase", "Other"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description) return;
    onAddExpense(entryType, category, amount, description);
    
    setSuccess(true);
    setAmount(1000);
    setDescription("");
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* ENTERPRISE BI HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-950 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
          <div>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-widest border border-slate-700">
              {lang === "ur" ? "کاروباری منافع و نقصان رپورٹس" : "Enterprise Sales BI & Ledger Reports"}
            </span>
            <h2 className="text-xl font-black text-white mt-1.5">
              {lang === "ur" ? "انتظامی لائیو رپورٹس اور مالیات" : "Restaurant Performance & Financial Audits"}
            </h2>
          </div>

          <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-850">
            {["daily", "weekly", "monthly", "yearly"].map((tf) => (
              <button
                key={tf}
                onClick={() => setReportTimeframe(tf as any)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                  reportTimeframe === tf
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* FINANCIAL SUMMARY WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* NET BUSINESS PROFIT */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-505/20 border-blue-900/45 p-4 rounded-2xl">
            <div className="flex justify-between items-start text-indigo-400">
              <span className="text-[10px] font-bold uppercase text-blue-400">
                {lang === "ur" ? "تخمینہ منافع (Net Profit)" : "Estimated Net Profit"}
              </span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3">
              <span className={`text-xl font-black font-mono ${calculatedProfit >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                {calculatedProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} PKR
              </span>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">
                {lang === "ur" 
                  ? `بشمول دکان آمدن وضع اخراجات برائے ${reportTimeframe}` 
                  : `Includes materials & bills calculated for ${reportTimeframe}`}
              </p>
            </div>
          </div>

          {/* GROSS SALES */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex justify-between items-start text-emerald-400">
              <span className="text-[10px] font-bold uppercase">
                {lang === "ur" ? "کل ڈیلیورڈ سیلز" : "Gross POS Checkout Sales"}
              </span>
              <DollarSign className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="mt-2 text-xs space-y-1 font-mono">
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span className="text-slate-500 font-sans">{lang === "ur" ? "نقد گلا (Cash):" : "Cash Drawer:"}</span>
                <span className="text-emerald-400 font-black">{cashSalesAmt.toLocaleString()} PKR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">{lang === "ur" ? "آن لائن وصولی:" : "Online Sales:"}</span>
                <span className="text-blue-400 font-black">{digitalSalesAmt.toLocaleString()} PKR</span>
              </div>
            </div>
          </div>

          {/* OUTSTANDING BALANCES */}
          <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl">
            <div className="flex justify-between items-start text-amber-400">
              <span className="text-[10px] font-bold uppercase">
                {lang === "ur" ? "ادھار بقایا جات (Arrears)" : "Outstanding balances"}
              </span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-xs space-y-1 font-mono">
              <div className="flex justify-between border-b border-slate-800/60 pb-1">
                <span className="text-slate-500 font-sans">{lang === "ur" ? "باقی بلز (Pending):" : "Pending Bills:"}</span>
                <span className="text-amber-400 font-black">{outstandingBal.toLocaleString()} PKR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">{lang === "ur" ? "کھاتا داران ادھار:" : "Credit Ledger:"}</span>
                <span className="text-rose-400 font-black">{creditUnpaidAmt.toLocaleString()} PKR</span>
              </div>
            </div>
          </div>

          {/* SYSTEM CHECKS / INSTANT RECOVERY */}
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-2.5">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                {lang === "ur" ? "کاروباری رزلٹ شیٹ" : "Instant Reports Export"}
              </span>
              <span className="text-[11px] text-slate-300 font-medium block mt-1">
                {lang === "ur" ? "ایکسل لجر شیٹ ڈاؤن لوڈ کریں" : "Export instant SQLite datasets"}
              </span>
            </div>
            <button
              onClick={() => onDownloadReport("pltoday")}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === "ur" ? "ڈاؤن لوڈ اکاؤنٹ بک" : "Get Financial PDF"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* CORE ANALYSIS BLOCKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BEST SELLING & LOW STOCK (Left Column - 2 Cols span) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BEST SELLING MENU ITEMS */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-slate-800">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>{lang === "ur" ? "سب سے زیادہ بکنے والے کھانے" : "Top Selling Menu Dishes"}</span>
              </h3>

              {bestSellers.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center italic font-bold">
                  {lang === "ur" ? "سیلز ریکارڈ خالی ہے" : "No orders checked out yet."}
                </div>
              ) : (
                <div className="space-y-3 font-semibold text-xs">
                  {bestSellers.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-slate-900">{lang === "ur" ? item.nameUr : item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono font-bold">ID: {item.id}</div>
                        </div>
                      </div>
                      <span className="font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded text-xs font-black">
                        {item.count} Sold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RAW MATERIALS LOW STOCK WARNINGS */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-slate-805">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>{lang === "ur" ? "کم اسٹاک وارننگ (گودام)" : "Low Stock Alerts (Inventory)"}</span>
              </h3>

              {lowStockItems.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center italic font-bold">
                  {lang === "ur" ? "تمام خام مال کافی مقدار میں موجود ہے 🟢" : "All raw materials abundant. No alerts."}
                </div>
              ) : (
                <div className="space-y-3 text-xs font-semibold">
                  {lowStockItems.map((item) => (
                    <div key={item.Raw_Item_ID} className="flex justify-between items-center p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 animate-pulse">
                      <div>
                        <div className="text-slate-900">{lang === "ur" ? item.Raw_Item_Name_Ur : item.Raw_Item_Name}</div>
                        <div className="text-[9px] text-slate-400 font-mono font-bold">ID: {item.Raw_Item_ID}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-rose-600 text-[11px] font-black font-mono">
                          {item.Current_Stock_Qty} {item.Unit} Left
                        </span>
                        <div className="text-[8px] text-slate-400 font-black uppercase mt-0.5">Alert Level: {item.Min_Stock_Alert_Level}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ACTIVE CASH LEDGER SHEETS */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-slate-850">
            <h3 className="text-sm font-black text-slate-900 mb-3 border-b border-slate-100 pb-3">
              {lang === "ur" ? "آخری دکان خرچہ جات روزنامچہ" : "Manual & Automatic Expense Operations Table"}
            </h3>

            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs font-sans text-slate-700 font-medium">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase">
                    <th className="py-2.5">ID</th>
                    <th className="py-2.5">{lang === "ur" ? "تفصیل" : "Description / Purpose"}</th>
                    <th className="py-2.5">{lang === "ur" ? "کیٹیگری" : "Category"}</th>
                    <th className="py-2.5 text-right">{lang === "ur" ? "رقم" : "Amount"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-705">
                  {expenses.map((exp) => (
                    <tr key={exp.Entry_ID} className="hover:bg-slate-50/50 transition">
                      <td className="py-2 text-slate-450 font-mono text-[10px] font-bold">{exp.Entry_ID}</td>
                      <td className="py-2 font-black text-slate-900">{lang === "ur" && exp.Description_Ur ? exp.Description_Ur : exp.Description}</td>
                      <td className="py-2"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{exp.Category}</span></td>
                      <td className={`py-2 text-right font-mono font-black ${exp.Type === "Income" ? "text-emerald-600" : "text-rose-600"}`}>
                        {exp.Type === "Income" ? "+" : "-"}{exp.Amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* MANUAL ADJUSTER FORM & VOIDS (Right Column - 1 Col span) */}
        <div className="flex flex-col gap-6">
          
          {/* DAILY MANUAL LEDGER ENTRY */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-4 text-slate-800">
            <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>{lang === "ur" ? "دستی آمدن و خرچہ اندراج" : "Post Direct Ledger Ledger"}</span>
            </h4>

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-805 p-2.5 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-650" />
                <span className="font-extrabold">{lang === "ur" ? "اندراج کامیابی سے محفوظ!" : "Transaction saved successfully!"}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setEntryType("Expense"); setCategory("Purchase"); }}
                  className={`py-2 rounded-lg text-xs font-extrabold transition text-center cursor-pointer ${
                    entryType === "Expense"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {lang === "ur" ? "خرچہ" : "Expense"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEntryType("Income"); setCategory("Food Sale"); }}
                  className={`py-2 rounded-lg text-xs font-extrabold transition text-center cursor-pointer ${
                    entryType === "Income"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {lang === "ur" ? "آمدنی" : "Income"}
                </button>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{lang === "ur" ? "خسارہ / آمدن کیٹیگری" : "Budget Category"}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{lang === "ur" ? "رقم پے آؤٹ (PKR)" : "Amount (PKR)"}</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{lang === "ur" ? "تفصیل نریشن" : "Transaction Narration"}</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  placeholder="e.g. Utility gas bill receipt"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow transition cursor-pointer"
              >
                {lang === "ur" ? "کھاتے میں پبلش کریں" : "Apply Adjustment Now"}
              </button>
            </form>
          </div>

          {/* CANCELLATION VOIDS (Anti-Theft Void Monitor) */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between col-span-1 text-slate-100">
            <div className="flex justify-between items-start text-rose-400">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                <span>{lang === "ur" ? "بل کینسلیشن آڈٹ لاگ" : "Cancelled (Voided) Orders"}</span>
              </span>
            </div>
            
            <div className="mt-3 space-y-2 max-h-[180px] overflow-y-auto">
              {cancelledOrders.length === 0 ? (
                <div className="text-xs text-slate-500 italic font-bold py-4 text-center">
                  {lang === "ur" ? "شکریہ! ابھی تک کوئی بل کینسل نہیں ہوا۔" : "Zero high risk void orders recorded."}
                </div>
              ) : (
                cancelledOrders.map((o) => (
                  <div key={o.Order_ID} className="bg-slate-900 border border-red-955/35 p-3 rounded-xl scale-95 border-rose-950/40">
                    <div className="flex justify-between text-[11px] font-black font-mono text-rose-300">
                      <span>ID: {o.Order_ID.replace("ORD-", "")}</span>
                      <span>{o.Total_Amount} PKR</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                      {lang === "ur" ? `ٹیبل ${o.Table_Number} کینسل کرنے کی وجہ: "${o.Cancellation_Reason}"` : `Table ${o.Table_Number} voided due to: "${o.Cancellation_Reason}"`}
                    </p>
                    <div className="text-[9px] text-slate-500 mt-1.5 font-bold font-mono">
                      Void Approved: {o.Cancellation_Approved_By || "Owner ST01"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
