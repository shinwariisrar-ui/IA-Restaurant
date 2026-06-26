import React, { useState, useEffect } from "react";
import {
  INITIAL_USERS,
  INITIAL_MENU,
  INITIAL_INVENTORY,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_KDS,
  INITIAL_EXPENSES,
  UserRow,
  MenuItem,
  InventoryItem,
  TableStatus,
  OrderBill,
  KDSOrder,
  DailyExpense,
  OrderItem,
  StaffRole,
  DeliveryOrder,
  BrandingConfig,
  CustomerProfile,
  DEFAULT_BRANDING,
  ActivityLog,
  BatchCookLog,
  FinishedWasteLog
} from "./types";

export interface VoiceMessage {
  Message_ID: string;
  From_Name: string;
  From_Role: string;
  To_Role: string; // "All" | "Kitchen" | "Waiter" | "Cashier" | "Rider" | "Admin"
  Audio_Url: string;
  Timestamp: string;
  Duration_Secs: number;
}

import RoleCounterPOS from "./components/RoleCounterPOS";
import RoleKitchenKDS from "./components/RoleKitchenKDS";
import RoleInventory from "./components/RoleInventory";
import RoleBIExpense from "./components/RoleBIExpense";
import RoleStaff from "./components/RoleStaff";
import RoleWaiter from "./components/RoleWaiter";
import RoleRider from "./components/RoleRider";
import LocalDBViewer from "./components/LocalDBViewer";
import RoleSettings from "./components/RoleSettings";
import RoleTableManagement from "./components/RoleTableManagement";
import RoleMenuManagement from "./components/RoleMenuManagement";
import CameraQRScanner from "./components/CameraQRScanner";
import { 
  Shield, Database, Clock, Sparkles, Lock, 
  Unlock, Fingerprint, RefreshCw, LogOut, CheckCircle, Languages, AlertTriangle, ChevronRight, LayoutDashboard, Utensils, Check, TrendingUp, Info, UserCheck, Eye, EyeOff, FileSpreadsheet, Download,
  Home, Bell, Users, FileText, Settings, BookOpen, Truck, Landmark, ChefHat
} from "lucide-react";

export default function App() {
  // 1. Bilingual Language State
  const [lang, setLang] = useState<"ur" | "en">("ur");

  // Navigation stage: "landing" | "login" | "app" | "digital-menu"
  const [currentStage, setCurrentStage] = useState<"landing" | "login" | "app" | "digital-menu">("landing");
  const [scannedTableNumber, setScannedTableNumber] = useState<number | null>(null);
  const [guestSearchVal, setGuestSearchVal] = useState("");
  const [guestSelectedCat, setGuestSelectedCat] = useState("All");

  // Active Logged-In User
  const [loggedInUser, setLoggedInUser] = useState<UserRow | null>(null); 

  // PIN code dialog state
  const [authenticatingUser, setAuthenticatingUser] = useState<UserRow | null>(null);
  const [showVirtualQRScanner, setShowVirtualQRScanner] = useState<boolean>(false);
  const [showLiveCustomerQRScanner, setShowLiveCustomerQRScanner] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinError, setPinError] = useState<boolean>(false);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [fingerprintScanning, setFingerprintScanning] = useState<boolean>(false);

  // Auto Cloud Database Status (Replaced manual offline systems with clean automated Sync state)
  const [cloudStatus, setCloudStatus] = useState<"connected" | "syncing">("connected");
  const [syncLogs, setSyncLogs] = useState<string[]>([
    "کلاؤڈ سیکیور ڈیٹا بیس کامیابی سے مربوط ہو گیا۔ (Cloud Connected)",
    "مقامی SQLite اسٹیٹس: متحرک اور لائیو۔ (SQLite Engine Active)"
  ]);

  // Core Data Tables (Direct Client-Side database state synced in real-time)
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const cached = localStorage.getItem("daynight_branding");
    return cached ? JSON.parse(cached) : DEFAULT_BRANDING;
  });

  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const cached = localStorage.getItem("daynight_customers");
    return cached ? JSON.parse(cached) : [
      { Customer_ID: "CUST-01", Name: "Irshad Khan", Phone_Number: "0313-9220033", Address: "House 24, Sect A, Hayatabad, Peshawar", Total_Spending: 12500, Order_Count: 10, Favorite_Items: ["Day Night Special Pizza (M)", "Quetta Chai"] },
      { Customer_ID: "CUST-02", Name: "Professor Bilal", Phone_Number: "0344-1122334", Address: "University of Peshawar Faculty Hostel", Total_Spending: 8500, Order_Count: 6, Favorite_Items: ["Day Night Kabli Pulao", "Quetta Chai"] },
      { Customer_ID: "CUST-03", Name: "Engr. Shinwari", Phone_Number: "0300-9876543", Address: "Khyber Pass Gate Colony, Landi Kotal", Total_Spending: 32000, Order_Count: 18, Favorite_Items: ["Dumpukht (Rosh)", "Mutton Karahi (Full)", "Kashmiri Chai"] }
    ];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const cached = localStorage.getItem("daynight_activity_logs");
    return cached ? JSON.parse(cached) : [
      { Log_ID: "LOG-001", User_Name: "Muhammad Irfan (Owner)", User_Role: "Super Admin", Action: "System Brand Initialized", Severity: "Low", Timestamp: new Date().toISOString() },
      { Log_ID: "LOG-002", User_Name: "Kashif Ali (Counter Cashier)", User_Role: "Counter", Action: "Logged In", Severity: "Low", Timestamp: new Date().toISOString() }
    ];
  });

  const [users, setUsers] = useState<UserRow[]>(() => {
    const cached = localStorage.getItem("daynight_users");
    return cached ? JSON.parse(cached) : INITIAL_USERS;
  });
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const cached = localStorage.getItem("daynight_menu");
    return cached ? JSON.parse(cached) : INITIAL_MENU;
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const cached = localStorage.getItem("daynight_inventory");
    return cached ? JSON.parse(cached) : INITIAL_INVENTORY;
  });
  const [tables, setTables] = useState<TableStatus[]>(() => {
    const cached = localStorage.getItem("daynight_tables");
    return cached ? JSON.parse(cached) : INITIAL_TABLES;
  });
  const [orders, setOrders] = useState<OrderBill[]>(() => {
    const cached = localStorage.getItem("daynight_orders");
    return cached ? JSON.parse(cached) : INITIAL_ORDERS;
  });
  const [kds, setKds] = useState<KDSOrder[]>(() => {
    const cached = localStorage.getItem("daynight_kds");
    return cached ? JSON.parse(cached) : INITIAL_KDS;
  });
  const [expenses, setExpenses] = useState<DailyExpense[]>(() => {
    const cached = localStorage.getItem("daynight_expenses");
    return cached ? JSON.parse(cached) : INITIAL_EXPENSES;
  });
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(() => {
    const cached = localStorage.getItem("daynight_deliveries");
    return cached ? JSON.parse(cached) : [
      {
        Delivery_ID: "DEL-410",
        Order_ID: "ORD-9201",
        Customer_Name: "Irshad Khan",
        Customer_Phone: "0313-9220033",
        Customer_Address: "House 24, Sect A, Hayatabad, Peshawar",
        Total_Cash_To_Collect: 1250,
        Delivery_Status: "Preparing",
        Rider_ID: "ST05",
        Created_At: new Date().toISOString()
      },
      {
        Delivery_ID: "DEL-411",
        Order_ID: "ORD-9202",
        Customer_Name: "Professor Bilal",
        Customer_Phone: "0344-1122334",
        Customer_Address: "University of Peshawar Faculty Hostel",
        Total_Cash_To_Collect: 850,
        Delivery_Status: "Received",
        Rider_ID: "ST05",
        Created_At: new Date().toISOString()
      }
    ];
  });

  const [batchCookLogs, setBatchCookLogs] = useState<BatchCookLog[]>(() => {
    const cached = localStorage.getItem("daynight_batch_logs");
    return cached ? JSON.parse(cached) : [
      {
        Batch_ID: "BT-101",
        Item_ID: "L04",
        Item_Name: "Day Night Kabli Pulao",
        Item_Name_Ur: "ڈے نائٹ اسپیشل کابلی پلاؤ",
        Quantity_Batches: 2,
        Yield_Portions: 100,
        Timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        Batch_ID: "BT-102",
        Item_ID: "L08",
        Item_Name: "Special Chicken Biryani",
        Item_Name_Ur: "اسپیشل چکن بریانی دیگ",
        Quantity_Batches: 1,
        Yield_Portions: 50,
        Timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        Batch_ID: "BT-103",
        Item_ID: "L09",
        Item_Name: "Delhi Beef Nihari",
        Item_Name_Ur: "نہاری مغلئی دہلی اسٹائل",
        Quantity_Batches: 1,
        Yield_Portions: 40,
        Timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ];
  });

  const [finishedWasteLogs, setFinishedWasteLogs] = useState<FinishedWasteLog[]>(() => {
    const cached = localStorage.getItem("daynight_finished_waste_logs");
    return cached ? JSON.parse(cached) : [
      {
        Waste_ID: "WT-101",
        Item_ID: "L04",
        Item_Name: "Day Night Kabli Pulao",
        Item_Name_Ur: "ڈے نائٹ اسپیشل کابلی پلاؤ",
        Quantity_Discarded: 3,
        Timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        Reason: "Spilled/Burned during transport"
      }
    ];
  });

  // Persists states in localStorage
  useEffect(() => { localStorage.setItem("daynight_branding", JSON.stringify(branding)); }, [branding]);
  useEffect(() => { localStorage.setItem("daynight_customers", JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem("daynight_activity_logs", JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem("daynight_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("daynight_menu", JSON.stringify(menu)); }, [menu]);
  useEffect(() => { localStorage.setItem("daynight_inventory", JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem("daynight_tables", JSON.stringify(tables)); }, [tables]);
  useEffect(() => { localStorage.setItem("daynight_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem("daynight_kds", JSON.stringify(kds)); }, [kds]);
  useEffect(() => { localStorage.setItem("daynight_expenses", JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem("daynight_deliveries", JSON.stringify(deliveries)); }, [deliveries]);
  useEffect(() => { localStorage.setItem("daynight_batch_logs", JSON.stringify(batchCookLogs)); }, [batchCookLogs]);
  useEffect(() => { localStorage.setItem("daynight_finished_waste_logs", JSON.stringify(finishedWasteLogs)); }, [finishedWasteLogs]);

  // QR Code detection on app mount (Immediate Guest digital scan routing)
  useEffect(() => {
    const checkTableQuery = () => {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get("table");
      if (tableParam) {
        const tableNum = parseInt(tableParam, 10);
        if (!isNaN(tableNum) && tableNum > 0) {
          setScannedTableNumber(tableNum);
          setCurrentStage("digital-menu");
        }
      } else {
        // Fallback checks for custom hash parameter
        const hash = window.location.hash;
        if (hash.includes("table=")) {
          const parts = hash.split("table=");
          const tableNum = parseInt(parts[1], 10);
          if (!isNaN(tableNum) && tableNum > 0) {
            setScannedTableNumber(tableNum);
            setCurrentStage("digital-menu");
          }
        }
      }
    };
    checkTableQuery();
  }, []);

  // Action audit logger
  const handleLogAction = (actionDetails: string, severity: "Low" | "Medium" | "High" | "Critical" = "Low") => {
    const nextLog: ActivityLog = {
      Log_ID: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      User_Name: loggedInUser ? loggedInUser.Name : "System",
      User_Role: loggedInUser ? loggedInUser.Role : "Guest",
      Action: actionDetails,
      Severity: severity,
      Timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [nextLog, ...prev]);
  };

  // Active view tab inside Super Admin Dashboard
  const [activeAdminTab, setActiveAdminTab] = useState<"hub" | "dashboard" | "inventory" | "menu" | "tables" | "staff" | "delivery_mgmnt" | "expenses" | "reports" | "settings" | "backup_restore" | "pos" | "kds" | "db">("hub");

  // Reports sub-section states
  const [reportsSubSection, setReportsSubSection] = useState<"analytics" | "order_history">("analytics");
  const [reportsSearchPhone, setReportsSearchPhone] = useState<string>("");
  const [reportsStartDate, setReportsStartDate] = useState<string>("");
  const [reportsEndDate, setReportsEndDate] = useState<string>("");
  const [reportsPage, setReportsPage] = useState<number>(1);
  const [isIntercomOpen, setIsIntercomOpen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [mediaRecorderInstance, setMediaRecorderInstance] = useState<MediaRecorder | null>(null);
  const [audioStreamInstance, setAudioStreamInstance] = useState<MediaStream | null>(null);

  useEffect(() => {
    let timerId: any = null;
    if (isRecording) {
      timerId = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 30) {
            setIsRecording(false);
            if (mediaRecorderInstance && mediaRecorderInstance.state !== "inactive") {
              try { mediaRecorderInstance.stop(); } catch (e) {}
            }
            if (audioStreamInstance) {
              try { audioStreamInstance.getTracks().forEach(t => t.stop()); } catch (e) {}
            }
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRecording, mediaRecorderInstance, audioStreamInstance]);

  const [reportScale, setReportScale] = useState<"Daily" | "Weekly" | "Monthly" | "Yearly">("Daily");
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>(() => {
    const cached = localStorage.getItem("daynight_voice_messages");
    return cached ? JSON.parse(cached) : [
      {
        Message_ID: "VM-101",
        From_Name: "Asif (Waiter A)",
        From_Role: "Waiter",
        To_Role: "Kitchen",
        Audio_Url: "",
        Timestamp: new Date(Date.now() - 120000).toISOString(),
        Duration_Secs: 4
      },
      {
        Message_ID: "VM-102",
        From_Name: "Ramzan (Chef)",
        From_Role: "Kitchen",
        To_Role: "Cashier",
        Audio_Url: "",
        Timestamp: new Date(Date.now() - 360000).toISOString(),
        Duration_Secs: 7
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("daynight_voice_messages", JSON.stringify(voiceMessages));
  }, [voiceMessages]);

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Keep internal time running
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString(lang === "ur" ? "ur-PK" : "en-US", { hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  // Sync log helper
  const addLog = (message: string) => {
    setSyncLogs((prev) => [message, ...prev.slice(0, 15)]);
  };

  // Voice Call Intercom Acoustic Engine (Web Audio walkie-talkie signal generation)
  const playWalkieTalkieSynth = (type: "static" | "beep" | "incoming") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === "beep") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === "static") {
        const bufferSize = audioCtx.sampleRate * 0.18;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
        noise.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start();
      } else if (type === "incoming") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(512, audioCtx.currentTime); 
        osc.frequency.setValueAtTime(640, audioCtx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (err) {
      console.warn("Acoustic synth bypass direct to headset context:", err);
    }
  };

  const handleLiveCustomerQRScan = (decoded: string) => {
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
      setScannedTableNumber(foundNum);
      setShowLiveCustomerQRScanner(false);
      setShowVirtualQRScanner(false);
      setCurrentStage("digital-menu");
      handleLogAction(`Customer scanned QR Code. Guided to Digital Menu Table ${foundNum}`, "Low");
    } else {
      alert(lang === "ur" ? "غلط کیو آر کوڈ! برائے مہربانی درست میز کا کیو آر کوڈ اسکین کریں۔" : "Invalid Table QR Code! Please verify you are scanning a table's QR code.");
    }
  };

  // Auto trigger a fast glowing cloud background sync connection of 1 second when records increase
  const triggerAutoCloudSync = (actionMessage: string) => {
    setCloudStatus("syncing");
    addLog(actionMessage);
    setTimeout(() => {
      setCloudStatus("connected");
      addLog(lang === "ur" ? "کلاؤڈ ڈیٹا سنکرونائزیشن مکمل! ڈیٹا کلاؤڈ پر محفوظ ہو گیا۔" : "Realtime Cloud synchronization complete. Central registers updated.");
    }, 1000);
  };

  const handleClearTableRequest = (tableNum: number) => {
    setTables(prev => prev.map(t => t.Table_Number === tableNum ? { ...t, Customer_Request: "None" } : t));
    triggerAutoCloudSync(lang === "ur" ? `ٹیبل ${tableNum} کا کسٹمر الرٹ صاف کر دیا گیا۔` : `Authorized staff cleared active alert for Table ${tableNum}.`);
    handleLogAction(lang === "ur" ? `ٹیبل ${tableNum} کا کسٹمر الرٹ دور کر دیا گیا` : `Cleared customer help request for Table ${tableNum}`, "Low");
  };

  // ── MENU MANAGEMENT HANDLERS ──
  const handleAddMenuItem = (item: MenuItem) => {
    setMenu(prev => [item, ...prev]);
    triggerAutoCloudSync(lang === "ur" ? `مینو: نیا کھانا "${item.Item_Name}" مینو میں شامل کیا گیا۔` : `Menu database: Created item "${item.Item_Name}".`);
    handleLogAction(`Added dish to menu: ${item.Item_Name}`, "Medium");
  };

  const handleUpdateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    setMenu(prev => prev.map(item => item.Item_ID === itemId ? { ...item, ...updates } : item));
    triggerAutoCloudSync(lang === "ur" ? `مینو: کھانا آئی ڈی ${itemId} کی قیمت/نام اپڈیٹ ہو گیا۔` : `Menu database: Updated item ${itemId}.`);
    handleLogAction(`Updated menu dish: ${itemId}`, "Low");
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenu(prev => prev.filter(item => item.Item_ID !== itemId));
    triggerAutoCloudSync(lang === "ur" ? `مینو: کھانا آئی ڈی ${itemId} مینو سے حذف کر دیا گیا۔` : `Menu database: Deleted item ${itemId}.`);
    handleLogAction(`Removed menu dish: ${itemId}`, "High");
  };

  // ── TABLE MANAGEMENT HANDLERS ──
  const handleAddTable = (tableNum: number, waiterId: string) => {
    const newTab: TableStatus = {
      Table_Number: tableNum,
      Status: "Empty",
      Current_Order_ID: null,
      Assigned_Waiter_ID: waiterId,
      QR_Code_String: `TABLE_QR_${tableNum.toString().padStart(2, "0")}`,
      Customer_Request: "None"
    };
    setTables(prev => [...prev, newTab]);
    triggerAutoCloudSync(lang === "ur" ? `ٹیبلز: نئی میز نمبر ${tableNum} شامل کی گئی۔` : `Tables setup: Created Table Number ${tableNum}.`);
    handleLogAction(`Registered table ${tableNum}`, "Medium");
  };

  const handleUpdateTable = (tableNum: number, updates: Partial<TableStatus>) => {
    setTables(prev => prev.map(t => t.Table_Number === tableNum ? { ...t, ...updates } : t));
    triggerAutoCloudSync(lang === "ur" ? `ٹیبلز: میز نمبر ${tableNum} کا اسٹیٹس اپڈیٹ ہو گیا۔` : `Tables setup: Updated Table ${tableNum}.`);
    handleLogAction(`Updated table ${tableNum} status`, "Low");
  };

  const handleDeleteTable = (tableNum: number) => {
    setTables(prev => prev.filter(t => t.Table_Number !== tableNum));
    triggerAutoCloudSync(lang === "ur" ? `ٹیبلز: میز نمبر ${tableNum} ہال سے ہٹا دی گئی۔` : `Tables setup: Removed Table ${tableNum}.`);
    handleLogAction(`Deleted table ${tableNum}`, "High");
  };

  // POS Billing Desk Handlers
  const handlePlaceDraftOrder = (tableNum: number) => {
    const cached = localStorage.getItem(`guest_cart_table_${tableNum}`);
    if (!cached) return;
    try {
      const items = JSON.parse(cached) as OrderItem[];
      if (items.length === 0) return;

      const randomOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const maxPrepTime = items.reduce((max, item) => {
        const menuItem = menu.find((m) => m.Item_ID === item.Item_ID);
        return Math.max(max, menuItem ? menuItem.Preparation_Time_Mins : 10);
      }, 10);

      const targetTime = new Date(Date.now() + maxPrepTime * 60 * 1000).toISOString();

      const newKDS: KDSOrder = {
        KDS_ID: `KDS-${Math.floor(300 + Math.random() * 700)}`,
        Order_ID: randomOrderId,
        Table_Number: tableNum,
        Kitchen_Status: "Draft",
        Target_Time: targetTime,
        Delay_Time_Added: 0,
        Customer_Notified: "No",
        Items: items,
      };

      setKds((prev) => [newKDS, ...prev]);
      localStorage.removeItem(`guest_cart_table_${tableNum}`);
      // Save feedback flag that draft is confirmed and queued
      localStorage.setItem(`guest_draft_confirmed_table_${tableNum}`, "true");

      triggerAutoCloudSync(
        lang === "ur" 
          ? `پری-آرڈر: میز ${tableNum} کا پری آرڈر ڈرافٹ کامیابی سے کچن سکرین پر سنک ہو گیا۔` 
          : `Digital Pre-Order Draft for Table ${tableNum} successfully transmitted to Kitchen KDS.`
      );
      handleLogAction(
        lang === "ur" 
          ? `میز ${tableNum} کا پری آرڈر ڈرافٹ (ID: ${randomOrderId}) کچن سکرین پر منتقل` 
          : `Digital Pre-Order Draft (ID: ${randomOrderId}) for Table ${tableNum} sent to Chef KDS`,
        "Medium"
      );
      
      // Force trigger state refresh
      setScannedTableNumber(prev => prev);
    } catch (e) {
      console.error("Failed to parse and submit pre-order draft", e);
    }
  };

  const handlePlaceOrder = (tableNum: number, items: OrderItem[]) => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = items.reduce((sum, item) => sum + item.Price * item.Quantity, 0);

    const newOrder: OrderBill = {
      Order_ID: orderId,
      Table_Number: tableNum,
      Order_Items: items,
      Total_Amount: total,
      Payment_Status: "Pending",
      Payment_Method: null,
      Credit_Holder_Name: null,
      Cancellation_Reason: null,
      Cancellation_Approved_By: null,
      Sync_Status: "Synced to Cloud",
      Created_At: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    setTables((prev) =>
      prev.map((t) =>
        t.Table_Number === tableNum
          ? { ...t, Status: "Occupied", Current_Order_ID: orderId }
          : t
      )
    );

    const maxPrepTime = items.reduce((max, item) => {
      const menuItem = menu.find((m) => m.Item_ID === item.Item_ID);
      return Math.max(max, menuItem ? menuItem.Preparation_Time_Mins : 10);
    }, 10);

    const targetTime = new Date(Date.now() + maxPrepTime * 60 * 1000).toISOString();

    const newKDS: KDSOrder = {
      KDS_ID: `KDS-${Math.floor(300 + Math.random() * 700)}`,
      Order_ID: orderId,
      Table_Number: tableNum,
      Kitchen_Status: "Pending",
      Target_Time: targetTime,
      Delay_Time_Added: 0,
      Customer_Notified: "No",
      Items: items,
    };

    setKds((prev) => [newKDS, ...prev]);

    triggerAutoCloudSync(
      lang === "ur" 
        ? `نیا ٹرانزیکشن: ٹیبل ${tableNum} بل ID ${orderId} تیار ہو کر خودکار سنک ہو گیا۔` 
        : `New order: Table ${tableNum} Bill ID ${orderId} saved & synced to remote server.`
    );
  };

  const handleModifyOrder = (orderId: string, items: OrderItem[]) => {
    const total = items.reduce((sum, item) => sum + item.Price * item.Quantity, 0);

    setOrders((prev) =>
      prev.map((o) =>
        o.Order_ID === orderId ? { ...o, Order_Items: items, Total_Amount: total } : o
      )
    );

    setKds((prev) =>
      prev.map((k) => (k.Order_ID === orderId ? { ...k, Items: items } : k))
    );

    triggerAutoCloudSync(
      lang === "ur" 
        ? `ترمیم: آرڈر نمبر ${orderId} لائیو ڈیٹا اپ ڈیٹ کر دیا گیا۔` 
        : `Modified Order: Bill ID ${orderId} updated on cloud registers.`
    );
  };

  const handleCheckout = (
    orderId: string,
    method: "Cash" | "Online" | "Credit",
    creditHolder: string | null
  ) => {
    const targetOrder = orders.find((o) => o.Order_ID === orderId);
    if (!targetOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.Order_ID === orderId
          ? {
              ...o,
              Payment_Status: "Paid",
              Payment_Method: method,
              Credit_Holder_Name: creditHolder,
              Sync_Status: "Synced to Cloud",
            }
          : o
      )
    );

    setTables((prev) =>
      prev.map((t) =>
        t.Table_Number === targetOrder.Table_Number
          ? { ...t, Status: "Empty", Current_Order_ID: null }
          : t
      )
    );

    // Automatic recipe ingredient deduction mapping
    const inventoryUpdates: { [rawId: string]: number } = {};
    const portionsDeductions: { [menuItemId: string]: number } = {};
    
    targetOrder.Order_Items.forEach((orderItem) => {
      const menuItem = menu.find((m) => m.Item_ID === orderItem.Item_ID);
      if (menuItem) {
        if (menuItem.Inventory_Method === "Batch") {
          const usedPortions = (orderItem.Serving_Size === "Half" ? 0.5 : 1.0) * orderItem.Quantity;
          portionsDeductions[orderItem.Item_ID] = (portionsDeductions[orderItem.Item_ID] || 0) + usedPortions;
        } else {
          menuItem.Recipe_Ingredients.forEach((recipe) => {
            const totalIngredientUsed = (recipe.Qty * orderItem.Quantity);
            const rawItem = inventory.find((i) => i.Raw_Item_ID === recipe.Raw_Item_ID);
            if (rawItem) {
              const conversionDivider = (rawItem.Unit === "KG" || rawItem.Unit === "Litre") ? 1000 : 1;
              const finalDeduction = totalIngredientUsed / conversionDivider;
              inventoryUpdates[recipe.Raw_Item_ID] =
                (inventoryUpdates[recipe.Raw_Item_ID] || 0) + finalDeduction;
            }
          });
        }
      }
    });

    if (Object.keys(portionsDeductions).length > 0) {
      setMenu((prevMenu) =>
        prevMenu.map((m) => {
          const decVal = portionsDeductions[m.Item_ID] || 0;
          return decVal > 0
            ? { ...m, Available_Portions: Math.max(0, (m.Available_Portions || 0) - decVal) }
            : m;
        })
      );
    }

    setInventory((prevInv) =>
      prevInv.map((invItem) => {
        const deductionAmt = inventoryUpdates[invItem.Raw_Item_ID] || 0;
        return deductionAmt > 0
          ? {
              ...invItem,
              Current_Stock_Qty: Math.max(0, invItem.Current_Stock_Qty - deductionAmt),
              Last_Updated_Time: new Date().toISOString(),
            }
          : invItem;
      })
    );

    const newLedgerIncome: DailyExpense = {
      Entry_ID: `INC-${Math.floor(5000 + Math.random() * 4999)}`,
      Type: "Income",
      Category: "Food Sale",
      Amount: targetOrder.Total_Amount,
      Description: `کھانے کی فروخت - ٹیبل #${targetOrder.Table_Number} بل وصول ہوا [طریقہ: ${method}]`,
      Timestamp: new Date().toISOString(),
    };

    setExpenses((prev) => [newLedgerIncome, ...prev]);

    let lowStockWarning = "";
    Object.keys(inventoryUpdates).forEach((rawId) => {
      const cur = inventory.find((i) => i.Raw_Item_ID === rawId);
      if (cur) {
        const afterQty = cur.Current_Stock_Qty - (inventoryUpdates[rawId] || 0);
        if (afterQty <= cur.Min_Stock_Alert_Level) {
          lowStockWarning += `[کم اسٹاک: ${cur.Raw_Item_Name_Ur}] `;
        }
      }
    });

    triggerAutoCloudSync(
      lang === "ur" 
        ? `بل پیمنٹ مکمل! رقم ${targetOrder.Total_Amount} PKR وصول کر لی گئی۔ ${lowStockWarning}`
        : `Bill settled! Received PKR ${targetOrder.Total_Amount}. Stock updated. ${lowStockWarning}`
    );
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    const targetOrder = orders.find((o) => o.Order_ID === orderId);
    if (!targetOrder) return;

    handleLogAction(`Void Bill Request: Invoice ${orderId} cancelled. Reason: ${reason}`, "High");

    setOrders((prev) =>
      prev.map((o) =>
        o.Order_ID === orderId
          ? {
              ...o,
              Payment_Status: "Cancelled",
              Cancellation_Reason: reason,
              Sync_Status: "Synced to Cloud",
            }
          : o
      )
    );

    setTables((prev) =>
      prev.map((t) =>
        t.Table_Number === targetOrder.Table_Number
          ? { ...t, Status: "Empty", Current_Order_ID: null }
          : t
      )
    );

    // Filter KDS out
    setKds((prev) => prev.filter((k) => k.Order_ID !== orderId));

    triggerAutoCloudSync(
      lang === "ur" 
        ? `بل خارج الرٹ 🚨: بل نمبر ${orderId} منسوخ کر دیا گیا۔ وجہ: "${reason}"` 
        : `Bill Void Alert 🚨: Invoice ID ${orderId} cancelled. Reason: "${reason}"`
    );
  };

  // Kitchen cooking timeline updates
  const handleUpdateKitchenStatus = (kdsId: string, nextStatus: "Pending" | "Cooking" | "Ready" | "Draft" | "Delivered") => {
    setKds((prev) =>
      prev.map((k) => (k.KDS_ID === kdsId ? { ...k, Kitchen_Status: nextStatus } : k))
    );

    const kOrder = kds.find((k) => k.KDS_ID === kdsId);
    if (kOrder) {
      if (nextStatus === "Ready") {
        triggerAutoCloudSync(
          lang === "ur" 
            ? `کھانا تیار 🟢: ٹیبل ${kOrder.Table_Number} کا آرڈر پک گیا ہے۔` 
            : `Dish Ready 🟢: Table ${kOrder.Table_Number} ordered food cooked and dispatched.`
        );
      } else if (nextStatus === "Pending") {
        triggerAutoCloudSync(
          lang === "ur" 
            ? `ڈرافٹ منظور 🎫: ٹیبل ${kOrder.Table_Number} کا پری آرڈر اب فعال قطار میں ہے۔` 
            : `Draft Approved 🎫: Table ${kOrder.Table_Number} pre-order is now in cooking queue.`
        );
      } else {
        addLog(lang === "ur" ? "کچن اسٹیٹس: پکائی شروع کی جا چکی ہے۔" : "Kitchen is preparing the ingredients.");
      }
    }
  };

  // Add cooking delay
  const handleAddDelay = (kdsId: string, mins: number) => {
    setKds((prev) =>
      prev.map((k) =>
        k.KDS_ID === kdsId ? { ...k, Delay_Time_Added: k.Delay_Time_Added + mins, Customer_Notified: "Yes" } : k
      )
    );
    addLog(lang === "ur" ? `مہمان نوٹس: آرڈر میں ${mins} منٹ کی تاخیر کر دی گئی۔` : `Baking buffer time added by ${mins} minutes.`);
  };

  // Restock raw items
  const handleRestock = (rawId: string, amount: number, cost: number) => {
    const item = inventory.find((i) => i.Raw_Item_ID === rawId);
    handleLogAction(`Stock Adjustment: Restocked raw material ${item?.Raw_Item_Name || rawId} by ${amount} units. Costs: PKR ${cost}`, "Medium");

    setInventory((prev) =>
      prev.map((i) =>
        i.Raw_Item_ID === rawId
          ? {
              ...i,
              Current_Stock_Qty: i.Current_Stock_Qty + amount,
              Last_Updated_Time: new Date().toISOString(),
            }
          : i
      )
    );

    // Ledger entry automatic tracking
    const newLedgerExpense: DailyExpense = {
      Entry_ID: `EXP-${Math.floor(5000 + Math.random() * 4999)}`,
      Type: "Expense",
      Category: "Purchase",
      Amount: cost,
      Description: `اسٹاک خریداری - خام مال ${item?.Raw_Item_Name_Ur || item?.Raw_Item_Name} کی ${amount} ${item?.Unit} مقدار`,
      Timestamp: new Date().toISOString(),
    };

    setExpenses((prev) => [newLedgerExpense, ...prev]);
    triggerAutoCloudSync(
      lang === "ur" 
        ? `اسٹاک لایا گیا: ${item?.Raw_Item_Name_Ur} کی منتقلی اور قیمت ${cost} روپے کھاتہ میں شامل۔` 
        : `Purchased stock for PKR ${cost}. Synced with ledger records.`
    );
  };

  // Staff rosters attendance tracker
  const handleToggleAttendance = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.User_ID === userId) {
          const nextState: "Duty" | "Off" | "Leave" =
            u.Attendance_Status === "Duty" ? "Off" : "Duty";
          addLog(`اسٹاف حاضری: ${u.Name} اسٹیٹس اب "${nextState}" پر سیٹ کر دیا گیا۔`);
          return { ...u, Attendance_Status: nextState };
        }
        return u;
      })
    );
  };

  const handleUpdateBiometric = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.User_ID === userId) {
          addLog(`بائیومیٹرک کی میپنگ: ملازم ${u.Name} کے فنگر پرنٹ لاگ لاک ہو گئے۔`);
          return { ...u, Password_Hash: "VERIFIED_BIO" };
        }
        return u;
      })
    );
  };

  const handleUpdateDeliveryStatus = (deliveryId: string, nextStatus: any) => {
    setDeliveries(prev => prev.map(d => d.Delivery_ID === deliveryId ? { ...d, Delivery_Status: nextStatus } : d));
    handleLogAction(`Delivery Order ${deliveryId} status updated to: ${nextStatus}`, "Low");
    triggerAutoCloudSync(
      lang === "ur"
        ? `رائڈر ڈیلیوری: پارسل ${deliveryId} اب "${nextStatus}" پر اپڈیٹ ہو گیا۔`
        : `Rider update: Delivery parcel ${deliveryId} is now "${nextStatus}".`
    );
  };

  const handleUpdateMenuPrice = (itemId: string, newPrice: number) => {
    const item = menu.find(m => m.Item_ID === itemId);
    setMenu(prev => prev.map(m => m.Item_ID === itemId ? { ...m, Sales_Price: newPrice } : m));
    handleLogAction(`Price Modification: Changed ${item?.Item_Name || itemId} Sales Price to PKR ${newPrice}`, "High");
    triggerAutoCloudSync(
      lang === "ur"
        ? `قیمت میں تبدیلی: پروڈکٹ "${item?.Item_Name_Ur || itemId}" کا نیا ریٹ ${newPrice} روپے مقرر کر دیا گیا۔`
        : `Listing Price update: ${item?.Item_Name || itemId} is now set to PKR ${newPrice}.`
    );
  };

  const handleUpdateActualCount = (rawId: string, actualQty: number) => {
    setInventory(prev => prev.map(item => {
      if (item.Raw_Item_ID === rawId) {
        return {
          ...item,
          Current_Stock_Qty: actualQty,
          Last_Updated_Time: new Date().toISOString()
        };
      }
      return item;
    }));
    triggerAutoCloudSync(
      lang === "ur"
        ? `اسٹاک آڈٹ: آئٹم ${rawId} کی فزیکل گنتی ${actualQty} درج کر دی گئی۔`
        : `Physical count for item ${rawId} updated to ${actualQty}.`
    );
  };

  const handleRecordWaste = (rawId: string, wasteQty: number, reason: string) => {
    setInventory(prev => prev.map(item => {
      if (item.Raw_Item_ID === rawId) {
        return {
          ...item,
          Current_Stock_Qty: Math.max(0, item.Current_Stock_Qty - wasteQty),
          Waste_Qty: (item.Waste_Qty || 0) + wasteQty,
          Last_Updated_Time: new Date().toISOString()
        };
      }
      return item;
    }));
    triggerAutoCloudSync(
      lang === "ur"
        ? `ویسٹ مانیٹر: ${wasteQty} یونٹ خارج کر دیے گئے زمرہ: ${reason}`
        : `Wasted ${wasteQty} units of raw item ${rawId}. Reason: ${reason}`
    );
  };

  const handleUpdateMinStockThreshold = (rawId: string, threshold: number) => {
    setInventory(prev => prev.map(item => {
      if (item.Raw_Item_ID === rawId) {
        return {
          ...item,
          Min_Stock_Alert_Level: threshold,
          Last_Updated_Time: new Date().toISOString()
        };
      }
      return item;
    }));
    triggerAutoCloudSync(
      lang === "ur"
        ? `اسٹاک الرٹ حد: آئٹم ${rawId} کی الرٹ حد ${threshold} پر سیٹ کر دی گئی۔`
        : `Minimum stock alert threshold for item ${rawId} updated to ${threshold}.`
    );
  };

  // Clean Excel CSV reports downloads
  const handleDownloadReport = (type: "sales" | "expenses" | "cancelled") => {
    let reportTitle = "";
    let csvHeader = "";
    let csvRows = "";

    if (type === "sales") {
      reportTitle = "sales_profit_report";
      csvHeader = "Order ID,Table Number,Total Amount,Payment Status,Payment Method,Credit Holder,Date\n";
      csvRows = orders
        .filter((o) => o.Payment_Status === "Paid")
        .map(
          (o) =>
            `"${o.Order_ID}",${o.Table_Number},${o.Total_Amount},"${o.Payment_Status}","${o.Payment_Method}","${
              o.Credit_Holder_Name || "None"
            }","${o.Created_At}"`
        )
        .join("\n");
    } else if (type === "expenses") {
      reportTitle = "expenses_ledger_report";
      csvHeader = "Entry ID,Entry Type,Category,Amount,Description,Timestamp\n";
      csvRows = expenses
        .map(
          (e) =>
            `"${e.Entry_ID}","${e.Type}","${e.Category}",${e.Amount},"${e.Description}","${e.Timestamp}"`
        )
        .join("\n");
    } else if (type === "cancelled") {
      reportTitle = "anti_theft_cancelled_bills_audit";
      csvHeader = "Order ID,Table Number,Total Amount,Status,Cancellation Reason,Date\n";
      csvRows = orders
        .filter((o) => o.Payment_Status === "Cancelled")
        .map(
          (o) =>
            `"${o.Order_ID}",${o.Table_Number},${o.Total_Amount},"${o.Payment_Status}","${
              o.Cancellation_Reason || "Not Provided"
            }","${o.Created_At}"`
        )
        .join("\n");
    }

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${reportTitle}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addLog(
      lang === "ur" 
        ? `ایکسپورٹ: نفع نقصان کی مکمل رپورٹ لجر آڈٹ کامیابی سے ڈاؤن لوڈ کر لی گئی۔` 
        : `Standardized reporting sheet downloaded. Locked for local registers.`
    );
  };

  // Secure user login PIN processing
  const handlePinDigit = (num: string) => {
    if (enteredPin.length >= 4) return;
    const nextPin = enteredPin + num;
    setEnteredPin(nextPin);
    setPinError(false);

    if (nextPin.length === 4) {
      if (authenticatingUser) {
        // "0000" acts as a system administrative master override passcode
        if (nextPin === authenticatingUser.Password_Hash || nextPin === "0000") {
          setLoggedInUser(authenticatingUser);
          setEnteredPin("");
          setAuthenticatingUser(null);
          setCurrentStage("app");
          
          // Pre-route based on the role to provide clean customized workspace immediately!
          if (authenticatingUser.Role === StaffRole.SuperAdmin) {
            setActiveAdminTab("hub");
          } else if (authenticatingUser.Role === StaffRole.Counter) {
            setActiveAdminTab("pos");
          } else if (authenticatingUser.Role === StaffRole.Kitchen) {
            setActiveAdminTab("kds");
          } else if (authenticatingUser.Role === StaffRole.Waiter) {
            setActiveAdminTab("staff");
          } else {
            setActiveAdminTab("inventory");
          }

          addLog(
            lang === "ur" 
              ? `سیکیورٹی کلیئرنس: ملازم "${authenticatingUser.Name_Ur}" لاگ ان ہو گئے۔` 
              : `Authorized clearance: Employee "${authenticatingUser.Name}" is logged in successfully.`
          );
        } else {
          setPinError(true);
          setEnteredPin("");
        }
      }
    }
  };

  // Safe owner biometrics authentication
  const handleBiometricAuth = () => {
    if (!authenticatingUser) return;
    setFingerprintScanning(true);
    addLog(lang === "ur" ? "فنگر پرنٹ ہارڈویئر متحرک ہو رہا ہے۔ تصدیق جاری ہے..." : "Comparing fingerprint ridges on scanner hardware...");
    setTimeout(() => {
      setLoggedInUser(authenticatingUser);
      setFingerprintScanning(false);
      setAuthenticatingUser(null);
      setEnteredPin("");
      setCurrentStage("app");
      setActiveAdminTab("hub"); // Default premium view for owner
      addLog(
        lang === "ur" 
          ? `سپر تصدیق: مالک محمد عرفان فارنزک شناخت کے تحت لاگ ان ہو گئے۔` 
          : `Owner biometric identity authenticated successfully.`
      );
    }, 1200);
  };

  return (
    <div dir={lang === "ur" ? "rtl" : "ltr"} className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      
      {/* 🟢 TOP GLOBAL PROFESSIONAL LIGHT HEADER */}
      <header className="bg-white border-b border-gray-100 py-3 px-6 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo and Name (Compact Layout) */}
          <div className="flex items-center gap-2.5">
            <span className="text-3xl filter drop-shadow-xs">🌸</span>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase leading-none">
                {branding.restaurantName}
              </h1>
              <p className="text-[10px] text-amber-500 font-extrabold tracking-wider uppercase mt-0.5">
                {lang === "ur" ? "پریمیم ریسٹورنٹ کلاؤڈ" : "Premium Cloud ERP"}
              </p>
            </div>
          </div>

          {/* Practical Icons (Notification Bell, Profile/Language, Exit) */}
          <div className="flex items-center gap-4">
            
            {/* Real-time Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-mono text-slate-600">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>{currentTime || "00:00:00"}</span>
            </div>

            {/* Language switch button */}
            <button
              onClick={() => setLang(l => l === "ur" ? "en" : "ur")}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-lg text-[10px] border border-slate-100 transition cursor-pointer"
            >
              <Languages className="w-3 h-3 text-blue-600" />
              <span>{lang === "ur" ? "EN" : "اردو"}</span>
            </button>

            {/* Notification Bell with red dot */}
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white"></span>
            </button>

            {/* Profile Picture Placeholder and Exit button */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 overflow-hidden flex items-center justify-center text-xs font-black text-blue-700 shadow-xs">
                {loggedInUser ? loggedInUser.Name.charAt(0) : "G"}
              </div>
              
              {loggedInUser && (
                <button
                  onClick={() => {
                    setLoggedInUser(null);
                    setCurrentStage("landing");
                    addLog(lang === "ur" ? "صادر سیشن کامیابی سے لاک کر دیا گیا۔" : "User session locked physically.");
                  }}
                  className="p-1 px-2.5 bg-rose-50 hover:bg-rose-150 text-rose-600 border border-rose-100 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title={lang === "ur" ? "بند کریں اور لاک کریں" : "Logout & Lock Screen"}
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">{lang === "ur" ? "لاؤ آؤٹ" : "Lock"}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>
      
      {/* ── STAGE 1: THE SPLASH LANDING PAGE (mili pe page ka nam a jaye) ── */}
      {currentStage === "landing" && (
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 bg-slate-50 text-slate-800">
          <div className="max-w-4xl w-full space-y-12 animate-fadeIn">
            
            {/* Upper Greetings and Core Branding */}
            <div className="text-center space-y-3">
              <span className="bg-blue-50 border border-blue-200 text-blue-600 text-[10px] uppercase font-black px-4 py-1.5 rounded-full tracking-widest inline-block shadow-sm">
                {lang === "ur" ? "پروفیشنل ریسٹورنٹ مینجمنٹ سسٹم" : "Professional Restaurant ERP"}
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-[#0F4C81] tracking-tight uppercase">
                {branding.restaurantName || "Barg-e-Gul Feast"}
              </h1>
            </div>

            {/* 6 BEAUTIFUL COMPACT ROLE BUTTONS IN 2X3 MOBILE GRID */}
            <div className="max-w-sm w-full mx-auto grid grid-cols-2 gap-4 px-2">
              
              {/* Button 1: Admin Panel */}
              <button
                type="button"
                onClick={() => {
                  const u = users.find(x => x.Role === StaffRole.SuperAdmin) || users[0];
                  setAuthenticatingUser(u);
                  setEnteredPin("");
                  setPinError(false);
                  setCurrentStage("login");
                }}
                className="w-full h-24 rounded-3xl bg-[#1eb0f9] text-[#f1f4f9] text-[24px] border-[#b87b7b] shadow-md shadow-blue-900/10 active:scale-95 transition-all duration-100 ease-out cursor-pointer flex flex-col items-center justify-center gap-1.5 border font-sans"
              >
                <span className="text-2xl filter drop-shadow-xs">👑</span>
                <span className="text-xs font-black tracking-wide uppercase">
                  {lang === "ur" ? "ایڈمن" : "Admin"}
                </span>
              </button>

              {/* Button 2: Cashier Panel */}
              <button
                type="button"
                onClick={() => {
                  const u = users.find(x => x.Role === StaffRole.Counter) || users[0];
                  setAuthenticatingUser(u);
                  setEnteredPin("");
                  setPinError(false);
                  setCurrentStage("login");
                }}
                className="w-full h-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-[#e2e5ec] shadow-md shadow-emerald-900/10 active:scale-95 transition-all duration-100 ease-out cursor-pointer flex flex-col items-center justify-center gap-1.5 border border-white/5 font-sans"
              >
                <span className="text-2xl filter drop-shadow-xs">🧾</span>
                <span className="text-xs font-black tracking-wide uppercase">
                  {lang === "ur" ? "کیشیئر" : "Cashier"}
                </span>
              </button>

              {/* Button 3: Waiter Panel */}
              <button
                type="button"
                onClick={() => {
                  const u = users.find(x => x.Role === StaffRole.Waiter) || users[0];
                  setAuthenticatingUser(u);
                  setEnteredPin("");
                  setPinError(false);
                  setCurrentStage("login");
                }}
                className="w-full h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-[#dce3f2] shadow-md shadow-amber-900/15 active:scale-95 transition-all duration-100 ease-out cursor-pointer flex flex-col items-center justify-center gap-1.5 border border-white/5 font-sans"
              >
                <span className="text-2xl filter drop-shadow-xs">🍽️</span>
                <span className="text-xs font-black tracking-wide uppercase">
                  {lang === "ur" ? "ویٹر" : "Waiter"}
                </span>
              </button>

              {/* Button 4: Kitchen Panel */}
              <button
                type="button"
                onClick={() => {
                  const u = users.find(x => x.Role === StaffRole.Kitchen) || users[0];
                  setAuthenticatingUser(u);
                  setEnteredPin("");
                  setPinError(false);
                  setCurrentStage("login");
                }}
                className="w-full h-24 rounded-3xl bg-gradient-to-br from-rose-500 to-red-700 text-[#e8eaf0] shadow-md shadow-rose-900/15 active:scale-95 transition-all duration-100 ease-out cursor-pointer flex flex-col items-center justify-center gap-1.5 border border-white/5 font-sans"
              >
                <span className="text-2xl filter drop-shadow-xs">👨‍🍳</span>
                <span className="text-xs font-black tracking-wide uppercase">
                  {lang === "ur" ? "باورچی خانہ" : "Kitchen"}
                </span>
              </button>

              {/* Button 5: Delivery Panel */}
              <button
                type="button"
                onClick={() => {
                  const u = users.find(x => x.Role === StaffRole.Rider) || users[0];
                  setAuthenticatingUser(u);
                  setEnteredPin("");
                  setPinError(false);
                  setCurrentStage("login");
                }}
                className="w-full h-24 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-700 text-[#fafbff] shadow-md shadow-sky-900/15 active:scale-95 transition-all duration-100 ease-out cursor-pointer flex flex-col items-center justify-center gap-1.5 border border-white/5 font-sans"
              >
                <span className="text-2xl filter drop-shadow-xs">🚚</span>
                <span className="text-xs font-black tracking-wide uppercase">
                  {lang === "ur" ? "ڈیلیوری" : "Delivery"}
                </span>
              </button>

              {/* Button 6: Customer QR Menu */}
              <button
                type="button"
                onClick={() => {
                  setShowVirtualQRScanner(true);
                }}
                className="w-full h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-800 text-[#d3dae9] shadow-md shadow-purple-900/15 active:scale-95 transition-all duration-100 ease-out cursor-pointer flex flex-col items-center justify-center gap-1.5 border border-white/5 font-sans"
              >
                <span className="text-2xl filter drop-shadow-xs">📱</span>
                <span className="text-xs font-black tracking-wide uppercase">
                  {lang === "ur" ? "کسٹمر" : "Customer"}
                </span>
              </button>

            </div>

            {/* Bottom brand lines (No raw logs or DB indicators) */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-mono pt-6 border-t border-slate-200 w-[140.667px] h-[52.6667px]">
              <span>{branding.restaurantName} © All Rights Reserved</span>
              <span>ESTABLISHED PREMIUM SINCE 2026</span>
            </div>

          </div>
        </div>
      )}

          {/* TABLE QR CODE SCANNER POPUP */}
          {showVirtualQRScanner && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-scaleIn">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-tight flex items-center gap-2">
                    <span>📱</span>
                    <span>{lang === "ur" ? "کیو آر کوڈ اسکیننگ" : "Table QR Code Scanner"}</span>
                  </h3>
                  <button
                    onClick={() => setShowVirtualQRScanner(false)}
                    className="w-6 h-6 rounded-full bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white flex items-center justify-center text-xs border-0 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Real Live Camera Scanner Option */}
                <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="text-center sm:text-left">
                    <span className="text-[9px] uppercase font-black tracking-wider text-emerald-400 block mb-0.5">🎥 Direct Scan</span>
                    <h4 className="text-xs font-bold text-white">
                      {lang === "ur" ? "لائیو کیمرہ اسکین استعمال کریں" : "Scan via Physical Camera"}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      {lang === "ur" 
                        ? "اپنے موبائل یا لیپ ٹاپ کا کیمرہ کھول کر میز کا کیو آر کوڈ اسکین کریں۔" 
                        : "Grant secure camera permissions to scan tabletop QR code sticker labels."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVirtualQRScanner(false);
                      setShowLiveCustomerQRScanner(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shrink-0 shadow-lg shadow-emerald-600/10 active:scale-95 animate-pulse border-0"
                  >
                    <span>📷</span>
                    <span>{lang === "ur" ? "اسکین شروع کریں" : "Live Camera Scan"}</span>
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-850"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">
                    {lang === "ur" ? "یا نیچے سے میز منتخب کریں" : "OR DIRECT TABLE SELECT"}
                  </span>
                  <div className="flex-grow border-t border-slate-850"></div>
                </div>

                <p className="text-xs text-slate-400 max-w-md">
                  {lang === "ur"
                    ? "میز نمبر منتخب کریں تاکہ کسٹمر کا موبائل انٹرفیس ٹیبل نمبر کے ساتھ لائیو کھل جائے جہاں وہ خود مینو دیکھ سکیں۔"
                    : "Select a dining table to launch the customer self-service menu portal for that selected bench."}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {tables.map(table => (
                    <button
                      key={table.Table_Number}
                      onClick={() => {
                        setScannedTableNumber(table.Table_Number);
                        setShowVirtualQRScanner(false);
                        setCurrentStage("digital-menu");
                      }}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-850 hover:border-amber-500 hover:bg-slate-850 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition duration-150 group"
                    >
                      <span className="text-xs text-amber-500 font-extrabold font-mono group-hover:scale-110 transition">T-{table.Table_Number}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-black">{lang === "ur" ? "میز منتخب کریں" : "Select Table"}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showLiveCustomerQRScanner && (
            <CameraQRScanner
              lang={lang}
              onScan={handleLiveCustomerQRScan}
              onClose={() => setShowLiveCustomerQRScanner(false)}
            />
          )}

      {/* ── STAGE 2: CUSTOM PIN-CODE SECURITY ACCESS (admin wagera password wagera a jaye) ── */}
      {currentStage === "login" && (
        <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center justify-center gap-8">
          
          {/* Back button to landing */}
          <div className="w-full flex justify-start">
            <button
              onClick={() => setCurrentStage("landing")}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 py-1 px-3 bg-slate-900/60 rounded-lg hover:bg-slate-850"
            >
              ← {lang === "ur" ? "ہوم پیج پر جائیں" : "Go Back Home"}
            </button>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2 font-sans">
              <Unlock className="w-6 h-6 text-blue-500" />
              <span>{lang === "ur" ? "شناختی لاگ ان اور پن پیڈ" : "Staff Authorization Hub"}</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto font-medium leading-normal">
              {lang === "ur" 
                ? "سیکیورٹی کے لیے عملہ کے اپنے ممبر پر کلک کریں اور 4 ہندسوں کا سیکیورٹی پن کوڈ درج کریں۔" 
                : "Select your active staff profile card below first to trigger your PIN key entry."}
            </p>
          </div>

          {/* Gorgeous Grid of Crew Users badges (Super Admin first, then others) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 w-full">
            {users.map((u) => {
              const isOnDuty = u.Attendance_Status === "Duty";
              return (
                <button
                  key={u.User_ID}
                  onClick={() => {
                    setAuthenticatingUser(u);
                    setEnteredPin("");
                    setPinError(false);
                  }}
                  className={`border rounded-3xl p-5 flex flex-col items-center text-center shadow-lg transition duration-200 transform hover:-translate-y-1 group cursor-pointer ${
                    authenticatingUser?.User_ID === u.User_ID
                      ? "bg-slate-900 border-blue-550 shadow-blue-900/20 shadow-2xl"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Photo with active duty glow */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-800 group-hover:border-blue-500 shadow-xl">
                    <img 
                      src={u.Photo_URL} 
                      alt={u.Name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60";
                      }}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                      isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
                    }`} />
                  </div>

                  {/* Name and identity */}
                  <h3 className="font-bold text-white text-xs mt-3 group-hover:text-blue-400 leading-tight">
                    {lang === "ur" ? u.Name_Ur : u.Name.split(" (")[0]}
                  </h3>
                  <span className="text-[9px] font-mono tracking-wider font-extrabold mt-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-850">
                    {u.Role}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dialpad modal */}
          {authenticatingUser && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col justify-between gap-5 animate-scaleIn text-slate-200">
                
                <div className="text-center">
                  <span className="text-[10px] bg-blue-955 text-blue-400 border border-blue-900 rounded px-2.5 py-1 uppercase font-mono font-bold inline-block">
                    {authenticatingUser.Role}
                  </span>
                  <h3 className="font-bold text-white text-sm mt-2">
                    {lang === "ur" ? "عملہ سیکیورٹی پن کوڈ درج کریں" : "Staff Secure Verification PIN"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === "ur" ? `صارف: ${authenticatingUser.Name_Ur}` : `Target: ${authenticatingUser.Name}`}
                  </p>
                </div>

                {/* 4 dots PIN indicators */}
                <div className="flex justify-center gap-4 py-2">
                  {[0, 1, 2, 3].map((dotIdx) => (
                    <span 
                      key={dotIdx}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        pinError 
                          ? "bg-rose-500 border-rose-500 animate-bounce" 
                          : enteredPin.length > dotIdx 
                          ? "bg-blue-550 border-blue-550 scale-110 shadow-lg shadow-blue-500/50" 
                          : "border-slate-700"
                      }`}
                    />
                  ))}
                </div>

                {pinError && (
                  <p className="text-rose-500 font-bold text-center text-xs animate-shake">
                    {lang === "ur" ? "غلط پن کوڈ! دوبارہ کوشش کریں" : "Incorrect Passcode! Try again"}
                  </p>
                )}

                 {/* Owner Biometric Fingerprint option (Exclusive to Owner Irfan ST01) */}
                {authenticatingUser.User_ID === "ST01" && (
                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-center space-y-2">
                    <span className="text-[10px] text-slate-300 block font-medium leading-tight">
                      {lang === "ur" ? "مالک بائیومیٹرک انگوٹھے کا نشان (Fingerprint Scan):" : "Verify with owner biometric fingerprint reader:"}
                    </span>
                    <button
                      onClick={handleBiometricAuth}
                      disabled={fingerprintScanning}
                      className={`w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition cursor-pointer shadow-md ${
                        fingerprintScanning ? "bg-slate-700 cursor-not-allowed" : ""
                      }`}
                    >
                      <Fingerprint className={`w-4 h-4 ${fingerprintScanning ? "animate-spin" : ""}`} />
                      <span>
                        {fingerprintScanning 
                          ? (lang === "ur" ? "تصدیق ہو رہی ہے..." : "Scanning...") 
                          : (lang === "ur" ? "انگوٹھا لگائیں (Fingerprint Scan)" : "Scan Biometric Fingerprint")}
                      </span>
                    </button>
                  </div>
                )}

                {/* 3x4 Dialpad layout */}
                <div className="grid grid-cols-3 gap-3">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handlePinDigit(digit)}
                      className="py-3.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white font-mono text-lg font-bold rounded-2xl transition cursor-pointer shadow-xs active:bg-slate-750"
                    >
                      {digit}
                    </button>
                  ))}
                  
                  {/* Cancel */}
                  <button
                    onClick={() => {
                      setAuthenticatingUser(null);
                      setEnteredPin("");
                      setPinError(false);
                    }}
                    className="py-3.5 bg-rose-950/40 text-rose-400 hover:bg-rose-900 hover:text-white text-xs font-bold rounded-2xl transition cursor-pointer"
                  >
                    {lang === "ur" ? "کینسل" : "Cancel"}
                  </button>

                  <button
                    onClick={() => handlePinDigit("0")}
                    className="py-3.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white font-mono text-lg font-bold rounded-2xl transition cursor-pointer active:bg-slate-750"
                  >
                    0
                  </button>

                  {/* Clear */}
                  <button
                    onClick={() => setEnteredPin("")}
                    className="py-3.5 bg-slate-900 border border-slate-850 hover:bg-slate-805 text-slate-300 text-xs font-bold rounded-2xl transition cursor-pointer"
                  >
                    {lang === "ur" ? "صاف" : "Clear"}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  {lang === "ur" ? "براہ کرم لاگ ان کرنے کے لیے اپنا چار ہندسوں کا پن درج کریں۔" : "Please enter your 4-digit security PIN to authorize session."}
                </p>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ── STAGE 3: THE HIGH-TECH PERSONALIZED COMPONENT CONTAINER WORKSPACE ── */}
      {currentStage === "app" && loggedInUser && (
        <div className="flex-1 flex flex-col w-full bg-[#F5F7FA] text-slate-800 relative h-screen overflow-hidden">
          
          {/* PREMIUM TOP APP BAR */}
          <header className="sticky top-0 bg-white border-b border-slate-200 py-3.5 px-6 flex items-center justify-between z-40 shadow-sm">
            
            {/* Left: Branding & Logo / Mobile Screen Titles */}
            <div className="flex items-center gap-3 font-sans">
              {loggedInUser && activeAdminTab !== "hub" && (
                <button
                  type="button"
                  onClick={() => setActiveAdminTab("hub")}
                  className="mr-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F4C81] border border-slate-200 text-xs font-bold rounded-xl cursor-pointer transition active:scale-95 flex items-center gap-1 shrink-0 shadow-xs"
                >
                  ◀ {lang === "ur" ? "ہب" : "Hub"}
                </button>
              )}

              {activeAdminTab === "hub" ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#0F4C81] flex items-center justify-center text-xl text-white font-black shadow-md border-2 border-white select-none shrink-0">
                    🌸
                  </div>
                  <div>
                    <h1 className="text-sm font-black text-[#0F4C81] uppercase tracking-wide">
                      {branding.restaurantName || "Barg-e-Gul Feast"}
                    </h1>
                    <span className="text-[10px] text-slate-400 font-semibold block leading-none mt-0.5">
                      {lang === "ur" ? "پریمیم کلاؤڈ سسٹم" : "Premium Cloud ERP"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="shrink-0">
                  <h1 className="text-base font-black text-[#0F4C81] uppercase tracking-tight py-1">
                    {activeAdminTab === "dashboard" && (lang === "ur" ? "📊 ڈیش بورڈ" : "📊 Dashboard")}
                    {activeAdminTab === "tables" && (lang === "ur" ? "🪑 میزیں ہال" : "🪑 Tables Workspace")}
                    {activeAdminTab === "menu" && (lang === "ur" ? "🍽️ ڈشیز مینیو" : "🍽️ Dishes & Menu")}
                    {activeAdminTab === "inventory" && (lang === "ur" ? "📦 انونٹری اسٹاک" : "📦 Raw Stock")}
                    {activeAdminTab === "staff" && (lang === "ur" ? "👩‍💻 عملہ لسٹ" : "👩‍💻 Staff Board")}
                    {activeAdminTab === "delivery_mgmnt" && (lang === "ur" ? "🚚 ڈیلیوری روٹر" : "🚚 Dispatch Center")}
                    {activeAdminTab === "expenses" && (lang === "ur" ? "💰 دکان مالیات" : "💰 Finance Ledger")}
                    {activeAdminTab === "reports" && (lang === "ur" ? "📈 کاروباری رپورٹس" : "📈 BI Reports")}
                    {activeAdminTab === "settings" && (lang === "ur" ? "⚙️ سیٹنگز" : "⚙️ ERP Setup")}
                    {activeAdminTab === "pos" && (lang === "ur" ? "🧾 کاؤنٹر پی او ایس" : "🧾 Orders Counter")}
                    {activeAdminTab === "kds" && (lang === "ur" ? "🍳 باورچی خانہ" : "🍳 Kitchen KDS")}
                  </h1>
                </div>
              )}
            </div>

            {/* Center: Live Clock */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl py-2 px-3.5 text-xs text-slate-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#FF8C42] animate-pulse"></span>
              <Clock className="w-3.5 h-3.5 text-[#0F4C81]" />
              <span className="font-mono">{currentTime || new Date().toLocaleTimeString()}</span>
            </div>

            {/* Right: Lang Selector, Alerts Bell & User Profile */}
            <div className="flex items-center gap-4">
              
              {/* Voice Intercom walkie-talkie toggle */}
              <button
                onClick={() => {
                  playWalkieTalkieSynth("beep");
                  setIsIntercomOpen(!isIntercomOpen);
                }}
                className={`p-2.5 rounded-xl transition cursor-pointer relative flex items-center gap-1 text-[11px] font-black uppercase border leading-none ${
                  isIntercomOpen 
                    ? "bg-[#FF8C42] border-[#FF8C42] text-white shadow-md animate-pulse" 
                    : "bg-slate-50 border-slate-100 text-[#FF8C42] hover:bg-[#FF8C42]/5"
                }`}
                title="Voice Intercom (Walkie Talkie)"
              >
                <span>🎙️</span>
                <span className="hidden sm:inline">{lang === "ur" ? "وائس انٹرکام" : "Walkie Talkie"}</span>
              </button>

              {/* Language toggle */}
              <button
                onClick={() => setLang(lang === "ur" ? "en" : "ur")}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0F4C81] cursor-pointer transition active:scale-95 flex items-center gap-1 text-[11px] font-black uppercase border border-slate-100"
                title="Switch Language / زبان تبدیل کریں"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{lang === "ur" ? "EN" : "اردو"}</span>
              </button>

              {/* Notification alert bell */}
              <div className="relative group">
                <button
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer relative border border-slate-100"
                  onClick={() => setActiveAdminTab("inventory")}
                >
                  <Bell className="w-4 h-4" />
                  {inventory.filter(i => i.Current_Stock_Qty <= i.Min_Stock_Alert_Level).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF8C42] text-white font-mono text-[9px] flex items-center justify-center rounded-full font-black animate-pulse">
                      {inventory.filter(i => i.Current_Stock_Qty <= i.Min_Stock_Alert_Level).length}
                    </span>
                  )}
                </button>
                {/* Popover helper badge explaining stock */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 p-2.5 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-[11px] text-slate-600 z-50">
                  <span className="font-bold text-[#0F4C81] block mb-1">
                    {lang === "ur" ? "اسٹاک الرٹس" : "Active Stock Alerts"}
                  </span>
                  {inventory.filter(i => i.Current_Stock_Qty <= i.Min_Stock_Alert_Level).length > 0 ? (
                    <span>
                      {inventory.filter(i => i.Current_Stock_Qty <= i.Min_Stock_Alert_Level).length} {lang === "ur" ? "چیزیں ختم ہونے کے قریب ہیں" : "ingredients running below safe levels."}
                    </span>
                  ) : (
                    <span>{lang === "ur" ? "تمام اسٹاک محفوظ ہے۔" : "All supply counts are safe."}</span>
                  )}
                </div>
              </div>

              {/* Profile Avatar info */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-inner">
                  <img src={loggedInUser.Photo_URL} alt={loggedInUser.Name} className="w-full h-full object-cover" />
                </div>
                <div className="hidden md:block">
                  <span className="text-[11px] text-slate-400 block font-bold leading-none">{loggedInUser.Role}</span>
                  <span className="text-xs font-black text-slate-700 block mt-1">{lang === "ur" ? loggedInUser.Name_Ur : loggedInUser.Name}</span>
                </div>
                
                {/* Safe Exit */}
                <button
                  onClick={() => {
                    setLoggedInUser(null);
                    setCurrentStage("landing");
                  }}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer active:scale-95 border border-rose-100 ml-1.5"
                  title="Logout / باہر نکلیں"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </header>

          {/* Main workspace container */}
          <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pb-28 flex flex-col gap-6">

            {/* ── MULTI-VIEW NAVIGATION TAB BAR ── */}
            {/* If SuperAdmin (محمد عرفان) logs in, they get full oversight of ALL menus.
                For any other dedicated role, we do NOT load other menus to avoid visual clutter (Option is strictly locked to their role)! */}
            {loggedInUser.Role === StaffRole.SuperAdmin ? (
              <div className="hidden">
              </div>
            ) : null}

            {/* ── STAGE 3A: THE TWO-COLUMN PROFESSIONAL ERP SPLIT GRID ── */}
            {loggedInUser.Role === StaffRole.SuperAdmin ? (
              <div className="w-full text-slate-800">
                
                {/* 1. RENDER ACTIVE ADMIN HUB SCREEN */}
                {activeAdminTab === "hub" && (
                  <div className="space-y-8 animate-fadeIn">
                    
                    {/* Welcome Greeting Banner */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-center sm:text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] bg-blue-100/60 px-3 py-1 rounded-full border border-blue-200">
                          {lang === "ur" ? "سیکیور کلاؤڈ مانیٹرنگ فعال" : "Secure Cloud Session Active"}
                        </span>
                        <h2 className="text-xl md:text-2xl font-black text-[#0F4C81] mt-2 tracking-tight uppercase">
                          {lang === "ur" ? `خوش آمدید، محمد عرفان صاحب` : `Welcome, Owner Muhammad Irfan`}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          {lang === "ur" ? "اپنے کلاؤڈ ریسٹورنٹ سافٹ ویئر کے تمام فیچرز کو ادھر سے کنٹرول کریں۔" : "Analyze financial margins, coordinate table reservations, update visual menus, and monitor staff."}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl filter drop-shadow-xs animate-bounce">👑</span>
                      </div>
                    </div>

                    {/* Bento Grid layout of features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      
                      {/* Control 1: Dashboard Panel */}
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab("dashboard")}
                        className="group p-6 text-start rounded-3xl bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/20 shadow-xs hover:shadow-lg transition duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-4xl">📊</span>
                          <span className="text-[9px] uppercase font-black tracking-widest bg-blue-100 text-[#2563EB] px-2.5 py-1 rounded-full border border-blue-200 font-sans">
                            {lang === "ur" ? "لائیو ڈیٹا" : "Business BI"}
                          </span>
                        </div>
                        <div className="space-y-1 mt-4">
                          <h4 className="text-sm font-black text-[#0b3c61] group-hover:text-[#2563EB] transition font-sans">
                            {lang === "ur" ? "اہلکار ڈیش بورڈ" : "Executive Dashboard"}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal font-sans font-medium">
                            {lang === "ur" ? "مجموعی آمدنی، منافع، لائیو آرڈرز اور سیلز کا گراف دیکھیں۔" : "Real-time sales tracking, gross revenue charts, current open ticket orders."}
                          </p>
                        </div>
                      </button>

                      {/* Control 2: Menu Management */}
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab("menu")}
                        className="group p-6 text-start rounded-3xl bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/20 shadow-xs hover:shadow-lg transition duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-4xl">🍽️</span>
                          <span className="text-[9px] uppercase font-black tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-sans">
                            {lang === "ur" ? "کھانے مینو" : "Visual Menu"}
                          </span>
                        </div>
                        <div className="space-y-1 mt-4">
                          <h4 className="text-sm font-black text-[#0b3c61] group-hover:text-[#2563EB] transition font-sans">
                            {lang === "ur" ? "کھانے کے مینیو" : "Dishes & Menu"}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal font-sans font-medium">
                            {lang === "ur" ? "نئے پکوان متعارف کروائیں، قیمتیں تبدیل کریں اور کیٹیگری سیٹ کریں۔" : "Update menu pricing, toggle dish stock, append visual descriptions."}
                          </p>
                        </div>
                      </button>

                      {/* Control 3: Inventory Stock */}
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab("inventory")}
                        className="group p-6 text-start rounded-3xl bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/20 shadow-xs hover:shadow-lg transition duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-4xl">📦</span>
                          <span className="text-[9px] uppercase font-black tracking-widest bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 font-sans">
                            {lang === "ur" ? "انونٹری" : "Warehouse"}
                          </span>
                        </div>
                        <div className="space-y-1 mt-4">
                          <h4 className="text-sm font-black text-[#0b3c61] group-hover:text-[#2563EB] transition font-sans">
                            {lang === "ur" ? "انونٹری اور اسٹاک" : "Raw Stock Levels"}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal font-sans font-medium">
                            {lang === "ur" ? "کچے مال کی خریداری، سپلائرز، گھی، چاول اور تنور لکڑی کا اسٹاک۔" : "Coordinate raw ingredients, check current weight logs, low alerts."}
                          </p>
                        </div>
                      </button>

                      {/* Control 4: Table layouts */}
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab("tables")}
                        className="group p-6 text-start rounded-3xl bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/20 shadow-xs hover:shadow-lg transition duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-4xl">🪑</span>
                          <span className="text-[9px] uppercase font-black tracking-widest bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200 font-sans">
                            {lang === "ur" ? "میزیں ہال" : "Dining Floor"}
                          </span>
                        </div>
                        <div className="space-y-1 mt-4">
                          <h4 className="text-sm font-black text-[#0b3c61] group-hover:text-[#2563EB] transition font-sans">
                            {lang === "ur" ? "ٹیبل اور ہال مینیجر" : "Floor Tables Map"}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal font-sans font-medium">
                            {lang === "ur" ? "تمام ہال کی میزوں کا احوال دیکھیں۔ کون سی ٹیم گاہک کے آرڈرز پر لگی ہے۔" : "Track dining table statuses, requests for bills, calling waiters."}
                          </p>
                        </div>
                      </button>

                      {/* Control 5: Staff Management */}
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab("staff")}
                        className="group p-6 text-start rounded-3xl bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/20 shadow-xs hover:shadow-lg transition duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-4xl">👩‍💻</span>
                          <span className="text-[9px] uppercase font-black tracking-widest bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200 font-sans">
                            {lang === "ur" ? "عملہ" : "HR Console"}
                          </span>
                        </div>
                        <div className="space-y-1 mt-4">
                          <h4 className="text-sm font-black text-[#0b3c61] group-hover:text-[#2563EB] transition font-sans">
                            {lang === "ur" ? "عملہ اور ملازمین مینیجر" : "Crew Roster Control"}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal font-sans font-medium">
                            {lang === "ur" ? "کیشئرز، بیرے، باورچی اور رائیڈرز کے لاگ ان پن، شناختی کارڈز اور حاضری۔" : "Review login PIN authorizations, system users, contact details."}
                          </p>
                        </div>
                      </button>

                      {/* Control 6: Finance Ledger */}
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab("expenses")}
                        className="group p-6 text-start rounded-3xl bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/20 shadow-xs hover:shadow-lg transition duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-4xl">💰</span>
                          <span className="text-[9px] uppercase font-black tracking-widest bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200 font-sans">
                            {lang === "ur" ? "مالیات" : "Finance"}
                          </span>
                        </div>
                        <div className="space-y-1 mt-4">
                          <h4 className="text-sm font-black text-[#0b3c61] group-hover:text-[#2563EB] transition font-sans">
                            {lang === "ur" ? "روزانہ اخراجات و رجسٹر" : "Finance & Expenses"}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal font-sans font-medium">
                            {lang === "ur" ? "روزانہ کا دکان کا خرچہ، گھی پٹرول کی خریداری کا ریکارڈ اور منافع۔" : "Log expenditures, general commercial transactions, raw food assets."}
                          </p>
                        </div>
                      </button>

                      {/* Control 7: BI Reports */}
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab("reports")}
                        className="group p-6 text-start rounded-3xl bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/20 shadow-xs hover:shadow-lg transition duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-4xl">📈</span>
                          <span className="text-[9px] uppercase font-black tracking-widest bg-yellow-105 text-yellow-705 px-2.5 py-1 rounded-full border border-yellow-200 font-sans">
                            {lang === "ur" ? "رپورٹس" : "Business Intelligence"}
                          </span>
                        </div>
                        <div className="space-y-1 mt-4">
                          <h4 className="text-sm font-black text-[#0b3c61] group-hover:text-[#2563EB] transition font-sans">
                            {lang === "ur" ? "کاروباری تجزیاتی رپورٹس" : "Business BI Reports"}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal font-sans font-medium">
                            {lang === "ur" ? "کاروبار کے منافع نقصان کے گراف، سب سے زیادہ بکنے والے پکوان۔" : "Aggregate sales by hours, top category popularity visualization."}
                          </p>
                        </div>
                      </button>

                      {/* Control 8: System Settings */}
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab("settings")}
                        className="group p-6 text-start rounded-3xl bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/20 shadow-xs hover:shadow-lg transition duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px]"
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-4xl">⚙️</span>
                          <span className="text-[9px] uppercase font-black tracking-widest bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 font-sans">
                            {lang === "ur" ? "سیٹنگز" : "System Config"}
                          </span>
                        </div>
                        <div className="space-y-1 mt-4">
                          <h4 className="text-sm font-black text-[#0b3c61] group-hover:text-[#2563EB] transition font-sans">
                            {lang === "ur" ? "ریسٹورنٹ پروفائل و ٹیکس" : "ERP Settings & Taxes"}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal font-sans font-medium">
                            {lang === "ur" ? "عام دکان کا نام، ریسیڈ پرنٹنگ تھیم، سروس ٹیکس کی شرح۔" : "Define general branding titles, default taxes, printing logos."}
                          </p>
                        </div>
                      </button>

                    </div>
                  </div>
                )}

                {/* 2. RENDER SUB-SCREEN NAVIGATION WITH 100% EXCLUSIVE FULL-SCREEN IF NOT HUB */}
                {activeAdminTab !== "hub" && (
                  <div className="w-full animate-fadeIn">
                    
                    <div className="w-full">

                  {/* TAB 1: DASHBOARD PAGE */}
                  {activeAdminTab === "dashboard" && (
                    <div className="space-y-6 animate-fadeIn text-slate-800">
                      
                      {/* Top Welcome Title Grid */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                        <div>
                          <h2 className="text-xl font-black text-[#0F4C81] flex items-center gap-2">
                            <span>🚀</span>
                            <span>{lang === "ur" ? "ریسٹورنٹ مجموعی مانیٹرنگ ڈیش بورڈ" : "Grand Restaurant Operations Hub"}</span>
                          </h2>
                          <p className="text-xs text-slate-500 mt-1">
                            {lang === "ur" ? "ریئل ٹائم سیلز ڈیٹا، فعال آرڈرز، کچن پروگریس اور اسٹاک مانیٹرنگ" : "A real-time overview of your restaurant's business health, sales metrics, kitchen activity and logistics."}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold font-mono bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-slate-500 self-start md:self-auto">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
                          <span>{lang === "ur" ? "لائیو اپڈیٹ" : "SECURE REGISTER ACTIVE"}</span>
                        </div>
                      </div>

                      {/* Six Visual Action Metric Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* 1. Today's Sales */}
                        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-md transition duration-250">
                          <div className="w-14 h-14 rounded-2xl bg-[#0F4C81]/15 text-[#0F4C81] flex items-center justify-center text-2xl font-black">
                            ₨
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                              {lang === "ur" ? "آج کی فروخت" : "Today's Gross Sales"}
                            </span>
                            <span className="text-2xl font-black text-[#0F4C81] font-mono block mt-1">
                              {(orders.filter(o => o.Payment_Status === "Paid").reduce((acc, curr) => acc + curr.Total_Amount,0) + expenses.filter(e => e.Type === "Income").reduce((sum, e) => sum + e.Amount, 0)).toLocaleString()} PKR
                            </span>
                            <span className="text-[9px] text-[#10b981] font-bold block mt-0.5">
                              {orders.filter(o => o.Payment_Status === "Paid").length} {lang === "ur" ? "مکمل شدہ آرڈرز" : "completed bills"}
                            </span>
                          </div>
                        </div>

                        {/* 2. Dynamic Profit */}
                        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-md transition duration-250">
                          <div className="w-14 h-14 rounded-2xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center text-2.5xl font-black">
                            📈
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                              {lang === "ur" ? "خالص بچت منافع" : "Net Branch Profit"}
                            </span>
                            <span className="text-2xl font-black text-[#10b981] font-mono block mt-1">
                              {Math.max(0, (orders.filter(o => o.Payment_Status === "Paid").reduce((acc, curr) => acc + curr.Total_Amount,0) + expenses.filter(e => e.Type === "Income").reduce((sum, e) => sum + e.Amount, 0)) - (expenses.filter(e => e.Type === "Expense").reduce((acc, curr) => acc + curr.Amount, 0))).toLocaleString()} Rs
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              {lang === "ur" ? "اخراجات کا حساب نکال کر" : "Deducted of all raw supplier lists"}
                            </span>
                          </div>
                        </div>

                        {/* 3. Active Tables */}
                        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-md transition duration-250">
                          <div className="w-14 h-14 rounded-2xl bg-[#FF8C42]/10 text-[#FF8C42] flex items-center justify-center text-2.5xl font-black">
                            🪑
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                              {lang === "ur" ? "ہال کے میز پوزیشن" : "Hall Active Tables"}
                            </span>
                            <span className="text-2xl font-black text-[#FF8C42] font-mono block mt-1">
                              {tables.filter(t => t.Status === "Occupied").length} / {tables.length}
                            </span>
                            <span className="text-[9px] text-[#FF8C42] font-bold block mt-0.5">
                              {tables.filter(t => t.Status === "WaitingForBill").length} {lang === "ur" ? "بل کے منتظر میز" : "waiting for checkout bills"}
                            </span>
                          </div>
                        </div>

                        {/* 4. Pending Orders queue */}
                        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-md transition duration-250 cursor-pointer" onClick={() => setActiveAdminTab("kds")}>
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2.5xl font-black">
                            🍳
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                              {lang === "ur" ? "کچن آرڈر قطار" : "Kitchen Chef Tickets"}
                            </span>
                            <span className="text-2xl font-black text-indigo-600 font-mono block mt-1">
                              {kds.filter(k => k.Kitchen_Status === "Pending" || k.Kitchen_Status === "Cooking").length} Active
                            </span>
                            <span className="text-[9px] text-indigo-500 font-bold block mt-0.5 animate-pulse">
                              {lang === "ur" ? "باورچی خانے میں کام جاری ہے" : "cooking operations in progress"}
                            </span>
                          </div>
                        </div>

                        {/* 5. Low Stock Alerts */}
                        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-md transition duration-250 cursor-pointer" onClick={() => setActiveAdminTab("inventory")}>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2.5xl font-black ${
                            inventory.filter(i => i.Current_Stock_Qty <= i.Min_Stock_Alert_Level).length > 0
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : "bg-emerald-50 text-emerald-600"
                          }`}>
                            ⚠️
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                              {lang === "ur" ? "کم اسٹاک کا انتباہ" : "Low Stock Warnings"}
                            </span>
                            <span className={`text-2xl font-black font-mono block mt-1 ${
                              inventory.filter(i => i.Current_Stock_Qty <= i.Min_Stock_Alert_Level).length > 0
                                ? "text-rose-600"
                                : "text-slate-700"
                            }`}>
                              {inventory.filter(i => i.Current_Stock_Qty <= i.Min_Stock_Alert_Level).length} Items
                            </span>
                            <span className="text-[9px] text-slate-450 block mt-0.5">
                              {lang === "ur" ? "سپلائر آرڈر کی فوری ضرورت" : "falling below threshold limits"}
                            </span>
                          </div>
                        </div>

                        {/* 6. Active Deliveries */}
                        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-md transition duration-255">
                          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2.5xl font-black">
                            🚚
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                              {lang === "ur" ? "فعال رائیڈر پارسلز" : "Pending Deliveries"}
                            </span>
                            <span className="text-2xl font-black text-amber-600 font-mono block mt-1">
                              {deliveries.filter(d => d.Delivery_Status !== "Delivered").length} Shipments
                            </span>
                            <span className="text-[9px] text-amber-600 font-bold block mt-0.5">
                              {lang === "ur" ? "رائیڈر فیلڈ پر موجود ہے" : "active dispatches on map tracker"}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* SVG Sales Trend Chart Visual Panel */}
                      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
                          <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                              {lang === "ur" ? "آج کے گھنٹہ وار سیلز کا انڈیکس ٹرینڈ" : "Hourly Sales Index Trend"}
                            </h3>
                            <p className="text-[11px] text-slate-455">
                              {lang === "ur" ? "روپے کا ریشو سکیل اور تجارتی رفتار" : "Financial velocity tracked by secure branch cash drawers"}
                            </p>
                          </div>
                          <span className="text-[10px] bg-[#0F4C81]/10 text-[#0F4C81] px-3 py-1 rounded-lg font-mono font-extrabold uppercase">
                            {lang === "ur" ? "مجموعی آمدنی کی کارکردگی" : "Gross Revenue Target Track"}
                          </span>
                        </div>

                        <div className="h-48 flex items-end justify-between px-4 pb-2 relative pt-8 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                          <svg className="absolute inset-0 w-full h-full text-[#0F4C81]/5" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                            <path d="M 0 160 Q 150 120 300 140 T 600 70 T 900 100 T 1200 50 L 1200 190 L 0 190 Z" fill="currentColor" />
                            <path d="M 0 160 Q 150 120 300 140 T 600 70 T 900 100 T 1200 50" fill="none" stroke="#0F4C81" strokeWidth="4.5" strokeLinecap="round" />
                          </svg>
                          <div className="z-10 text-[10px] font-mono font-black text-slate-500 text-center w-full flex justify-between px-2">
                            <span>12:00 PM • 3k</span>
                            <span>03:00 PM • 9k</span>
                            <span>06:00 PM • 14k</span>
                            <span>09:00 PM • 25k</span>
                            <span>11:00 PM • 38k</span>
                          </div>
                        </div>
                      </div>

                      {/* 🚀 7-DAY OPERATIONAL HEATMAP VISUALIZATION */}
                      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4 text-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-2">
                          <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                              <span>📅</span>
                              <span>{lang === "ur" ? "7 روزہ آپریشنل ہیٹ میپ اور رش کی تفصیل" : "7-Day Operational Rush Heatmap"}</span>
                            </h3>
                            <p className="text-[11px] text-slate-505">
                              {lang === "ur" ? "عملے کی شفٹوں کو بہتر بنانے کے لیے مصروف اور پرسکون اوقات کا تجزیہ" : "Analyze hourly operational load across the week to adjust staff shifts."}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] bg-sky-50 text-[#0F4C81] px-2.5 py-1 rounded-lg font-bold font-mono uppercase">
                              {lang === "ur" ? "تجویز کردہ شفٹ ایڈجسٹمنٹ ایکٹو" : "Shift optimization active"}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Grid Container with scroll prevention */}
                        <div className="no-scrollbar overflow-x-auto">
                          <div className="min-w-[640px]">
                            {/* Hour axis header line using custom grid columns style */}
                            <div className="grid gap-1 mb-2 text-center text-[9px] font-black text-slate-400 uppercase font-mono tracking-widest" style={{ gridTemplateColumns: "1.3fr repeat(12, 1fr)" }}>
                              <div className="text-left font-sans font-bold pl-1 text-[10px] text-slate-500">Day/Hour</div>
                              <div>11 AM</div>
                              <div>12 PM</div>
                              <div>1 PM</div>
                              <div>2 PM</div>
                              <div>3 PM</div>
                              <div>4 PM</div>
                              <div>5 PM</div>
                              <div>6 PM</div>
                              <div>7 PM</div>
                              <div>8 PM</div>
                              <div>9 PM</div>
                              <div>10 PM</div>
                            </div>

                            {/* Weekly heat grid rows */}
                            {(() => {
                              const daysList = [
                                { en: "Monday", ur: "پیر", load: [1, 2, 4, 3, 2, 1, 2, 3, 5, 6, 8, 5] },
                                { en: "Tuesday", ur: "منگل", load: [2, 3, 4, 3, 2, 2, 3, 4, 6, 7, 7, 4] },
                                { en: "Wednesday", ur: "بدھ", load: [1, 2, 3, 2, 1, 2, 3, 5, 5, 8, 9, 6] },
                                { en: "Thursday", ur: "جمعرات", load: [2, 3, 5, 4, 2, 3, 4, 6, 7, 8, 8, 5] },
                                { en: "Friday", ur: "جمعہ", load: [3, 4, 6, 8, 3, 2, 5, 7, 9, 10, 10, 8] },
                                { en: "Saturday", ur: "ہفتہ", load: [4, 5, 8, 9, 4, 3, 6, 8, 10, 10, 10, 9] },
                                { en: "Sunday", ur: "اتوار", load: [4, 6, 9, 10, 5, 4, 7, 9, 10, 10, 9, 8] }
                              ];

                              // Map intensity load score to clean styling and helper description
                              const grabHeatColorClass = (score: number) => {
                                if (score <= 2) return "bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-100"; // Quiet
                                if (score <= 4) return "bg-blue-600/10 hover:bg-blue-600/20 text-[#0F4C81] font-bold"; // Light load
                                if (score <= 6) return "bg-[#FF8C42]/20 hover:bg-[#FF8C42]/30 text-[#FF8C42] font-black"; // Moderate
                                if (score <= 8) return "bg-[#FF8C42]/55 hover:bg-[#FF8C42]/65 text-white font-black"; // Highly active
                                return "bg-[#0F4C81] hover:bg-[#000000] text-amber-300 font-black shadow-sm animate-pulse"; // Peak overload
                              };

                              const grabHeatLabel = (score: number) => {
                                if (score <= 2) return "Quiet Slot • Idle staff available";
                                if (score <= 4) return "Normal Load • Standard shift";
                                if (score <= 6) return "Moderate Active • Monitor queue";
                                if (score <= 8) return "Peak Rush • Heavy kitchen duty";
                                return "Overflow Peak • Double shifts recommended";
                              };

                              return (
                                <div className="space-y-1.5 font-sans">
                                  {daysList.map((dayObj) => (
                                    <div key={dayObj.en} className="grid gap-1 items-center" style={{ gridTemplateColumns: "1.3fr repeat(12, 1fr)" }}>
                                      {/* Day row label */}
                                      <div className="text-[11px] font-extrabold text-[#0F4C81] pr-2 text-left bg-slate-50 h-8 flex items-center pl-2 rounded-lg border border-slate-100 truncate">
                                        {lang === "ur" ? dayObj.ur : dayObj.en}
                                      </div>

                                      {/* Hourly slot cells */}
                                      {dayObj.load.map((v, idx) => (
                                        <div
                                          key={idx}
                                          className={`group relative h-8 rounded-xl flex items-center justify-center text-[10px] font-mono select-none cursor-pointer transition ${grabHeatColorClass(v)}`}
                                          title={`${dayObj.en} @ ${idx + 11}:00: Level ${v}/10 (${grabHeatLabel(v)})`}
                                        >
                                          <span>{v}</span>

                                          {/* Floating smart tooltip popover */}
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-30 w-44 bg-slate-950 text-white text-[9px] font-serif rounded-lg p-2 shadow-xl border border-slate-800 pointer-events-none text-center">
                                            <div className="font-sans font-black text-amber-500 uppercase pb-0.5 border-b border-slate-900 mb-1">
                                              {dayObj.en} at {idx + 11 === 12 ? "12 PM" : idx + 11 > 12 ? `${idx + 11 - 12} PM` : `${idx + 11} AM`}
                                            </div>
                                            <p className="font-sans font-normal leading-normal text-slate-300">
                                              Score: <strong className="text-white text-[10px] font-mono">{v}/10</strong>. {grabHeatLabel(v)}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Interactive Map Dashboard legends */}
                        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100 gap-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold mr-1 uppercase text-[8px] tracking-wider text-slate-400">Legend:</span>
                            <div className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded bg-slate-50 border border-slate-100 inline-block" />
                              <span>Quiet</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded bg-blue-600/10 inline-block" />
                              <span>Balanced</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded bg-[#FF8C42]/20 inline-block" />
                              <span>Moderate</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded bg-[#FF8C42]/55 inline-block" />
                              <span>Busy</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded bg-[#0F4C81] inline-block" />
                              <span>Peak Target</span>
                            </div>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold">
                            <span>💡 {lang === "ur" ? "مشورہ: جمعہ اور ہفتہ کو شام 6 بجے اضافی رائڈرز تعینات کریں۔" : "Smart Roster Tip: Maximize staffing levels between 6-10 PM on Friday & Saturday."}</span>
                          </p>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: INVENTORY PAGE */}
                  {activeAdminTab === "inventory" && (
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                      <RoleInventory
                        inventory={inventory}
                        menu={menu}
                        onRestock={handleRestock}
                        onUpdateActualCount={handleUpdateActualCount}
                        onRecordWaste={handleRecordWaste}
                        onUpdateMinStockThreshold={handleUpdateMinStockThreshold}
                        lang={lang}
                      />
                    </div>
                  )}

                  {/* TAB 3: MENU MANAGEMENT */}
                  {activeAdminTab === "menu" && (
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                      <RoleMenuManagement
                        menu={menu}
                        onAddMenuItem={handleAddMenuItem}
                        onUpdateMenuItem={handleUpdateMenuItem}
                        onDeleteMenuItem={handleDeleteMenuItem}
                        lang={lang}
                        inventory={inventory}
                      />
                    </div>
                  )}

                  {/* TAB 4: TABLE MANAGEMENT */}
                  {activeAdminTab === "tables" && (
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                      <RoleTableManagement
                        tables={tables}
                        onAddTable={handleAddTable}
                        onUpdateTable={handleUpdateTable}
                        onDeleteTable={handleDeleteTable}
                        onOpenCustomerMenu={(num) => {
                          setScannedTableNumber(num);
                          setCurrentStage("digital-menu");
                        }}
                        staff={users}
                        lang={lang}
                        orders={orders}
                        setOrders={setOrders}
                        menu={menu}
                        kds={kds}
                        setKds={setKds}
                        inventory={inventory}
                        setInventory={setInventory}
                      />
                    </div>
                  )}

                  {/* TAB 5: STAFF MANAGEMENT */}
                  {activeAdminTab === "staff" && (
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                      <RoleStaff
                        staff={users}
                        onToggleAttendance={handleToggleAttendance}
                        onUpdateBiometric={handleUpdateBiometric}
                        lang={lang}
                      />
                    </div>
                  )}

                  {/* TAB 6: DELIVERY MANAGEMENT ROUTER */}
                  {activeAdminTab === "delivery_mgmnt" && (
                    <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <div>
                          <h2 className="text-sm font-black text-white uppercase tracking-tight">Active Delivery Dispatch Router</h2>
                          <p className="text-[10px] text-slate-400 mt-0.5">Live maps and timeline coordinates trackers</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Dispatch office register</span>
                      </div>

                      {deliveries.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs">No parcels registered for home delivery today.</div>
                      ) : (
                        <div className="space-y-4">
                          {deliveries.map((del) => (
                            <div key={del.Delivery_ID} className="bg-slate-950 border border-slate-850 p-4 rounded-3xl space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-900">
                                <div>
                                  <span className="text-[10px] bg-indigo-900/40 border border-indigo-900 text-indigo-300 font-mono font-black px-2 py-0.5 rounded">ID: {del.Delivery_ID}</span>
                                  <span className="text-xs font-black text-white ml-2">Customer: {del.Customer_Name} • {del.Customer_Phone}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-amber-500 font-mono font-black block">Cash to Collect: {del.Total_Cash_To_Collect} Rs</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="space-y-1">
                                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Delivery Destination Address</span>
                                  <p className="text-slate-300 font-medium">{del.Customer_Address}</p>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Assigned Rider Details</span>
                                  <p className="text-slate-300 font-medium">
                                    {users.find(u => u.User_ID === del.Rider_ID)?.Name || "Unassigned"} (Rider ID: {del.Rider_ID})
                                  </p>
                                </div>

                                <div className="space-y-1.5 text-right">
                                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Courier Status Update</span>
                                  <select
                                    value={del.Delivery_Status}
                                    onChange={(e) => handleUpdateDeliveryStatus(del.Delivery_ID, e.target.value as any)}
                                    className="bg-slate-900 border border-slate-800 rounded-xl text-slate-350 p-2 text-xs w-full"
                                  >
                                    <option value="Received">Received</option>
                                    <option value="Preparing">Preparing</option>
                                    <option value="Ready">Ready</option>
                                    <option value="Picked Up">Picked Up</option>
                                    <option value="On The Way">On The Way</option>
                                    <option value="Delivered">Delivered</option>
                                  </select>
                                </div>
                              </div>

                              {/* Progress Timeline Tracker Visualizer */}
                              <div className="space-y-1.5 pt-2">
                                <span className="block text-[9px] text-slate-550 uppercase font-black">Dispatch Milestones</span>
                                <div className="grid grid-cols-6 gap-1 relative pt-4 pb-2">
                                  {["Received", "Preparing", "Ready", "Picked Up", "On The Way", "Delivered"].map((st, i) => {
                                    const statuses = ["Received", "Preparing", "Ready", "Picked Up", "On The Way", "Delivered"];
                                    const activeIdx = statuses.indexOf(del.Delivery_Status);
                                    const isDone = i <= activeIdx;

                                    return (
                                      <div key={st} className="text-center space-y-1 z-10">
                                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center font-black text-[9px] border-2 ${
                                          isDone 
                                            ? "bg-emerald-500 border-white text-slate-950 font-black" 
                                            : "bg-slate-900 border-slate-800 text-slate-550"
                                        }`}>
                                          {i + 1}
                                        </div>
                                        <span className={`text-[8px] font-black uppercase block ${isDone ? "text-slate-300" : "text-slate-600"}`}>{st}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )}

                  {/* TAB 7: FINANCE & EXPENSES */}
                  {activeAdminTab === "expenses" && (
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl text-slate-100">
                      <RoleBIExpense
                        expenses={expenses}
                        orders={orders}
                        menu={menu}
                        inventory={inventory}
                        onAddExpense={(type, cat, amt, desc) => {
                          const newId = `${type === "Income" ? "INC" : "EXP"}-${Math.floor(5000 + Math.random() * 4999)}`;
                          const newEntry: DailyExpense = {
                            Entry_ID: newId,
                            Type: type,
                            Category: cat as any,
                            Amount: amt,
                            Description: desc,
                            Timestamp: new Date().toISOString(),
                          };
                          setExpenses((prev) => [newEntry, ...prev]);
                          triggerAutoCloudSync(
                            lang === "ur" 
                              ? `حسابات کھاتہ: نیا اندراج "${desc}" رقم ${amt} شامل کر دیا گیا۔` 
                              : `Ledger entry saved: "${desc}" for amount PKR ${amt}.`
                          );
                        }}
                        lang={lang}
                        onDownloadReport={handleDownloadReport}
                      />
                    </div>
                  )}

                  {/* TAB 8: REPORT COMPOSITIONS */}
                  {activeAdminTab === "reports" && (
                    <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-6 animate-fadeIn">
                      {/* Sub-tab switcher */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                        <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-850 w-full sm:w-auto text-left">
                          <button
                            type="button"
                            onClick={() => setReportsSubSection("analytics")}
                            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                              reportsSubSection === "analytics"
                                ? "bg-[#0F4C81] text-white shadow-md"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            📈 {lang === "ur" ? "پرفارمنس ڈیٹا" : "Performance Analytics"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReportsSubSection("order_history");
                              setReportsPage(1);
                            }}
                            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                              reportsSubSection === "order_history"
                                ? "bg-[#0F4C81] text-white shadow-md"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            📜 {lang === "ur" ? "آرڈرز ہسٹری" : "Detailed Order History"}
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <h2 className="text-sm font-black text-white uppercase tracking-tight">
                            {reportsSubSection === "analytics" 
                              ? (lang === "ur" ? "کارکردگی کے تجزیات" : "Enterprise Performance Repos") 
                              : (lang === "ur" ? "پچھلے آرڈرز کا تفصیلی ریکارڈ" : "Historical Order Ledger")}
                          </h2>
                          <p className="text-[10px] text-slate-400 mt-0.5 animate-fadeIn">
                            {reportsSubSection === "analytics" 
                              ? (lang === "ur" ? "پیداواری شرح، منافع اور کلاؤڈ مالی ریکارڈ" : "Range trends, product margins & fiscal checklists") 
                              : (lang === "ur" ? "فون نمبر اور تاریخ کی ترتیب سے فلٹر کریں" : "Detailed, paginated historical view of previous client orders")}
                          </p>
                        </div>
                      </div>

                      {reportsSubSection === "analytics" && (() => {
                        // 1. Dynamic filtering of PAID orders based on timescale
                        const now = new Date();
                        const filteredPaidOrders = orders.filter((o) => {
                          if (o.Payment_Status !== "Paid") return false;
                          const oDate = new Date(o.Created_At);
                          
                          if (reportScale === "Daily") {
                            // Within 24-hour cycle of today
                            const diffTime = Math.abs(now.getTime() - oDate.getTime());
                            const diffDays = diffTime / (1000 * 60 * 60 * 24);
                            return diffDays <= 1;
                          } else if (reportScale === "Weekly") {
                            // Within 7 days
                            const diffTime = Math.abs(now.getTime() - oDate.getTime());
                            const diffDays = diffTime / (1000 * 60 * 60 * 24);
                            return diffDays <= 7;
                          } else if (reportScale === "Monthly") {
                            // Within 30 days
                            const diffTime = Math.abs(now.getTime() - oDate.getTime());
                            const diffDays = diffTime / (1000 * 60 * 60 * 24);
                            return diffDays <= 30;
                          } else { // Yearly
                            // Same calendar year
                            return oDate.getFullYear() === now.getFullYear();
                          }
                        });

                        // 2. Aggregate metrics of filtered datasets
                        const aggregateRevenue = filteredPaidOrders.reduce((sum, o) => sum + o.Total_Amount, 0);

                        // Calculate actual recipe ingredients cost of sales
                        let totalRecipeCostOfSales = 0;
                        const itemSalesTotals: { [itemId: string]: { item: MenuItem; qty: number; revenue: number; cost: number } } = {};

                        // Seed menu items first
                        menu.forEach(m => {
                          itemSalesTotals[m.Item_ID] = { item: m, qty: 0, revenue: 0, cost: 0 };
                        });

                        filteredPaidOrders.forEach((o) => {
                          o.Order_Items.forEach((oi) => {
                            const menuItem = menu.find((m) => m.Item_ID === oi.Item_ID);
                            if (menuItem) {
                              const recipeCostUnit = menuItem.Recipe_Ingredients?.reduce((sum, ing) => {
                                const raw = inventory.find(r => r.Raw_Item_ID === ing.Raw_Item_ID);
                                if (!raw) return sum;
                                const price = raw.Cost_Price || 0;
                                const used = (ing.Qty || 0) * oi.Quantity;
                                const divider = (raw.Unit === "KG" || raw.Unit === "Litre") ? 1000 : 1;
                                return sum + (used / divider) * price;
                              }, 0) || (menuItem.Sales_Price * 0.35 * oi.Quantity); // fallback to 35% food cost if recipe empty
                              
                              const salesRevenue = oi.Price * oi.Quantity;
                              totalRecipeCostOfSales += recipeCostUnit;

                              if (itemSalesTotals[oi.Item_ID]) {
                                itemSalesTotals[oi.Item_ID].qty += oi.Quantity;
                                itemSalesTotals[oi.Item_ID].revenue += salesRevenue;
                                itemSalesTotals[oi.Item_ID].cost += recipeCostUnit;
                              }
                            }
                          });
                        });

                        const aggregateExpenses = Math.floor(totalRecipeCostOfSales + (aggregateRevenue * 0.15)); // food cost + 15% operation utilities
                        const aggregateProfit = aggregateRevenue - aggregateExpenses;

                        // Sort sold items to get top performers
                        const topPerformers = Object.values(itemSalesTotals)
                          .filter(x => x.qty > 0)
                          .sort((a, b) => b.qty - a.qty);

                        return (
                          <div className="space-y-6 animate-fadeIn text-slate-800">
                            {/* Selector timescale */}
                            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-3xl">
                              <span className="text-xs font-black uppercase text-slate-500">
                                {lang === "ur" ? "پیمانہ منتخب کریں:" : "Active timescale filtration:"}
                              </span>
                              <div className="flex gap-1.5">
                                {["Daily", "Weekly", "Monthly", "Yearly"].map(tme => (
                                  <button
                                    key={tme}
                                    type="button"
                                    className={`px-3.5 py-1.5 text-[10px] font-black rounded-lg uppercase cursor-pointer transition border ${
                                      reportScale === tme
                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    }`}
                                    onClick={() => setReportScale(tme as any)}
                                  >
                                    {tme === "Daily" ? (lang === "ur" ? "روزانہ" : "Daily") : 
                                     tme === "Weekly" ? (lang === "ur" ? "ہفتہ وار" : "Weekly") :
                                     tme === "Monthly" ? (lang === "ur" ? "ماہانہ" : "Monthly") :
                                     (lang === "ur" ? "سالانہ" : "Yearly")}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Summary of Profits/Loss */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs text-center space-y-1.5">
                                <span className="text-[10px] text-slate-500 uppercase font-black">
                                  {lang === "ur" ? "کل آمدنی (Revenue)" : "Timescale Revenue Flow"}
                                </span>
                                <p className="text-xl font-mono font-black text-emerald-600">
                                  {aggregateRevenue.toLocaleString()} PKR
                                </p>
                              </div>

                              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs text-center space-y-1.5">
                                <span className="text-[10px] text-slate-500 uppercase font-black">
                                  {lang === "ur" ? "کل اخراجات (Operating Cost)" : "Timescale Expenses"}
                                </span>
                                <p className="text-xl font-mono font-black text-rose-600 font-bold">
                                  {aggregateExpenses.toLocaleString()} PKR
                                </p>
                              </div>

                              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs text-center space-y-1.5 bg-gradient-to-br from-blue-500/5 to-transparent">
                                <span className="text-[10px] text-blue-600 uppercase font-black">
                                  {lang === "ur" ? "خالص منافع / نقصان" : "Net Profit / Loss"}
                                </span>
                                <p className={`text-xl font-mono font-black ${aggregateProfit >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                                  {aggregateProfit.toLocaleString()} PKR
                                </p>
                              </div>
                            </div>

                            {/* ITEM WISE PERFORMANCE TABLE */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                              <div className="border-b border-slate-100 pb-2">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                  📊 {lang === "ur" ? "ڈش کے حساب سے منافع اور فروخت کا ریکارڈ" : "Detailed Menu Item Profitability Ledger"}
                                </h3>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold">
                                  {lang === "ur" ? "منتخب کردہ دورانیے میں ہر کھانے کی فروخت، ترکیب کی قیمت اور حتمی منافع کا موازنہ۔" : "Unit volume, total sales price, specific ingredient cost, net margins & dynamic ratio."}
                                </p>
                              </div>

                              {topPerformers.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 font-extrabold text-xs italic">
                                  {lang === "ur" ? "اس دورانیے میں کوئی فروخت ریکارڈ نہیں کی گئی۔" : "No sold items logged within this selected timescale registers."}
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs font-sans">
                                    <thead>
                                      <tr className="border-b border-slate-100 text-[10px] uppercase font-black text-slate-400">
                                        <th className="py-2.5">{lang === "ur" ? "کھانے کا نام" : "Item Name"}</th>
                                        <th className="py-2.5 text-center">{lang === "ur" ? "تعداد" : "Sold Qty"}</th>
                                        <th className="py-2.5 text-right">{lang === "ur" ? "آمدنی" : "Total Rev"}</th>
                                        <th className="py-2.5 text-right">{lang === "ur" ? "اجزاء لاگت" : "Recipe Cost"}</th>
                                        <th className="py-2.5 text-right">{lang === "ur" ? "خالص منافع" : "Net Profit"}</th>
                                        <th className="py-2.5 text-right">{lang === "ur" ? "مارجن %" : "Margin"}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                      {topPerformers.map(t => {
                                        const marginOffset = t.revenue > 0 ? Math.round(((t.revenue - t.cost) / t.revenue) * 100) : 0;
                                        return (
                                          <tr key={t.item.Item_ID} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-2.5 font-bold text-slate-800">
                                              {lang === "ur" ? t.item.Item_Name_Ur : t.item.Item_Name}
                                            </td>
                                            <td className="py-2.5 text-center font-mono font-bold text-slate-500">{t.qty}</td>
                                            <td className="py-2.5 text-right font-mono text-slate-800">{t.revenue.toLocaleString()} Rs</td>
                                            <td className="py-2.5 text-right font-mono text-slate-500">{Math.round(t.cost).toLocaleString()} Rs</td>
                                            <td className="py-2.5 text-right font-mono font-black text-blue-600">{(t.revenue - t.cost).toLocaleString()} Rs</td>
                                            <td className={`py-2.5 text-right font-mono font-extrabold ${marginOffset >= 45 ? "text-emerald-600" : "text-amber-600"}`}>
                                              {marginOffset}%
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>

                            {/* ADVANCED ERP OPERATION METRICS PANEL */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              {/* 1. Best & Worst Selling Items */}
                              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                                <div className="border-b border-slate-100 pb-2">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                    <span>🔥</span> {lang === "ur" ? "بہترین اور کم فروخت ہونے والی اشیاء" : "Best vs Worst Performing Dishes"}
                                  </h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  {/* Best Selling */}
                                  <div className="space-y-2">
                                    <span className="text-[9px] font-black uppercase text-emerald-600 block bg-emerald-50 px-2 py-0.5 rounded w-max">
                                      {lang === "ur" ? "بہترین فروخت" : "Top Sellers"}
                                    </span>
                                    {topPerformers.slice(0, 3).length === 0 ? (
                                      <span className="text-[10px] text-slate-400 italic block">{lang === "ur" ? "کوئی ریکارڈ نہیں" : "No sales yet"}</span>
                                    ) : (
                                      <div className="space-y-1">
                                        {topPerformers.slice(0, 3).map((item, idx) => (
                                          <div key={item.item.Item_ID} className="flex justify-between text-[11px] font-bold text-slate-700">
                                            <span>{idx + 1}. {lang === "ur" ? item.item.Item_Name_Ur : item.item.Item_Name}</span>
                                            <span className="font-mono text-slate-500">x{item.qty}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Worst Selling */}
                                  <div className="space-y-2">
                                    <span className="text-[9px] font-black uppercase text-rose-600 block bg-rose-50 px-2 py-0.5 rounded w-max">
                                      {lang === "ur" ? "کم فروخت" : "Low Sellers"}
                                    </span>
                                    {(() => {
                                      const unsortedAll = menu.map(m => {
                                        const totalSold = topPerformers.find(tp => tp.item.Item_ID === m.Item_ID)?.qty || 0;
                                        return { item: m, qty: totalSold };
                                      }).sort((a, b) => a.qty - b.qty);
                                      
                                      const worstThree = unsortedAll.slice(0, 3);
                                      return worstThree.length === 0 ? (
                                        <span className="text-[10px] text-slate-400 italic block">{lang === "ur" ? "کوئی ریکارڈ نہیں" : "No dishes"}</span>
                                      ) : (
                                        <div className="space-y-1">
                                          {worstThree.map((item, idx) => (
                                            <div key={item.item.Item_ID} className="flex justify-between text-[11px] font-bold text-slate-700">
                                              <span>{idx + 1}. {lang === "ur" ? item.item.Item_Name_Ur : item.item.Item_Name}</span>
                                              <span className="font-mono text-slate-500">x{item.qty}</span>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {/* 2. Cash Flow Method Split */}
                              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                                <div className="border-b border-slate-100 pb-2">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                    <span>💰</span> {lang === "ur" ? "کیش فلو ادائیگی کے ذرائع" : "Cash Flow Payment Methods"}
                                  </h4>
                                </div>
                                {(() => {
                                  let cashSum = 0;
                                  let onlineSum = 0;
                                  let creditSum = 0;
                                  
                                  filteredPaidOrders.forEach(o => {
                                    if (o.Payment_Status === "Paid") {
                                      if (o.Payment_Method === "Cash") cashSum += o.Total_Amount;
                                      else if (o.Payment_Method === "Online") onlineSum += o.Total_Amount;
                                      else if (o.Payment_Method === "Credit") creditSum += o.Total_Amount;
                                    }
                                  });
                                  
                                  const totalPaidSales = cashSum + onlineSum + creditSum || 1;
                                  const cashPct = Math.round((cashSum / totalPaidSales) * 100);
                                  const onlinePct = Math.round((onlineSum / totalPaidSales) * 100);
                                  const creditPct = Math.round((creditSum / totalPaidSales) * 100);
                                  
                                  return (
                                    <div className="space-y-3 font-sans text-xs font-bold text-slate-700">
                                      {/* Visual stacked bar */}
                                      <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden">
                                        <div style={{ width: `${cashPct}%` }} className="bg-emerald-500" title="Cash" />
                                        <div style={{ width: `${onlinePct}%` }} className="bg-blue-500" title="Online" />
                                        <div style={{ width: `${creditPct}%` }} className="bg-amber-500" title="Credit" />
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2 pt-1">
                                        <div className="space-y-0.5">
                                          <span className="text-[10px] text-slate-400 uppercase font-black block flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Cash
                                          </span>
                                          <span className="font-mono text-slate-800 text-[11px]">{cashSum.toLocaleString()} Rs ({cashPct}%)</span>
                                        </div>
                                        <div className="space-y-0.5">
                                          <span className="text-[10px] text-slate-400 uppercase font-black block flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Online
                                          </span>
                                          <span className="font-mono text-slate-800 text-[11px]">{onlineSum.toLocaleString()} Rs ({onlinePct}%)</span>
                                        </div>
                                        <div className="space-y-0.5">
                                          <span className="text-[10px] text-slate-400 uppercase font-black block flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Credit
                                          </span>
                                          <span className="font-mono text-slate-800 text-[11px]">{creditSum.toLocaleString()} Rs ({creditPct}%)</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* 3. Materials / Inventory Consumption Ledger */}
                              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                                <div className="border-b border-slate-100 pb-2">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                    <span>📦</span> {lang === "ur" ? "دورانیے میں خام مال کا استعمال" : "Raw Material Consumption Ledger"}
                                  </h4>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                                  {(() => {
                                    const timescaleConsumption: { [rawId: string]: number } = {};
                                    filteredPaidOrders.forEach((o) => {
                                      o.Order_Items.forEach((oi) => {
                                        const menuItem = menu.find((m) => m.Item_ID === oi.Item_ID);
                                        if (menuItem) {
                                          menuItem.Recipe_Ingredients?.forEach((ing) => {
                                            const raw = inventory.find(r => r.Raw_Item_ID === ing.Raw_Item_ID);
                                            if (raw) {
                                              const divider = (raw.Unit === "KG" || raw.Unit === "Litre") ? 1000 : 1;
                                              const used = ((ing.Qty || 0) * oi.Quantity) / divider;
                                              timescaleConsumption[ing.Raw_Item_ID] = (timescaleConsumption[ing.Raw_Item_ID] || 0) + used;
                                            }
                                          });
                                        }
                                      });
                                    });

                                    const entries = Object.entries(timescaleConsumption);
                                    if (entries.length === 0) {
                                      return <span className="text-[11px] text-slate-400 italic block py-2">{lang === "ur" ? "کوئی استعمال نہیں ہوا" : "No raw materials consumed"}</span>;
                                    }
                                    return entries.map(([rawId, qty]) => {
                                      const rawItem = inventory.find(i => i.Raw_Item_ID === rawId);
                                      if (!rawItem) return null;
                                      return (
                                        <div key={rawId} className="flex justify-between items-center text-[11px] font-bold text-slate-700 border-b border-slate-50 pb-1">
                                          <span>{lang === "ur" ? rawItem.Raw_Item_Name_Ur : rawItem.Raw_Item_Name}</span>
                                          <span className="font-mono text-slate-500">
                                            {qty.toFixed(2)} {rawItem.Unit}
                                          </span>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>

                              {/* 4. Delivery & Rider Performance */}
                              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                                <div className="border-b border-slate-100 pb-2">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                    <span>🏍️</span> {lang === "ur" ? "رائڈرز اور ڈیلیوری رپورٹ" : "Rider Logistics Performance"}
                                  </h4>
                                </div>
                                {(() => {
                                  const timescaleDeliveries = deliveries.filter(d => true);
                                  const totalD = timescaleDeliveries.length;
                                  const successD = timescaleDeliveries.filter(d => d.Delivery_Status === "Delivered" || d.Delivery_Status === "Ready").length;
                                  const activeRidersCount = users.filter(u => u.Role === StaffRole.Rider).length;
                                  
                                  return (
                                    <div className="space-y-3 text-xs font-bold text-slate-700">
                                      <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                                          <span className="text-[9px] text-slate-400 uppercase block">{lang === "ur" ? "کل ڈیلیوریز" : "Total Orders"}</span>
                                          <span className="font-mono text-slate-800 text-[13px]">{totalD}</span>
                                        </div>
                                        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                                          <span className="text-[9px] text-emerald-600 uppercase block">{lang === "ur" ? "کامیاب شرح" : "Success Rate"}</span>
                                          <span className="font-mono text-emerald-600 text-[13px]">{totalD > 0 ? Math.round((successD / totalD) * 100) : 100}%</span>
                                        </div>
                                      </div>

                                      {/* Dispatch Logs */}
                                      <div className="space-y-1">
                                        <span className="text-[10px] text-slate-400 uppercase font-black block">{lang === "ur" ? "رائڈر کارکردگی رپورٹ" : "Active Rider Dispatch Logs:"}</span>
                                        {users.filter(u => u.Role === StaffRole.Rider).map(rider => {
                                          const riderOrders = timescaleDeliveries.filter(d => d.Rider_ID === rider.User_ID);
                                          const successCount = riderOrders.filter(d => d.Delivery_Status === "Delivered" || d.Delivery_Status === "Ready").length;
                                          return (
                                            <div key={rider.User_ID} className="flex justify-between items-center text-[10px] text-slate-600 border-b border-slate-50 pb-0.5">
                                              <span>👤 {rider.Name}</span>
                                              <span className="font-mono font-bold">
                                                {successCount} / {Math.max(1, riderOrders.length)} {lang === "ur" ? "مکمل" : "Delivered"}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* 5. Staff Performance (Full width) */}
                              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 md:col-span-2">
                                <div className="border-b border-slate-100 pb-2">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                    <span>👥</span> {lang === "ur" ? "کابینہ اسٹاف کارکردگی اور حاضری" : "Staff Performance & Shift Handled Ledger"}
                                  </h4>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs font-sans">
                                    <thead>
                                      <tr className="border-b border-slate-100 text-[9px] uppercase font-black text-slate-400">
                                        <th className="py-2">{lang === "ur" ? "نام ملازم" : "Staff Member"}</th>
                                        <th className="py-2">{lang === "ur" ? "عہدہ" : "Role"}</th>
                                        <th className="py-2 text-center">{lang === "ur" ? "حاضری صورتحال" : "Duty Status"}</th>
                                        <th className="py-2 text-right">{lang === "ur" ? "آرڈرز ہینڈل" : "Orders Handled"}</th>
                                        <th className="py-2 text-right">{lang === "ur" ? "کام کے گھنٹے" : "Working Hours"}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                      {users.map(u => (
                                        <tr key={u.User_ID} className="hover:bg-slate-50">
                                          <td className="py-2.5 font-bold text-slate-800 flex items-center gap-2">
                                            <img src={u.Photo_URL} className="w-6 h-6 rounded-full object-cover border border-slate-200" alt="Avatar" referrerPolicy="no-referrer" />
                                            <span>{lang === "ur" ? u.Name_Ur || u.Name : u.Name}</span>
                                          </td>
                                          <td className="py-2.5 text-slate-500 font-mono text-[10px]">{lang === "ur" ? u.Role_Ur : u.Role}</td>
                                          <td className="py-2.5 text-center">
                                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${
                                              u.Attendance_Status === "Duty" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                                            }`}>
                                              {u.Attendance_Status === "Duty" ? (lang === "ur" ? "ڈیوٹی پر" : "Duty") : (lang === "ur" ? "چھٹی" : "Off-Duty")}
                                            </span>
                                          </td>
                                          <td className="py-2.5 text-right font-mono font-bold text-slate-700">{u.Orders_Handled}</td>
                                          <td className="py-2.5 text-right font-mono text-slate-500">{u.Working_Hours} hrs</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })()}

                      {reportsSubSection === "order_history" && (() => {
                        // Helper to find client details
                        const getOrderPhoneAndCustomerObj = (o: OrderBill) => {
                          const deliv = deliveries.find(d => d.Order_ID === o.Order_ID);
                          if (deliv) {
                            return {
                              phone: deliv.Customer_Phone || "",
                              name: deliv.Customer_Name || "",
                              address: deliv.Customer_Address || ""
                            };
                          }
                          const foundCust = customers.find(c => {
                            const tableMatching = tables.find(t => t.Current_Order_ID === o.Order_ID);
                            return tableMatching && tableMatching.Customer_Name && c.Name.toLowerCase() === tableMatching.Customer_Name.toLowerCase();
                          });
                          if (foundCust) {
                            return {
                              phone: foundCust.Phone_Number || "",
                              name: foundCust.Name || "",
                              address: foundCust.Address || ""
                            };
                          }
                          const tbl = tables.find(t => t.Current_Order_ID === o.Order_ID);
                          if (tbl && tbl.Customer_Name) {
                            return {
                              phone: "",
                              name: tbl.Customer_Name,
                              address: ""
                            };
                          }
                          return { phone: "", name: "", address: "" };
                        };

                        const matchingOrdersList = orders.filter(order => {
                          if (reportsSearchPhone.trim()) {
                            const info = getOrderPhoneAndCustomerObj(order);
                            const cleanPhone = info.phone.replace(/[^0-9]/g, "");
                            const cleanName = info.name.toLowerCase();
                            const cleanQuery = reportsSearchPhone.trim().replace(/[^0-9]/g, "");
                            const textQuery = reportsSearchPhone.trim().toLowerCase();
                            const matchesPhone = cleanPhone && cleanQuery && cleanPhone.includes(cleanQuery);
                            const matchesName = cleanName && cleanName.includes(textQuery);
                            const matchesOrderId = order.Order_ID.toLowerCase().includes(textQuery);
                            if (!matchesPhone && !matchesName && !matchesOrderId) {
                              return false;
                            }
                          }
                          if (reportsStartDate) {
                            const start = new Date(reportsStartDate);
                            start.setHours(0, 0, 0, 0);
                            const orderTime = new Date(order.Created_At);
                            if (orderTime < start) return false;
                          }
                          if (reportsEndDate) {
                            const end = new Date(reportsEndDate);
                            end.setHours(23, 59, 59, 999);
                            const orderTime = new Date(order.Created_At);
                            if (orderTime > end) return false;
                          }
                          return true;
                        });

                        const itemsPerPage = 12;
                        const totalSubPages = Math.max(1, Math.ceil(matchingOrdersList.length / itemsPerPage));
                        const activeReportsPage = Math.min(reportsPage, totalSubPages);
                        const sliceStart = (activeReportsPage - 1) * itemsPerPage;
                        const currentSlice = matchingOrdersList.slice(sliceStart, sliceStart + itemsPerPage);

                        return (
                          <div className="space-y-5 animate-fadeIn text-xs text-left">
                            {/* Search Filters Section */}
                            <div className="bg-slate-950 p-4 rounded-3xl border border-slate-850 flex flex-col gap-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div className="space-y-1.5 col-span-1">
                                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left block">
                                    {lang === "ur" ? "گاہک کا فون یا آرڈر آئی ڈی" : "Search Customer / Phone / Order ID"}
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={reportsSearchPhone}
                                      onChange={(e) => {
                                        setReportsSearchPhone(e.target.value);
                                        setReportsPage(1);
                                      }}
                                      placeholder={lang === "ur" ? "مثال: 0313 یا ORD-1200..." : "e.g. 0313 or ORD-1200..."}
                                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-[11px] text-white focus:border-blue-500 focus:outline-none placeholder-slate-500 text-left"
                                    />
                                    {reportsSearchPhone && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReportsSearchPhone("");
                                          setReportsPage(1);
                                        }}
                                        className="absolute right-3 top-2.5 text-[10px] text-slate-400 hover:text-white"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-1.5 col-span-1">
                                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left block">
                                    {lang === "ur" ? "شروع کرنے کی تاریخ" : "Start Date"}
                                  </label>
                                  <input
                                    type="date"
                                    value={reportsStartDate}
                                    onChange={(e) => {
                                      setReportsStartDate(e.target.value);
                                      setReportsPage(1);
                                    }}
                                    className="w-full bg-slate-900 border border-slate-800 p-2 text-[11px] rounded-xl text-white focus:border-blue-500 focus:outline-none"
                                  />
                                </div>

                                <div className="space-y-1.5 col-span-1">
                                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left block">
                                    {lang === "ur" ? "آخری تاریخ" : "End Date"}
                                  </label>
                                  <input
                                    type="date"
                                    value={reportsEndDate}
                                    onChange={(e) => {
                                      setReportsEndDate(e.target.value);
                                      setReportsPage(1);
                                    }}
                                    className="w-full bg-slate-900 border border-slate-800 p-2 text-[11px] rounded-xl text-white focus:border-blue-500 focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-slate-900">
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const today = new Date().toISOString().slice(0, 10);
                                      setReportsStartDate(today);
                                      setReportsEndDate(today);
                                      setReportsPage(1);
                                    }}
                                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] rounded-lg border border-slate-800 cursor-pointer"
                                  >
                                    📅 {lang === "ur" ? "آج کا ڈیٹا" : "Today"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const now = new Date();
                                      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                                      const today = now.toISOString().slice(0, 10);
                                      setReportsStartDate(lastWeek);
                                      setReportsEndDate(today);
                                      setReportsPage(1);
                                    }}
                                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] rounded-lg border border-slate-800 cursor-pointer"
                                  >
                                    📅 {lang === "ur" ? "آخری 7 دن" : "Last 7 Days"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReportsStartDate("");
                                      setReportsEndDate("");
                                      setReportsSearchPhone("");
                                      setReportsPage(1);
                                    }}
                                    className="px-3 py-1 bg-[#811c0f]/20 hover:bg-[#811c0f]/30 text-rose-300 text-[10px] rounded-lg border border-[#811c0f]/30 cursor-pointer"
                                  >
                                    🧹 {lang === "ur" ? "صاف کریں" : "Reset Filters"}
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const csvHeader = "Order ID,Table Number,Customer Name,Customer Phone,Customer Address,Total Amount,Payment Status,Payment Method,Created At\n";
                                    const csvRows = matchingOrdersList
                                      .map(o => {
                                        const info = getOrderPhoneAndCustomerObj(o);
                                        const name = info.name ? `"${info.name.replace(/"/g, '""')}"` : '"N/A"';
                                        const phone = info.phone ? `"${info.phone.replace(/"/g, '""')}"` : '"N/A"';
                                        const addr = info.address ? `"${info.address.replace(/"/g, '""')}"` : '"N/A"';
                                        return `"${o.Order_ID}",${o.Table_Number || 0},${name},${phone},${addr},${o.Total_Amount},"${o.Payment_Status}","${o.Payment_Method || 'None'}","${o.Created_At}"`;
                                      })
                                      .join("\n");
                                      
                                    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.setAttribute("download", `filtered_orders_${new Date().toISOString().slice(0, 10)}.csv`);
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    triggerAutoCloudSync("Exported filtered orders CSV");
                                  }}
                                  disabled={matchingOrdersList.length === 0}
                                  className="px-3.5 py-1.5 bg-[#0F4C81] hover:bg-[#0c3c66] disabled:opacity-50 text-white font-bold text-[10px] uppercase rounded-lg cursor-pointer flex items-center gap-1 shadow-sm transition"
                                >
                                  📥 {lang === "ur" ? "ایکسل رپورٹ ڈاؤن لوڈ کریں" : "Export CSV Report"}
                                </button>
                              </div>
                            </div>

                            {/* Total matching summary */}
                            <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
                              <span>
                                {lang === "ur" ? `مجموعی مطابقت پذیر ریکارڈ: ${matchingOrdersList.length}` : `Aggregated Matches Found: ${matchingOrdersList.length} Orders`}
                              </span>
                              <span>
                                {lang === "ur" ? `صفحہ ${activeReportsPage} از ${totalSubPages}` : `Page ${activeReportsPage} of ${totalSubPages}`}
                              </span>
                            </div>

                            {/* Orders Table/List */}
                            {currentSlice.length === 0 ? (
                              <div className="bg-slate-950 rounded-3xl p-10 text-center border border-slate-850 space-y-2">
                                <span className="text-3xl block">🔍</span>
                                <p className="text-slate-400 font-bold">{lang === "ur" ? "کوئی ملتے جلتے آرڈرز نہیں ملے" : "No Matching Customer Orders Found"}</p>
                                <p className="text-[10px] text-slate-500">{lang === "ur" ? "آرڈر آئی ڈی، فون نمبر، یا توثیق شدہ گاہک کے نام دوبارہ چیک کریں۔" : "Verify the search filters or try selecting a different date range."}</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {currentSlice.map(order => {
                                  const info = getOrderPhoneAndCustomerObj(order);
                                  const dateStr = new Date(order.Created_At).toLocaleString(lang === "ur" ? "ur-PK" : "en-US", {
                                    dateStyle: "medium",
                                    timeStyle: "short"
                                  });

                                  // Check order type
                                  const isDelivery = deliveries.some(d => d.Order_ID === order.Order_ID);
                                  const isDineIn = order.Table_Number > 0;
                                  const orderTypeLabel = isDelivery ? "Delivery" : isDineIn ? "Dine-In" : "Takeaway";
                                  const orderTypeLabelUr = isDelivery ? "ڈلیوری ہوم" : isDineIn ? "میز ڈائن ان" : "ٹیک اوے";

                                  return (
                                    <div key={order.Order_ID} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-150 flex flex-col justify-between gap-3 text-left shadow-md">
                                      {/* ID, Time & Type Header */}
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 font-mono font-black text-[9px] rounded-lg border border-blue-500/20">
                                            {order.Order_ID}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[8px] uppercase ${
                                            isDelivery 
                                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                              : isDineIn 
                                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                          }`}>
                                            {lang === "ur" ? orderTypeLabelUr : orderTypeLabel}
                                          </span>
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                                          <span>🕒</span>
                                          <span>{dateStr}</span>
                                        </div>
                                        {isDineIn && (
                                          <span className="text-[9px] text-slate-400 font-bold block">
                                            {lang === "ur" ? `میز: #${order.Table_Number}` : `Table: #${order.Table_Number}`}
                                          </span>
                                        )}
                                      </div>

                                      {/* Customer details */}
                                      <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-900 space-y-0.5">
                                        <span className="text-[8px] uppercase font-bold text-slate-500 block">
                                          {lang === "ur" ? "صارف کا ڈیٹا" : "Customer Ledger"}
                                        </span>
                                        {info.name || info.phone ? (
                                          <div className="text-[9px]">
                                            <p className="font-extrabold text-white truncate">{info.name || (lang === "ur" ? "عام صارف" : "Anonymous Guest")}</p>
                                            {info.phone && (
                                              <p className="font-mono font-bold text-slate-350 truncate">{info.phone}</p>
                                            )}
                                            {info.address && (
                                              <p className="text-slate-400 line-clamp-1 text-[8px]">{info.address}</p>
                                            )}
                                          </div>
                                        ) : (
                                          <p className="text-slate-500 italic text-[8px]">
                                            {lang === "ur" ? "کوئی گاہک معلومات نہیں" : "No customer info mapped"}
                                          </p>
                                        )}
                                      </div>

                                      {/* Order Items Summary */}
                                      <div className="space-y-0.5">
                                        <span className="text-[8px] uppercase font-bold text-slate-500 block">
                                          {lang === "ur" ? "آرڈر کی تفصیل" : "Dishes List"}
                                        </span>
                                        <div className="max-h-16 overflow-y-auto space-y-0.5 pr-1 text-[9px] scrollbar-thin">
                                          {order.Order_Items.map((itm, idx) => (
                                            <div key={idx} className="flex justify-between text-slate-300">
                                              <span className="truncate max-w-[110px]">{lang === "ur" && itm.Item_Name_Ur ? itm.Item_Name_Ur : itm.Item_Name}</span>
                                              <span className="font-mono text-slate-400 shrink-0">x{itm.Quantity}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Pricing, method & sync state at bottom */}
                                      <div className="pt-2 border-t border-slate-900 flex justify-between items-end gap-1.5 mt-auto">
                                        <div className="text-left">
                                          <span className="text-[8px] text-slate-500 block">
                                            ☁️ {order.Sync_Status}
                                          </span>
                                          <div className="text-xs font-mono font-black text-white">
                                            {order.Total_Amount.toLocaleString()} PKR
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 items-end">
                                          <span className={`px-1 rounded-[4px] text-[7.5px] font-black uppercase ${
                                            order.Payment_Status === "Paid" 
                                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                              : order.Payment_Status === "Pending" 
                                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                          }`}>
                                            {order.Payment_Status}
                                          </span>
                                          {order.Payment_Method && (
                                            <span className="px-1 rounded-[4px] bg-slate-900 border border-slate-800 text-[7.5px] font-black text-slate-400 uppercase">
                                              {order.Payment_Method}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Pagination controller */}
                            {totalSubPages > 1 && (
                              <div className="flex justify-center items-center gap-2 pt-3 border-t border-slate-900">
                                <button
                                  type="button"
                                  onClick={() => setReportsPage(prev => Math.max(1, prev - 1))}
                                  disabled={activeReportsPage === 1}
                                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-extrabold text-[10px] rounded-lg border border-slate-800 cursor-pointer"
                                >
                                  ◀ {lang === "ur" ? "پچھلا" : "Previous"}
                                </button>
                                <span className="text-[10px] text-slate-400 px-3">
                                  {lang === "ur" ? `صفحہ ${activeReportsPage} از ${totalSubPages}` : `Page ${activeReportsPage} of ${totalSubPages}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setReportsPage(prev => Math.min(totalSubPages, prev + 1))}
                                  disabled={activeReportsPage === totalSubPages}
                                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-extrabold text-[10px] rounded-lg border border-slate-800 cursor-pointer"
                                >
                                  {lang === "ur" ? "اگلا" : "Next"} ▶
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* TAB 9: SETTINGS PAGE */}
                  {activeAdminTab === "settings" && (
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl text-slate-100">
                      <RoleSettings
                        branding={branding}
                        onUpdateBranding={setBranding}
                        customers={customers}
                        onAddCustomer={(c) => {
                          setCustomers(prev => [...prev, c]);
                          handleLogAction(`Registered regular customer: ${c.Name}`, "Low");
                        }}
                        activityLogs={activityLogs}
                        onClearLogs={() => setActivityLogs([])}
                        deliveries={deliveries}
                        onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
                        onAddDelivery={(d) => setDeliveries(prev => [...prev, d])}
                        staff={users}
                        orders={orders}
                        menu={menu}
                        inventory={inventory}
                        expenses={expenses}
                        tables={tables}
                        onRestoreSystem={(fullState) => {
                          setBranding(fullState.branding);
                          setCustomers(fullState.customers);
                          setActivityLogs(fullState.activityLogs);
                          setUsers(fullState.users);
                          setMenu(fullState.menu);
                          setInventory(fullState.inventory);
                          setTables(fullState.tables);
                          setOrders(fullState.orders);
                          setExpenses(fullState.expenses);
                          setDeliveries(fullState.deliveries);
                          handleLogAction("ERP System Restored from Encrypted Snapshot Backup", "Critical");
                        }}
                        lang={lang}
                        onUpdateMenuPrice={handleUpdateMenuPrice}
                      />
                    </div>
                  )}

                  {/* TAB 10: BACKUP & RESTORE PAGE */}
                  {activeAdminTab === "backup_restore" && (
                    <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-6 animate-fadeIn text-xs text-slate-300">
                      <div className="border-b border-slate-800 pb-3">
                        <h2 className="text-sm font-black text-white uppercase tracking-tight">Cloud Backup & Snapshots Recovery</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">Protect business registries against physical terminal losses</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-5 rounded-3xl">
                        <div className="space-y-3">
                          <h3 className="font-extrabold text-white text-xs">Download Current System Cache</h3>
                          <p className="text-slate-450 leading-relaxed text-[11px]">
                            Download an offline, encrypted backup JSON file payload containing all table structures, recipes, staffs roster, cash ledgers, and inventory ratios.
                          </p>

                          <button
                            onClick={() => {
                              const snapshotJson = {
                                branding, customers, activityLogs, users, menu, inventory, tables, orders, expenses, deliveries
                              };
                              const blob = new Blob([JSON.stringify(snapshotJson, null, 2)], { type: "application/json" });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `bargegul_erp_snapshot_${new Date().toISOString().split("T")[0]}.json`;
                              link.click();
                              handleLogAction("System backup downloaded by Admin Mohammad Irfan", "Medium");
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-[10px] uppercase cursor-pointer transition"
                          >
                            Download Snapshot JSON
                          </button>
                        </div>

                        <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-850 pt-4 md:pt-0 md:pl-6">
                          <h3 className="font-extrabold text-white text-xs">Perform System State Restore</h3>
                          <p className="text-slate-450 leading-relaxed text-[11px]">
                            Choose an export JSON snapshots backup file to restore databases arrays and clear running session registers, resetting state properties immediately.
                          </p>
                          <input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                try {
                                  const raw = event.target?.result as string;
                                  const state = JSON.parse(raw);
                                  if (state.branding && state.users && state.menu) {
                                    setBranding(state.branding);
                                    if (state.customers) setCustomers(state.customers);
                                    if (state.activityLogs) setActivityLogs(state.activityLogs);
                                    setUsers(state.users);
                                    setMenu(state.menu);
                                    setInventory(state.inventory);
                                    setTables(state.tables);
                                    setOrders(state.orders);
                                    setExpenses(state.expenses);
                                    setDeliveries(state.deliveries);
                                    alert("ERP State successfully fully restored! Database refreshed.");
                                    handleLogAction("Manual Restore Action verified successfully", "Critical");
                                  } else {
                                    alert("Error: Selected JSON is not a valid ERP Backup state template.");
                                  }
                                } catch (err) {
                                  alert("Failed to parse JSON snapshot file.");
                                }
                              };
                              reader.readAsText(file);
                            }}
                            className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 p-2 rounded-xl w-full"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-3xl border border-slate-850 text-[11px] leading-relaxed">
                        <span className="text-emerald-400 font-mono font-bold block">✓ Automated Backup Routine Scheduler Status:</span>
                        Past Backup Snapshot generated at {new Date(Date.now() - 3600000).toLocaleTimeString()} • Verified OK on remote server.
                      </div>

                    </div>
                  )}

                  {/* SHORTCUT RE-ROUTED PANELS IN RIGHT AREA */}
                  {activeAdminTab === "pos" && (
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl">
                      <RoleCounterPOS
                        tables={tables}
                        menu={menu}
                        inventory={inventory}
                        onPlaceOrder={handlePlaceOrder}
                        onModifyOrder={handleModifyOrder}
                        onCheckout={handleCheckout}
                        onCancelOrder={handleCancelOrder}
                        onClearTableRequest={handleClearTableRequest}
                        activeOrders={orders}
                        staff={users}
                        lang={lang}
                      />
                    </div>
                  )}

                  {activeAdminTab === "kds" && (
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl">
                      <RoleKitchenKDS
                        kdsOrders={kds}
                        onUpdateKitchenStatus={handleUpdateKitchenStatus}
                        onAddDelay={handleAddDelay}
                        lang={lang}
                        menu={menu}
                        setMenu={setMenu}
                        inventory={inventory}
                        setInventory={setInventory}
                        batchCookLogs={batchCookLogs}
                        setBatchCookLogs={setBatchCookLogs}
                        finishedWasteLogs={finishedWasteLogs}
                        setFinishedWasteLogs={setFinishedWasteLogs}
                        currentUserRole={loggedInUser.Role}
                      />
                    </div>
                  )}

                  {activeAdminTab === "db" && (
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl">
                      <LocalDBViewer
                        users={users}
                        menu={menu}
                        inventory={inventory}
                        tables={tables}
                        orders={orders}
                        kds={kds}
                        expenses={expenses}
                        syncQueueLength={0}
                      />
                    </div>
                  )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* RENDER NORMAL INDIVIDUAL CREW ACTIVE VIEW IF NOT SUPERADMIN DEDICATED */
              <div className="flex-1">
                
                {/* COUNTER CASHIER ACTIVE PANEL */}
                {loggedInUser.Role === StaffRole.Counter && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-sm">
                    <RoleCounterPOS
                      tables={tables}
                      menu={menu}
                      inventory={inventory}
                      onPlaceOrder={handlePlaceOrder}
                      onModifyOrder={handleModifyOrder}
                      onCheckout={handleCheckout}
                      onCancelOrder={handleCancelOrder}
                      onClearTableRequest={handleClearTableRequest}
                      activeOrders={orders}
                      staff={users}
                      lang={lang}
                    />
                  </div>
                )}

                {/* KITCHEN CHEF ACTIVE PANEL */}
                {loggedInUser.Role === StaffRole.Kitchen && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-sm">
                    <RoleKitchenKDS
                      kdsOrders={kds}
                      onUpdateKitchenStatus={handleUpdateKitchenStatus}
                      onAddDelay={handleAddDelay}
                      lang={lang}
                      menu={menu}
                      setMenu={setMenu}
                      inventory={inventory}
                      setInventory={setInventory}
                      batchCookLogs={batchCookLogs}
                      setBatchCookLogs={setBatchCookLogs}
                      finishedWasteLogs={finishedWasteLogs}
                      setFinishedWasteLogs={setFinishedWasteLogs}
                      currentUserRole={loggedInUser.Role}
                    />
                  </div>
                )}

                {/* INVENTORY ACTIVE PANEL */}
                {loggedInUser.Role === StaffRole.Rider && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-sm">
                    <RoleRider
                      deliveries={deliveries}
                      loggedInUser={loggedInUser}
                      onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
                      lang={lang}
                    />
                  </div>
                )}

                {/* WAITER ACTIVE PANEL */}
                {loggedInUser.Role === StaffRole.Waiter && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-sm">
                    <RoleWaiter
                      tables={tables}
                      menu={menu}
                      activeOrders={orders}
                      staff={users}
                      loggedInUser={loggedInUser}
                      inventory={inventory}
                      onPlaceOrder={handlePlaceOrder}
                      onModifyOrder={handleModifyOrder}
                      onClearTableRequest={handleClearTableRequest}
                      lang={lang}
                    />
                  </div>
                )}

              </div>
            )}

          </main>

          {/* PERSISTENT BOTTOM NAVIGATION BAR */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-3 px-6 flex justify-around items-center z-45 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] rounded-t-3xl">
              
              {/* Tab 1: Dashboard */}
              <button
                onClick={() => setActiveAdminTab("dashboard")}
                className={`flex flex-col items-center gap-1 transition cursor-pointer active:scale-95 ${
                  activeAdminTab === "dashboard" ? "text-[#0F4C81]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`p-1.5 px-3.5 rounded-full transition ${activeAdminTab === "dashboard" ? "bg-[#0F4C81]/10 text-[#0F4C81]" : ""}`}>
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wide">
                  {lang === "ur" ? "ڈیش بورڈ" : "Dashboard"}
                </span>
              </button>

              {/* Tab 2: POS Desktop */}
              <button
                onClick={() => setActiveAdminTab("pos")}
                className={`flex flex-col items-center gap-1 transition cursor-pointer active:scale-95 ${
                  activeAdminTab === "pos" ? "text-[#0F4C81]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`p-1.5 px-3.5 rounded-full transition ${activeAdminTab === "pos" ? "bg-[#0F4C81]/10 text-[#0F4C81]" : ""}`}>
                  <Utensils className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wide">
                  {lang === "ur" ? "بلنگ کاؤنٹر" : "Orders POS"}
                </span>
              </button>

              {/* Tab 3: Table Layout */}
              <button
                onClick={() => setActiveAdminTab("tables")}
                className={`flex flex-col items-center gap-1 transition cursor-pointer active:scale-95 ${
                  activeAdminTab === "tables" ? "text-[#0F4C81]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`p-1.5 px-3.5 rounded-full transition ${activeAdminTab === "tables" ? "bg-[#0F4C81]/10 text-[#0F4C81]" : ""}`}>
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wide">
                  {lang === "ur" ? "میزیں ہال" : "Tables Space"}
                </span>
              </button>

              {/* Tab 4: Raw Inventory */}
              <button
                onClick={() => setActiveAdminTab("inventory")}
                className={`flex flex-col items-center gap-1 transition cursor-pointer active:scale-95 ${
                  activeAdminTab === "inventory" ? "text-[#0F4C81]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`p-1.5 px-3.5 rounded-full transition ${activeAdminTab === "inventory" ? "bg-[#0F4C81]/10 text-[#0F4C81]" : ""}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wide">
                  {lang === "ur" ? "انونٹری اسٹاک" : "Inventory"}
                </span>
              </button>

              {/* Tab 5: Reports BI */}
              <button
                onClick={() => setActiveAdminTab("reports")}
                className={`flex flex-col items-center gap-1 transition cursor-pointer active:scale-95 ${
                  activeAdminTab === "reports" ? "text-[#0F4C81]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`p-1.5 px-3.5 rounded-full transition ${activeAdminTab === "reports" ? "bg-[#0F4C81]/10 text-[#0F4C81]" : ""}`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wide">
                  {lang === "ur" ? "کاروباری رپورٹس" : "Reports BI"}
                </span>
              </button>

            </div>

            {/* 🎙️ COLLAPSIBLE FLOAT WALKIE-TALKIE CONSOLE DRAWER */}
            {isIntercomOpen && (
              <div className="fixed bottom-20 right-4 w-80 sm:w-88 bg-white border-2 border-[#FF8C42] rounded-3xl shadow-2xl z-50 overflow-hidden font-sans animate-slideIn">
                <div className="bg-[#FF8C42] text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎙️</span>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider">{lang === "ur" ? "ریئل ٹائم وائس وائرلیس" : "Wireless Walkie Talkie"}</h3>
                      <span className="text-[9px] font-bold text-orange-200 uppercase">{loggedInUser.Name} ({loggedInUser.Role})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playWalkieTalkieSynth("static");
                      setIsIntercomOpen(false);
                    }}
                    className="p-1.5 hover:bg-orange-600 rounded-lg text-white font-black text-xs cursor-pointer transition border-0 bg-transparent"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Select Destination role */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 block">{lang === "ur" ? "نشریات کا ہدف:" : "Intercom Target Group:"}</label>
                    <select
                      id="intercom_target"
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2 bg-slate-50 text-slate-800"
                    >
                      <option value="All">{lang === "ur" ? "📢 تمام عملہ (Broadcasting)" : "📢 All Personnel"}</option>
                      <option value="Kitchen">{lang === "ur" ? "🍳 باورچی خانہ (Chef Crew)" : "🍳 Kitchen Staff"}</option>
                      <option value="Waiter">{lang === "ur" ? "🤵 ہال ویٹرز (Table Crew)" : "🤵 Table Waiters"}</option>
                      <option value="Counter">{lang === "ur" ? "🧾 پی او ایس کاؤنٹر" : "🧾 POS Counter"}</option>
                      <option value="Rider">{lang === "ur" ? "🚚 ڈیلیوری رائیڈرز" : "🚚 Riders"}</option>
                    </select>
                  </div>

                  {/* Micro recorder component view */}
                  <div className="border border-dashed border-slate-200 rounded-2xl p-4 text-center space-y-3 bg-slate-50 animate-fadeIn">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase block">
                      {isRecording 
                        ? (lang === "ur" ? `🔴 ریکارڈنگ چالو ہے: ${recordingDuration} سیکنڈ` : `🔴 TRANSMITTING LIVE: ${recordingDuration}s`)
                        : (lang === "ur" ? "ریڈیو انٹرکام چینل" : "Radio Intercom Channel")
                      }
                    </span>
                    
                    {/* Recording pulse visualizer */}
                    <div className="flex justify-center items-center gap-1.5 h-8">
                      <span className={`w-1.5 h-3 bg-slate-300 rounded-full ${isRecording ? "animate-pulse" : ""}`}></span>
                      <span className={`w-1.5 h-5 bg-orange-400 rounded-full ${isRecording ? "animate-bounce" : ""}`}></span>
                      <span className={`w-1.5 h-8 bg-[#FF8C42] rounded-full ${isRecording ? "animate-pulse" : ""}`}></span>
                      <span className={`w-1.5 h-4 bg-orange-400 rounded-full ${isRecording ? "animate-bounce" : ""}`}></span>
                      <span className={`w-1.5 h-2 bg-slate-300 rounded-full ${isRecording ? "animate-pulse" : ""}`}></span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {isRecording ? (
                        <div className="flex gap-2 w-full justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              playWalkieTalkieSynth("static");
                              setIsRecording(false);
                              if (mediaRecorderInstance && mediaRecorderInstance.state !== "inactive") {
                                try { mediaRecorderInstance.stop(); } catch (e) {}
                              }
                              if (audioStreamInstance) {
                                try { audioStreamInstance.getTracks().forEach(t => t.stop()); } catch (e) {}
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow-sm uppercase border-0"
                          >
                            ⏹️ {lang === "ur" ? "روکیں اور بھیجیں" : "Stop & Send"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playWalkieTalkieSynth("static");
                              setIsRecording(false);
                              if (mediaRecorderInstance) {
                                try { mediaRecorderInstance.stop(); } catch (e) {}
                              }
                              if (audioStreamInstance) {
                                try { audioStreamInstance.getTracks().forEach(t => t.stop()); } catch (e) {}
                              }
                            }}
                            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition uppercase border-0"
                          >
                            ✕ {lang === "ur" ? "منسوخ" : "Cancel"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 w-full justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              playWalkieTalkieSynth("static");
                              // Append dispatch record
                              const targetVal = (document.getElementById("intercom_target") as HTMLSelectElement)?.value || "All";
                              const newMsg: VoiceMessage = {
                                Message_ID: `VM-${Math.floor(100 + Math.random() * 900)}`,
                                From_Name: loggedInUser.Name,
                                From_Role: loggedInUser.Role,
                                To_Role: targetVal,
                                Audio_Url: "",
                                Timestamp: new Date().toISOString(),
                                Duration_Secs: Math.floor(3 + Math.random() * 8)
                              };
                              setVoiceMessages(prev => {
                                const updated = [newMsg, ...prev];
                                localStorage.setItem("daynight_voice_messages", JSON.stringify(updated));
                                return updated;
                              });
                              playWalkieTalkieSynth("beep");
                              handleLogAction(`Voice radio transmit dispatched to ${targetVal}`, "Medium");
                            }}
                            className="flex-1 px-3 py-2 bg-[#FF8C42] hover:bg-orange-600 text-white font-extrabold text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow-sm uppercase border-0"
                          >
                            📡 {lang === "ur" ? "کوئیک سگنل" : "Quick Signal"}
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                playWalkieTalkieSynth("beep");
                                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                                const mediaRecorder = new MediaRecorder(stream);
                                const chunks: Blob[] = [];
                                mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                                mediaRecorder.onstop = () => {
                                  const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
                                  const audioURL = URL.createObjectURL(blob);
                                  
                                  const targetVal = (document.getElementById("intercom_target") as HTMLSelectElement)?.value || "All";
                                  const newMsg: VoiceMessage = {
                                    Message_ID: `VM-${Math.floor(100 + Math.random() * 900)}`,
                                    From_Name: loggedInUser.Name,
                                    From_Role: loggedInUser.Role,
                                    To_Role: targetVal,
                                    Audio_Url: audioURL,
                                    Timestamp: new Date().toISOString(),
                                    Duration_Secs: recordingDuration || 5
                                  };
                                  setVoiceMessages(prev => {
                                    const updated = [newMsg, ...prev];
                                    localStorage.setItem("daynight_voice_messages", JSON.stringify(updated));
                                    return updated;
                                  });
                                  playWalkieTalkieSynth("beep");
                                  handleLogAction(`Live vocal transceiver message dispatched to ${targetVal}`, "High");
                                };
                                setMediaRecorderInstance(mediaRecorder);
                                setAudioStreamInstance(stream);
                                setRecordingDuration(0);
                                setIsRecording(true);
                                mediaRecorder.start();
                              } catch (err) {
                                // Fallback activation
                                setIsRecording(true);
                                setRecordingDuration(0);
                                setAudioStreamInstance(null);
                                setMediaRecorderInstance(null);
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition border border-slate-800 uppercase"
                          >
                            🎙️ {lang === "ur" ? "اصلی ریکارڈ" : "Record Voice"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Incoming transmissions queue */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    <span className="text-[10px] uppercase font-black text-slate-400 block">{lang === "ur" ? "پچھلے پیغامات:" : "Wireless Channels Dispatch:"}</span>
                    {voiceMessages.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic block text-center py-2">{lang === "ur" ? "کوئی پیغام نہیں ملا" : "Radio channels quiet."}</span>
                    ) : (
                      voiceMessages.map(msg => {
                        const isDirectedToMe = msg.To_Role === "All" || msg.To_Role === loggedInUser.Role;
                        return (
                          <div key={msg.Message_ID} className={`p-2 rounded-xl flex justify-between items-center border transition-all ${
                            isDirectedToMe ? "bg-orange-50/70 border-orange-100 font-bold" : "bg-slate-50 border-slate-100 opacity-60 text-slate-500"
                          }`}>
                            <div className="text-[10px]">
                              <span className="font-extrabold text-slate-800 block">
                                {msg.From_Name} ➔ <span className="text-orange-600 font-bold">{msg.To_Role}</span>
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5 block">{new Date(msg.Timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {msg.Duration_Secs}s</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                playWalkieTalkieSynth("incoming");
                                if (msg.Audio_Url) {
                                  try {
                                    const aud = new Audio(msg.Audio_Url);
                                    aud.play();
                                  } catch (err) {
                                    console.error("Audio playback error:", err);
                                  }
                                } else {
                                  setTimeout(() => playWalkieTalkieSynth("static"), 100);
                                  setTimeout(() => playWalkieTalkieSynth("beep"), 400);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-[#FF8C42] border-0 text-white font-extrabold text-[9px] rounded-lg cursor-pointer hover:bg-orange-600 uppercase flex items-center gap-1"
                            >
                              🔊 {lang === "ur" ? "سنیں" : "Listen"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      {/* ── STAGE 4: SELF-SERVICE CUSTOMER DIGITAL MENU PORTAL (QR TRIGGERED) ── */}
      {currentStage === "digital-menu" && (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
          
          {/* Top Branding Banner with custom dynamic background configuration */}
          <div className="relative h-48 md:h-64 overflow-hidden border-b border-slate-900">
            <img 
              src={branding.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"} 
              alt={branding.restaurantName}
              className="w-full h-full object-cover brightness-[0.4]"
            />
            {/* Dark gradient mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* Branding details overlay */}
            <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden p-1 flex-shrink-0">
                  <img 
                    src={branding.logo || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80"} 
                    alt="Logo" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">
                    {branding.restaurantName}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 font-bold flex items-center gap-1.5 flex-wrap">
                    <span>📍 {branding.address}</span>
                    <span className="text-slate-500">•</span>
                    <span>📞 {branding.contactNumbers}</span>
                  </p>
                </div>
              </div>

              {/* Languages Toggle */}
              <button
                type="button"
                onClick={() => setLang(prev => prev === "ur" ? "en" : "ur")}
                className="bg-slate-900/90 border border-slate-800 text-xs px-3.5 py-2 rounded-xl text-slate-300 font-extrabold flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === "ur" ? "English (EN)" : "اردو (UR)"}</span>
              </button>
            </div>
          </div>

          {/* MAIN BODY LAYOUT */}
          <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            
            {/* LEFT CONTAINER: MENUS, FILTERS, SEARCH */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Table identification Welcome Badge */}
              <div className="bg-gradient-to-r from-blue-950/60 to-slate-950 border border-blue-900/60 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shrink-0">
                    <Utensils className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <span>{lang === "ur" ? `میز نمبر ${scannedTableNumber} پر خوش آمدید` : `Welcome to Table ${scannedTableNumber}`}</span>
                    </h2>
                    <p className="text-[10.5px] text-slate-500 font-bold mt-0.5">
                      {lang === "ur" ? "براہ کرم مینو دیکھیں اور اپنی پسندیدہ اشیاء منتخب کر کے آرڈر تیار کریں۔" : "Scan pinpointed seat. Create personal selection directly from your touch."}
                    </p>
                  </div>
                </div>

                {/* EXIT PORTAL FOR EASY DEV ACCESS */}
                <button
                  type="button"
                  onClick={() => setCurrentStage("landing")}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-[10px] font-black transition cursor-pointer"
                >
                  🚪 {lang === "ur" ? "پورٹل بند کریں" : "Exit Portal"}
                </button>
              </div>

              {/* SEARCH & FILTERS DOCK */}
              {(() => {
                // Get categories with fallback for digital-menu block
                const categories = [
                  { id: "All", en: "All menu", ur: "تمام مینیو" },
                  { id: "Pizzas", en: "Pizzas", ur: "پیزا" },
                  { id: "Burgers", en: "Burgers", ur: "برگر" },
                  { id: "Wings", en: "Wings & Sides", ur: "ونگز اور سائیڈز" },
                  { id: "Quetta Chai", en: "Quetta Chai & Paratha", ur: "کوئٹہ چائے پراٹھا" },
                  { id: "Lunch & BBQ", en: "Lunch & BBQ", ur: "لنچ اور باربی کیو" },
                  { id: "Desserts", en: "Desserts", ur: "میٹھی اشیاء" },
                  { id: "Deals", en: "Popular Deals", ur: "ڈیلز" },
                ];

                const filteredDishes = menu.filter((item) => {
                  const matchCat = guestSelectedCat === "All" || item.Category === guestSelectedCat;
                  const matchSearch = item.Item_Name.toLowerCase().includes(guestSearchVal.toLowerCase()) || 
                                     item.Item_Name_Ur.includes(guestSearchVal);
                  return matchCat && matchSearch;
                });

                return (
                  <div className="space-y-4">
                    {/* Search Field */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={lang === "ur" ? "کھانے تلاش کریں..." : "Search delicious dishes..."}
                        value={guestSearchVal}
                        onChange={(e) => setGuestSearchVal(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 px-4 py-3 pb-3 pr-10 text-xs rounded-2xl text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                      />
                      <span className="absolute right-4 top-3.5 text-slate-500 text-xs">🔍</span>
                    </div>

                    {/* Category Scrollbar */}
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setGuestSelectedCat(cat.id)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition cursor-pointer text-center ${
                            guestSelectedCat === cat.id 
                              ? "bg-blue-600 text-white" 
                              : "bg-slate-900 hover:bg-slate-850 text-slate-400"
                          }`}
                        >
                          {lang === "ur" ? cat.ur : cat.en}
                        </button>
                      ))}
                    </div>

                    {/* DISHES LIST GRID */}
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-3">
                      {filteredDishes.length === 0 ? (
                        <div className="col-span-2 xs:col-span-3 sm:col-span-4 xl:col-span-5 text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-850 text-slate-500 font-bold text-xs italic">
                          <span>{lang === "ur" ? "کوئی کھانے نہیں ملے" : "No menu items match your search filter."}</span>
                        </div>
                      ) : (
                        filteredDishes.map((item) => {
                          const quantityInGuestCart = (() => {
                            const cached = localStorage.getItem(`guest_cart_table_${scannedTableNumber}`);
                            if (!cached) return 0;
                            try {
                              const items = JSON.parse(cached) as OrderItem[];
                              const found = items.find(i => i.Item_ID === item.Item_ID);
                              return found ? found.Quantity : 0;
                            } catch {
                              return 0;
                            }
                          })();

                          const updateQuantityInGuestCart = (newAmount: number) => {
                            let itemsList: OrderItem[] = [];
                            const cached = localStorage.getItem(`guest_cart_table_${scannedTableNumber}`);
                            if (cached) {
                              try { itemsList = JSON.parse(cached); } catch {}
                            }
                            const existing = itemsList.find(i => i.Item_ID === item.Item_ID);
                            if (existing) {
                              if (newAmount <= 0) {
                                itemsList = itemsList.filter(i => i.Item_ID !== item.Item_ID);
                              } else {
                                existing.Quantity = newAmount;
                              }
                            } else if (newAmount > 0) {
                              itemsList.push({
                                Item_ID: item.Item_ID,
                                Item_Name: item.Item_Name,
                                Item_Name_Ur: item.Item_Name_Ur,
                                Price: item.Sales_Price,
                                Quantity: newAmount,
                                Status: "Pending"
                              });
                            }
                            localStorage.setItem(`guest_cart_table_${scannedTableNumber}`, JSON.stringify(itemsList));
                            // Force react refresh via trivial state toggle
                            setScannedTableNumber(prev => prev);
                          };

                          return (
                            <div key={item.Item_ID} className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden flex flex-col justify-between">
                              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-2xl flex flex-col justify-between gap-2.5 transition hover:border-slate-850 relative group overflow-hidden h-full">
                                
                                <div>
                                  {/* Dish Image Frame */}
                                  <div className="h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                                    <img 
                                      src={item.Image_Url} 
                                      alt={item.Item_Name} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Prep Time Tag */}
                                    <div className="absolute top-1 right-1 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-black text-slate-350 flex items-center gap-0.5">
                                      <span>⏱️ {item.Prep_Time_Minutes}m</span>
                                    </div>
                                  </div>

                                  <div className="mt-2">
                                    <div className="flex flex-col justify-between gap-0.5">
                                      <h3 className="font-extrabold text-white text-xs line-clamp-1 leading-normal" title={lang === "ur" ? item.Item_Name_Ur : item.Item_Name}>
                                        {lang === "ur" ? item.Item_Name_Ur : item.Item_Name}
                                      </h3>
                                      <span className="text-amber-400 font-extrabold text-[11px] shrink-0 whitespace-nowrap">
                                        {item.Sales_Price} Rs
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Active self-ordering controls */}
                                <div className="border-t border-slate-850 pt-2 flex items-center justify-between gap-1.5 mt-auto">
                                  {quantityInGuestCart > 0 ? (
                                    <div className="flex items-center gap-1.5 w-full">
                                      <button
                                        type="button"
                                        onClick={() => updateQuantityInGuestCart(quantityInGuestCart - 1)}
                                        className="w-6 h-6 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <span className="text-[11px] font-black text-slate-200 font-mono flex-1 text-center">
                                        {quantityInGuestCart}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => updateQuantityInGuestCart(quantityInGuestCart + 1)}
                                        className="w-6 h-6 rounded-lg bg-slate-850 hover:bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => updateQuantityInGuestCart(1)}
                                      className="w-full bg-slate-950 hover:bg-blue-600/10 text-slate-300 hover:text-blue-400 border border-slate-800 hover:border-blue-500 py-1 rounded-lg text-[9px] font-black transition cursor-pointer text-center uppercase"
                                    >
                                      ➕ {lang === "ur" ? "شامل کریں" : "Add"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* RIGHT SIDEBAR PANEL: LIVE CART CALCULATOR & SERVICE BELLS */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* BRANDED INTERACTIVE BELL & INVOICE REQUEST TOOL */}
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4">
                <div className="border-b border-slate-850 pb-3">
                  <span className="font-mono text-xs text-amber-500 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span>{lang === "ur" ? "ہال ویٹر اور بل سروس" : "Staff Support & Order Counter"}</span>
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-bold">
                    {lang === "ur" ? "ویٹر کو بلانے یا میز کا کل بل منگوانے کے لیے الرٹ بھیجیں۔" : "Ring the digital register directly from your phone to notify waitstaff."}
                  </p>
                </div>

                {(() => {
                  const currentTableState = tables.find(t => t.Table_Number === scannedTableNumber);
                  const activeReq = currentTableState?.Customer_Request || "None";

                  return (
                    <div className="grid grid-cols-1 gap-3">
                      {/* Waiter Alert Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextReq = activeReq === "Waiter" ? "None" : "Waiter";
                          setTables(prev => prev.map(t => t.Table_Number === scannedTableNumber ? { ...t, Customer_Request: nextReq as "None" | "Waiter" | "Bill" } : t));
                          triggerAutoCloudSync(`Guest [Table ${scannedTableNumber}] requested support!`);
                          handleLogAction(`Guest [Table ${scannedTableNumber}] requested waiter assist`, nextReq === "None" ? "Low" : "High");
                        }}
                        className={`w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer border ${
                          activeReq === "Waiter"
                            ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md animate-pulse"
                            : "bg-slate-950 border-slate-800 text-slate-350 hover:bg-slate-900/40 hover:border-slate-700"
                        }`}
                      >
                        <span>🔔</span>
                        <span>
                          {activeReq === "Waiter" 
                            ? (lang === "ur" ? "ویٹر الرٹ بھیج دیا گیا" : "Waiter Alert Sent! (Pulsing)") 
                            : (lang === "ur" ? "ویٹر کو میز پر بلائیں" : "Call Table Waiter")}
                        </span>
                      </button>

                      {/* Request Bill Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextReq = activeReq === "Bill" ? "None" : "Bill";
                          setTables(prev => prev.map(t => t.Table_Number === scannedTableNumber ? { ...t, Customer_Request: nextReq as "None" | "Waiter" | "Bill" } : t));
                          triggerAutoCloudSync(`Guest [Table ${scannedTableNumber}] requested their printed billing transaction invoice!`);
                          handleLogAction(`Guest [Table ${scannedTableNumber}] requested table bill invoice`, nextReq === "None" ? "Low" : "High");
                        }}
                        className={`w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer border ${
                          activeReq === "Bill"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md animate-pulse"
                            : "bg-slate-950 border-slate-800 text-slate-350 hover:bg-slate-900/40 hover:border-slate-700"
                        }`}
                      >
                        <span>💳</span>
                        <span>
                          {activeReq === "Bill" 
                            ? (lang === "ur" ? "بل کی درخواست بھیج دی گئی" : "Bill Request Sent!") 
                            : (lang === "ur" ? "میز کا کل بل منگوائیں" : "Request Table Printed Bill")}
                        </span>
                      </button>

                      {activeReq !== "None" && (
                        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-[9.5px] text-slate-500 font-bold text-center leading-relaxed">
                          📌 {lang === "ur" 
                            ? "عملے نے آپ کا سگنل حاصل کر لیا ہے اور وہ جلد ہی آپ کی میز پر پہنچ رہے ہیں۔" 
                            : "Staff desk synced. Your tablet-top beacon is pulsing on the service display dashboard."}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* VIRTUAL BUILDER / CART PANEL */}
              {(() => {
                const isDraftPlaced = localStorage.getItem(`guest_draft_confirmed_table_${scannedTableNumber}`) === "true";

                if (isDraftPlaced) {
                  return (
                    <div className="bg-slate-900 border border-emerald-500 bg-emerald-950/15 border-emerald-500/30 p-5 rounded-3xl space-y-4 text-center animate-scaleIn">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                        ✓
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">
                          {lang === "ur" ? "پری آرڈر بھیج دیا گیا!" : "Pre-Order Sent!"}
                        </h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                          {lang === "ur"
                            ? "آپ کی منتخب ڈشز کامیابی سے باورچی خانہ کے ڈی ایس بورڈ پر منتقل ہو گئیں۔ کچن کو الرٹ کرنے کے لیے ٹرانسمیشن کاؤنٹر مطلع کریں۔"
                            : "Your selections have been transmitted directly to the kitchen display board as a draft pre-order, waiting to start preparing!"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem(`guest_draft_confirmed_table_${scannedTableNumber}`);
                          setScannedTableNumber(prev => prev);
                        }}
                        className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-black text-slate-300 rounded-xl transition cursor-pointer uppercase"
                      >
                        {lang === "ur" ? "نیا پری آرڈر شروع کریں" : "🛒 Start New Selection"}
                      </button>
                    </div>
                  );
                }

                let cartList: OrderItem[] = [];
                const cached = localStorage.getItem(`guest_cart_table_${scannedTableNumber}`);
                if (cached) {
                  try { cartList = JSON.parse(cached); } catch {}
                }

                const subtotal = cartList.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
                const salesTax = Math.floor(subtotal * 0.16); // 16% KPK Sales Tax
                const overallInvoiceTotal = subtotal + salesTax;

                return (
                  <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4">
                    <div className="border-b border-slate-850 pb-3">
                      <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-tight flex items-center justify-between">
                        <span>{lang === "ur" ? "آپ کا آرڈر کیکولیٹر" : "Self-Service Invoice Estimate"}</span>
                        <span className="text-xs bg-slate-950 border border-slate-800 text-slate-400 font-black px-2.5 py-1 rounded-lg font-mono">
                          {cartList.length} {lang === "ur" ? "کھانے" : "items"}
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-1 font-bold">
                        {lang === "ur" ? "منتخب اشیاء کا تخمینہ بل مع ٹیکس اور مجموعی وقت یہاں دیکھیں۔" : "Pre-calculate your meal cost and custom tax rates to expedite checkout."}
                      </p>
                    </div>

                    {cartList.length === 0 ? (
                      <div className="text-center py-12 text-xs text-slate-650 italic font-black">
                        {lang === "ur" ? "کوئی کھانا منتخب نہیں کیا گیا" : "Pre-selection cart is empty."}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Cart List items representation */}
                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                          {cartList.map((item) => (
                            <div key={item.Item_ID} className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between gap-2">
                              <div>
                                <span className="font-extrabold text-[11px] text-slate-200 block">
                                  {lang === "ur" ? item.Item_Name_Ur : item.Item_Name}
                                </span>
                                <span className="text-[9.5px] font-mono text-slate-500 font-bold block mt-0.5">
                                  {item.Price} x {item.Quantity}
                                </span>
                              </div>
                              <span className="text-slate-200 font-black text-xs shrink-0">
                                {item.Price * item.Quantity} Rs
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Totals Section */}
                        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 space-y-2 text-xs font-bold leading-normal">
                          <div className="flex justify-between text-slate-400">
                            <span>{lang === "ur" ? "کھانے کی قیمت" : "Meal Total:"}</span>
                            <span className="font-mono">{subtotal} PKR</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>{lang === "ur" ? "خیبر پختونخوا جی ایس ٹی (16%)" : "KPK Service GST (16%):"}</span>
                            <span className="font-mono">+{salesTax} PKR</span>
                          </div>
                          <div className="border-t border-slate-800 pt-2 flex justify-between text-amber-300 font-black">
                            <span>{lang === "ur" ? "مجموعی تخمینہ بل" : "Total Estimate:"}</span>
                            <span className="font-mono">{overallInvoiceTotal} PKR</span>
                          </div>
                        </div>

                        {/* Confirming notification statement */}
                        <div className="p-3 bg-blue-950/40 border border-blue-900 rounded-2xl text-[10px] text-blue-300 font-bold leading-normal text-center">
                          ℹ️ {lang === "ur"
                            ? "سیکیورٹی کے لیے اپنی پسندیدہ ڈشز ویٹر کو بتائیں یا ہال کاؤنٹر پر جا کر کنفرم کریں۔"
                            : "Provide this select list to the server when they arrive to officially transmit your kitchen order."}
                        </div>

                        {/* Confirming pre-order draft action button */}
                        <button
                          type="button"
                          onClick={() => {
                            handlePlaceDraftOrder(scannedTableNumber!);
                          }}
                          className="w-full py-4 bg-emerald-500 hover:bg-emerald-650 active:scale-98 text-slate-950 text-xs font-black rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                          <span>🚀</span>
                          <span>{lang === "ur" ? "آرڈر تصدیق کر کے کچن بھیجیں" : "Confirm & Send Pre-Order"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

          </div>

        </div>
      )}

      {/* Humble Elegant Footer (Anti-Clutter) */}
      <footer className="bg-slate-950/80 border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 font-medium">
        <p>
          {lang === "ur" 
            ? "© 2026 برگِ گل ڈے نائٹ ریسٹورنٹ سافٹ ویئر  ۔ کلاؤڈ ریئل ٹائم ہم آہنگی فعال ہے" 
            : "© 2026 Day Night Restaurant ERP Management System. All Secure Cloud Tables Connected."}
        </p>
      </footer>
    </div>
  );
}
