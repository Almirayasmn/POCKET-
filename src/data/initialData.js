// Initial Data for Pocket Duo: Yasmeen (China), Adziima (Indonesia), & Tabungan Emas Berdua

export const DEFAULT_EXCHANGE_RATE = 2750; // 1 CNY = 2.750 IDR

// Yasmeen Categories (Nanning, China - Sesuai Google Sheet & Prinsip Stipend ¥1.500)
export const YASMEEN_CATEGORIES = [
  { id: 'makan', name: 'Makan', iconName: 'Utensils', budgetCny: 900, color: '#f472b6', note: 'Makan ¥30/hari (¥900/bulan)' },
  { id: 'jajan', name: 'Jajan & nongkrong', iconName: 'Coffee', budgetCny: 200, color: '#ec4899', note: 'Jajan & santai' },
  { id: 'pos_tambahan', name: 'Pos tambahan', iconName: 'Tag', budgetCny: 0, color: '#94a3b8', note: 'Pos cadangan' },
  { id: 'transport', name: 'Transport', iconName: 'Train', budgetCny: 100, color: '#38bdf8', note: 'Metro & bus Nanning' },
  { id: 'internet', name: 'Internet', iconName: 'Wifi', budgetCny: 60, color: '#2dd4bf', note: 'Paket data bulanan' },
  { id: 'laundry', name: 'Laundry', iconName: 'Shirt', budgetCny: 40, color: '#34d399', note: 'Mesin cuci kampus' },
  { id: 'listrik_air', name: 'Listrik & air', iconName: 'Zap', budgetCny: 50, color: '#fbbf24', note: 'Token utilitas asrama' },
  { id: 'kesehatan', name: 'Kesehatan', iconName: 'HeartPulse', budgetCny: 50, color: '#f87171', note: 'Obat & vitamin' },
  { id: 'belanja_lain', name: 'Belanja lain', iconName: 'ShoppingBag', budgetCny: 70, color: '#f472b6', note: 'Keperluan harian' },
  { id: 'toiletries', name: 'Toiletries', iconName: 'Luggage', budgetCny: 0, color: '#a855f7', note: 'Peralatan mandi' },
  { id: 'asrama', name: 'Asrama', iconName: 'Zap', budgetCny: 0, color: '#6366f1', note: 'Keperluan asrama' },
  { id: 'kebutuhan_awal', name: 'Kebutuhan awal', iconName: 'Luggage', budgetCny: 182, color: '#fb923c', note: 'Biaya awal Nov: Rp 500rb (¥182)' },
  { id: 'tiket_pesawat', name: 'Tiket Pesawat', iconName: 'Plane', budgetCny: 0, color: '#0ea5e9', note: 'Penerbangan Indo ⇄ China' },
  { id: 'qris_debit_bca', name: 'QRIS / Debit BCA', iconName: 'CreditCard', budgetCny: 0, color: '#38bdf8', note: 'Transaksi via QRIS / BCA' },
];

// Adziima Categories (Indonesia - Rupiah Rp, Hemat & Rapi)
export const ADZIIMA_CATEGORIES = [
  { id: 'makan_harian', name: 'Makan Harian', iconName: 'Utensils', budgetIdr: 0, color: '#38bdf8', note: 'Makan siang & malam' },
  { id: 'rokok', name: 'Rokok', iconName: 'Cigarette', budgetIdr: 0, color: '#f97316', note: 'Pos rokok harian' },
  { id: 'bensin_transport', name: 'Bensin & Transport', iconName: 'Bike', budgetIdr: 0, color: '#60a5fa', note: 'Bensin motor & parkir' },
  { id: 'belanja_kebutuhan', name: 'Kebutuhan Pokok', iconName: 'ShoppingBag', budgetIdr: 0, color: '#34d399', note: 'Kebutuhan harian' },
  { id: 'pulsa_internet', name: 'Paket Data & Pulsa', iconName: 'Wifi', budgetIdr: 0, color: '#2dd4bf', note: 'Komunikasi bulanan' },
  { id: 'ngopi_santai', name: 'Ngopi / Nongkrong', iconName: 'Coffee', budgetIdr: 0, color: '#fbbf24', note: 'Kopi santai terencana' },
  { id: 'lainnya_obat', name: 'Lainnya & Obat', iconName: 'Pill', budgetIdr: 0, color: '#f43f5e', note: 'Obat, vitamin & kebutuhan darurat' },
];

export const DEFAULT_USERS = {
  yasmeen: {
    id: 'yasmeen',
    name: 'Yasmeen Almira',
    avatarImage: null, // Base64 data URL or null
    avatarInitials: 'YA',
    roleTag: 'Nanning, China',
    bio: '', // Kosongkan awal sesuai permintaan
    currency: 'CNY',
    themeColor: '#f472b6',
    initialFundIdr: 10000000, // Rp 10.000.000
    initialFundCny: 3636.36,   // ¥3.636,36
    stipendCny: 1000,          // ¥1.000 per bulan
    stipendReceived: false,
    otherIncomeCny: 0,
    emergencyReserveCny: 1000, // ¥1.000 cadangan (Rp 2.750.000)
    emergencyReserveIdr: 2750000,
  },
  adziima: {
    id: 'adziima',
    name: 'Muhammad Mulkan Adziima',
    avatarImage: null,
    avatarInitials: 'MA',
    roleTag: 'Indonesia',
    bio: '', // Kosongkan awal sesuai permintaan
    currency: 'IDR',
    themeColor: '#38bdf8',
    initialFundIdr: 0, // Kosongkan awal sesuai permintaan
    emergencyReserveIdr: 0,
  }
};

export const SAMPLE_YASMEEN_TRANSACTIONS = [
  {
    id: 'tx-y1',
    date: '2026-11-01',
    category: 'makan',
    title: 'Nasi ayam',
    amountCny: 12,
    amountIdr: 33000,
    inputCurrency: 'CNY',
    type: 'Keluar',
    paidBy: 'yasmeen',
    paymentMethod: 'WeChat Pay',
    notes: 'Kantin kampus'
  },
  {
    id: 'tx-y2',
    date: '2026-11-01',
    category: 'jajan',
    title: 'Teh',
    amountCny: 5,
    amountIdr: 13750,
    inputCurrency: 'CNY',
    type: 'Keluar',
    paidBy: 'yasmeen',
    paymentMethod: 'Alipay',
    notes: 'Minuman'
  },
  {
    id: 'tx-y3',
    date: '2026-11-02',
    category: 'jajan',
    title: 'Kafe bersama Najma',
    amountCny: 45,
    amountIdr: 123750,
    inputCurrency: 'CNY',
    type: 'Keluar',
    paidBy: 'yasmeen',
    paymentMethod: 'WeChat Pay',
    notes: 'Nongkrong kafe'
  }
];

export const SAMPLE_ADZIIMA_TRANSACTIONS = [];

export const GALERI24_DEFAULT_PRICE_TABLE = [
  { grams: 0.5, sell: 1316000, buyback: 1179000 },
  { grams: 1, sell: 2510000, buyback: 2363000 },
  { grams: 2, sell: 4960000, buyback: 4718000 },
  { grams: 5, sell: 12307000, buyback: 11795000 },
  { grams: 10, sell: 24549000, buyback: 23591000 },
  { grams: 25, sell: 61040000, buyback: 58688000 },
  { grams: 50, sell: 121984000, buyback: 117377000 },
  { grams: 100, sell: 243849000, buyback: 234755000 }
];

export const DEFAULT_GOLD_SAVINGS = {
  brand: 'Galeri 24 (Pegadaian)',
  pricePerGramIdr: 2510000,
  buybackPerGramIdr: 2363000,
  valuationMode: 'sell', // 'sell' or 'buyback'
  lastUpdated: '2026-10-20',
  lastUpdatedLabel: 'Selasa, 20 Oktober 2026',
  sourceUrl: 'https://galeri24.co.id/harga-emas',
  priceTable: GALERI24_DEFAULT_PRICE_TABLE,
  targetGrams: 25,
  transactions: []
};

export const PAYMENT_METHODS_YASMEEN = [
  'Bank Mandiri',
  'Bank BCA',
  'E-Wallet',
  'Tunai / Cash'
];

export const PAYMENT_METHODS_ADZIIMA = [
  'BCA',
  'SeaBank',
  'E-Wallet',
  'Tunai / Cash'
];

// Presets (Professional clean labels)
export const PRESETS_YASMEEN = [
  { title: 'Tiket Pesawat', amount: 1500, category: 'tiket_pesawat', iconName: 'Plane', currency: 'CNY' },
  { title: 'Nasi Ayam Kantin', amount: 12, category: 'makan', iconName: 'Utensils', currency: 'CNY' },
  { title: 'Teh / Minuman', amount: 5, category: 'jajan', iconName: 'CupSoda', currency: 'CNY' },
  { title: 'Nongkrong Kafe (Maks. ¥75)', amount: 75, category: 'jajan', iconName: 'Coffee', currency: 'CNY' },
  { title: 'Metro Nanning', amount: 4, category: 'transport', iconName: 'Train', currency: 'CNY' },
  { title: 'Laundry Kampus', amount: 4, category: 'laundry', iconName: 'Shirt', currency: 'CNY' },
  { title: 'Debit BCA / QRIS', amount: 0, category: 'qris_debit_bca', iconName: 'CreditCard', currency: 'IDR' },
];

export const PRESETS_ADZIIMA = [
  { title: 'Makan Siang', amount: 20000, category: 'makan_harian', iconName: 'Utensils', currency: 'IDR' },
  { title: 'Beli Rokok', amount: 25000, category: 'rokok', iconName: 'Cigarette', currency: 'IDR' },
  { title: 'Bensin Motor', amount: 25000, category: 'bensin_transport', iconName: 'Bike', currency: 'IDR' },
  { title: 'Kebutuhan Harian', amount: 20000, category: 'belanja_kebutuhan', iconName: 'ShoppingBag', currency: 'IDR' },
  { title: 'Kopi Santai', amount: 15000, category: 'ngopi_santai', iconName: 'Coffee', currency: 'IDR' },
  { title: 'Obat / Vitamin', amount: 15000, category: 'lainnya_obat', iconName: 'Pill', currency: 'IDR' },
];
