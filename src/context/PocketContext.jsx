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
  pushCloudSubpath,
  subscribeToCloudChanges,
  mergeFullState
} from '../services/cloudSync';
import { fetchLiveGoldPrices } from '../services/goldPriceService';
import { getLocalDateString } from '../utils/formatters';

const STORAGE_KEY = 'pocket_duo_storage_v10';

// Helper function to get list of months between startBaseline and targetMonth
export function getMonthsListBetween(startM, targetM) {
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
}

// Helper to resolve categories for a given month with fallback inheritance
export function resolveCategories(catsState, userId, targetMonth) {
  const month = targetMonth || '2026-10';
  const userMonthlyCats = catsState?.monthlyCategories?.[userId];

  // 1. Direct match for this specific month
  if (userMonthlyCats?.[month] && Array.isArray(userMonthlyCats[month]) && userMonthlyCats[month].length > 0) {
    return userMonthlyCats[month];
  }

  // 2. Look back through earlier months in chronological order
  if (userMonthlyCats) {
    const earlierMonths = Object.keys(userMonthlyCats)
      .filter(m => m < month && Array.isArray(userMonthlyCats[m]) && userMonthlyCats[m].length > 0)
      .sort();
    if (earlierMonths.length > 0) {
      const latestEarlierMonth = earlierMonths[earlierMonths.length - 1];
      return userMonthlyCats[latestEarlierMonth];
    }
  }

  // 3. Fallback to default base categories
  if (userId === 'adziima') {
    return catsState?.adziimaCategories || ADZIIMA_CATEGORIES;
  }
  return catsState?.yasmeenCategories || YASMEEN_CATEGORIES;
}

const PocketContext = createContext(null);

export function PocketProvider({ children }) {
  // 1. Device-local UI State (NEVER synced to Firebase or between devices)
  const [activeView, setActiveViewState] = useState(() => {
    try {
      const saved = localStorage.getItem('pocket_device_active_view');
      if (saved && ['landing', 'yasmeen', 'adziima', 'gold'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'landing';
  });

  const setActiveView = (view) => {
    setActiveViewState(view);
    try {
      localStorage.setItem('pocket_device_active_view', view);
    } catch (e) {}
  };

  const [selectedMonth, setSelectedMonthState] = useState(() => {
    try {
      const saved = localStorage.getItem('pocket_device_selected_month');
      if (saved && saved >= '2026-10') {
        return saved;
      }
    } catch (e) {}
    const curMonth = getLocalDateString().slice(0, 7);
    return curMonth >= '2026-10' ? curMonth : '2026-10';
  });

  const setSelectedMonth = (month) => {
    const curMonth = getLocalDateString().slice(0, 7);
    const fallback = curMonth >= '2026-10' ? curMonth : '2026-10';
    const val = (month && month >= '2026-10') ? month : fallback;
    setSelectedMonthState(val);
    try {
      localStorage.setItem('pocket_device_selected_month', val);
    } catch (e) {}
  };

  const [yasmeenCurrencyView, setYasmeenCurrencyViewState] = useState(() => {
    try {
      const saved = localStorage.getItem('pocket_device_yasmeen_currency');
      if (saved && ['CNY', 'IDR'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'CNY';
  });

  const setYasmeenCurrencyView = (curr) => {
    setYasmeenCurrencyViewState(curr);
    try {
      localStorage.setItem('pocket_device_yasmeen_currency', curr);
    } catch (e) {}
  };

  const [isFetchingGoldPrice, setIsFetchingGoldPrice] = useState(false);

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users?.yasmeen && parsed.users?.adziima) {
          // Clean legacy bios if needed
          const users = {
            ...parsed.users,
            yasmeen: {
              ...parsed.users.yasmeen,
              name: (!parsed.users.yasmeen?.name || parsed.users.yasmeen?.name === 'Yasmeen') ? 'Yasmeen Almira' : parsed.users.yasmeen.name,
              bio: (parsed.users.yasmeen?.bio || '').includes('GXPC') ? '' : (parsed.users.yasmeen?.bio || ''),
              stipendCny: (parsed.users.yasmeen?.stipendCny === 1500 || !parsed.users.yasmeen?.stipendCny) ? 1000 : parsed.users.yasmeen.stipendCny
            },
            adziima: {
              ...parsed.users.adziima,
              name: (!parsed.users.adziima?.name || parsed.users.adziima?.name === 'Adziima') ? 'Muhammad Mulkan Adziima' : parsed.users.adziima.name,
              bio: (parsed.users.adziima?.bio || '').includes('Sadar Finansial') ? '' : (parsed.users.adziima?.bio || '')
            }
          };

          return {
            ...parsed,
            users,
            adziimaCategories: parsed.adziimaCategories || ADZIIMA_CATEGORIES,
            yasmeenCategories: parsed.yasmeenCategories || YASMEEN_CATEGORIES,
            monthlyCategories: parsed.monthlyCategories || { yasmeen: {}, adziima: {} },
            yasmeenTransactions: parsed.yasmeenTransactions || [],
            adziimaTransactions: parsed.adziimaTransactions || [],
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
            monthlyBudgets: parsed.monthlyBudgets || { yasmeen: {}, adziima: {} }
          };
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return {
      exchangeRate: DEFAULT_EXCHANGE_RATE,
      users: DEFAULT_USERS,
      yasmeenCategories: YASMEEN_CATEGORIES,
      adziimaCategories: ADZIIMA_CATEGORIES,
      monthlyCategories: { yasmeen: {}, adziima: {} },
      yasmeenTransactions: SAMPLE_YASMEEN_TRANSACTIONS,
      adziimaTransactions: SAMPLE_ADZIIMA_TRANSACTIONS,
      goldSavings: DEFAULT_GOLD_SAVINGS,
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
        if (remote && (remote.users || remote.yasmeenTransactions || remote.adziimaTransactions)) {
          isRemoteUpdatingRef.current = true;
          const { activeView: _av, selectedMonth: _sm, yasmeenCurrencyView: _ycv, ...cleanRemote } = remote;
          setData(prev => {
            const merged = mergeFullState(prev, cleanRemote);
            // If local had new transactions that cloud didn't have, push merged to cloud
            const prevYasLen = (prev.yasmeenTransactions || []).length;
            const remYasLen = (cleanRemote.yasmeenTransactions || []).length;
            const prevAdzLen = (prev.adziimaTransactions || []).length;
            const remAdzLen = (cleanRemote.adziimaTransactions || []).length;
            if (merged.yasmeenTransactions.length > remYasLen || merged.adziimaTransactions.length > remAdzLen) {
              pushCloudData(firebaseDbUrl, merged).catch(() => {});
            }
            return merged;
          });
          setTimeout(() => { isRemoteUpdatingRef.current = false; }, 350);
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
        if (remote.users || remote.yasmeenTransactions || remote.adziimaTransactions) {
          isRemoteUpdatingRef.current = true;
          const { activeView: _av, selectedMonth: _sm, yasmeenCurrencyView: _ycv, ...cleanRemote } = remote;
          setData(prev => mergeFullState(prev, cleanRemote));
          setTimeout(() => { isRemoteUpdatingRef.current = false; }, 350);
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
      const { activeView: _av, selectedMonth: _sm, yasmeenCurrencyView: _ycv, ...cleanRemote } = remote;
      setData(prev => {
        const merged = mergeFullState(prev, cleanRemote);
        pushCloudData(clean, merged).catch(() => {});
        return merged;
      });
      setTimeout(() => { isRemoteUpdatingRef.current = false; }, 350);
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
      const { activeView: _av, selectedMonth: _sm, yasmeenCurrencyView: _ycv, ...cleanRemote } = remote;
      setData(prev => {
        const merged = mergeFullState(prev, cleanRemote);
        pushCloudData(firebaseDbUrl, merged).catch(() => {});
        return merged;
      });
      setTimeout(() => { isRemoteUpdatingRef.current = false; }, 350);
      setIsCloudConnected(true);
    }
  };

  const syncToCloud = async () => {
    if (!firebaseDbUrl) throw new Error('URL Database belum diatur');
    await pushCloudData(firebaseDbUrl, data);
    setIsCloudConnected(true);
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

  // Set initial or current total money
  const setTotalMoney = (userId, amount, mode = 'current_balance') => {
    const num = parseFloat(amount) || 0;
    const rate = data.exchangeRate || DEFAULT_EXCHANGE_RATE;
    const currentMonth = selectedMonth || getLocalDateString().slice(0, 7);

    if (mode === 'current_balance') {
      // Calculate what initialFund needs to be so that current totalBalance becomes exactly `num`
      if (userId === 'adziima') {
        const pastMonths = currentMonth > '2026-10' ? getMonthsListBetween('2026-10', currentMonth) : [];
        let pastNet = 0;
        pastMonths.forEach(m => {
          (data.adziimaTransactions || []).forEach(tx => {
            if ((tx?.date || '').startsWith(m)) {
              if (tx.type === 'Masuk') pastNet += (tx.amountIdr || 0);
              else pastNet -= (tx.amountIdr || 0);
            }
          });
        });
        let curIncome = 0;
        let curOutflow = 0;
        (data.adziimaTransactions || []).forEach(tx => {
          if ((tx?.date || '').startsWith(currentMonth)) {
            if (tx.type === 'Masuk') curIncome += (tx.amountIdr || 0);
            else curOutflow += (tx.amountIdr || 0);
          }
        });
        const baseInitial = num - pastNet - curIncome + curOutflow;
        updateUser('adziima', { initialFundIdr: Math.round(baseInitial) });
      } else {
        const pastMonths = currentMonth > '2026-10' ? getMonthsListBetween('2026-10', currentMonth) : [];
        let pastNetCny = 0;
        pastMonths.forEach(m => {
          (data.yasmeenTransactions || []).forEach(tx => {
            if ((tx?.date || '').startsWith(m)) {
              if (tx.type === 'Masuk') pastNetCny += (tx.amountCny || 0);
              else pastNetCny -= (tx.amountCny || 0);
            }
          });
        });
        let curIncomeCny = 0;
        let curOutflowCny = 0;
        (data.yasmeenTransactions || []).forEach(tx => {
          if ((tx?.date || '').startsWith(currentMonth)) {
            if (tx.type === 'Masuk') curIncomeCny += (tx.amountCny || 0);
            else curOutflowCny += (tx.amountCny || 0);
          }
        });
        const targetCny = num / rate;
        const baseInitialCny = targetCny - pastNetCny - curIncomeCny + curOutflowCny;
        updateUser('yasmeen', {
          initialFundIdr: Math.round(baseInitialCny * rate),
          initialFundCny: Math.round(baseInitialCny * 100) / 100
        });
      }
    } else {
      // mode === 'initial_fund'
      if (userId === 'adziima') {
        updateUser('adziima', { initialFundIdr: num });
      } else {
        updateUser('yasmeen', {
          initialFundIdr: num,
          initialFundCny: Math.round((num / rate) * 100) / 100
        });
      }
    }
  };

  const toggleStipend = (targetMonth = null) => {
    const month = targetMonth || selectedMonth || '2026-11';
    setData(prev => {
      const yasmeen = prev.users?.yasmeen || DEFAULT_USERS.yasmeen;
      const stipendByMonth = { ...(yasmeen.stipendByMonth || {}) };
      const currentVal = Boolean(stipendByMonth[month]);
      const nextVal = !currentVal;
      stipendByMonth[month] = nextVal;

      return {
        ...prev,
        users: {
          ...prev.users,
          yasmeen: {
            ...yasmeen,
            stipendByMonth
          }
        }
      };
    });
  };

  const toggleNongkrongDay = (day, targetMonth = null) => {
    const month = targetMonth || selectedMonth || '2026-11';
    setData(prev => {
      const nongkrongChecklist = { ...(prev.nongkrongChecklist || {}) };
      const currentDays = new Set(nongkrongChecklist[month] || []);
      if (currentDays.has(day)) {
        currentDays.delete(day);
      } else {
        currentDays.add(day);
      }
      nongkrongChecklist[month] = Array.from(currentDays);
      return {
        ...prev,
        nongkrongChecklist
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
      date: tx.date || getLocalDateString(),
      category: tx.category,
      title: tx.title || 'Transaksi',
      type: tx.type || 'Keluar',
      amountIdr,
      amountCny,
      inputCurrency: (userId === 'adziima' || !isYasmeenChinaMonth) ? 'IDR' : (tx.inputCurrency || 'CNY'),
      paymentMethod: tx.paymentMethod,
      notes: tx.notes || ''
    };

    const nextList = [newTx, ...(data[key] || [])];
    const nextData = {
      ...data,
      [key]: nextList
    };

    setData(nextData);

    // Persist immediately to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    } catch (e) {}

    // Instantly push specific transaction array to cloud
    if (firebaseDbUrl) {
      pushCloudSubpath(firebaseDbUrl, key, nextList).catch(err => {
        console.warn('Subpath push failed, fallback to debounced full push:', err);
      });
    }
  };

  // Edit existing transaction
  const updateTransaction = (userId, id, updatedFields) => {
    const rate = data.exchangeRate || DEFAULT_EXCHANGE_RATE;
    const key = userId === 'adziima' ? 'adziimaTransactions' : 'yasmeenTransactions';

    const nextList = (data[key] || []).map(tx => {
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
    });

    const nextData = {
      ...data,
      [key]: nextList
    };

    setData(nextData);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    } catch (e) {}

    if (firebaseDbUrl) {
      pushCloudSubpath(firebaseDbUrl, key, nextList).catch(() => {});
    }
  };

  const deleteTransaction = (userId, id) => {
    const key = userId === 'adziima' ? 'adziimaTransactions' : 'yasmeenTransactions';
    const nextList = (data[key] || []).filter(tx => tx.id !== id);
    const nextData = {
      ...data,
      [key]: nextList
    };

    setData(nextData);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    } catch (e) {}

    if (firebaseDbUrl) {
      pushCloudSubpath(firebaseDbUrl, key, nextList).catch(() => {});
    }
  };

  // Helper to get categories for a given month
  const getCategoriesForMonth = (userId, targetMonth = null) => {
    return resolveCategories(data, userId, targetMonth || selectedMonth || '2026-10');
  };

  const currentYasmeenCategories = useMemo(
    () => resolveCategories(data, 'yasmeen', selectedMonth || '2026-10'),
    [data, selectedMonth]
  );

  const currentAdziimaCategories = useMemo(
    () => resolveCategories(data, 'adziima', selectedMonth || '2026-10'),
    [data, selectedMonth]
  );

  // Category Budget update with monthly inheritance template
  const updateCategoryBudget = (userId, catId, newBudget, targetMonth = null) => {
    const month = targetMonth || selectedMonth || '2026-10';
    const num = parseFloat(newBudget) || 0;
    const key = userId === 'adziima' ? 'adziimaCategories' : 'yasmeenCategories';

    setData(prev => {
      const userMonthly = { ...(prev.monthlyBudgets?.[userId] || {}) };
      const currentMonthBudget = { ...(userMonthly[month] || {}) };
      currentMonthBudget[catId] = num;
      userMonthly[month] = currentMonthBudget;

      // Also ensure this month's custom categories list reflects the new budget
      const currentList = resolveCategories(prev, userId, month);
      const updatedList = currentList.map(c => {
        if (c.id !== catId) return c;
        if (userId === 'adziima') return { ...c, budgetIdr: num };
        return { ...c, budgetCny: num };
      });
      const monthlyCategories = { ...(prev.monthlyCategories || {}) };
      const userMonthlyCats = { ...(monthlyCategories[userId] || {}) };
      userMonthlyCats[month] = updatedList;
      monthlyCategories[userId] = userMonthlyCats;

      return {
        ...prev,
        monthlyBudgets: {
          ...(prev.monthlyBudgets || {}),
          [userId]: userMonthly
        },
        monthlyCategories,
        [key]: (prev[key] || []).map(c => {
          if (c.id !== catId) return c;
          if (userId === 'adziima') return { ...c, budgetIdr: num };
          return { ...c, budgetCny: num };
        })
      };
    });
  };

  // Add new Category / Pos specifically for targetMonth
  const addCategory = (userId, newCat, targetMonth = null) => {
    const month = targetMonth || selectedMonth || '2026-10';
    const key = userId === 'adziima' ? 'adziimaCategories' : 'yasmeenCategories';
    const id = (newCat.id || newCat.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_') || `pos_${Date.now()}`;
    const budget = parseFloat(newCat.budget) || 0;
    const catObj = {
      id,
      name: newCat.name || 'Pos Baru',
      iconName: newCat.iconName || 'Tag',
      color: newCat.color || (userId === 'adziima' ? '#0284c7' : '#db2777'),
      budgetCny: userId === 'yasmeen' ? budget : 0,
      budgetIdr: userId === 'adziima' ? budget : 0,
      note: newCat.note || ''
    };

    setData(prev => {
      const currentList = resolveCategories(prev, userId, month);
      const finalId = currentList.some(c => c.id === id) ? `${id}_${Date.now()}` : id;
      catObj.id = finalId;
      const updatedList = [...currentList, catObj];

      const monthlyCategories = { ...(prev.monthlyCategories || {}) };
      const userMonthlyCats = { ...(monthlyCategories[userId] || {}) };
      userMonthlyCats[month] = updatedList;
      monthlyCategories[userId] = userMonthlyCats;

      // Set budget for this month
      const monthlyBudgets = { ...(prev.monthlyBudgets || {}) };
      const userBudgets = { ...(monthlyBudgets[userId] || {}) };
      const currentMonthBudgets = { ...(userBudgets[month] || {}) };
      currentMonthBudgets[finalId] = budget;
      userBudgets[month] = currentMonthBudgets;
      monthlyBudgets[userId] = userBudgets;

      return {
        ...prev,
        monthlyCategories,
        monthlyBudgets,
        [key]: [...(prev[key] || []), catObj]
      };
    });
    return catObj;
  };

  // Update Category specifically for targetMonth
  const updateCategory = (userId, catId, updates, targetMonth = null) => {
    const month = targetMonth || selectedMonth || '2026-10';
    const key = userId === 'adziima' ? 'adziimaCategories' : 'yasmeenCategories';
    setData(prev => {
      const currentList = resolveCategories(prev, userId, month);
      const updatedList = currentList.map(c => {
        if (c.id !== catId) return c;
        const merged = { ...c, ...updates };
        if (updates.budget !== undefined) {
          const num = parseFloat(updates.budget) || 0;
          if (userId === 'adziima') merged.budgetIdr = num;
          else merged.budgetCny = num;
        }
        return merged;
      });

      const monthlyCategories = { ...(prev.monthlyCategories || {}) };
      const userMonthlyCats = { ...(monthlyCategories[userId] || {}) };
      userMonthlyCats[month] = updatedList;
      monthlyCategories[userId] = userMonthlyCats;

      const monthlyBudgets = { ...(prev.monthlyBudgets || {}) };
      if (updates.budget !== undefined) {
        const num = parseFloat(updates.budget) || 0;
        const userBudgets = { ...(monthlyBudgets[userId] || {}) };
        const currentMonthBudgets = { ...(userBudgets[month] || {}) };
        currentMonthBudgets[catId] = num;
        userBudgets[month] = currentMonthBudgets;
        monthlyBudgets[userId] = userBudgets;
      }

      return {
        ...prev,
        monthlyCategories,
        monthlyBudgets,
        [key]: (prev[key] || []).map(c => {
          if (c.id !== catId) return c;
          const merged = { ...c, ...updates };
          if (updates.budget !== undefined) {
            const num = parseFloat(updates.budget) || 0;
            if (userId === 'adziima') merged.budgetIdr = num;
            else merged.budgetCny = num;
          }
          return merged;
        })
      };
    });
  };

  // Delete Category specifically for targetMonth
  const deleteCategory = (userId, catId, targetMonth = null) => {
    const month = targetMonth || selectedMonth || '2026-10';
    const key = userId === 'adziima' ? 'adziimaCategories' : 'yasmeenCategories';
    setData(prev => {
      const currentList = resolveCategories(prev, userId, month);
      const updatedList = currentList.filter(c => c.id !== catId);

      const monthlyCategories = { ...(prev.monthlyCategories || {}) };
      const userMonthlyCats = { ...(monthlyCategories[userId] || {}) };
      userMonthlyCats[month] = updatedList;
      monthlyCategories[userId] = userMonthlyCats;

      // Remove from monthly budgets for this month
      const monthlyBudgets = { ...(prev.monthlyBudgets || {}) };
      const userBudgets = { ...(monthlyBudgets[userId] || {}) };
      if (userBudgets[month]) {
        const currentMonthBudgets = { ...userBudgets[month] };
        delete currentMonthBudgets[catId];
        userBudgets[month] = currentMonthBudgets;
        monthlyBudgets[userId] = userBudgets;
      }

      // Also remove from base categories so it never resurrects
      const updatedBase = (prev[key] || []).filter(c => c.id !== catId);

      return {
        ...prev,
        [key]: updatedBase,
        monthlyCategories,
        monthlyBudgets
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

  const refreshLiveGoldPrices = async (force = false) => {
    setIsFetchingGoldPrice(true);
    try {
      const res = await fetchLiveGoldPrices();
      if (res && res.sellPrice) {
        updateGaleri24Prices({
          sell: res.sellPrice,
          buyback: res.buybackPrice,
          table: res.table,
          dateLabel: res.dateLabel
        });
        return { success: true, ...res };
      }
      return { success: false };
    } catch (err) {
      console.warn('Auto refresh gold price failed:', err);
      return { success: false, error: err.message };
    } finally {
      setIsFetchingGoldPrice(false);
    }
  };

  // Automatically fetch fresh Galeri 24 prices on app mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = data?.goldSavings?.lastUpdated;
    if (!lastDate || lastDate !== today) {
      refreshLiveGoldPrices();
    }
  }, []);

  // Bulletproof Calculations per selectedMonth
  const calculations = useMemo(() => {
    try {
      const rate = data?.exchangeRate || DEFAULT_EXCHANGE_RATE;
      const yasmeen = data?.users?.yasmeen || DEFAULT_USERS.yasmeen;
      const adziima = data?.users?.adziima || DEFAULT_USERS.adziima;
      const currentMonth = selectedMonth || '2026-10';

      // Check if Yasmeen is in China for the selected month
      const isYasmeenInChina = currentMonth <= '2027-01';

      // Filter transactions for this specific month
      const monthYasmeenTx = (data?.yasmeenTransactions || []).filter(tx => (tx?.date || '').startsWith(currentMonth));
      const monthAdziimaTx = (data?.adziimaTransactions || []).filter(tx => (tx?.date || '').startsWith(currentMonth));

      // 1. Rolling Monthly Balance calculation starting from Oktober 2026 ('2026-10')
      const startBaselineMonth = '2026-10';
      const baseInitialYasmeenCny = (yasmeen?.initialFundCny !== undefined && yasmeen?.initialFundCny !== null)
        ? parseFloat(yasmeen.initialFundCny)
        : ((parseFloat(yasmeen?.initialFundIdr) || 10000000) / rate);
      const baseInitialAdziimaIdr = parseFloat(adziima?.initialFundIdr) || 0;

      const pastMonths = currentMonth > startBaselineMonth ? getMonthsListBetween(startBaselineMonth, currentMonth) : [];

      // Cumulative net change for Yasmeen across past months
      let yasmeenCumulativeNetCny = 0;
      pastMonths.forEach(m => {
        let mIncome = 0;
        let mOutflow = 0;
        (data?.yasmeenTransactions || []).forEach(tx => {
          if ((tx?.date || '').startsWith(m)) {
            if (tx.type === 'Masuk') mIncome += (tx.amountCny || 0);
            else mOutflow += (tx.amountCny || 0);
          }
        });
        yasmeenCumulativeNetCny += (mIncome - mOutflow);
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
        // November has initial cost of Rp 500.000 (¥182). Future months default to ¥0 / Rp 0
        if (userId === 'yasmeen' && catId === 'kebutuhan_awal') {
          return (currentMonth === '2026-10' || currentMonth === '2026-11') ? 182 : 0;
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

      // 1. Yasmeen Monthly Calculations for currentMonth (Stipend dicatat manual di Pemasukan)
      let monthIncomeYasmeenCny = 0;
      let monthOutflowYasmeenCny = 0;

      monthYasmeenTx.forEach(tx => {
        if (tx?.type === 'Masuk') {
          monthIncomeYasmeenCny += (tx?.amountCny || 0);
        } else {
          monthOutflowYasmeenCny += (tx?.amountCny || 0);
        }
      });

      const totalInflowYasmeenCny = startBalanceYasmeenCny + monthIncomeYasmeenCny;
      const netMonthYasmeenCny = totalInflowYasmeenCny - monthOutflowYasmeenCny;
      const reserveYasmeenCny = yasmeen?.emergencyReserveCny || 0;
      const safeYasmeenCny = Math.max(0, netMonthYasmeenCny - reserveYasmeenCny);

      // Categories spending for selected month with inherited budget
      const baseYasmeenCats = isYasmeenInChina
        ? currentYasmeenCategories
        : currentAdziimaCategories;

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

      const activeAdziimaCats = currentAdziimaCategories.map(c => {
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

      // 4. Hitung sisa hari dalam bulan yang dipilih
      const [curYearStr, curMonthStr] = (currentMonth || '2026-10').split('-');
      const cYear = parseInt(curYearStr, 10);
      const cMonth = parseInt(curMonthStr, 10);
      const totalDaysInCurrentMonth = new Date(cYear, cMonth, 0).getDate();
      const nowDate = new Date();
      const isViewingCurrentMonth = (cYear === nowDate.getFullYear() && cMonth === (nowDate.getMonth() + 1));
      const remainingDays = isViewingCurrentMonth
        ? Math.max(1, totalDaysInCurrentMonth - nowDate.getDate() + 1)
        : totalDaysInCurrentMonth;

      // --- Perhitungan Jatah Harian Adziima (Murni dari Pos Daily: Makan, Kebutuhan, Bensin, Ngopi, Rokok) ---
      const dailyCatIdsAdziima = ['makan_harian', 'belanja_kebutuhan', 'bensin_transport', 'ngopi_santai', 'rokok'];
      const dailyCatsAdziima = activeAdziimaCats.filter(c => dailyCatIdsAdziima.includes(c.id));
      const totalDailyBudgetAdziima = dailyCatsAdziima.reduce((sum, c) => sum + (c.budgetIdr || 0), 0);
      const totalDailySpentAdziima = dailyCatsAdziima.reduce((sum, c) => sum + (adziimaSpending[c.id]?.totalIdr || 0), 0);
      const remainingDailyBudgetAdziima = Math.max(0, totalDailyBudgetAdziima - totalDailySpentAdziima);

      const hasDailyBudgetAdziima = totalDailyBudgetAdziima > 0;
      const dailySafeAdziimaIdr = hasDailyBudgetAdziima
        ? Math.round(remainingDailyBudgetAdziima / remainingDays)
        : 0;

      // --- Ringkasan Alokasi Anggaran Semua Pos & Simpanan Bersih Adziima ---
      const totalAllBudgetIdr = activeAdziimaCats.reduce((sum, c) => sum + (c.budgetIdr || 0), 0);
      const remainingAllBudgetIdr = Math.max(0, totalAllBudgetIdr - monthOutflowAdziimaIdr);
      const plannedSavingsIdr = Math.max(0, totalInflowAdziimaIdr - totalAllBudgetIdr);
      const isOverAllocatedAdziima = totalAllBudgetIdr > totalInflowAdziimaIdr && totalInflowAdziimaIdr > 0;
      const overAllocatedAmountAdziima = isOverAllocatedAdziima ? (totalAllBudgetIdr - totalInflowAdziimaIdr) : 0;

      // --- Perhitungan Jatah Harian Yasmeen (Murni dari Pos Daily: Makan, Jajan, Kebutuhan Harian, Belanja Lain) ---
      const dailyCatIdsYasmeen = ['makan', 'jajan', 'kebutuhan_harian', 'belanja_lain'];
      const dailyCatsYasmeen = activeCategories.filter(c => dailyCatIdsYasmeen.includes(c.id));
      const totalDailyBudgetYasmeenCny = dailyCatsYasmeen.reduce((sum, c) => sum + (c.budgetCny || 0), 0);
      const totalDailySpentYasmeenCny = dailyCatsYasmeen.reduce((sum, c) => sum + (yasmeenSpending[c.id]?.totalCny || 0), 0);
      const remainingDailyBudgetYasmeenCny = Math.max(0, totalDailyBudgetYasmeenCny - totalDailySpentYasmeenCny);

      const hasDailyBudgetYasmeen = totalDailyBudgetYasmeenCny > 0;
      const dailySafeYasmeenCny = hasDailyBudgetYasmeen
        ? Math.round((remainingDailyBudgetYasmeenCny / remainingDays) * 10) / 10
        : 0;

      // --- Ringkasan Alokasi Anggaran Semua Pos & Simpanan Bersih Yasmeen ---
      const totalAllBudgetYasmeenCny = activeCategories.reduce((sum, c) => sum + (isYasmeenInChina ? (c.budgetCny || 0) : (c.budgetIdr || 0)), 0);
      const remainingAllBudgetYasmeenCny = Math.max(0, totalAllBudgetYasmeenCny - monthOutflowYasmeenCny);
      const plannedSavingsYasmeenCny = Math.max(0, totalInflowYasmeenCny - totalAllBudgetYasmeenCny);
      const isOverAllocatedYasmeen = totalAllBudgetYasmeenCny > totalInflowYasmeenCny && totalInflowYasmeenCny > 0;
      const overAllocatedAmountYasmeenCny = isOverAllocatedYasmeen ? (totalAllBudgetYasmeenCny - totalInflowYasmeenCny) : 0;

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
          stipendCny: 0,
          stipendIdr: 0,
          isStipendCair: false,
          monthIncomeCny: monthIncomeYasmeenCny,
          monthIncomeIdr: monthIncomeYasmeenCny * rate,
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
          remainingDays,
          hasDailyBudgetSet: hasDailyBudgetYasmeen,
          remainingDailyBudgetCny: remainingDailyBudgetYasmeenCny,
          totalDailyBudgetCny: totalDailyBudgetYasmeenCny,
          dailySafeCny: dailySafeYasmeenCny,
          dailySafeIdr: dailySafeYasmeenCny * rate,
          totalAllBudgetCny: totalAllBudgetYasmeenCny,
          totalAllBudgetIdr: totalAllBudgetYasmeenCny * rate,
          remainingAllBudgetCny: remainingAllBudgetYasmeenCny,
          remainingAllBudgetIdr: remainingAllBudgetYasmeenCny * rate,
          plannedSavingsCny: plannedSavingsYasmeenCny,
          plannedSavingsIdr: plannedSavingsYasmeenCny * rate,
          isOverAllocated: isOverAllocatedYasmeen,
          overAllocatedAmountCny: overAllocatedAmountYasmeenCny,
          overAllocatedAmountIdr: overAllocatedAmountYasmeenCny * rate,
          spending: yasmeenSpending,
          categories: activeCategories || [],
          nongkrongDays: data?.nongkrongChecklist?.[currentMonth] || []
        },
        adziima: {
          monthTx: monthAdziimaTx,
          initialIdr: startBalanceAdziimaIdr,
          startBalanceIdr: startBalanceAdziimaIdr,
          monthIncomeIdr: monthIncomeAdziimaIdr,
          totalInflowIdr: totalInflowAdziimaIdr,
          totalOutflowIdr: monthOutflowAdziimaIdr,
          totalBalanceIdr: netMonthAdziimaIdr,
          reserveIdr: reserveAdziimaIdr,
          safeToSpendIdr: safeAdziimaIdr,
          remainingDays,
          hasDailyBudgetSet: hasDailyBudgetAdziima,
          remainingDailyBudgetIdr: remainingDailyBudgetAdziima,
          totalDailyBudgetIdr: totalDailyBudgetAdziima,
          dailySafeIdr: dailySafeAdziimaIdr,
          totalAllBudgetIdr,
          remainingAllBudgetIdr,
          plannedSavingsIdr,
          isOverAllocated: isOverAllocatedAdziima,
          overAllocatedAmountIdr: overAllocatedAmountAdziima,
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
        currentMonth: selectedMonth || '2026-10',
        yasmeen: {
          monthTx: [],
          isChina: true,
          initialCny: 3636.36,
          initialIdr: 10000000,
          stipendCny: 1000,
          stipendIdr: 2750000,
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
          spending: {},
          categories: ADZIIMA_CATEGORIES
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
  }, [data, selectedMonth]);

  return (
    <PocketContext.Provider
      value={{
        ...data,
        activeView,
        setActiveView,
        selectedMonth,
        setSelectedMonth,
        yasmeenCurrencyView,
        setYasmeenCurrencyView,
        yasmeenCategories: currentYasmeenCategories,
        adziimaCategories: currentAdziimaCategories,
        getCategoriesForMonth,
        calculations,
        setExchangeRate,
        updateUser,
        setTotalMoney,
        toggleStipend,
        toggleNongkrongDay,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateCategoryBudget,
        addCategory,
        updateCategory,
        deleteCategory,
        addGoldDeposit,
        deleteGoldDeposit,
        updateGoldPrice,
        updateGoldTarget,
        updateGaleri24Prices,
        refreshLiveGoldPrices,
        isFetchingGoldPrice,
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
