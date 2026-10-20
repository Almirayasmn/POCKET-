import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  DEFAULT_EXCHANGE_RATE,
  YASMEEN_CATEGORIES,
  ADZIIMA_CATEGORIES,
  DEFAULT_USERS,
  SAMPLE_YASMEEN_TRANSACTIONS,
  SAMPLE_ADZIIMA_TRANSACTIONS,
  DEFAULT_GOLD_SAVINGS,
  GALERI24_DEFAULT_PRICE_TABLE
} from '../data/initialData';
import {
  getSavedFirebaseUrl,
  saveFirebaseUrl,
  fetchCloudData,
  pushCloudData,
  subscribeToCloudChanges
} from '../services/cloudSync';

const STORAGE_KEY = 'pocket_duo_storage_v10';

const PocketContext = createContext(null);

export function PocketProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users?.yasmeen && parsed.users?.adziima) {
          // Ensure Adziima categories include 'rokok' and 'lainnya_obat'
          const existingAdzCats = parsed.adziimaCategories || ADZIIMA_CATEGORIES;
          const adzIds = new Set(existingAdzCats.map(c => c.id));
          const updatedAdzCats = [...existingAdzCats.filter(c => c.id !== 'kesehatan' && c.id !== 'kesehatan_darurat')];
          if (!adzIds.has('rokok')) {
            updatedAdzCats.splice(1, 0, ADZIIMA_CATEGORIES.find(c => c.id === 'rokok'));
          }
          if (!adzIds.has('lainnya_obat')) {
            updatedAdzCats.push(ADZIIMA_CATEGORIES.find(c => c.id === 'lainnya_obat'));
          }

          // Ensure Yasmeen categories include 'tiket_pesawat'
          const existingYasCats = parsed.yasmeenCategories || YASMEEN_CATEGORIES;
          const yasCatIds = new Set(existingYasCats.map(c => c.id));
          const updatedYasCats = [...existingYasCats];
          if (!yasCatIds.has('tiket_pesawat')) {
            updatedYasCats.push(YASMEEN_CATEGORIES.find(c => c.id === 'tiket_pesawat'));
          }

          // Ensure bios are emptied if they still have old default text
          const users = {
            ...parsed.users,
            yasmeen: {
              ...parsed.users.yasmeen,
              bio: (parsed.users.yasmeen?.bio || '').includes('GXPC') ? '' : (parsed.users.yasmeen?.bio || '')
            },
            adziima: {
              ...parsed.users.adziima,
              bio: (parsed.users.adziima?.bio || '').includes('Sadar Finansial') ? '' : (parsed.users.adziima?.bio || '')
            }
          };

          // Ensure flight ticket transactions exist in yasmeenTransactions
          const existingTxIds = new Set((parsed.yasmeenTransactions || []).map(t => t.id));
          const updatedYasTx = [...(parsed.yasmeenTransactions || [])];
          SAMPLE_YASMEEN_TRANSACTIONS.forEach(stx => {
            if (stx.category === 'tiket_pesawat' && !existingTxIds.has(stx.id)) {
              updatedYasTx.push(stx);
            }
          });

          return {
            ...parsed,
            users,
            adziimaCategories: updatedAdzCats,
            yasmeenCategories: updatedYasCats,
            yasmeenTransactions: updatedYasTx,
            goldSavings: {
              ...DEFAULT_GOLD_SAVINGS,
              ...(parsed.goldSavings || {}),
              pricePerGramIdr: (!parsed.goldSavings?.pricePerGramIdr || parsed.goldSavings?.pricePerGramIdr === 1500000)
                ? DEFAULT_GOLD_SAVINGS.pricePerGramIdr
                : parsed.goldSavings.pricePerGramIdr,
              buybackPerGramIdr: parsed.goldSavings?.buybackPerGramIdr || DEFAULT_GOLD_SAVINGS.buybackPerGramIdr,
              priceTable: parsed.goldSavings?.priceTable || DEFAULT_GOLD_SAVINGS.priceTable,
              lastUpdated: parsed.goldSavings?.lastUpdated || DEFAULT_GOLD_SAVINGS.lastUpdated,
              lastUpdatedLabel: parsed.goldSavings?.lastUpdatedLabel || DEFAULT_GOLD_SAVINGS.lastUpdatedLabel,
              valuationMode: parsed.goldSavings?.valuationMode || 'sell'
            },
            selectedMonth: parsed.selectedMonth < '2026-11' ? '2026-11' : (parsed.selectedMonth || '2026-11'),
            monthlyBudgets: parsed.monthlyBudgets || { yasmeen: {}, adziima: {} },
            yasmeenCurrencyView: parsed.yasmeenCurrencyView || 'CNY'
          };
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return {
      activeView: 'landing', // 'landing' | 'yasmeen' | 'adziima'
      exchangeRate: DEFAULT_EXCHANGE_RATE,
      users: DEFAULT_USERS,
      yasmeenCategories: YASMEEN_CATEGORIES,
      adziimaCategories: ADZIIMA_CATEGORIES,
      yasmeenTransactions: SAMPLE_YASMEEN_TRANSACTIONS,
      adziimaTransactions: SAMPLE_ADZIIMA_TRANSACTIONS,
      goldSavings: DEFAULT_GOLD_SAVINGS,
      selectedMonth: '2026-11',
      yasmeenCurrencyView: 'CNY', // 'CNY' | 'IDR'
      monthlyBudgets: { yasmeen: {}, adziima: {} }
    };
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data]);

  // Multi-Device Cloud Sync State (Firebase Realtime Database)
  const [firebaseDbUrl, setFirebaseDbUrl] = useState(() => getSavedFirebaseUrl());
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const isRemoteUpdatingRef = React.useRef(false);

  // Initial pull and real-time SSE listener
  useEffect(() => {
    if (!firebaseDbUrl) {
      setIsCloudConnected(false);
      return;
    }

    let isMounted = true;
    setIsCloudSyncing(true);

    fetchCloudData(firebaseDbUrl)
      .then(remote => {
        if (!isMounted) return;
        if (remote && remote.users?.yasmeen && remote.users?.adziima) {
          isRemoteUpdatingRef.current = true;
          setData(prev => ({
            ...prev,
            ...remote,
            activeView: prev.activeView,
            selectedMonth: prev.selectedMonth
          }));
          setTimeout(() => { isRemoteUpdatingRef.current = false; }, 250);
          setIsCloudConnected(true);
        } else {
          // Cloud is empty, seed it with current local data
          pushCloudData(firebaseDbUrl, data)
            .then(() => { if (isMounted) setIsCloudConnected(true); })
            .catch(() => {});
        }
      })
      .catch(err => {
        console.warn('Initial cloud sync error:', err);
        if (isMounted) setIsCloudConnected(false);
      })
      .finally(() => {
        if (isMounted) setIsCloudSyncing(false);
      });

    const unsubscribe = subscribeToCloudChanges(
      firebaseDbUrl,
      (remote) => {
        if (!isMounted || !remote) return;
        if (remote.users?.yasmeen && remote.users?.adziima) {
          isRemoteUpdatingRef.current = true;
          setData(prev => ({
            ...prev,
            ...remote,
            activeView: prev.activeView,
            selectedMonth: prev.selectedMonth
          }));
          setTimeout(() => { isRemoteUpdatingRef.current = false; }, 250);
          setIsCloudConnected(true);
        }
      },
      (err) => {
        console.warn('Cloud listener error:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [firebaseDbUrl]);

  // Debounced push to cloud whenever local data changes
  useEffect(() => {
    if (!firebaseDbUrl || !isCloudConnected || isRemoteUpdatingRef.current) return;
    const timer = setTimeout(() => {
      pushCloudData(firebaseDbUrl, data).catch(err => {
        console.warn('Auto cloud sync failed:', err);
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [data, firebaseDbUrl, isCloudConnected]);

  const saveCloudUrl = async (url) => {
    const clean = saveFirebaseUrl(url);
    setFirebaseDbUrl(clean);
    if (!clean) {
      setIsCloudConnected(false);
      return;
    }
    const remote = await fetchCloudData(clean);
    if (remote && remote.users) {
      isRemoteUpdatingRef.current = true;
      setData(prev => ({
        ...prev,
        ...remote,
        activeView: prev.activeView,
        selectedMonth: prev.selectedMonth
      }));
      setTimeout(() => { isRemoteUpdatingRef.current = false; }, 250);
    } else {
      await pushCloudData(clean, data);
    }
    setIsCloudConnected(true);
  };

  const syncFromCloud = async () => {
    if (!firebaseDbUrl) throw new Error('URL Database belum diatur');
    const remote = await fetchCloudData(firebaseDbUrl);
    if (remote && remote.users) {
      isRemoteUpdatingRef.current = true;
      setData(prev => ({
        ...prev,
        ...remote,
        activeView: prev.activeView,
        selectedMonth: prev.selectedMonth
      }));
      setTimeout(() => { isRemoteUpdatingRef.current = false; }, 250);
      setIsCloudConnected(true);
    }
  };

  const syncToCloud = async () => {
    if (!firebaseDbUrl) throw new Error('URL Database belum diatur');
    await pushCloudData(firebaseDbUrl, data);
    setIsCloudConnected(true);
  };

  const setActiveView = (view) => {
    setData(prev => ({ ...prev, activeView: view }));
  };

  const setSelectedMonth = (month) => {
    setData(prev => ({ ...prev, selectedMonth: month }));
  };

  const setYasmeenCurrencyView = (currency) => {
    setData(prev => ({ ...prev, yasmeenCurrencyView: currency }));
  };

  const setExchangeRate = (rate) => {
    setData(prev => ({ ...prev, exchangeRate: parseFloat(rate) || DEFAULT_EXCHANGE_RATE }));
  };

  // Update user profile or funds
  const updateUser = (userId, updates) => {
    setData(prev => ({
      ...prev,
      users: {
        ...prev.users,
        [userId]: {
          ...(prev.users?.[userId] || DEFAULT_USERS[userId] || {}),
          ...updates
        }
      }
    }));
  };

  // Set initial total money
  const setTotalMoney = (userId, amount) => {
    const num = parseFloat(amount) || 0;
    const rate = data.exchangeRate || DEFAULT_EXCHANGE_RATE;

    if (userId === 'adziima') {
      updateUser('adziima', { initialFundIdr: num });
    } else {
      updateUser('yasmeen', {
        initialFundIdr: num,
        initialFundCny: Math.round((num / rate) * 100) / 100
      });
    }
  };

  const toggleStipend = (targetMonth = null) => {
    const month = targetMonth || data.selectedMonth || '2026-11';
    setData(prev => {
      const yasmeen = prev.users?.yasmeen || DEFAULT_USERS.yasmeen;
      const stipendByMonth = { ...(yasmeen.stipendByMonth || {}) };
      const currentVal = stipendByMonth[month] !== undefined
        ? Boolean(stipendByMonth[month])
        : (month === '2026-11' ? Boolean(yasmeen.stipendReceived) : false);
      const nextVal = !currentVal;
      stipendByMonth[month] = nextVal;

      return {
        ...prev,
        users: {
          ...prev.users,
          yasmeen: {
            ...yasmeen,
            stipendByMonth,
            stipendReceived: nextVal
          }
        }
      };
    });
  };

  // Add transaction (Expense or Income)
  const addTransaction = (userId, tx) => {
    const rate = data.exchangeRate || DEFAULT_EXCHANGE_RATE;
    const key = userId === 'adziima' ? 'adziimaTransactions' : 'yasmeenTransactions';
    const isYasmeenChinaMonth = userId === 'yasmeen' && (tx.date || data.selectedMonth) <= '2027-01';

    let amountCny = 0;
    let amountIdr = 0;

    if (userId === 'adziima' || !isYasmeenChinaMonth) {
      amountIdr = parseFloat(tx.amount) || 0;
      amountCny = Math.round((amountIdr / rate) * 100) / 100;
    } else {
      if (tx.inputCurrency === 'IDR') {
        amountIdr = parseFloat(tx.amount) || 0;
        amountCny = Math.round((amountIdr / rate) * 100) / 100;
      } else {
        amountCny = parseFloat(tx.amount) || 0;
        amountIdr = Math.round(amountCny * rate);
      }
    }

    const newTx = {
      id: `tx-${userId}-${Date.now()}`,
      date: tx.date || new Date().toISOString().split('T')[0],
      category: tx.category,
      title: tx.title || 'Transaksi',
      type: tx.type || 'Keluar',
      amountIdr,
      amountCny,
      inputCurrency: (userId === 'adziima' || !isYasmeenChinaMonth) ? 'IDR' : (tx.inputCurrency || 'CNY'),
      paymentMethod: tx.paymentMethod,
      notes: tx.notes || ''
    };

    setData(prev => ({
      ...prev,
      [key]: [newTx, ...(prev[key] || [])]
    }));
  };

  // Edit existing transaction
  const updateTransaction = (userId, id, updatedFields) => {
    const rate = data.exchangeRate || DEFAULT_EXCHANGE_RATE;
    const key = userId === 'adziima' ? 'adziimaTransactions' : 'yasmeenTransactions';

    setData(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(tx => {
        if (tx.id !== id) return tx;
        const merged = { ...tx, ...updatedFields };

        if (updatedFields.amount !== undefined) {
          if (userId === 'adziima' || merged.inputCurrency === 'IDR') {
            merged.amountIdr = parseFloat(updatedFields.amount) || 0;
            merged.amountCny = Math.round((merged.amountIdr / rate) * 100) / 100;
          } else {
            merged.amountCny = parseFloat(updatedFields.amount) || 0;
            merged.amountIdr = Math.round(merged.amountCny * rate);
          }
        }
        return merged;
      })
    }));
  };

  const deleteTransaction = (userId, id) => {
    const key = userId === 'adziima' ? 'adziimaTransactions' : 'yasmeenTransactions';
    setData(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(tx => tx.id !== id)
    }));
  };

  // Category Budget update with monthly inheritance template
  const updateCategoryBudget = (userId, catId, newBudget, targetMonth = null) => {
    const month = targetMonth || data.selectedMonth || '2026-11';
    const num = parseFloat(newBudget) || 0;
    const key = userId === 'adziima' ? 'adziimaCategories' : 'yasmeenCategories';

    setData(prev => {
      const userMonthly = { ...(prev.monthlyBudgets?.[userId] || {}) };
      const currentMonthBudget = { ...(userMonthly[month] || {}) };
      currentMonthBudget[catId] = num;
      userMonthly[month] = currentMonthBudget;

      return {
        ...prev,
        monthlyBudgets: {
          ...(prev.monthlyBudgets || {}),
          [userId]: userMonthly
        },
        [key]: (prev[key] || []).map(c => {
          if (c.id !== catId) return c;
          if (userId === 'adziima') {
            return { ...c, budgetIdr: num };
          }
          return { ...c, budgetCny: num };
        })
      };
    });
  };

  // Gold Savings (Emas Batangan Galeri 24)
  const addGoldDeposit = (entry) => {
    const keping = parseInt(entry.keping) || 1;
    const pecahan = parseFloat(entry.pecahan) || parseFloat(entry.grams) || 1;
    const totalGrams = parseFloat(entry.grams) || (keping * pecahan);
    const newEntry = {
      id: `gold-${Date.now()}`,
      date: entry.date || new Date().toISOString().split('T')[0],
      contributor: entry.contributor || 'berdua',
      keping,
      pecahan,
      grams: totalGrams,
      amountIdr: parseFloat(entry.amountIdr) || 0,
      place: entry.place || 'Galeri 24 (Pegadaian)',
      serialNumber: entry.serialNumber || '',
      notes: entry.notes || ''
    };

    setData(prev => ({
      ...prev,
      goldSavings: {
        ...(prev.goldSavings || DEFAULT_GOLD_SAVINGS),
        transactions: [newEntry, ...(prev.goldSavings?.transactions || [])]
      }
    }));
  };

  const deleteGoldDeposit = (id) => {
    setData(prev => ({
      ...prev,
      goldSavings: {
        ...prev.goldSavings,
        transactions: (prev.goldSavings?.transactions || []).filter(g => g.id !== id)
      }
    }));
  };

  const updateGoldPrice = (newPrice) => {
    setData(prev => ({
      ...prev,
      goldSavings: {
        ...(prev.goldSavings || DEFAULT_GOLD_SAVINGS),
        pricePerGramIdr: parseFloat(newPrice) || DEFAULT_GOLD_SAVINGS.pricePerGramIdr,
        lastUpdated: new Date().toISOString().split('T')[0],
        lastUpdatedLabel: 'Diperbarui Manual'
      }
    }));
  };

  const updateGaleri24Prices = ({ sell, buyback, table, dateLabel }) => {
    setData(prev => ({
      ...prev,
      goldSavings: {
        ...(prev.goldSavings || DEFAULT_GOLD_SAVINGS),
        pricePerGramIdr: parseFloat(sell) || prev.goldSavings?.pricePerGramIdr || 2510000,
        buybackPerGramIdr: parseFloat(buyback) || prev.goldSavings?.buybackPerGramIdr || 2363000,
        priceTable: table || prev.goldSavings?.priceTable || DEFAULT_GOLD_SAVINGS.priceTable,
        lastUpdated: new Date().toISOString().split('T')[0],
        lastUpdatedLabel: dateLabel || 'Hari Ini (galeri24.co.id)'
      }
    }));
  };

  const setGoldValuationMode = (mode) => {
    setData(prev => ({
      ...prev,
      goldSavings: {
        ...(prev.goldSavings || DEFAULT_GOLD_SAVINGS),
        valuationMode: mode === 'buyback' ? 'buyback' : 'sell'
      }
    }));
  };

  const updateGoldTarget = (newTarget) => {
    setData(prev => ({
      ...prev,
      goldSavings: {
        ...prev.goldSavings,
        targetGrams: parseFloat(newTarget) || 25
      }
    }));
  };

  // Bulletproof Calculations per selectedMonth
  const calculations = useMemo(() => {
    try {
      const rate = data?.exchangeRate || DEFAULT_EXCHANGE_RATE;
      const yasmeen = data?.users?.yasmeen || DEFAULT_USERS.yasmeen;
      const adziima = data?.users?.adziima || DEFAULT_USERS.adziima;
      const currentMonth = data?.selectedMonth || '2026-11';

      // Check if Yasmeen is in China for the selected month
      const isYasmeenInChina = currentMonth <= '2027-01';

      // Filter transactions for this specific month
      const monthYasmeenTx = (data?.yasmeenTransactions || []).filter(tx => (tx?.date || '').startsWith(currentMonth));
      const monthAdziimaTx = (data?.adziimaTransactions || []).filter(tx => (tx?.date || '').startsWith(currentMonth));

      // 1. Rolling Monthly Balance calculation starting from November 2026 ('2026-11')
      const startBaselineMonth = '2026-11';
      const baseInitialYasmeenCny = (yasmeen?.initialFundCny !== undefined && yasmeen?.initialFundCny !== null)
        ? parseFloat(yasmeen.initialFundCny)
        : ((parseFloat(yasmeen?.initialFundIdr) || 10000000) / rate);
      const baseInitialAdziimaIdr = parseFloat(adziima?.initialFundIdr) || 0;

      // Helper function to get list of months between startBaseline and currentMonth
      const getMonthsListBetween = (startM, targetM) => {
        const list = [];
        let [y, m] = startM.split('-').map(Number);
        const [targetY, targetMNum] = targetM.split('-').map(Number);

        while (y < targetY || (y === targetY && m < targetMNum)) {
          const mStr = m < 10 ? `0${m}` : `${m}`;
          list.push(`${y}-${mStr}`);
          m++;
          if (m > 12) {
            m = 1;
            y++;
          }
        }
        return list;
      };

      const pastMonths = currentMonth > startBaselineMonth ? getMonthsListBetween(startBaselineMonth, currentMonth) : [];

      // Cumulative net change for Yasmeen across past months
      let yasmeenCumulativeNetCny = 0;
      pastMonths.forEach(m => {
        const isStipendCair = yasmeen?.stipendByMonth?.[m] !== undefined
          ? Boolean(yasmeen.stipendByMonth[m])
          : (m === '2026-11' ? Boolean(yasmeen?.stipendReceived) : false);
        const mStipend = (m <= '2027-01' && isStipendCair) ? (yasmeen?.stipendCny || 1500) : 0;
        let mIncome = 0;
        let mOutflow = 0;
        (data?.yasmeenTransactions || []).forEach(tx => {
          if ((tx?.date || '').startsWith(m)) {
            if (tx.type === 'Masuk') mIncome += (tx.amountCny || 0);
            else mOutflow += (tx.amountCny || 0);
          }
        });
        yasmeenCumulativeNetCny += (mStipend + mIncome - mOutflow);
      });

      // Cumulative net change for Adziima across past months
      let adziimaCumulativeNetIdr = 0;
      pastMonths.forEach(m => {
        let mIncome = 0;
        let mOutflow = 0;
        (data?.adziimaTransactions || []).forEach(tx => {
          if ((tx?.date || '').startsWith(m)) {
            if (tx.type === 'Masuk') mIncome += (tx.amountIdr || 0);
            else mOutflow += (tx.amountIdr || 0);
          }
        });
        adziimaCumulativeNetIdr += (mIncome - mOutflow);
      });

      // Starting balance of the selected month
      const startBalanceYasmeenCny = baseInitialYasmeenCny + yasmeenCumulativeNetCny;
      const startBalanceAdziimaIdr = baseInitialAdziimaIdr + adziimaCumulativeNetIdr;

      // Helper to resolve inherited budget for a category in a given month
      const getCategoryBudget = (userId, catId, defaultBudget) => {
        const userMonthly = data?.monthlyBudgets?.[userId] || {};
        // 1. Direct match in current month
        if (userMonthly[currentMonth] && userMonthly[currentMonth][catId] !== undefined) {
          return userMonthly[currentMonth][catId];
        }

        // Special rule for Yasmeen's kebutuhan_awal:
        // November has initial cost of Rp 500.000 (¥182). Future months (Dec+) default to ¥0 / Rp 0
        if (userId === 'yasmeen' && catId === 'kebutuhan_awal') {
          return currentMonth === '2026-11' ? 182 : 0;
        }

        // 2. Look back through earlier months in chronological order
        const sortedMonths = Object.keys(userMonthly).filter(m => m <= currentMonth).sort();
        for (let i = sortedMonths.length - 1; i >= 0; i--) {
          const m = sortedMonths[i];
          if (userMonthly[m] && userMonthly[m][catId] !== undefined) {
            return userMonthly[m][catId];
          }
        }
        // 3. Fallback to default
        return defaultBudget || 0;
      };

      // 1. Yasmeen Monthly Calculations for currentMonth
      const isCurrentStipendCair = yasmeen?.stipendByMonth?.[currentMonth] !== undefined
        ? Boolean(yasmeen.stipendByMonth[currentMonth])
        : (currentMonth === '2026-11' ? Boolean(yasmeen?.stipendReceived) : false);
      const stipendCny = (isYasmeenInChina && isCurrentStipendCair) ? (yasmeen?.stipendCny || 1500) : 0;

      let monthIncomeYasmeenCny = 0;
      let monthOutflowYasmeenCny = 0;

      monthYasmeenTx.forEach(tx => {
        if (tx?.type === 'Masuk') {
          monthIncomeYasmeenCny += (tx?.amountCny || 0);
        } else {
          monthOutflowYasmeenCny += (tx?.amountCny || 0);
        }
      });

      const totalInflowYasmeenCny = startBalanceYasmeenCny + stipendCny + monthIncomeYasmeenCny;
      const netMonthYasmeenCny = totalInflowYasmeenCny - monthOutflowYasmeenCny;
      const reserveYasmeenCny = yasmeen?.emergencyReserveCny || 0;
      const safeYasmeenCny = Math.max(0, netMonthYasmeenCny - reserveYasmeenCny);

      // Categories spending for selected month with inherited budget
      const baseYasmeenCats = isYasmeenInChina
        ? (data?.yasmeenCategories || YASMEEN_CATEGORIES)
        : (data?.adziimaCategories || ADZIIMA_CATEGORIES);

      const activeCategories = baseYasmeenCats.map(c => {
        const resolvedBudget = getCategoryBudget('yasmeen', c.id, isYasmeenInChina ? c.budgetCny : c.budgetIdr);
        return isYasmeenInChina
          ? { ...c, budgetCny: resolvedBudget, budgetIdr: resolvedBudget * rate }
          : { ...c, budgetIdr: resolvedBudget, budgetCny: Math.round((resolvedBudget / rate) * 100) / 100 };
      });

      const yasmeenSpending = {};
      activeCategories.forEach(c => {
        yasmeenSpending[c.id] = { totalCny: 0, totalIdr: 0, count: 0 };
      });
      monthYasmeenTx.forEach(tx => {
        if (tx?.type !== 'Masuk' && yasmeenSpending[tx?.category]) {
          yasmeenSpending[tx.category].totalCny += (tx.amountCny || 0);
          yasmeenSpending[tx.category].totalIdr += (tx.amountIdr || 0);
          yasmeenSpending[tx.category].count += 1;
        }
      });

      // 2. Adziima Monthly Calculations (100% IDR) for currentMonth
      let monthIncomeAdziimaIdr = 0;
      let monthOutflowAdziimaIdr = 0;

      monthAdziimaTx.forEach(tx => {
        if (tx?.type === 'Masuk') {
          monthIncomeAdziimaIdr += (tx?.amountIdr || 0);
        } else {
          monthOutflowAdziimaIdr += (tx?.amountIdr || 0);
        }
      });

      const totalInflowAdziimaIdr = startBalanceAdziimaIdr + monthIncomeAdziimaIdr;
      const netMonthAdziimaIdr = totalInflowAdziimaIdr - monthOutflowAdziimaIdr;
      const reserveAdziimaIdr = adziima?.emergencyReserveIdr || 0;
      const safeAdziimaIdr = Math.max(0, netMonthAdziimaIdr - reserveAdziimaIdr);

      const activeAdziimaCats = (data?.adziimaCategories || ADZIIMA_CATEGORIES).map(c => {
        const resolvedBudget = getCategoryBudget('adziima', c.id, c.budgetIdr);
        return { ...c, budgetIdr: resolvedBudget };
      });

      const adziimaSpending = {};
      activeAdziimaCats.forEach(c => {
        adziimaSpending[c.id] = { totalIdr: 0, count: 0 };
      });
      monthAdziimaTx.forEach(tx => {
        if (tx?.type !== 'Masuk' && adziimaSpending[tx?.category]) {
          adziimaSpending[tx.category].totalIdr += (tx.amountIdr || 0);
          adziimaSpending[tx.category].count += 1;
        }
      });

      // 3. Gold Savings Calculations (Emas Batangan Galeri 24)
      const goldTx = data?.goldSavings?.transactions || [];
      const valuationMode = data?.goldSavings?.valuationMode || 'sell';
      const pricePerGram = data?.goldSavings?.pricePerGramIdr || 2510000;
      const buybackPerGram = data?.goldSavings?.buybackPerGramIdr || 2363000;
      const activeValuationPrice = valuationMode === 'buyback' ? buybackPerGram : pricePerGram;
      const priceTable = data?.goldSavings?.priceTable || GALERI24_DEFAULT_PRICE_TABLE;

      let totalGrams = 0;
      let totalKeping = 0;
      let totalGoldSpentIdr = 0;
      let currentAssetValueIdr = 0;
      let yasmeenContributedGrams = 0;
      let adziimaContributedGrams = 0;
      let yasmeenContributedValueIdr = 0;
      let adziimaContributedValueIdr = 0;

      goldTx.forEach(g => {
        const gGrams = parseFloat(g?.grams) || 0;
        const gKeping = parseInt(g?.keping) || (gGrams > 0 ? 1 : 0);
        const gPecahan = parseFloat(g?.pecahan) || (gKeping > 0 ? (gGrams / gKeping) : gGrams);

        // Find exact Galeri 24 table row for this denomination
        const match = priceTable.find(p => Math.abs(p.grams - gPecahan) < 0.001);
        const unitVal = match
          ? (valuationMode === 'buyback' ? match.buyback : match.sell)
          : (gPecahan * activeValuationPrice);
        const itemVal = unitVal * gKeping;

        totalGrams += gGrams;
        totalKeping += gKeping;
        totalGoldSpentIdr += (g?.amountIdr || 0);
        currentAssetValueIdr += itemVal;

        if (g?.contributor === 'yasmeen') {
          yasmeenContributedGrams += gGrams;
          yasmeenContributedValueIdr += itemVal;
        } else if (g?.contributor === 'adziima') {
          adziimaContributedGrams += gGrams;
          adziimaContributedValueIdr += itemVal;
        } else {
          yasmeenContributedGrams += gGrams / 2;
          adziimaContributedGrams += gGrams / 2;
          yasmeenContributedValueIdr += itemVal / 2;
          adziimaContributedValueIdr += itemVal / 2;
        }
      });

      const targetGrams = data?.goldSavings?.targetGrams || 25;
      const goldProgressPercent = targetGrams > 0 ? Math.min(100, Math.round((totalGrams / targetGrams) * 100)) : 0;
      const profitLossIdr = currentAssetValueIdr - totalGoldSpentIdr;
      const profitLossPercent = totalGoldSpentIdr > 0 ? Math.round(((profitLossIdr / totalGoldSpentIdr) * 100) * 10) / 10 : 0;

      return {
        rate,
        isYasmeenInChina,
        currentMonth,
        yasmeen: {
          monthTx: monthYasmeenTx,
          isChina: isYasmeenInChina,
          initialCny: startBalanceYasmeenCny,
          initialIdr: startBalanceYasmeenCny * rate,
          startBalanceCny: startBalanceYasmeenCny,
          startBalanceIdr: startBalanceYasmeenCny * rate,
          stipendCny,
          stipendIdr: stipendCny * rate,
          isStipendCair: Boolean(isCurrentStipendCair),
          totalInflowCny: totalInflowYasmeenCny,
          totalInflowIdr: totalInflowYasmeenCny * rate,
          totalOutflowCny: monthOutflowYasmeenCny,
          totalOutflowIdr: monthOutflowYasmeenCny * rate,
          totalBalanceCny: netMonthYasmeenCny,
          totalBalanceIdr: netMonthYasmeenCny * rate,
          reserveCny: reserveYasmeenCny,
          reserveIdr: reserveYasmeenCny * rate,
          safeToSpendCny: safeYasmeenCny,
          safeToSpendIdr: safeYasmeenCny * rate,
          dailySafeCny: Math.max(0, safeYasmeenCny / 30),
          dailySafeIdr: Math.max(0, (safeYasmeenCny * rate) / 30),
          spending: yasmeenSpending,
          categories: activeCategories || []
        },
        adziima: {
          monthTx: monthAdziimaTx,
          initialIdr: startBalanceAdziimaIdr,
          startBalanceIdr: startBalanceAdziimaIdr,
          totalInflowIdr: totalInflowAdziimaIdr,
          totalOutflowIdr: monthOutflowAdziimaIdr,
          totalBalanceIdr: netMonthAdziimaIdr,
          reserveIdr: reserveAdziimaIdr,
          safeToSpendIdr: safeAdziimaIdr,
          dailySafeIdr: Math.max(0, safeAdziimaIdr / 30),
          spending: adziimaSpending,
          categories: activeAdziimaCats || []
        },
        gold: {
          totalGrams,
          totalKeping,
          totalGoldSpentIdr,
          currentAssetValueIdr,
          targetGrams,
          progressPercent: goldProgressPercent,
          yasmeenContributedGrams,
          adziimaContributedGrams,
          yasmeenContributedValueIdr,
          adziimaContributedValueIdr,
          pricePerGram,
          buybackPerGram,
          activeValuationPrice,
          valuationMode,
          lastUpdated: data?.goldSavings?.lastUpdated || DEFAULT_GOLD_SAVINGS.lastUpdated,
          lastUpdatedLabel: data?.goldSavings?.lastUpdatedLabel || DEFAULT_GOLD_SAVINGS.lastUpdatedLabel,
          priceTable: data?.goldSavings?.priceTable || DEFAULT_GOLD_SAVINGS.priceTable,
          profitLossIdr,
          profitLossPercent,
          avgBuyPricePerGram: totalGrams > 0 ? (totalGoldSpentIdr / totalGrams) : 0
        }
      };
    } catch (err) {
      console.error('Calculations error:', err);
      return {
        rate: DEFAULT_EXCHANGE_RATE,
        isYasmeenInChina: true,
        currentMonth: '2026-11',
        yasmeen: {
          monthTx: [],
          isChina: true,
          initialCny: 3636.36,
          initialIdr: 10000000,
          stipendCny: 1500,
          stipendIdr: 4125000,
          totalInflowCny: 3636.36,
          totalInflowIdr: 10000000,
          totalOutflowCny: 0,
          totalOutflowIdr: 0,
          totalBalanceCny: 3636.36,
          totalBalanceIdr: 10000000,
          reserveCny: 1000,
          reserveIdr: 2750000,
          safeToSpendCny: 2636.36,
          safeToSpendIdr: 7250000,
          dailySafeCny: 87.87,
          dailySafeIdr: 241666,
          spending: {},
          categories: YASMEEN_CATEGORIES
        },
        adziima: {
          monthTx: [],
          initialIdr: 0,
          totalInflowIdr: 0,
          totalOutflowIdr: 0,
          totalBalanceIdr: 0,
          reserveIdr: 0,
          safeToSpendIdr: 0,
          dailySafeIdr: 0,
          spending: {}
        },
        gold: {
          totalGrams: 0,
          totalKeping: 0,
          totalGoldSpentIdr: 0,
          currentAssetValueIdr: 0,
          targetGrams: 25,
          progressPercent: 0,
          yasmeenContributedGrams: 0,
          adziimaContributedGrams: 0,
          pricePerGram: 1500000,
          profitLossIdr: 0,
          profitLossPercent: 0,
          avgBuyPricePerGram: 0
        }
      };
    }
  }, [data]);

  return (
    <PocketContext.Provider
      value={{
        ...data,
        calculations,
        setActiveView,
        setSelectedMonth,
        setExchangeRate,
        updateUser,
        setTotalMoney,
        toggleStipend,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateCategoryBudget,
        addGoldDeposit,
        deleteGoldDeposit,
        updateGoldPrice,
        updateGoldTarget,
        updateGaleri24Prices,
        setGoldValuationMode,
        setYasmeenCurrencyView,
        firebaseDbUrl,
        isCloudConnected,
        isCloudSyncing,
        saveCloudUrl,
        syncFromCloud,
        syncToCloud
      }}
    >
      {children}
    </PocketContext.Provider>
  );
}

export function usePocket() {
  const context = useContext(PocketContext);
  if (!context) {
    throw new Error('usePocket must be used within a PocketProvider');
  }
  return context;
}
