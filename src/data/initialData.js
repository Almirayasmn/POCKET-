// Initial Data for Pocket Duo: Yasmeen (China), Adziima (Indonesia), & Tabungan Emas Berdua

export const DEFAULT_EXCHANGE_RATE = 2750; // 1 CNY = 2.750 IDR

// Yasmeen Categories (Nanning, China - Sesuai Prinsip Anggaran Bulanan)
export const YASMEEN_CATEGORIES = [
  { id: 'makan', name: 'Makan', iconName: 'Utensils', budgetIdr: 2475000, budgetCny: 900, color: '#f472b6', note: 'Makan Rp 82.500/hari (Rp 2.475.000/bln ≈ ¥900)' },
  { id: 'jajan', name: 'Jajan & nongkrong', iconName: 'Coffee', budgetIdr: 550000, budgetCny: 200, color: '#ec4899', note: 'Jajan & santai (Rp 550.000 ≈ ¥200)' },
  { id: 'pos_tambahan', name: 'Pos tambahan', iconName: 'Tag', budgetIdr: 0, budgetCny: 0, color: '#94a3b8', note: 'Pos cadangan' },
  { id: 'transport', name: 'Transport', iconName: 'Train', budgetIdr: 275000, budgetCny: 100, color: '#38bdf8', note: 'Metro & bus Nanning (Rp 275.000 ≈ ¥100)' },
  { id: 'internet', name: 'Internet', iconName: 'Wifi', budgetIdr: 165000, budgetCny: 60, color: '#2dd4bf', note: 'Paket data bulanan (Rp 165.000 ≈ ¥60)' },
  { id: 'laundry', name: 'Laundry', iconName: 'Shirt', budgetIdr: 110000, budgetCny: 40, color: '#34d399', note: 'Mesin cuci kampus (Rp 110.000 ≈ ¥40)' },
  { id: 'listrik_air', name: 'Listrik & air', iconName: 'Zap', budgetIdr: 137500, budgetCny: 50, color: '#fbbf24', note: 'Token utilitas asrama (Rp 137.500 ≈ ¥50)' },
  { id: 'kesehatan', name: 'Kesehatan', iconName: 'HeartPulse', budgetIdr: 137500, budgetCny: 50, color: '#f87171', note: 'Obat & vitamin (Rp 137.500 ≈ ¥50)' },
  { id: 'belanja_lain', name: 'Belanja lain', iconName: 'ShoppingBag', budgetIdr: 192500, budgetCny: 70, color: '#f472b6', note: 'Keperluan harian (Rp 192.500 ≈ ¥70)' },
  { id: 'toiletries', name: 'Toiletries', iconName: 'Luggage', budgetIdr: 0, budgetCny: 0, color: '#a855f7', note: 'Peralatan mandi' },
  { id: 'asrama', name: 'Asrama', iconName: 'Zap', budgetIdr: 0, budgetCny: 0, color: '#6366f1', note: 'Keperluan asrama' },
  { id: 'kebutuhan_awal', name: 'Kebutuhan awal', iconName: 'Luggage', budgetIdr: 500000, budgetCny: 182, color: '#fb923c', note: 'Biaya awal Nov: Rp 500.000 (¥182)' },
  { id: 'tiket_pesawat', name: 'Tiket Pesawat', iconName: 'Plane', budgetIdr: 0, budgetCny: 0, color: '#0ea5e9', note: 'Penerbangan Indo ⇄ China' },
  { id: 'qris_debit_bca', name: 'QRIS / Debit BCA', iconName: 'CreditCard', budgetIdr: 0, budgetCny: 0, color: '#38bdf8', note: 'Transaksi via QRIS / BCA' },
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
    currency: 'IDR',
    themeColor: '#f472b6',
    initialFundIdr: 10000000, // Rp 10.000.000
    initialFundCny: 3636.36,   // ¥3.636,36
    stipendCny: 1000,          // ¥1.000 per bulan (Rp 2.750.000)
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

export const SAMPLE_YASMEEN_TRANSACTIONS = [];

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

const defaultNowWib = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
const defaultTodayStr = defaultNowWib.toISOString().split('T')[0];
const defaultTodayLabel = `${defaultNowWib.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} (Pegadaian Resmi)`;

export const DEFAULT_GOLD_SAVINGS = {
  brand: 'Galeri 24 (Pegadaian)',
  pricePerGramIdr: 2430000,
  buybackPerGramIdr: 2344000,
  valuationMode: 'sell', // 'sell' or 'buyback'
  lastUpdated: defaultTodayStr,
  lastUpdatedLabel: defaultTodayLabel,
  sourceUrl: 'https://galeri24.co.id/harga-emas',
  priceTable: GALERI24_DEFAULT_PRICE_TABLE,
  targetGrams: 25,
  transactions: [],
  pegadaianLastPrice001g: 24300,
  pegadaianLastBuyback001g: 23440,
  pegadaianLastDate: defaultTodayStr,
  pegadaianLastDateLabel: defaultTodayLabel,
  pegadaianHistory: [
    { date: '2026-10-23', sellPer001g: 24090, buybackPer001g: 23240 },
    { date: '2026-10-24', sellPer001g: 23990, buybackPer001g: 23150 },
    { date: '2026-10-25', sellPer001g: 23990, buybackPer001g: 23150 },
    { date: '2026-10-26', sellPer001g: 23990, buybackPer001g: 23150 },
    { date: '2026-10-27', sellPer001g: 24090, buybackPer001g: 23240 },
    { date: '2026-10-28', sellPer001g: 24300, buybackPer001g: 23440 },
    { date: defaultTodayStr, sellPer001g: 24300, buybackPer001g: 23440 }
  ]
};

export const PAYMENT_METHODS_YASMEEN = [
  'Bank Mandiri',
  'Bank BCA',
  'WeChat Pay',
  'Alipay',
  'E-Wallet',
  'Tunai / Cash'
];

export const PAYMENT_METHODS_ADZIIMA = [
  'BCA',
  'SeaBank',
  'E-Wallet',
  'Tunai / Cash'
];

// Presets (IDR amounts with CNY notes)
export const PRESETS_YASMEEN = [
  { title: 'Nasi Ayam Kantin', amount: 33000, category: 'makan', iconName: 'Utensils', currency: 'IDR', noteCny: '¥12' },
  { title: 'Teh / Minuman', amount: 13750, category: 'jajan', iconName: 'CupSoda', currency: 'IDR', noteCny: '¥5' },
  { title: 'Nongkrong Kafe (Maks. ¥75)', amount: 206250, category: 'jajan', iconName: 'Coffee', currency: 'IDR', noteCny: '¥75' },
  { title: 'Metro Nanning', amount: 11000, category: 'transport', iconName: 'Train', currency: 'IDR', noteCny: '¥4' },
  { title: 'Laundry Kampus', amount: 11000, category: 'laundry', iconName: 'Shirt', currency: 'IDR', noteCny: '¥4' },
  { title: 'Debit BCA / QRIS', amount: 0, category: 'qris_debit_bca', iconName: 'CreditCard', currency: 'IDR', noteCny: '' },
  { title: 'Tiket Pesawat', amount: 4125000, category: 'tiket_pesawat', iconName: 'Plane', currency: 'IDR', noteCny: '¥1.500' },
];

export const PRESETS_ADZIIMA = [
  { title: 'Makan Siang', amount: 20000, category: 'makan_harian', iconName: 'Utensils', currency: 'IDR' },
  { title: 'Beli Rokok', amount: 25000, category: 'rokok', iconName: 'Cigarette', currency: 'IDR' },
  { title: 'Bensin Motor', amount: 25000, category: 'bensin_transport', iconName: 'Bike', currency: 'IDR' },
  { title: 'Kebutuhan Harian', amount: 20000, category: 'belanja_kebutuhan', iconName: 'ShoppingBag', currency: 'IDR' },
  { title: 'Kopi Santai', amount: 15000, category: 'ngopi_santai', iconName: 'Coffee', currency: 'IDR' },
  { title: 'Obat / Vitamin', amount: 15000, category: 'lainnya_obat', iconName: 'Pill', currency: 'IDR' },
];

export const DEFAULT_BUSINESS_DATA = {
  settings: {
    businessName: 'Pocket Fashion Padang',
    tagline: 'Jastip & Baju Impor China · Yasmeen & Adziima',
    originCity: 'China ➔ Bandung ➔ Padang',
    defaultItemPriceChina: 63200,      // Rp 63.200 per pcs (inc ongkir ke Bandung)
    defaultWeightPerBalKg: 35,         // 35 kg per bal
    defaultShippingPerKg: 3700,        // Rp 3.700 per kg (Bandung ke Padang)
    defaultPcsPerBal: 50,              // 50 pcs per bal
    defaultTargetSellPrice: 120000,    // Rp 120.000 harga dasar / setoran saudara
    consignmentPriceToSaudara: 120000, // Harga setoran saudara per pcs
    partnerProfitSplit: { yasmeen: 50, adziima: 50 } // Bagi hasil laba bersih 50:50
  },
  batches: [
    {
      id: 'batch-1',
      name: 'Bal #1 - Baju Import China (Batch 1)',
      date: '2026-11-01',
      status: 'active',
      totalPcs: 50,
      weightKg: 35,
      pricePerPcsChina: 63200,
      totalItemCostChina: 3160000,
      shippingCostPerKg: 3700,
      totalShippingCost: 129500,
      otherCosts: 0,
      totalCapitalCost: 3289500,
      hppPerPcs: 65790,
      targetSellPrice: 120000,
      allocations: {
        saudara: 15,
        cfd: 20,
        live: 15
      },
      notes: 'Batch perdana 50 pcs baju impor. 1 bal 35 kg lewat kargo Bandung ke Padang.'
    }
  ],
  sales: [],
  consignments: [
    {
      id: 'csg-1',
      batchId: 'batch-1',
      saudaraName: 'Saudara / Reseller Padang',
      givenPcs: 15,
      dateGiven: '2026-11-01',
      pricePerPcs: 120000,
      soldPcs: 0,
      returnedPcs: 0,
      notes: 'Titip 15 pcs. Saudara setor Rp 120.000/pcs laku, selisih jual di atas itu jadi untung saudara.'
    }
  ],
  expenses: []
};

