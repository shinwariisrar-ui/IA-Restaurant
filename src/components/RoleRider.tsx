import React, { useState } from "react";
import { DeliveryOrder, UserRow } from "../types";
import { 
  CheckCircle, Compass, MapPin, Phone, DollarSign, Calendar, Truck, Check, Navigation, AlertCircle, ShoppingBag, Eye
} from "lucide-react";

interface RoleRiderProps {
  deliveries: DeliveryOrder[];
  loggedInUser: UserRow;
  onUpdateDeliveryStatus: (deliveryId: string, nextStatus: "Pending" | "In-Transit" | "Delivered") => void;
  lang: "ur" | "en";
}

export default function RoleRider({
  deliveries,
  loggedInUser,
  onUpdateDeliveryStatus,
  lang
}: RoleRiderProps) {
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(deliveries[0]?.Delivery_ID || null);

  const selectedDelivery = deliveries.find(d => d.Delivery_ID === activeDeliveryId);

  // Math equations
  const activeDeliveriesList = deliveries.filter(d => d.Delivery_Status !== "Delivered");
  const deliveredList = deliveries.filter(d => d.Delivery_Status === "Delivered");
  const totalCashCollected = deliveredList.reduce((sum, d) => sum + d.Total_Cash_To_Collect, 0);

  return (
    <div className="space-y-6">
      
      {/* RIDER PROFILE METRIC CHIPS */}
      <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 text-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-850">
            <img src={loggedInUser.Photo_URL} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-[10px] bg-slate-800 text-cyan-405 text-cyan-400 font-extrabold px-2.5 py-0.5 rounded-lg border border-slate-705 font-mono uppercase">
              DELIVERY RIDER PROFILE
            </span>
            <h3 className="text-base font-black mt-1">
              {lang === "ur" ? loggedInUser.Name_Ur : loggedInUser.Name}
            </h3>
          </div>
        </div>

        {/* CASH COLLECTED TALLY COUNTER */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center justify-between md:justify-end gap-5">
          <div className="text-left font-sans text-xs">
            <span className="text-slate-450 text-slate-400 block font-black uppercase text-[10px]">{lang === "ur" ? "آج کی کل کیش وصولی:" : "Today's Cash Collected:"}</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block font-black">{totalCashCollected.toLocaleString()} PKR</span>
          </div>
          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-900/30 text-emerald-400">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* CORE RIDER PORTAL SPLIT SPREAD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ASSIGNED DELIVERIES QUEUE (5 Cols Span) */}
        <div className="lg:col-span-5 bg-slate-950 p-4.5 rounded-3xl border border-slate-850 space-y-4">
          <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
            {lang === "ur" ? "تفویض کردہ پارسلز اور ڈیلیوری" : "Assigned Delivery Tasks"}
          </h4>

          {activeDeliveriesList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-850 bg-slate-900/40 rounded-2xl space-y-2">
              <Truck className="w-10 h-10 text-slate-700 mx-auto animate-pulse" />
              <div className="text-slate-400 font-black text-xs">{lang === "ur" ? "تمام ڈیلیوریاں مکمل ہو چکی ہیں!" : "All deliveries matched & completed!"}</div>
              <p className="text-[10px] text-slate-500 leading-normal max-w-xs mx-auto">
                {lang === "ur" ? "کاؤنٹر کی جانب سے نیا پارسل ملنے پر یہاں الرٹ ظاہر ہوگا۔" : "Counter will push new home delivery tickets with customer address details."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDeliveriesList.map((del) => {
                const isActive = activeDeliveryId === del.Delivery_ID;
                const transit = del.Delivery_Status === "In-Transit";

                return (
                  <div
                    key={del.Delivery_ID}
                    onClick={() => setActiveDeliveryId(del.Delivery_ID)}
                    className={`p-3.5 rounded-2xl border transition duration-155 cursor-pointer flex items-center justify-between ${
                      isActive
                        ? "bg-slate-905 border-blue-500 shadow-md scale-102"
                        : "bg-slate-900/40 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm text-white">{del.Customer_Name}</div>
                      <div className="text-[10px] text-slate-405 font-medium text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
                        <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[9px] ${
                          transit ? "bg-amber-950 text-amber-400" : "bg-slate-800 text-slate-350"
                        }`}>
                          {del.Delivery_Status}
                        </span>
                        <span>D-{del.Delivery_ID}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-emerald-400 block">{del.Total_Cash_To_Collect} Rs</span>
                      <button className="text-[10px] text-blue-400 mt-1 underline flex items-center gap-1 cursor-pointer">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Navigate</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DELIVERED HISTORY FOLDER */}
          {deliveredList.length > 0 && (
            <div className="pt-3 border-t border-slate-850 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">{lang === "ur" ? "آج کے حل شدہ آرڈرز" : "Today's Dispatched history"}</span>
              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {deliveredList.map(del => (
                  <div key={del.Delivery_ID} className="bg-slate-900/30 p-2 text-[10.5px] rounded-xl border border-slate-900/40 flex justify-between font-mono font-semibold">
                    <span className="text-slate-400 text-left truncate max-w-[120px]">✓ {del.Customer_Name}</span>
                    <span className="text-emerald-400 font-black">{del.Total_Cash_To_Collect} PKR COLLECTED</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE NAVIGATION TARGET AND BUTTONS (7 Cols Span) */}
        <div className="lg:col-span-7">
          {selectedDelivery ? (
            <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-5 animate-scaleIn text-slate-200">
              
              <div className="border-b border-slate-850 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-black text-white">{selectedDelivery.Customer_Name}</h3>
                  <div className="text-xs text-slate-450 text-slate-400 font-medium font-mono">Delivery ID: D-{selectedDelivery.Delivery_ID} | Order Ref: {selectedDelivery.Order_ID}</div>
                </div>

                <div className="flex gap-1.5">
                  {selectedDelivery.Delivery_Status === "Pending" && (
                    <button
                      onClick={() => onUpdateDeliveryStatus(selectedDelivery.Delivery_ID, "In-Transit")}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 font-extrabold text-slate-950 text-xs rounded-xl cursor-pointer"
                    >
                      {lang === "ur" ? "روانہ کریں" : "Dispatch Transit 🚴"}
                    </button>
                  )}

                  {selectedDelivery.Delivery_Status === "In-Transit" && (
                    <button
                      onClick={() => onUpdateDeliveryStatus(selectedDelivery.Delivery_ID, "Delivered")}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-slate-950 text-xs rounded-xl cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 text-slate-950" />
                      <span>{lang === "ur" ? "ڈیلیور ہو گیا" : "Mark as Delivered ✓"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Delivery parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-850 space-y-1">
                  <span className="text-slate-500 font-extrabold block uppercase tracking-wider text-[9px]">
                    {lang === "ur" ? "کسٹمر فون نمبر:" : "Customer Phone:"}
                  </span>
                  <p className="font-mono text-white text-sm font-black flex items-center gap-2">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span>{selectedDelivery.Customer_Phone}</span>
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-850 space-y-1">
                  <span className="text-slate-500 font-extrabold block uppercase tracking-wider text-[9px]">
                    {lang === "ur" ? "کیش وصولی (Cash Payable):" : "Cash Due to Collect:"}
                  </span>
                  <p className="font-mono text-emerald-400 text-sm font-black flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>{selectedDelivery.Total_Cash_To_Collect} PKR</span>
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-850 space-y-1 sm:col-span-2">
                  <span className="text-slate-500 font-extrabold block uppercase tracking-wider text-[9px]">
                    {lang === "ur" ? "ڈیلیوری کا پتہ:" : "Destination Drop Address:"}
                  </span>
                  <p className="text-white text-xs font-bold leading-relaxed flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-rose-505 text-rose-500 flex-shrink-0" />
                    <span>{selectedDelivery.Customer_Address}</span>
                  </p>
                </div>
              </div>

              {/* MOCK VECTOR ROUTE MAP */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-3xl space-y-3">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Compass className="w-4 h-4 text-blue-400 animate-spin" />
                  <span>{lang === "ur" ? "رائڈر لائیو اسٹریٹ نیویگیشن" : "Live Driver Street Compass Direction"}</span>
                </span>

                {/* Vector map visualization */}
                <div className="relative bg-slate-950 h-52 border border-slate-850 rounded-2xl overflow-hidden flex items-center justify-center">
                  
                  {/* Styled clean gridlines representing Peshawar/Islamic roads */}
                  <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Aesthetic road nodes */}
                  <div className="absolute top-10 left-10 w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-slate-605 cursor-pointer flex justify-center items-center"><span className="text-[8px] text-slate-500 mt-4">Karkhano</span></div>
                  <div className="absolute bottom-16 right-16 w-3.5 h-3.5 rounded-full bg-slate-705 bg-slate-700 cursor-pointer flex justify-center items-center"><span className="text-[8px] text-slate-500 mt-5">Saddar Cantt</span></div>
                  
                  {/* Route line connecting */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 50,50 L 150,110 L 290,140" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="5,3" className="animate-[dash_10s_linear_infinite]" />
                  </svg>

                  {/* Rider icon dot and customer icon dot */}
                  <div className="absolute top-10 left-11 p-1 bg-blue-600 rounded-lg text-[9px] font-black text-white shadow-md animate-bounce flex items-center gap-1">
                    <Navigation className="w-2.5 h-2.5 text-white transform rotate-45" />
                    <span>Outlet</span>
                  </div>

                  <div className="absolute bottom-12 right-12 p-1 bg-rose-600 rounded-lg text-[9px] font-black text-white shadow-md flex items-center gap-1 animate-pulse">
                    <MapPin className="w-2.5 h-2.5 text-white" />
                    <span>Customer drop</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 text-center font-bold">
                  {lang === "ur" 
                    ? "یہ آف لائن روٹ پلانر سمارٹ لوپ پر کام کرتا ہے تاکہ پٹرول کا ضیاع کم سے کم ہو۔" 
                    : "Intelligent vector path optimizer. Avoid traffic gridlocks on GT Road."}
                </p>
              </div>

            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-850 p-16 rounded-3xl text-center text-slate-500">
              {lang === "ur" ? "تفصیل دیکھنے کے لیے ڈیلیوری ٹاسک کو منتخب کریں" : "Select an assigned home delivery on the left list to view navigation drop path."}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
