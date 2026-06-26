export enum StaffRole {
  SuperAdmin = "Super Admin",
  Admin = "Admin",
  Waiter = "Waiter",
  Kitchen = "Kitchen",
  Counter = "Counter",
  Rider = "Rider"
}

export interface UserRow {
  User_ID: string;
  Name: string;
  Name_Ur: string;
  Role: StaffRole;
  Role_Ur: string;
  Password_Hash: string; // default "0000" PIN
  Phone_Number: string;
  Photo_URL: string;
  Attendance_Status: "Duty" | "Off" | "Leave";
  // Expanded profile data for Restaurant ERP Staff file:
  CNIC: string;
  Address: string;
  Joined_Date: string;
  Leave_Records: string[]; // e.g., ["2026-06-01: Sick Leave"]
  Orders_Handled: number;
  Working_Hours: number;
}

export interface RecipeIngredient {
  Raw_Item_ID: string;
  Qty: number; // in grams or units
}

export interface MenuItem {
  Item_ID: string;
  Item_Name: string; // English
  Item_Name_Ur: string; // Urdu translation
  Category: "Pizzas" | "Burgers" | "Shorma & Rolls" | "Wings & Sides" | "Deals" | "Quetta Chai & Paratha" | "Lunch & BBQ" | "Desserts";
  Sales_Price: number;
  Preparation_Time_Mins: number;
  Recipe_Ingredients: RecipeIngredient[];
  Image_Url?: string;
  Inventory_Method?: "Batch" | "Direct"; // Batch production or Direct recipe deduction
  Batch_Yield?: number; // How many plates/units in 1 Cooker/Batch (e.g., 50)
  Available_Portions?: number; // Portion stock currently prepared and remaining in KDS (e.g. 32)
}

export interface BatchCookLog {
  Batch_ID: string;
  Item_ID: string;
  Item_Name: string;
  Item_Name_Ur: string;
  Quantity_Batches: number; // how many Cookers (دیگ) prepared
  Yield_Portions: number; // Quantity_Batches * Batch_Yield
  Timestamp: string;
}

export interface FinishedWasteLog {
  Waste_ID: string;
  Item_ID: string;
  Item_Name: string;
  Item_Name_Ur: string;
  Quantity_Discarded: number; // plates/portions wasted
  Timestamp: string;
  Reason: string;
}

export interface InventoryItem {
  Raw_Item_ID: string;
  Raw_Item_Name: string;
  Raw_Item_Name_Ur: string;
  Current_Stock_Qty: number;
  Unit: "KG" | "Litre" | "Gram" | "Units";
  Cost_Price: number;
  Min_Stock_Alert_Level: number;
  Last_Updated_Time: string;
  Image_Url?: string;
  // Anti-Theft Expected vs Actual fields & Movement tracking
  Opening_Stock_Qty: number;
  Purchased_Stock_Qty: number;
  Expected_Usage_Qty: number; // Auto calculated from orders
  Actual_Usage_Qty: number;   // Tracked by real physical counts
  Waste_Qty: number;          // Damaged/expired raw items
}

export interface TableStatus {
  Table_Number: number;
  Status: "Empty" | "Occupied" | "WaitingForBill" | "Reserved";
  Current_Order_ID: string | null;
  Assigned_Waiter_ID: string;
  QR_Code_String: string;
  Customer_Request: "None" | "Waiter" | "Bill";
  Customer_Name?: string;
  People_Count?: number;
}

export interface InventoryPurchase {
  Purchase_ID: string;
  Date: string;
  Raw_Item_ID: string;
  Supplier: string;
  Quantity: number;
  Cost: number;
  Invoice_Photo: string;
  Payment_Status: "Paid" | "Pending";
}

export interface OrderItem {
  Item_ID: string;
  Item_Name: string;
  Item_Name_Ur: string;
  Price: number;
  Quantity: number;
  Status?: string;
  Serving_Size?: "Full" | "Half";
}

export interface OrderBill {
  Order_ID: string;
  Table_Number: number;
  Order_Items: OrderItem[];
  Total_Amount: number;
  Payment_Status: "Pending" | "Paid" | "Cancelled";
  Payment_Method: "Cash" | "Online" | "Credit" | null;
  Credit_Holder_Name: string | null;
  Cancellation_Reason: string | null;
  Cancellation_Approved_By: string | null; // Cashier or Admin approval workflow
  Cancellation_Status?: "PendingApproval" | "Approved" | "Rejected";
  Sync_Status: "Synced to Cloud" | "Local Only";
  Created_At: string;
  Order_Type?: "Dine-In" | "Delivery" | "Takeaway";
}

export interface KDSOrder {
  KDS_ID: string;
  Order_ID: string;
  Table_Number: number;
  Kitchen_Status: "Pending" | "Cooking" | "Ready" | "Draft" | "Delivered";
  Target_Time: string; // ISO string
  Delay_Time_Added: number; // in mins
  Customer_Notified: "Yes" | "No";
  Items: OrderItem[];
}

export interface DailyExpense {
  Entry_ID: string;
  Type: "Income" | "Expense";
  Category: "Salary" | "Bill" | "Fuel" | "Purchase" | "Food Sale" | "Electricity Bill" | "Gas Bill" | "Water Bill" | "Internet Bill" | "Staff Salaries" | "Rent" | "Maintenance" | "Cleaning Expenses" | "Packaging Costs" | "Fuel Costs" | "Kitchen Equipment Purchases" | "Emergency Expenses" | "Other Custom Expenses" | "Other";
  Amount: number;
  Description: string;
  Description_Ur?: string;
  Timestamp: string;
}

// Internal Messaging
export interface StaffMessage {
  Message_ID: string;
  From_User_ID: string;
  From_Name: string;
  To_User_Or_Group: string; // e.g. "ALL", "KITCHEN", "ST01"
  Message_Text: string;
  Timestamp: string;
}

// Delivery tracking structure
export interface DeliveryOrder {
  Delivery_ID: string;
  Order_ID: string;
  Customer_Name: string;
  Customer_Phone: string;
  Customer_Address: string;
  Total_Cash_To_Collect: number;
  Delivery_Status: "Received" | "Preparing" | "Ready" | "Picked Up" | "On The Way" | "Delivered" | "Cancelled" | "Pending" | "In-Transit";
  Rider_ID: string;
  Created_At: string;
}

// Activity logging for security audit
export interface ActivityLog {
  Log_ID: string;
  User_Name: string;
  User_Role: string;
  Action: string;
  Severity: "Low" | "Medium" | "High" | "Critical";
  Timestamp: string;
}

export interface CustomerProfile {
  Customer_ID: string;
  Name: string;
  Phone_Number: string;
  Address: string;
  Total_Spending: number;
  Order_Count: number;
  Favorite_Items: string[];
}

export interface BrandingConfig {
  restaurantName: string;
  logoUrl: string;
  coverUrl: string;
  photos: string[];
  contactNumbers: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
}

export const DEFAULT_BRANDING: BrandingConfig = {
  restaurantName: "DAY NIGHT RESTAURANT - LANDI KOTAL",
  logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
  coverUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&auto=format&fit=crop&q=80",
  photos: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&auto=format&fit=crop&q=80"
  ],
  contactNumbers: "0300-1234567, 0313-9220033",
  address: "Landi Kotal Bypass Road, Adjacent to historical Khyber Pass gate, District Khyber, Khyber Pakhtunkhwa, Pakistan",
  facebookUrl: "https://facebook.com/daynightlandikotal",
  instagramUrl: "https://instagram.com/daynightlandikotal"
};

// Initial bilingual user roles database
export const INITIAL_USERS: UserRow[] = [
  { User_ID: "ST01", Name: "Muhammad Irfan (Owner)", Name_Ur: "محمد عرفان (مالک)", Role: StaffRole.SuperAdmin, Role_Ur: "سپر ایڈمن", Password_Hash: "0000", Phone_Number: "0300-1234567", Photo_URL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60", Attendance_Status: "Duty", CNIC: "42101-1234567-1", Address: "Saddar Cantt Extension, Peshawar", Joined_Date: "2024-03-12", Leave_Records: [], Orders_Handled: 42, Working_Hours: 190 },
  { User_ID: "ST02", Name: "Kashif Ali (Counter Cashier)", Name_Ur: "کاشف علی (کاؤنٹر منیجر)", Role: StaffRole.Counter, Role_Ur: "کاؤنٹر منیجر", Password_Hash: "0000", Phone_Number: "0321-7654321", Photo_URL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60", Attendance_Status: "Duty", CNIC: "42101-9876543-2", Address: "G-11 Markaz, Islamabad", Joined_Date: "2025-01-05", Leave_Records: ["2026-03-01: Auto Leave APPROVED"], Orders_Handled: 154, Working_Hours: 250 },
  { User_ID: "ST03", Name: "Chef Ramzan (Kitchen)", Name_Ur: "شیف رمضان (کچن)", Role: StaffRole.Kitchen, Role_Ur: "باورچی / شیف", Password_Hash: "0000", Phone_Number: "0333-5551234", Photo_URL: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=60", Attendance_Status: "Duty", CNIC: "13501-4433221-5", Address: "GT Road, Charsadda", Joined_Date: "2024-08-20", Leave_Records: ["2026-05-15: Sick Leave"], Orders_Handled: 290, Working_Hours: 280 },
  { User_ID: "ST04", Name: "Asif (Hall Waiter)", Name_Ur: "آصف ویٹر", Role: StaffRole.Waiter, Role_Ur: "ہال ویٹر", Password_Hash: "0000", Phone_Number: "0312-9998887", Photo_URL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60", Attendance_Status: "Duty", CNIC: "17301-5123456-7", Address: "University Road, Peshawar", Joined_Date: "2025-02-14", Leave_Records: [], Orders_Handled: 85, Working_Hours: 160 },
  { User_ID: "ST05", Name: "Bilal (Rider Delivery)", Name_Ur: "بلال رائڈر", Role: StaffRole.Rider, Role_Ur: "ڈیلیوری بوائے", Password_Hash: "0000", Phone_Number: "0345-4443322", Photo_URL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60", Attendance_Status: "Duty", CNIC: "16202-0987654-3", Address: "Karkhano Market, Peshawar", Joined_Date: "2025-04-01", Leave_Records: [], Orders_Handled: 110, Working_Hours: 175 }
];

// Rich menu database matching "Day Night Restaurant" menu in the prompt precisely
export const INITIAL_MENU: MenuItem[] = [
  // 1. Pizzas
  { Item_ID: "P01", Item_Name: "Day Night Special Pizza (M)", Item_Name_Ur: "ڈے نائٹ اسپیشل پیزا (Medium)", Category: "Pizzas", Sales_Price: 1000, Preparation_Time_Mins: 15, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 200 }, { Raw_Item_ID: "R03", Qty: 30 }, { Raw_Item_ID: "R05", Qty: 100 }], Image_Url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "P02", Item_Name: "Day Night Special Pizza (L)", Item_Name_Ur: "ڈے نائٹ اسپیشل پیزا (Large)", Category: "Pizzas", Sales_Price: 1600, Preparation_Time_Mins: 20, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 350 }, { Raw_Item_ID: "R03", Qty: 50 }, { Raw_Item_ID: "R05", Qty: 180 }], Image_Url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "P03", Item_Name: "Crown Crust Pizza (Medium)", Item_Name_Ur: "کراؤن کرسٹ پیزا (Medium)", Category: "Pizzas", Sales_Price: 950, Preparation_Time_Mins: 15, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 180 }, { Raw_Item_ID: "R03", Qty: 30 }], Image_Url: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "P04", Item_Name: "Crown Crust Pizza (Large)", Item_Name_Ur: "کراؤن کرسٹ پیزا (Large)", Category: "Pizzas", Sales_Price: 1500, Preparation_Time_Mins: 20, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 300 }, { Raw_Item_ID: "R03", Qty: 45 }], Image_Url: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "P05", Item_Name: "Chicken Fajita Pizza (Medium)", Item_Name_Ur: "چکن فجیتا پیزا (Medium)", Category: "Pizzas", Sales_Price: 900, Preparation_Time_Mins: 15, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 180 }, { Raw_Item_ID: "R03", Qty: 25 }], Image_Url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "P06", Item_Name: "Cheese Lover Pizza (Medium)", Item_Name_Ur: "چیز لور پیزا (Medium)", Category: "Pizzas", Sales_Price: 900, Preparation_Time_Mins: 12, Recipe_Ingredients: [{ Raw_Item_ID: "R03", Qty: 60 }], Image_Url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "P07", Item_Name: "Chicken Tikka Pizza (Medium)", Item_Name_Ur: "چکن تکہ پیزا (Medium)", Category: "Pizzas", Sales_Price: 900, Preparation_Time_Mins: 15, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 180 }, { Raw_Item_ID: "R03", Qty: 25 }], Image_Url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "P08", Item_Name: "Italian Lasagna Pizza (L)", Item_Name_Ur: "اطالوی لزانیا پیزا (Large)", Category: "Pizzas", Sales_Price: 1050, Preparation_Time_Mins: 18, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 220 }], Image_Url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&auto=format&fit=crop&q=60" },

  // 2. Burgers
  { Item_ID: "B01", Item_Name: "Zinger Burger", Item_Name_Ur: "زنگر برگر", Category: "Burgers", Sales_Price: 340, Preparation_Time_Mins: 10, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 150 }, { Raw_Item_ID: "R06", Qty: 1 }], Image_Url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "B02", Item_Name: "Tower Burger", Item_Name_Ur: "ٹاور برگر اسپیشل", Category: "Burgers", Sales_Price: 550, Preparation_Time_Mins: 12, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 250 }, { Raw_Item_ID: "R06", Qty: 1 }], Image_Url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "B03", Item_Name: "Tikka Burger", Item_Name_Ur: "تکہ چکن برگر", Category: "Burgers", Sales_Price: 320, Preparation_Time_Mins: 10, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 120 }, { Raw_Item_ID: "R06", Qty: 1 }], Image_Url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "B04", Item_Name: "Mighty Burger", Item_Name_Ur: "مایٹی ڈبل پیٹی برگر", Category: "Burgers", Sales_Price: 580, Preparation_Time_Mins: 14, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 300 }, { Raw_Item_ID: "R06", Qty: 2 }], Image_Url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=60" },

  // 3. Shorma & Rolls
  { Item_ID: "S01", Item_Name: "Zinger Roll", Item_Name_Ur: "زنگر کباب رول", Category: "Shorma & Rolls", Sales_Price: 230, Preparation_Time_Mins: 8, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 120 }, { Raw_Item_ID: "R04", Qty: 80 }], Image_Url: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "S02", Item_Name: "Normal Shorma", Item_Name_Ur: "سادہ شوارما", Category: "Shorma & Rolls", Sales_Price: 150, Preparation_Time_Mins: 6, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 60 }], Image_Url: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "S03", Item_Name: "Shorma Special", Item_Name_Ur: "اسپیشل ڈے نائٹ شوارما", Category: "Shorma & Rolls", Sales_Price: 250, Preparation_Time_Mins: 8, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 120 }], Image_Url: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "S04", Item_Name: "Cheese Shorma", Item_Name_Ur: "چیز شوارما", Category: "Shorma & Rolls", Sales_Price: 230, Preparation_Time_Mins: 8, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 80 }], Image_Url: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=200&auto=format&fit=crop&q=60" },

  // 4. Wings & Sides
  { Item_ID: "W01", Item_Name: "Hot Wings (5 Pcs)", Item_Name_Ur: "ہاٹ چکن ونگز (5 دانے)", Category: "Wings & Sides", Sales_Price: 350, Preparation_Time_Mins: 10, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 200 }], Image_Url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "W02", Item_Name: "Hot Wings (10 Pcs)", Item_Name_Ur: "ہاٹ چکن ونگز (10 دانے)", Category: "Wings & Sides", Sales_Price: 700, Preparation_Time_Mins: 12, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 400 }], Image_Url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "W03", Item_Name: "Chicken Piece", Item_Name_Ur: "چکن پیس (Deep Fry)", Category: "Wings & Sides", Sales_Price: 220, Preparation_Time_Mins: 8, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 250 }], Image_Url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=200&auto=format&fit=crop&q=60" },

  // 5. Deals
  { Item_ID: "D01", Item_Name: "Student Deal 1", Item_Name_Ur: "اسٹوڈنٹ ڈیل 1 (1 Med Pizza + 2 Zinger + 1.5L)", Category: "Deals", Sales_Price: 1840, Preparation_Time_Mins: 20, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 500 }], Image_Url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "D02", Item_Name: "Student Deal 2", Item_Name_Ur: "اسٹوڈنٹ ڈیل 2 (3 Zinger + 10 Wings + 1L)", Category: "Deals", Sales_Price: 1520, Preparation_Time_Mins: 18, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 800 }], Image_Url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "D03", Item_Name: "Family Deal 1", Item_Name_Ur: "فیملی ڈیل 1 (1 Lrg Pizza + 5 Zinger + 1.5L)", Category: "Deals", Sales_Price: 3220, Preparation_Time_Mins: 25, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 1200 }], Image_Url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "D04", Item_Name: "Family Deal 3", Item_Name_Ur: "فیملی ڈیل 3 (2 Med Pizza + 1.5L)", Category: "Deals", Sales_Price: 2200, Preparation_Time_Mins: 22, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 1000 }], Image_Url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=60" },

  // 6. Quetta Chai & Paratha
  { Item_ID: "C01", Item_Name: "Quetta Chai", Item_Name_Ur: "کوئٹہ چائے (اسپیشل پیالی)", Category: "Quetta Chai & Paratha", Sales_Price: 50, Preparation_Time_Mins: 5, Recipe_Ingredients: [{ Raw_Item_ID: "R07", Qty: 8 }, { Raw_Item_ID: "R08", Qty: 150 }], Image_Url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "C02", Item_Name: "Kashmiri Chai", Item_Name_Ur: "کشمیری چائے اسپیشل", Category: "Quetta Chai & Paratha", Sales_Price: 80, Preparation_Time_Mins: 6, Recipe_Ingredients: [{ Raw_Item_ID: "R08", Qty: 150 }], Image_Url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "C03", Item_Name: "Special Pizza Paratha", Item_Name_Ur: "اسپیشل پیزا پراٹھا", Category: "Quetta Chai & Paratha", Sales_Price: 300, Preparation_Time_Mins: 10, Recipe_Ingredients: [{ Raw_Item_ID: "R04", Qty: 150 }, { Raw_Item_ID: "R03", Qty: 20 }], Image_Url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "C04", Item_Name: "Lachha Paratha", Item_Name_Ur: "لچھا پراٹھا فرائی", Category: "Quetta Chai & Paratha", Sales_Price: 50, Preparation_Time_Mins: 6, Recipe_Ingredients: [{ Raw_Item_ID: "R04", Qty: 120 }, { Raw_Item_ID: "R03", Qty: 20 }], Image_Url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "C05", Item_Name: "Aloo Paratha", Item_Name_Ur: "آلو پراٹھا", Category: "Quetta Chai & Paratha", Sales_Price: 100, Preparation_Time_Mins: 8, Recipe_Ingredients: [{ Raw_Item_ID: "R04", Qty: 150 }, { Raw_Item_ID: "R03", Qty: 15 }], Image_Url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "C06", Item_Name: "Cheese Paratha", Item_Name_Ur: "چیز پراٹھا", Category: "Quetta Chai & Paratha", Sales_Price: 120, Preparation_Time_Mins: 7, Recipe_Ingredients: [{ Raw_Item_ID: "R04", Qty: 120 }], Image_Url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=200&auto=format&fit=crop&q=60" },

  // 7. Lunch & BBQ (Lunch, Dinner & BBQ)
  { Item_ID: "L01", Item_Name: "Dumpukht (Rosh)", Item_Name_Ur: "دم پخت (روش) مٹن اسپیشل", Category: "Lunch & BBQ", Sales_Price: 500, Preparation_Time_Mins: 15, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 400 }], Image_Url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "L02", Item_Name: "Mutton Karahi (Full)", Item_Name_Ur: "چھوٹا گوشت (مٹن) کڑاہی فل", Category: "Lunch & BBQ", Sales_Price: 2200, Preparation_Time_Mins: 30, Recipe_Ingredients: [{ Raw_Item_ID: "R03", Qty: 150 }, { Raw_Item_ID: "R05", Qty: 200 }], Image_Url: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "L03", Item_Name: "Mutton Tikka", Item_Name_Ur: "چھوٹا گوشت تکہ (سیخ)", Category: "Lunch & BBQ", Sales_Price: 2200, Preparation_Time_Mins: 25, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 350 }], Image_Url: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "L04", Item_Name: "Day Night Kabli Pulao", Item_Name_Ur: "ڈے نائٹ اسپیشل کابلی پلاؤ", Category: "Lunch & BBQ", Sales_Price: 600, Preparation_Time_Mins: 10, Recipe_Ingredients: [{ Raw_Item_ID: "R01", Qty: 250 }, { Raw_Item_ID: "R03", Qty: 20 }], Image_Url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=200&auto=format&fit=crop&q=60", Inventory_Method: "Batch", Batch_Yield: 50, Available_Portions: 32 },
  { Item_ID: "L05", Item_Name: "Kabli Pulao Normal", Item_Name_Ur: "کابلی پلاؤ نارمل", Category: "Lunch & BBQ", Sales_Price: 400, Preparation_Time_Mins: 8, Recipe_Ingredients: [{ Raw_Item_ID: "R01", Qty: 200 }], Image_Url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=200&auto=format&fit=crop&q=60", Inventory_Method: "Batch", Batch_Yield: 50, Available_Portions: 18 },
  { Item_ID: "L06", Item_Name: "Chicken Malai Boti", Item_Name_Ur: "چکن ملائی بوٹی (پلیٹ)", Category: "Lunch & BBQ", Sales_Price: 250, Preparation_Time_Mins: 15, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 200 }], Image_Url: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&auto=format&fit=crop&q=60", Inventory_Method: "Direct" },
  { Item_ID: "L07", Item_Name: "Seekh Kabab Plate", Item_Name_Ur: "سیخ کباب سادہ / کڑاہی", Category: "Lunch & BBQ", Sales_Price: 100, Preparation_Time_Mins: 10, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 150 }], Image_Url: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&auto=format&fit=crop&q=60", Inventory_Method: "Direct" },
  { Item_ID: "L08", Item_Name: "Special Chicken Biryani", Item_Name_Ur: "اسپیشل چکن بریانی دیگ", Category: "Lunch & BBQ", Sales_Price: 380, Preparation_Time_Mins: 10, Recipe_Ingredients: [{ Raw_Item_ID: "R01", Qty: 200 }, { Raw_Item_ID: "R02", Qty: 160 }, { Raw_Item_ID: "R03", Qty: 40 }], Image_Url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=200&auto=format&fit=crop&q=60", Inventory_Method: "Batch", Batch_Yield: 50, Available_Portions: 48 },
  { Item_ID: "L09", Item_Name: "Delhi Beef Nihari", Item_Name_Ur: "نہاری مغلئی دہلی اسٹائل", Category: "Lunch & BBQ", Sales_Price: 480, Preparation_Time_Mins: 15, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 180 }, { Raw_Item_ID: "R03", Qty: 50 }], Image_Url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=60", Inventory_Method: "Batch", Batch_Yield: 40, Available_Portions: 12 },
  { Item_ID: "L10", Item_Name: "Shahi Chicken Qorma", Item_Name_Ur: "شاہی چکن قورمہ دیگ", Category: "Lunch & BBQ", Sales_Price: 450, Preparation_Time_Mins: 12, Recipe_Ingredients: [{ Raw_Item_ID: "R02", Qty: 180 }, { Raw_Item_ID: "R03", Qty: 40 }], Image_Url: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&auto=format&fit=crop&q=60", Inventory_Method: "Batch", Batch_Yield: 30, Available_Portions: 25 },

  // 8. Desserts
  { Item_ID: "E01", Item_Name: "Cream Chat (Half)", Item_Name_Ur: "فروٹ کریم چاٹ (ہاف پلیٹ)", Category: "Desserts", Sales_Price: 150, Preparation_Time_Mins: 5, Recipe_Ingredients: [{ Raw_Item_ID: "R08", Qty: 50 }], Image_Url: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "E02", Item_Name: "Cream Chat (Full)", Item_Name_Ur: "فروٹ کریم چاٹ (فل پلیٹ)", Category: "Desserts", Sales_Price: 300, Preparation_Time_Mins: 5, Recipe_Ingredients: [{ Raw_Item_ID: "R08", Qty: 100 }], Image_Url: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=200&auto=format&fit=crop&q=60" },
  { Item_ID: "E03", Item_Name: "Kheer Matka", Item_Name_Ur: "ٹھنڈی مٹکا کھیر اسپیشل", Category: "Desserts", Sales_Price: 90, Preparation_Time_Mins: 2, Recipe_Ingredients: [{ Raw_Item_ID: "R08", Qty: 100 }], Image_Url: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=200&auto=format&fit=crop&q=60" }
];

// Seeded Raw Inventory Goods with Expected vs Actual starting values
export const INITIAL_INVENTORY: InventoryItem[] = [
  { Raw_Item_ID: "R01", Raw_Item_Name: "Basmati Rice", Raw_Item_Name_Ur: "باسمتی چاول", Current_Stock_Qty: 100.0, Unit: "KG", Cost_Price: 280, Min_Stock_Alert_Level: 15.0, Last_Updated_Time: "2026-06-14T03:00:00-07:00", Image_Url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&auto=format&fit=crop&q=60", Expected_Usage_Qty: 14.2, Actual_Usage_Qty: 14.2, Waste_Qty: 0, Opening_Stock_Qty: 120.0, Purchased_Stock_Qty: 25.0 },
  { Raw_Item_ID: "R02", Raw_Item_Name: "Fresh Chicken", Raw_Item_Name_Ur: "تازہ مرغی کا گوشت", Current_Stock_Qty: 50.0, Unit: "KG", Cost_Price: 620, Min_Stock_Alert_Level: 10.0, Last_Updated_Time: "2026-06-14T03:05:00-07:00", Image_Url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=120&auto=format&fit=crop&q=60", Expected_Usage_Qty: 32.5, Actual_Usage_Qty: 32.5, Waste_Qty: 0.5, Opening_Stock_Qty: 60.0, Purchased_Stock_Qty: 40.0 },
  { Raw_Item_ID: "R03", Raw_Item_Name: "Banaspati Ghee", Raw_Item_Name_Ur: "بناسپتی گھی", Current_Stock_Qty: 40.0, Unit: "KG", Cost_Price: 480, Min_Stock_Alert_Level: 8.0, Last_Updated_Time: "2026-06-14T02:30:00-07:00", Image_Url: "https://images.unsplash.com/photo-1622484211148-7359ef1b3f7f?w=120&auto=format&fit=crop&q=60", Expected_Usage_Qty: 8.9, Actual_Usage_Qty: 9.9, Waste_Qty: 0.1, Opening_Stock_Qty: 50.0, Purchased_Stock_Qty: 10.0 }, // Logged discrepancy representing physical shelf audit difference
  { Raw_Item_ID: "R04", Raw_Item_Name: "Fine Wheat Flour", Raw_Item_Name_Ur: "فائن آٹا / گندم", Current_Stock_Qty: 120.0, Unit: "KG", Cost_Price: 140, Min_Stock_Alert_Level: 20.0, Last_Updated_Time: "2026-06-14T01:15:00-07:00", Image_Url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&auto=format&fit=crop&q=60", Expected_Usage_Qty: 24.0, Actual_Usage_Qty: 24.0, Waste_Qty: 0.0, Opening_Stock_Qty: 150.0, Purchased_Stock_Qty: 20.0 },
  { Raw_Item_ID: "R05", Raw_Item_Name: "Fresh Tomatoes", Raw_Item_Name_Ur: "ٹماٹر سبزی", Current_Stock_Qty: 25.0, Unit: "KG", Cost_Price: 120, Min_Stock_Alert_Level: 5.0, Last_Updated_Time: "2026-06-14T03:10:00-07:00", Image_Url: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=120&auto=format&fit=crop&q=60", Expected_Usage_Qty: 6.8, Actual_Usage_Qty: 7.8, Waste_Qty: 0.2, Opening_Stock_Qty: 30.0, Purchased_Stock_Qty: 15.0 }, // discrepancy
  { Raw_Item_ID: "R06", Raw_Item_Name: "Soft Burger Buns", Raw_Item_Name_Ur: "گول برگر بن", Current_Stock_Qty: 100, Unit: "Units", Cost_Price: 35, Min_Stock_Alert_Level: 15, Last_Updated_Time: "2026-06-14T03:11:00-07:00", Image_Url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=120&auto=format&fit=crop&q=60", Expected_Usage_Qty: 12, Actual_Usage_Qty: 12, Waste_Qty: 0, Opening_Stock_Qty: 120.0, Purchased_Stock_Qty: 0.0 },
  { Raw_Item_ID: "R07", Raw_Item_Name: "Tea Leaves (Patti)", Raw_Item_Name_Ur: "چائے پتی پاؤڈر", Current_Stock_Qty: 15, Unit: "KG", Cost_Price: 950, Min_Stock_Alert_Level: 2, Last_Updated_Time: "2026-06-14T03:11:00-07:00", Image_Url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=120&auto=format&fit=crop&q=60", Expected_Usage_Qty: 1.1, Actual_Usage_Qty: 1.1, Waste_Qty: 0.0, Opening_Stock_Qty: 20.0, Purchased_Stock_Qty: 5.0 },
  { Raw_Item_ID: "R08", Raw_Item_Name: "Milk & Dairy", Raw_Item_Name_Ur: "فریش دودھ", Current_Stock_Qty: 50.0, Unit: "Litre", Cost_Price: 180, Min_Stock_Alert_Level: 5, Last_Updated_Time: "2026-06-14T03:11:00-07:00", Image_Url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120&auto=format&fit=crop&q=60", Expected_Usage_Qty: 18.5, Actual_Usage_Qty: 18.5, Waste_Qty: 0, Opening_Stock_Qty: 60.0, Purchased_Stock_Qty: 10.0 }
];

export const INITIAL_TABLES: TableStatus[] = [
  { Table_Number: 1, Status: "Empty", Current_Order_ID: null, Assigned_Waiter_ID: "ST04", QR_Code_String: "TABLE_QR_01", Customer_Request: "None" },
  { Table_Number: 2, Status: "Empty", Current_Order_ID: null, Assigned_Waiter_ID: "ST04", QR_Code_String: "TABLE_QR_02", Customer_Request: "None" },
  { Table_Number: 3, Status: "Empty", Current_Order_ID: null, Assigned_Waiter_ID: "ST04", QR_Code_String: "TABLE_QR_03", Customer_Request: "None" },
  { Table_Number: 4, Status: "Empty", Current_Order_ID: null, Assigned_Waiter_ID: "ST04", QR_Code_String: "TABLE_QR_04", Customer_Request: "None" },
  { Table_Number: 5, Status: "Empty", Current_Order_ID: null, Assigned_Waiter_ID: "ST04", QR_Code_String: "TABLE_QR_05", Customer_Request: "None" },
  { Table_Number: 6, Status: "Empty", Current_Order_ID: null, Assigned_Waiter_ID: "ST04", QR_Code_String: "TABLE_QR_06", Customer_Request: "None" },
  { Table_Number: 7, Status: "Empty", Current_Order_ID: null, Assigned_Waiter_ID: "ST04", QR_Code_String: "TABLE_QR_07", Customer_Request: "None" },
  { Table_Number: 8, Status: "Empty", Current_Order_ID: null, Assigned_Waiter_ID: "ST04", QR_Code_String: "TABLE_QR_08", Customer_Request: "None" }
];

export const INITIAL_ORDERS: OrderBill[] = [
  {
    Order_ID: "ORD-1200",
    Table_Number: 2,
    Order_Items: [
      { Item_ID: "L04", Item_Name: "Day Night Kabli Pulao", Item_Name_Ur: "ڈے نائٹ اسپیشل کابلی پلاؤ", Price: 600, Quantity: 1 },
      { Item_ID: "C01", Item_Name: "Quetta Chai", Item_Name_Ur: "کوئٹہ چائے (اسپیشل پیالی)", Price: 50, Quantity: 2 },
      { Item_ID: "C03", Item_Name: "Special Pizza Paratha", Item_Name_Ur: "اسپیشل پیزا پراٹھا", Price: 300, Quantity: 1 },
      { Item_ID: "E02", Item_Name: "Cream Chat (Full)", Item_Name_Ur: "فروٹ کریم چاٹ (فل پلیٹ)", Price: 300, Quantity: 1 }
    ],
    Total_Amount: 1300,
    Payment_Status: "Pending",
    Payment_Method: null,
    Credit_Holder_Name: null,
    Cancellation_Reason: null,
    Cancellation_Approved_By: null,
    Sync_Status: "Local Only",
    Created_At: "2026-06-14T03:30:00-07:00"
  },
  {
    Order_ID: "ORD-1001",
    Table_Number: 3,
    Order_Items: [
      { Item_ID: "L04", Item_Name: "Day Night Kabli Pulao", Item_Name_Ur: "ڈے نائٹ اسپیشل کابلی پلاؤ", Price: 600, Quantity: 2 },
      { Item_ID: "C04", Item_Name: "Lachha Paratha", Item_Name_Ur: "لچھا پراٹھا فرائی", Price: 50, Quantity: 4 }
    ],
    Total_Amount: 1400,
    Payment_Status: "Paid",
    Payment_Method: "Cash",
    Credit_Holder_Name: null,
    Cancellation_Reason: null,
    Cancellation_Approved_By: null,
    Sync_Status: "Synced to Cloud",
    Created_At: "2026-06-14T01:30:00-07:00"
  }
];

export const INITIAL_KDS: KDSOrder[] = [
  {
    KDS_ID: "KDS-301",
    Order_ID: "ORD-1200",
    Table_Number: 2,
    Kitchen_Status: "Cooking",
    Target_Time: "2026-06-14T04:45:00-07:00",
    Delay_Time_Added: 0,
    Customer_Notified: "No",
    Items: [
      { Item_ID: "L04", Item_Name: "Day Night Kabli Pulao", Item_Name_Ur: "ڈے نائٹ اسپیشل کابلی پلاؤ", Price: 600, Quantity: 1 },
      { Item_ID: "C03", Item_Name: "Special Pizza Paratha", Item_Name_Ur: "اسپیشل پیزا پراٹھا", Price: 300, Quantity: 1 }
    ]
  }
];

export const INITIAL_EXPENSES: DailyExpense[] = [
  { Entry_ID: "EXP-501", Type: "Expense", Category: "Purchase", Amount: 2400, Description: "Purchased 15KG Fresh Chicken", Description_Ur: "اسٹاک چکن خریداری", Timestamp: "2026-06-14T01:45:00-07:00" },
  { Entry_ID: "EXP-502", Type: "Income", Category: "Food Sale", Amount: 1400, Description: "Bill receipt Table #3 Paid", Description_Ur: "ٹیبل 3 چائے پراٹھا ادائیگی", Timestamp: "2026-06-14T02:05:00-07:00" },
  { Entry_ID: "EXP-503", Type: "Expense", Category: "Fuel", Amount: 500, Description: "Generator Fuel refill", Description_Ur: "جنریٹر پٹرول ری فل", Timestamp: "2026-06-14T02:40:00-07:00" }
];
