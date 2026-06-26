import React, { useState } from "react";
import { MenuItem, InventoryItem, RecipeIngredient } from "../types";
import { 
  Plus, Trash2, Edit2, Save, X, ArrowLeft, Clock, Coins, 
  TrendingUp, ChefHat, Check, Upload, AlertCircle, Sparkles, AlertTriangle
} from "lucide-react";
import Pagination from "./Pagination";

interface RoleMenuManagementProps {
  menu: MenuItem[];
  onAddMenuItem: (item: MenuItem) => void;
  onUpdateMenuItem: (itemId: string, updates: Partial<MenuItem>) => void;
  onDeleteMenuItem: (itemId: string) => void;
  lang: "ur" | "en";
  inventory: InventoryItem[];
}

export default function RoleMenuManagement({
  menu,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  lang,
  inventory
}: RoleMenuManagementProps) {
  // Navigation & Page State
  const [selectedDetailItemId, setSelectedDetailItemId] = useState<string | null>(null);
  const [menuPage, setMenuPage] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Edit fields (used in Detail page)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editName, setEditName] = useState<string>("");
  const [editNameUr, setEditNameUr] = useState<string>("");
  const [editPrepTime, setEditPrepTime] = useState<number>(15);
  const [editImageUrl, setEditImageUrl] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("Pizzas");

  // Create New Form fields
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemNameUr, setNewItemNameUr] = useState<string>("");
  const [newItemPrice, setNewItemPrice] = useState<number>(350);
  const [newItemCategory, setNewItemCategory] = useState<string>("Pizzas");
  const [newItemPrep, setNewItemPrep] = useState<number>(15);
  const [newItemImage, setNewItemImage] = useState<string>("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400");

  // Recipe Builder inside detail view
  const [newRecipeRawId, setNewRecipeRawId] = useState<string>(inventory[0]?.Raw_Item_ID || "");
  const [newRecipeQty, setNewRecipeQty] = useState<number>(100);

  // Availability algorithm helper
  const checkAvailability = (item: MenuItem): { status: "Available" | "Out of Stock" | "Low Ingredient", color: string, urStatus: string } => {
    if (item.Inventory_Method === "Batch") {
      const portions = item.Available_Portions ?? 0;
      if (portions > 10) return { status: "Available", color: "bg-emerald-50 text-emerald-700 border-emerald-150", urStatus: "دستیاب" };
      if (portions > 0) return { status: "Low Ingredient", color: "bg-amber-50 text-amber-700 border-amber-150", urStatus: "کم مقدار" };
      return { status: "Out of Stock", color: "bg-rose-50 text-rose-700 border-rose-150", urStatus: "ختم ہے" };
    }

    if (!item.Recipe_Ingredients || item.Recipe_Ingredients.length === 0) {
      return { status: "Available", color: "bg-emerald-50 text-emerald-700 border-emerald-150", urStatus: "دستیاب" };
    }

    // Check if any ingredient is completely out
    let hasOut = false;
    let hasLow = false;

    for (const ing of item.Recipe_Ingredients) {
      const raw = inventory.find(r => r.Raw_Item_ID === ing.Raw_Item_ID);
      if (!raw) {
        hasOut = true;
        break;
      }
      if (raw.Current_Stock_Qty <= 0) {
        hasOut = true;
      } else if (raw.Current_Stock_Qty < raw.Min_Stock_Alert_Level) {
        hasLow = true;
      }
    }

    if (hasOut) {
      return { status: "Out of Stock", color: "bg-rose-50 text-rose-700 border-rose-150", urStatus: "ختم ہے" };
    }
    if (hasLow) {
      return { status: "Low Ingredient", color: "bg-amber-50 text-amber-700 border-amber-150", urStatus: "سٹاک کم" };
    }
    return { status: "Available", color: "bg-emerald-50 text-emerald-700 border-emerald-150", urStatus: "دستیاب" };
  };

  // Recipe cost calculation
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

  const handleOpenDetail = (item: MenuItem) => {
    setSelectedDetailItemId(item.Item_ID);
    setIsEditing(false);
    setEditPrice(item.Sales_Price);
    setEditName(item.Item_Name);
    setEditNameUr(item.Item_Name_Ur);
    setEditPrepTime(item.Preparation_Time_Mins);
    setEditImageUrl(item.Image_Url || "");
    setEditCategory(item.Category);
  };

  const handleSaveEdit = (itemId: string) => {
    onUpdateMenuItem(itemId, {
      Sales_Price: editPrice,
      Item_Name: editName,
      Item_Name_Ur: editNameUr,
      Preparation_Time_Mins: editPrepTime,
      Image_Url: editImageUrl,
      Category: editCategory as any
    });
    setIsEditing(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemNameUr) return;

    const randomId = `M-${Math.floor(100 + Math.random() * 900)}`;
    const added: MenuItem = {
      Item_ID: randomId,
      Item_Name: newItemName,
      Item_Name_Ur: newItemNameUr,
      Category: newItemCategory as any,
      Sales_Price: newItemPrice,
      Preparation_Time_Mins: newItemPrep,
      Recipe_Ingredients: [],
      Image_Url: newItemImage
    };

    onAddMenuItem(added);
    setShowAddForm(false);
    setNewItemName("");
    setNewItemNameUr("");
  };

  // Recipe Builders within Detail panel
  const handleAddRecipeIngredient = (item: MenuItem) => {
    if (!newRecipeRawId || newRecipeQty <= 0) return;
    const currentList = item.Recipe_Ingredients || [];
    const exists = currentList.some(r => r.Raw_Item_ID === newRecipeRawId);
    
    let updatedList: RecipeIngredient[];
    if (exists) {
      updatedList = currentList.map(r => 
        r.Raw_Item_ID === newRecipeRawId ? { ...r, Qty: r.Qty + newRecipeQty } : r
      );
    } else {
      updatedList = [...currentList, { Raw_Item_ID: newRecipeRawId, Qty: newRecipeQty }];
    }

    onUpdateMenuItem(item.Item_ID, { Recipe_Ingredients: updatedList });
  };

  const handleRemoveRecipeIngredient = (item: MenuItem, rawId: string) => {
    const updatedList = (item.Recipe_Ingredients || []).filter(r => r.Raw_Item_ID !== rawId);
    onUpdateMenuItem(item.Item_ID, { Recipe_Ingredients: updatedList });
  };

  // Main UI routing
  if (selectedDetailItemId) {
    const item = menu.find(m => m.Item_ID === selectedDetailItemId);
    if (!item) {
      setSelectedDetailItemId(null);
      return null;
    }

    const avail = checkAvailability(item);
    const recipeCost = getRecipeCost(item);
    const netProfit = item.Sales_Price - recipeCost;
    const profitPercentage = item.Sales_Price > 0 ? (netProfit / item.Sales_Price) * 100 : 0;

    return (
      <div className="bg-slate-50 min-h-[500px] rounded-3xl border border-slate-200 shadow-sm p-4 md:p-6 animate-fadeIn text-slate-800">
        
        {/* Full Screen Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <button
            onClick={() => setSelectedDetailItemId(null)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center gap-2 text-xs font-black uppercase text-[#0F4C81]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === "ur" ? "پیچھے جائیں" : "Back to Menu"}</span>
          </button>

          <div className="text-right">
            <span className="text-[9px] font-mono font-bold uppercase text-slate-400">DISH METRIC PORTAL</span>
            <h3 className="text-lg font-black text-slate-850 leading-none">ID: {item.Item_ID}</h3>
          </div>
        </div>

        {/* 2-Column Professional Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Image & Basic Info / Edit Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 relative border border-slate-100">
                <img 
                  src={isEditing ? editImageUrl : item.Image_Url} 
                  alt={item.Item_Name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-[9px] font-mono font-black text-white">
                  {isEditing ? editCategory : item.Category}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-3.5 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 font-bold uppercase">English Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 font-bold uppercase text-right">اردو نام</label>
                      <input
                        type="text"
                        value={editNameUr}
                        onChange={(e) => setEditNameUr(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-right text-slate-800 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 col-span-2">
                      <label className="block text-[8px] text-slate-400 font-bold uppercase">Sales Price (PKR)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-black text-[#0F4C81]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 font-bold uppercase">Prep Time (m)</label>
                      <input
                        type="number"
                        value={editPrepTime}
                        onChange={(e) => setEditPrepTime(parseInt(e.target.value) || 10)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-400 font-bold uppercase">Dish Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700"
                    >
                      <option value="Pizzas">Pizzas</option>
                      <option value="Burgers">Burgers</option>
                      <option value="Shorma & Rolls">Shorma & Rolls</option>
                      <option value="Wings & Sides">Wings & Sides</option>
                      <option value="Quetta Chai & Paratha">Tea & Paratha</option>
                      <option value="Lunch & BBQ">Lunch & BBQ</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-400 font-bold uppercase">Image URL Link</label>
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] font-mono text-slate-650"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSaveEdit(item.Item_ID)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 uppercase transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{lang === "ur" ? "محفوظ کریں" : "Save Changes"}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">{item.Item_Name}</h2>
                    <h4 className="text-sm font-bold text-slate-500 text-right font-serif mt-0.5">{item.Item_Name_Ur}</h4>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 py-2.5 bg-[#0F4C81] hover:bg-[#0c3c66] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 uppercase transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{lang === "ur" ? "تبدیل کریں" : "Edit Basic Details"}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(lang === "ur" ? "کیا آپ واقعی یہ ڈش مینو سے ہمیشہ کے لیے ختم کرنا چاہتے ہیں؟" : `Are you sure you want to delete "${item.Item_Name}" completely?`)) {
                          onDeleteMenuItem(item.Item_ID);
                          setSelectedDetailItemId(null);
                        }
                      }}
                      className="px-4.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer border border-rose-100 flex items-center justify-center"
                      title="Delete entire item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recipe Costing, Margins & Recipe Matrix */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Specs & Analytical Margins Summary */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="block text-[8px] text-slate-400 font-black uppercase tracking-wider leading-none mb-1">Sales Rate</span>
                  <span className="text-lg font-mono font-black text-[#0F4C81]">
                    {item.Sales_Price} <span className="text-[10px] font-sans font-bold text-slate-500">PKR</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-2 font-bold">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Prep: {item.Preparation_Time_Mins}m</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex flex-col justify-between">
                <div>
                  <span className="block text-[8px] text-emerald-600 font-black uppercase tracking-wider leading-none mb-1">Recipe Cost</span>
                  <span className="text-lg font-mono font-black text-emerald-700">
                    {recipeCost.toFixed(1)} <span className="text-[10px] font-sans font-bold">PKR</span>
                  </span>
                </div>
                <div className="text-[9.5px] font-bold text-emerald-800 mt-2">
                  Ingredients: {item.Recipe_Ingredients?.length || 0}
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex flex-col justify-between ${netProfit >= 0 ? "bg-orange-50/40 border-orange-100" : "bg-rose-50 border-rose-150"}`}>
                <div>
                  <span className="block text-[8px] text-slate-400 font-black uppercase tracking-wider leading-none mb-1">Profit & Margin</span>
                  <span className={`text-lg font-mono font-black ${netProfit >= 0 ? "text-[#FF8C42]" : "text-rose-600"}`}>
                    {netProfit.toFixed(0)} <span className="text-[10px] font-sans font-bold">PKR</span>
                  </span>
                </div>
                <div className="text-[10px] font-black uppercase mt-2 flex items-center gap-1 text-slate-700">
                  <TrendingUp className="w-3 h-3 text-[#FF8C42]" />
                  <span>Margin: {profitPercentage.toFixed(0)}%</span>
                </div>
              </div>

            </div>

            {/* Availability Status explanation card */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${avail.color}`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <div className="text-xs">
                  <span className="font-black uppercase tracking-wider block text-[9px] leading-none mb-0.5">Current POS Status</span>
                  <span className="font-bold">{lang === "ur" ? avail.urStatus : avail.status}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest opacity-60">
                {item.Inventory_Method === "Batch" ? `BATCH METHOD [Yield: ${item.Batch_Yield}]` : "DIRECT DEDUCTION"}
              </span>
            </div>

            {/* Recipe Builder / Ingredients Matrix */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <ChefHat className="w-4.5 h-4.5 text-[#FF8C42]" />
                  <span className="font-extrabold text-xs uppercase tracking-tight">Recipe Ingredients Mapping</span>
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Dynamic Deduction Engine</span>
              </div>

              {/* Recipe Items list */}
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {!item.Recipe_Ingredients || item.Recipe_Ingredients.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No raw materials mapped to this dish recipe yet! Mapped ingredients will dynamically deduct from stock on orders.
                  </div>
                ) : (
                  item.Recipe_Ingredients.map((r, idx) => {
                    const rawItem = inventory.find(i => i.Raw_Item_ID === r.Raw_Item_ID);
                    const ingredientCost = rawItem ? ((r.Qty / (rawItem.Unit === "KG" || rawItem.Unit === "Litre" ? 1000 : 1)) * rawItem.Cost_Price) : 0;

                    return (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100/60 p-2.5 rounded-xl text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C42]" />
                          <span className="font-bold">{rawItem ? rawItem.Raw_Item_Name : r.Raw_Item_ID}</span>
                          <span className="text-[9px] text-slate-400 font-bold">({rawItem ? (lang === "ur" ? rawItem.Raw_Item_Name_Ur : rawItem.Unit) : "Units"})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-500 text-[11px]">Cost: {ingredientCost.toFixed(1)} Rs</span>
                          <span className="font-mono font-extrabold text-[#0F4C81]">
                            {r.Qty} {rawItem ? (rawItem.Unit === "KG" ? "G" : rawItem.Unit === "Litre" ? "ML" : rawItem.Unit) : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipeIngredient(item, r.Raw_Item_ID)}
                            className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Recipe item inline row */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                <div className="space-y-1">
                  <label className="block text-[8px] text-slate-400 font-black uppercase tracking-wider">Raw Material</label>
                  <select
                    value={newRecipeRawId}
                    onChange={(e) => setNewRecipeRawId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-[#0F4C81]"
                  >
                    {inventory.map(r => (
                      <option key={r.Raw_Item_ID} value={r.Raw_Item_ID}>
                        {r.Raw_Item_Name} ({r.Unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[8px] text-slate-400 font-black uppercase tracking-wider">Qty (Grams/Units)</label>
                  <input
                    type="number"
                    value={newRecipeQty}
                    onChange={(e) => setNewRecipeQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs text-slate-800 text-center font-bold font-mono focus:outline-[#0F4C81]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddRecipeIngredient(item)}
                  className="py-1.5 bg-[#0F4C81] hover:bg-[#0c3c66] text-white text-xs font-black rounded-lg uppercase transition cursor-pointer text-center"
                >
                  Add Ingredient
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-[#0F4C81] uppercase tracking-tight flex items-center gap-2.5">
            <ChefHat className="w-5 h-5 text-[#FF8C42]" />
            <span>{lang === "ur" ? "وزٹ مینو منیجر" : "Dishes & Menu Management"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "ur"
              ? "مینو میں نے کھانے شامل کریں، چارج ریٹ تبدیل کریں اور متبادلات درست کریں۔"
              : "Adjust sales rates, configure dynamic recipe deductions, and check availability status."}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-[#FF8C42] hover:bg-[#e07b36] text-white text-xs font-black rounded-xl uppercase flex items-center gap-2 transition duration-200 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? (lang === "ur" ? "پینل چھپائیں" : "Hide Form") : (lang === "ur" ? "نیا کھانا بنائیں" : "Create New Dish")}</span>
        </button>
      </div>

      {/* CREATE NEW DISH MODAL FORM */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-5 shadow-sm animate-scaleIn">
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">English Label Name</label>
            <input
              type="text"
              placeholder="e.g. Arabic Special Rice bowl"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs text-slate-800 focus:outline-[#0F4C81]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">اردو نام لکھیں</label>
            <input
              type="text"
              placeholder="مثال: عربی اسپیشل چاول"
              value={newItemNameUr}
              onChange={(e) => setNewItemNameUr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs text-slate-800 text-right focus:outline-[#0F4C81]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dish Category group</label>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs text-slate-700 focus:outline-[#0F4C81]"
            >
              <option value="Pizzas">Pizzas</option>
              <option value="Burgers">Burgers</option>
              <option value="Shorma & Rolls">Shorma & Rolls</option>
              <option value="Wings & Sides">Wings & Sides</option>
              <option value="Quetta Chai & Paratha">Tea & Paratha</option>
              <option value="Lunch & BBQ">Lunch & BBQ</option>
              <option value="Desserts">Desserts</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sales Price (PKR)</label>
            <input
              type="number"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs text-slate-800 focus:outline-[#0F4C81]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prep Time (mins)</label>
            <input
              type="number"
              value={newItemPrep}
              onChange={(e) => setNewItemPrep(parseInt(e.target.value) || 15)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs text-slate-800 focus:outline-[#0F4C81]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dish Image Picker / Uploader</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Image URL"
                value={newItemImage}
                onChange={(e) => setNewItemImage(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs text-slate-800 font-mono focus:outline-[#0F4C81]"
              />
              <label className="px-4 py-3 bg-[#0F4C81] hover:bg-[#0c3c66] text-white font-black text-[10px] uppercase rounded-xl cursor-pointer transition flex items-center justify-center select-none shrink-0">
                <Upload className="w-4 h-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onload = () => {
                        if (typeof r.result === "string") setNewItemImage(r.result);
                      };
                      r.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            {/* Quick presets */}
            <div className="flex flex-wrap gap-1 pt-1">
              <button type="button" onClick={() => setNewItemImage("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400")} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[9px] font-bold text-slate-600 rounded">🍕 Pizza</button>
              <button type="button" onClick={() => setNewItemImage("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400")} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[9px] font-bold text-slate-600 rounded">🍔 Burger</button>
              <button type="button" onClick={() => setNewItemImage("https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400")} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[9px] font-bold text-slate-600 rounded">🌯 Roll</button>
              <button type="button" onClick={() => setNewItemImage("https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400")} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[9px] font-bold text-slate-600 rounded">☕ Tea</button>
              <button type="button" onClick={() => setNewItemImage("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400")} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[9px] font-bold text-slate-600 rounded">🍖 Kabab</button>
              <button type="button" onClick={() => setNewItemImage("https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400")} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[9px] font-bold text-slate-600 rounded">🧁 Sweet</button>
            </div>
          </div>

          <div className="md:col-span-3 pt-2 text-right">
            <button
              type="submit"
              className="px-6 py-3 bg-[#0F4C81] hover:bg-[#0c3c66] text-white text-xs font-black uppercase rounded-xl cursor-pointer shadow-sm transition"
            >
              Confirm & Save Dish
            </button>
          </div>
        </form>
      )}

      {/* POS STYLE COMPACT TILES */}
      {(() => {
        const itemsPerPage = 8; // 6 to 8 items visible per screen
        const totalPages = Math.ceil(menu.length / itemsPerPage) || 1;
        const validPage = Math.min(menuPage, totalPages);
        const paginatedMenu = menu.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);

        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-fadeIn">
              {paginatedMenu.map((item) => {
                const avail = checkAvailability(item);

                return (
                  <button
                    key={item.Item_ID}
                    onClick={() => handleOpenDetail(item)}
                    className="bg-white border border-slate-100 hover:border-slate-300 p-2.5 rounded-2xl flex flex-col justify-between gap-2.5 text-left transition duration-200 shadow-xs hover:shadow-md cursor-pointer select-none group focus:outline-none"
                  >
                    
                    {/* Compact Image */}
                    <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-slate-100 border border-slate-50">
                      <img 
                        src={item.Image_Url} 
                        alt={item.Item_Name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 left-1.5 bg-slate-900/70 backdrop-blur-md px-1 rounded text-[7px] font-mono text-white font-bold uppercase">
                        ID: {item.Item_ID}
                      </span>
                    </div>

                    {/* Data block */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1 flex-1 leading-tight" title={item.Item_Name}>
                          {item.Item_Name}
                        </h4>
                        <span className="text-[10px] font-mono font-black text-[#0F4C81] bg-blue-50/50 px-1.5 py-0.2 rounded shrink-0">
                          {item.Sales_Price} Rs
                        </span>
                      </div>
                      <p className="text-[9.5px] text-slate-455 font-bold truncate text-right font-serif leading-none">
                        {item.Item_Name_Ur}
                      </p>
                    </div>

                    {/* Availability badge */}
                    <div className="pt-1.5 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {item.Category}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-md border text-[7.5px] font-black uppercase ${avail.color}`}>
                        {lang === "ur" ? avail.urStatus : avail.status}
                      </span>
                    </div>

                  </button>
                );
              })}
            </div>

            <Pagination
              currentPage={validPage}
              totalPages={totalPages}
              onPageChange={setMenuPage}
              lang={lang}
            />
          </div>
        );
      })()}

    </div>
  );
}
