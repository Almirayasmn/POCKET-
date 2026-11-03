import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  DEFAULT_EXCHANGE_RATE,
  YASMEEN_CATEGORIES,
  ADZIIMA_CATEGORIES,
  DEFAULT_USERS,
  SAMPLE_YASMEEN_TRANSACTIONS,
  SAMPLE_ADZIIMA_TRANSACTIONS,
  DEFAULT_GOLD_SAVINGS,
  GALERI24_DEFAULT_PRICE_TABLE,
  DEFAULT_BUSINESS_DATA
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
export const DEFAULT_GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1G5Mm3lnpdx_4T3QYqODurGBZdK1Kv5CX?usp=sharing';

export const resolveDriveUrl = (url) => {
  if (!url || typeof url !== 'string' || url.includes('/my-drive') || url === 'https://drive.google.com' || url === 'https://drive.google.com/') {
    return DEFAULT_GOOGLE_DRIVE_FOLDER_URL;
  }
  return url;
};

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
  if (userMonthlyCats && userMonthlyCats[month] !== undefined) {
    return Array.isArray(userMonthlyCats[month]) ? userMonthlyCats[month] : [];
  }

  // 2. For Yasmeen: user explicitly requested:
  // "tiap bulan baru itu kosongin aja pos nya biar dibikin ulang dari awal"
  // Do NOT copy from earlier months! Every new month starts empty [] so she can create pos from scratch!
  if (userId === 'yasmeen') {
    return [];
  }

  // Fallback for Adziima
  return catsState?.adziimaCategories || ADZIIMA_CATEGORIES;
}

const PocketContext = createContext(null);

export function PocketProvider({ children }) {
  // 1. Device-local UI State (NEVER synced to Firebase or between devices)
  const [activeView, setActiveViewState] = useState(() => {
    try {
      const saved = localStorage.getItem('pocket_device_active_view');
      if (saved && ['landing', 'yasmeen', 'adziima', 'gold', 'business'].includes(saved)) {
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
    return 'IDR';
  });

  const setYasmeenCurrencyView = (curr) => {
    setYasmeenCurrencyViewState(curr);
    try {
      localStorage.setItem('pocket_device_yasmeen_currency', curr);
    } catch (e) {}
  };

  const [isFetchingGoldPrice, setIsFetchingGoldPrice] = useState(false);

  // App Privacy / PIN Lock State
  const [isAppUnlocked, setIsAppUnlocked] = useState(() => {
    try {
      return localStorage.getItem('pocket_duo_unlocked') === 'true';
    } catch (e) {
      return false;
    }
  });

  const unlockApp = (rememberDevice = true) => {
    setIsAppUnlocked(true);
    if (rememberDevice) {
      try {
        localStorage.setItem('pocket_duo_unlocked', 'true');
      } catch (e) {}
    }
  };

  const lockApp = () => {
    setIsAppUnlocked(false);
    try {
      localStorage.removeItem('pocket_duo_unlocked');
    } catch (e) {}
  };

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users?.yasmeen && parsed.users?.adziima) {
          // Clean legacy bios and dummy mock transactions if needed
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

          // Filter out dummy mock transactions
          const cleanYasTx = (parsed.yasmeenTransactions || []).filter(tx => !['tx-y1', 'tx-y2', 'tx-y3'].includes(tx?.id));

          return {
            ...parsed,
            users,
            securityPin: (typeof window !== 'undefined' ? localStorage.getItem('pocket_duo_security_pin') : null) || parsed.securityPin || '123456',
            adziimaCategories: parsed.adziimaCategories || ADZIIMA_CATEGORIES,
            yasmeenCategories: [],
            monthlyCategories: parsed.monthlyCategories || { yasmeen: {}, adziima: {} },
            yasmeenTransactions: cleanYasTx,
            adziimaTransactions: parsed.adziimaTransactions || [],
            goldSavings: {
              ...DEFAULT_GOLD_SAVINGS,
              ...(parsed.goldSavings || {}),
              pricePerGramIdr: (!parsed.goldSavings?.pricePerGramIdr || parsed.goldSavings?.pricePerGramIdr === 1500000 || parsed.goldSavings?.pricePerGramIdr === 2383000)
                ? DEFAULT_GOLD_SAVINGS.pricePerGramIdr
                : parsed.goldSavings.pricePerGramIdr,
              buybackPerGramIdr: (!parsed.goldSavings?.buybackPerGramIdr || parsed.goldSavings?.buybackPerGramIdr === 2299000)
                ? DEFAULT_GOLD_SAVINGS.buybackPerGramIdr
                : parsed.goldSavings.buybackPerGramIdr,
              priceTable: parsed.goldSavings?.priceTable || GALERI24_DEFAULT_PRICE_TABLE,
              brand: 'Emas Batangan Galeri 24',
              lastUpdated: parsed.goldSavings?.lastUpdated || DEFAULT_GOLD_SAVINGS.lastUpdated,
              lastUpdatedLabel: (parsed.goldSavings?.lastUpdatedLabel && !parsed.goldSavings.lastUpdatedLabel.includes('Pegadaian'))
                ? parsed.goldSavings.lastUpdatedLabel
                : DEFAULT_GOLD_SAVINGS.lastUpdatedLabel,
              valuationMode: parsed.goldSavings?.valuationMode || 'sell'
            },
            monthlyBudgets: parsed.monthlyBudgets || { yasmeen: {}, adziima: {} },
            googleDriveUrl: resolveDriveUrl(parsed.googleDriveUrl || (typeof window !== 'undefined' ? localStorage.getItem('pocket_gdrive_url') : null)),
            deletedBusinessProjectIds: parsed.deletedBusinessProjectIds || [],
            deletedBusinessSaleIds: parsed.deletedBusinessSaleIds || [],
            business: (parsed.business && Array.isArray(parsed.business.projects))
              ? {
                  ...parsed.business,
                  projects: (parsed.business.projects || []).filter(p => !(parsed.deletedBusinessProjectIds || []).includes(p.id))
                }
              : DEFAULT_BUSINESS_DATA
          };
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return {
      securityPin: (typeof window !== 'undefined' ? localStorage.getItem('pocket_duo_security_pin') : null) || '123456',
      exchangeRate: DEFAULT_EXCHANGE_RATE,
      users: DEFAULT_USERS,
      yasmeenCategories: YASMEEN_CATEGORIES,
      adziimaCategories: ADZIIMA_CATEGORIES,
      monthlyCategories: { yasmeen: {}, adziima: {} },
      yasmeenTransactions: [],
      adziimaTransactions: SAMPLE_ADZIIMA_TRANSACTIONS,
      goldSavings: DEFAULT_GOLD_SAVINGS,
      monthlyBudgets: { yasmeen: {}, adziima: {} },
      googleDriveUrl: DEFAULT_GOOGLE_DRIVE_FOLDER_URL,
      deletedBusinessProjectIds: [],
      deletedBusinessSaleIds: [],
      business: DEFAULT_BUSINESS_DATA
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
            // If merged state differs from remote (new entries or purged deletions), update cloud
            const remYasLen = (cleanRemote.yasmeenTransactions || []).length;
            const remAdzLen = (cleanRemote.adziimaTransactions || []).length;
            const remDelLen = (cleanRemote.deletedTransactionIds || []).length;
            const mergedDelLen = (merged.deletedTransactionIds || []).length;
            const remYasCatsLen = (cleanRemote.monthlyCategories?.yasmeen?.['2026-11'] || []).length;
            const mergedYasCatsLen = (merged.monthlyCategories?.yasmeen?.['2026-11'] || []).length;
            if (
              merged.yasmeenTransactions.length !== remYasLen ||
              merged.adziimaTransactions.length !== remAdzLen ||
              mergedDelLen !== remDelLen ||
              remYasCatsLen !== mergedYasCatsLen
            ) {
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
        if (remote.users || remote.yasmeenTransactions || remote.adziimaTransactions || remote.monthlyCategories) {
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

  // Update App Security PIN
  const updateSecurityPin = (newPin) => {
    const clean = String(newPin).trim();
    if (!clean) return;
    try {
      localStorage.setItem('pocket_duo_security_pin', clean);
    } catch (e) {}
    setData(prev => ({
      ...prev,
      securityPin: clean
    }));
    if (firebaseDbUrl) {
      pushCloudSubpath(firebaseDbUrl, 'securityPin', clean).catch(() => {});
    }
  };

  // Update Google Drive folder URL for monthly recap archives
  const updateGoogleDriveUrl = (url) => {
    const clean = resolveDriveUrl((url || '').trim());
    try {
      localStorage.setItem('pocket_gdrive_url', clean);
    } catch (e) {}
    setData(prev => ({
      ...prev,
      googleDriveUrl: clean
    }));
    if (firebaseDbUrl) {
      pushCloudSubpath(firebaseDbUrl, 'googleDriveUrl', clean).catch(() => {});
    }
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
    isRemoteUpdatingRef.current = true;
    const key = userId === 'adziima' ? 'adziimaTransactions' : 'yasmeenTransactions';
    
    setData(prev => {
      const nextList = (prev[key] || []).filter(tx => tx.id !== id);
      const nextDeletedIds = Array.from(new Set([...(prev.deletedTransactionIds || []), id]));
      const nextData = {
        ...prev,
        deletedTransactionIds: nextDeletedIds,
        [key]: nextList
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}

      if (firebaseDbUrl) {
        Promise.all([
          pushCloudSubpath(firebaseDbUrl, key, nextList),
          pushCloudSubpath(firebaseDbUrl, 'deletedTransactionIds', nextDeletedIds)
        ]).catch(() => {});
      }

      return nextData;
    });

    setTimeout(() => { isRemoteUpdatingRef.current = false; }, 1200);
  };

  // Helper to get categories for a given month with fully resolved budgets in IDR & CNY
  const getCategoriesForMonth = (userId, targetMonth = null) => {
    const month = targetMonth || selectedMonth || '2026-10';
    const rate = data?.exchangeRate || DEFAULT_EXCHANGE_RATE;
    const rawList = resolveCategories(data, userId, month);
    const userMonthlyBudgets = data?.monthlyBudgets?.[userId] || {};

    const normalizeToIdr = (val) => {
      const num = parseFloat(val) || 0;
      if (num > 0 && num < 5000) {
        return Math.round(num * rate);
      }
      return num;
    };

    return rawList.map(c => {
      // 1. Direct match in monthlyBudgets for this month
      let budgetVal = undefined;
      if (userMonthlyBudgets[month] && userMonthlyBudgets[month][c.id] !== undefined) {
        budgetVal = userMonthlyBudgets[month][c.id];
      } else {
        // Fallback chronological lookback
        const sortedMonths = Object.keys(userMonthlyBudgets).filter(m => m <= month).sort();
        for (let i = sortedMonths.length - 1; i >= 0; i--) {
          const m = sortedMonths[i];
          if (userMonthlyBudgets[m] && userMonthlyBudgets[m][c.id] !== undefined) {
            budgetVal = userMonthlyBudgets[m][c.id];
            break;
          }
        }
      }

      let resolvedIdr = 0;
      let resolvedCny = 0;

      if (userId === 'yasmeen') {
        if (budgetVal !== undefined) {
          resolvedIdr = normalizeToIdr(budgetVal);
        } else {
          const rawBudget = (c.budgetIdr !== undefined && c.budgetIdr !== null && c.budgetIdr >= 5000)
            ? c.budgetIdr
            : ((c.budgetCny || 0) * rate);
          resolvedIdr = normalizeToIdr(rawBudget);
        }
        resolvedCny = Math.round((resolvedIdr / rate) * 100) / 100;
      } else {
        const raw = budgetVal !== undefined ? budgetVal : (c.budgetIdr || c.budget || 0);
        resolvedIdr = Math.round(parseFloat(raw) || 0);
        resolvedCny = Math.round((resolvedIdr / rate) * 100) / 100;
      }

      return {
        ...c,
        budgetIdr: resolvedIdr,
        budgetCny: resolvedCny,
        budget: resolvedIdr
      };
    });
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
    const rate = data?.exchangeRate || DEFAULT_EXCHANGE_RATE;

    setData(prev => {
      const userMonthly = { ...(prev.monthlyBudgets?.[userId] || {}) };
      const currentMonthBudget = { ...(userMonthly[month] || {}) };
      currentMonthBudget[catId] = num;
      userMonthly[month] = currentMonthBudget;

      const monthlyBudgets = {
        ...(prev.monthlyBudgets || {}),
        [userId]: userMonthly
      };

      // Also ensure this month's custom categories list reflects the new budget
      const currentList = resolveCategories(prev, userId, month);
      const updatedList = currentList.map(c => {
        if (c.id !== catId) return c;
        const asIdr = num;
        const asCny = Math.round((num / rate) * 100) / 100;
        return { ...c, budgetIdr: asIdr, budgetCny: asCny, budget: asIdr };
      });
      const monthlyCategories = { ...(prev.monthlyCategories || {}) };
      const userMonthlyCats = { ...(monthlyCategories[userId] || {}) };
      userMonthlyCats[month] = updatedList;
      monthlyCategories[userId] = userMonthlyCats;

      const nextData = {
        ...prev,
        monthlyBudgets,
        monthlyCategories,
        [key]: (prev[key] || []).map(c => {
          if (c.id !== catId) return c;
          const asIdr = num;
          const asCny = Math.round((num / rate) * 100) / 100;
          return { ...c, budgetIdr: asIdr, budgetCny: asCny, budget: asIdr };
        })
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}

      if (firebaseDbUrl) {
        pushCloudSubpath(firebaseDbUrl, 'monthlyCategories', monthlyCategories).catch(() => {});
        pushCloudSubpath(firebaseDbUrl, 'monthlyBudgets', monthlyBudgets).catch(() => {});
      }

      return nextData;
    });
  };

  // Add new Category / Pos specifically for targetMonth
  const addCategory = (userId, newCat, targetMonth = null) => {
    const month = targetMonth || selectedMonth || '2026-10';
    const key = userId === 'adziima' ? 'adziimaCategories' : 'yasmeenCategories';
    const id = (newCat.id || newCat.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_') || `pos_${Date.now()}`;
    const budget = parseFloat(newCat.budget) || 0;
    const rate = data?.exchangeRate || DEFAULT_EXCHANGE_RATE;
    const catObj = {
      id,
      name: newCat.name || 'Pos Baru',
      iconName: newCat.iconName || 'Tag',
      color: newCat.color || (userId === 'adziima' ? '#0284c7' : '#db2777'),
      budgetIdr: budget,
      budgetCny: Math.round((budget / rate) * 100) / 100,
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

      const nextData = {
        ...prev,
        monthlyCategories,
        monthlyBudgets,
        [key]: [...(prev[key] || []), catObj]
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}
      if (firebaseDbUrl) {
        pushCloudSubpath(firebaseDbUrl, 'monthlyCategories', monthlyCategories).catch(() => {});
        pushCloudSubpath(firebaseDbUrl, 'monthlyBudgets', monthlyBudgets).catch(() => {});
      }
      return nextData;
    });
    return catObj;
  };

  // Update Category specifically for targetMonth
  const updateCategory = (userId, catId, updates, targetMonth = null) => {
    const month = targetMonth || selectedMonth || '2026-10';
    const key = userId === 'adziima' ? 'adziimaCategories' : 'yasmeenCategories';
    const rate = data?.exchangeRate || DEFAULT_EXCHANGE_RATE;
    setData(prev => {
      const currentList = resolveCategories(prev, userId, month);
      const updatedList = currentList.map(c => {
        if (c.id !== catId) return c;
        const merged = { ...c, ...updates };
        if (updates.budget !== undefined) {
          const num = parseFloat(updates.budget) || 0;
          merged.budget = num;
          merged.budgetIdr = num;
          merged.budgetCny = Math.round((num / rate) * 100) / 100;
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

      const nextData = {
        ...prev,
        monthlyCategories,
        monthlyBudgets,
        [key]: (prev[key] || []).map(c => {
          if (c.id !== catId) return c;
          const merged = { ...c, ...updates };
          if (updates.budget !== undefined) {
            const num = parseFloat(updates.budget) || 0;
            merged.budget = num;
            merged.budgetIdr = num;
            merged.budgetCny = Math.round((num / rate) * 100) / 100;
          }
          return merged;
        })
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}
      if (firebaseDbUrl) {
        pushCloudSubpath(firebaseDbUrl, 'monthlyCategories', monthlyCategories).catch(() => {});
        pushCloudSubpath(firebaseDbUrl, 'monthlyBudgets', monthlyBudgets).catch(() => {});
      }
      return nextData;
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

      const nextData = {
        ...prev,
        [key]: updatedBase,
        monthlyCategories,
        monthlyBudgets
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}
      if (firebaseDbUrl) {
        pushCloudSubpath(firebaseDbUrl, 'monthlyCategories', monthlyCategories).catch(() => {});
        pushCloudSubpath(firebaseDbUrl, 'monthlyBudgets', monthlyBudgets).catch(() => {});
      }
      return nextData;
    });
  };

  // Reset all categories for targetMonth to empty []
  const resetCategoriesForMonth = (userId, targetMonth = null) => {
    const month = targetMonth || selectedMonth || '2026-10';
    setData(prev => {
      const monthlyCategories = { ...(prev.monthlyCategories || {}) };
      const userMonthlyCats = { ...(monthlyCategories[userId] || {}) };
      userMonthlyCats[month] = [];
      monthlyCategories[userId] = userMonthlyCats;

      const monthlyBudgets = { ...(prev.monthlyBudgets || {}) };
      const userBudgets = { ...(monthlyBudgets[userId] || {}) };
      userBudgets[month] = {};
      monthlyBudgets[userId] = userBudgets;

      const nextData = {
        ...prev,
        monthlyCategories,
        monthlyBudgets
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}

      if (firebaseDbUrl) {
        pushCloudSubpath(firebaseDbUrl, 'monthlyCategories', monthlyCategories).catch(() => {});
        pushCloudSubpath(firebaseDbUrl, 'monthlyBudgets', monthlyBudgets).catch(() => {});
      }

      return nextData;
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
        brand: 'Emas Batangan Galeri 24',
        pricePerGramIdr: parseFloat(sell) || prev.goldSavings?.pricePerGramIdr || 2467000,
        buybackPerGramIdr: parseFloat(buyback) || prev.goldSavings?.buybackPerGramIdr || 2322000,
        priceTable: table || prev.goldSavings?.priceTable || GALERI24_DEFAULT_PRICE_TABLE,
        lastUpdated: new Date().toISOString().split('T')[0],
        lastUpdatedLabel: dateLabel || 'Acuan Resmi Galeri 24',
        sourceUrl: 'https://galeri24.co.id/harga-emas'
      }
    }));
  };

  const updatePegadaianChartHistory = ({ history, sellPrice, buybackPrice, pricePer001g, buybackPer001g, priceTable, dateLabel, date }) => {
    const nowWib = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const todayStr = date || nowWib.toISOString().split('T')[0];
    const todayLabel = dateLabel || `${nowWib.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} (Galeri 24 Resmi)`;
    const sellPricePerGram = parseFloat(sellPrice) || (parseFloat(pricePer001g) ? parseFloat(pricePer001g) * 100 : 2467000);
    const buybackPricePerGram = parseFloat(buybackPrice) || (parseFloat(buybackPer001g) ? parseFloat(buybackPer001g) * 100 : 2322000);
    const price001g = Math.round(sellPricePerGram / 100);
    const buyback001g = Math.round(buybackPricePerGram / 100);

    setData(prev => {
      const prevHistory = prev.goldSavings?.pegadaianHistory || DEFAULT_GOLD_SAVINGS.pegadaianHistory || [];
      let merged = [];

      if (Array.isArray(history) && history.length > 1) {
        merged = [...history];
        const hasToday = merged.some(h => h.date === todayStr);
        if (!hasToday) {
          merged.push({
            date: todayStr,
            sellPrice: sellPricePerGram,
            buybackPrice: buybackPricePerGram,
            sellPer001g: price001g,
            buybackPer001g: buyback001g,
            sellPerGram: sellPricePerGram,
            buybackPerGram: buybackPricePerGram
          });
        }
      } else {
        const withoutToday = prevHistory.filter(h => h.date !== todayStr);
        merged = [
          ...withoutToday,
          {
            date: todayStr,
            sellPrice: sellPricePerGram,
            buybackPrice: buybackPricePerGram,
            sellPer001g: price001g,
            buybackPer001g: buyback001g,
            sellPerGram: sellPricePerGram,
            buybackPerGram: buybackPricePerGram
          }
        ];
      }

      merged.sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        ...prev,
        goldSavings: {
          ...(prev.goldSavings || DEFAULT_GOLD_SAVINGS),
          brand: 'Emas Batangan Galeri 24',
          priceTable: priceTable || prev.goldSavings?.priceTable || GALERI24_DEFAULT_PRICE_TABLE,
          pegadaianHistory: merged,
          pegadaianLastPrice001g: price001g,
          pegadaianLastBuyback001g: buyback001g,
          pegadaianLastDate: todayStr,
          pegadaianLastDateLabel: todayLabel,
          pricePerGramIdr: sellPricePerGram,
          buybackPerGramIdr: buybackPricePerGram,
          lastUpdated: todayStr,
          lastUpdatedLabel: todayLabel,
          sourceUrl: 'https://galeri24.co.id/harga-emas'
        }
      };
    });
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
      if (res && res.success) {
        updatePegadaianChartHistory({
          history: res.history,
          sellPrice: res.sellPrice,
          buybackPrice: res.buybackPrice,
          pricePer001g: res.sellPricePer001g,
          buybackPer001g: res.buybackPricePer001g,
          priceTable: res.priceTable,
          date: res.date,
          dateLabel: res.dateLabel
        });
        return { success: true, ...res };
      }
      return { success: false };
    } catch (err) {
      console.warn('Auto refresh Galeri 24 live prices failed:', err);
      return { success: false, error: err.message };
    } finally {
      setIsFetchingGoldPrice(false);
    }
  };

  // Automatically fetch fresh Pegadaian chart history on app mount and window focus/resume
  useEffect(() => {
    refreshLiveGoldPrices();

    const handleFocus = () => {
      refreshLiveGoldPrices();
    };

    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshLiveGoldPrices();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Multi-Project Business Action Methods
  const addBusinessProject = (newProjectData) => {
    const id = `biz-${Date.now()}`;
    const weight = parseFloat(newProjectData.weightKg) || 0;
    const shipKg = parseFloat(newProjectData.shippingCostPerKg) || 0;
    const newProj = {
      id,
      name: newProjectData.name || 'Bisnis Baru',
      category: newProjectData.category || 'fashion',
      customCategoryName: newProjectData.customCategoryName || '',
      createdAt: new Date().toISOString().split('T')[0],
      productName: newProjectData.productName || 'Produk Perdana',
      totalUnits: parseInt(newProjectData.totalUnits, 10) || 50,
      itemCostTotal: parseFloat(newProjectData.itemCostTotal) || 0,
      weightKg: weight,
      shippingCostPerKg: shipKg,
      otherCostTotal: parseFloat(newProjectData.otherCostTotal) || 0,
      targetPricePerUnit: parseFloat(newProjectData.targetPricePerUnit) || 100000,
      notes: newProjectData.notes || '',
      selectedSalesMethods: newProjectData.selectedSalesMethods || ['ready_stock', 'pre_order', 'online_shop'],
      partnerProfitSplit: newProjectData.partnerProfitSplit || { yasmeen: 50, adziima: 50 },
      sales: [],
      expenses: []
    };

    setData(prev => {
      const prevProjects = prev.business?.projects || DEFAULT_BUSINESS_DATA.projects;
      const nextBusiness = {
        ...(prev.business || {}),
        activeProjectId: id,
        projects: [...prevProjects, newProj]
      };
      const nextData = {
        ...prev,
        business: nextBusiness
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}

      if (firebaseDbUrl) {
        pushCloudSubpath(firebaseDbUrl, 'business', nextBusiness).catch(() => {});
      }

      return nextData;
    });
    return id;
  };

  const updateBusinessProject = (projectId, updates) => {
    setData(prev => {
      const prevProjects = prev.business?.projects || DEFAULT_BUSINESS_DATA.projects;
      const updated = prevProjects.map(p => {
        if (p.id === projectId) {
          return { ...p, ...updates };
        }
        return p;
      });
      const nextBusiness = {
        ...(prev.business || {}),
        projects: updated
      };
      const nextData = {
        ...prev,
        business: nextBusiness
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}

      if (firebaseDbUrl) {
        pushCloudSubpath(firebaseDbUrl, 'business', nextBusiness).catch(() => {});
      }

      return nextData;
    });
  };

  const deleteBusinessProject = (projectId) => {
    isRemoteUpdatingRef.current = true;
    setData(prev => {
      const prevProjects = prev.business?.projects || DEFAULT_BUSINESS_DATA.projects;
      const filtered = prevProjects.filter(p => p.id !== projectId);
      const nextActiveId = filtered.length > 0 ? filtered[0].id : null;
      const nextDeletedIds = Array.from(new Set([...(prev.deletedBusinessProjectIds || []), projectId]));
      const nextBusiness = {
        ...(prev.business || {}),
        activeProjectId: nextActiveId,
        projects: filtered
      };
      const nextData = {
        ...prev,
        deletedBusinessProjectIds: nextDeletedIds,
        business: nextBusiness
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}

      if (firebaseDbUrl) {
        Promise.all([
          pushCloudSubpath(firebaseDbUrl, 'business', nextBusiness),
          pushCloudSubpath(firebaseDbUrl, 'deletedBusinessProjectIds', nextDeletedIds)
        ]).catch(() => {});
      }

      return nextData;
    });
    setTimeout(() => { isRemoteUpdatingRef.current = false; }, 800);
  };

  const setActiveBusinessProject = (projectId) => {
    setData(prev => {
      const nextData = {
        ...prev,
        business: {
          ...(prev.business || {}),
          activeProjectId: projectId
        }
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}
      return nextData;
    });
  };

  const recordBusinessSale = (saleData) => {
    const newSale = {
      id: `bsale-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: saleData.date || getLocalDateString(),
      method: saleData.method || saleData.channel || 'ready_stock',
      pcs: parseInt(saleData.pcs, 10) || 1,
      pricePerPcs: parseFloat(saleData.pricePerPcs) || 100000,
      totalAmountIdr: (parseInt(saleData.pcs, 10) || 1) * (parseFloat(saleData.pricePerPcs) || 100000),
      buyerOrNote: saleData.buyerOrNote || '',
      seller: saleData.seller || 'berdua',
      createdAt: new Date().toISOString()
    };

    setData(prev => {
      const prevProjects = prev.business?.projects || DEFAULT_BUSINESS_DATA.projects;
      const targetId = saleData.projectId || prev.business?.activeProjectId || prevProjects[0]?.id;
      const updated = prevProjects.map(p => {
        if (p.id === targetId) {
          return {
            ...p,
            sales: [newSale, ...(p.sales || [])]
          };
        }
        return p;
      });
      const nextBusiness = {
        ...(prev.business || {}),
        projects: updated
      };
      const nextData = {
        ...prev,
        business: nextBusiness
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}

      if (firebaseDbUrl) {
        pushCloudSubpath(firebaseDbUrl, 'business', nextBusiness).catch(() => {});
      }

      return nextData;
    });
  };

  const deleteBusinessSale = (saleId, projectId) => {
    isRemoteUpdatingRef.current = true;
    setData(prev => {
      const prevProjects = prev.business?.projects || DEFAULT_BUSINESS_DATA.projects;
      const updated = prevProjects.map(p => {
        if (!projectId || p.id === projectId) {
          return {
            ...p,
            sales: (p.sales || []).filter(s => s.id !== saleId)
          };
        }
        return p;
      });
      const nextDeletedSaleIds = Array.from(new Set([...(prev.deletedBusinessSaleIds || []), saleId]));
      const nextBusiness = {
        ...(prev.business || {}),
        projects: updated
      };
      const nextData = {
        ...prev,
        deletedBusinessSaleIds: nextDeletedSaleIds,
        business: nextBusiness
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      } catch (e) {}

      if (firebaseDbUrl) {
        Promise.all([
          pushCloudSubpath(firebaseDbUrl, 'business', nextBusiness),
          pushCloudSubpath(firebaseDbUrl, 'deletedBusinessSaleIds', nextDeletedSaleIds)
        ]).catch(() => {});
      }

      return nextData;
    });
    setTimeout(() => { isRemoteUpdatingRef.current = false; }, 800);
  };

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

      // Convert legacy Yuan budget (< 5000) to IDR
      const normalizeToIdr = (val) => {
        const num = parseFloat(val) || 0;
        if (num > 0 && num < 5000) {
          return Math.round(num * rate);
        }
        return num;
      };

      // Helper to resolve inherited budget for a category in a given month
      const getCategoryBudget = (userId, catId, defaultBudget) => {
        const userMonthly = data?.monthlyBudgets?.[userId] || {};
        // 1. Direct match in current month
        if (userMonthly[currentMonth] && userMonthly[currentMonth][catId] !== undefined) {
          return normalizeToIdr(userMonthly[currentMonth][catId]);
        }

        // Special rule for Yasmeen's kebutuhan_awal:
        // November has initial cost of Rp 500.000. Future months default to Rp 0
        if (userId === 'yasmeen' && catId === 'kebutuhan_awal') {
          return (currentMonth === '2026-10' || currentMonth === '2026-11') ? 500000 : 0;
        }

        // 2. Look back through earlier months in chronological order
        const sortedMonths = Object.keys(userMonthly).filter(m => m <= currentMonth).sort();
        for (let i = sortedMonths.length - 1; i >= 0; i--) {
          const m = sortedMonths[i];
          if (userMonthly[m] && userMonthly[m][catId] !== undefined) {
            return normalizeToIdr(userMonthly[m][catId]);
          }
        }
        // 3. Fallback to default
        return normalizeToIdr(defaultBudget || 0);
      };

      // 1. Yasmeen Monthly Calculations for currentMonth (Stipend dicatat manual di Pemasukan)
      let monthIncomeYasmeenCny = 0;
      let monthOutflowYasmeenCny = 0;
      let monthIncomeYasmeenIdr = 0;
      let monthOutflowYasmeenIdr = 0;

      monthYasmeenTx.forEach(tx => {
        if (tx?.type === 'Masuk') {
          monthIncomeYasmeenCny += (tx?.amountCny || 0);
          monthIncomeYasmeenIdr += (tx?.amountIdr || 0);
        } else {
          monthOutflowYasmeenCny += (tx?.amountCny || 0);
          monthOutflowYasmeenIdr += (tx?.amountIdr || 0);
        }
      });

      const startBalanceYasmeenIdr = startBalanceYasmeenCny * rate;
      const totalInflowYasmeenCny = startBalanceYasmeenCny + monthIncomeYasmeenCny;
      const totalInflowYasmeenIdr = startBalanceYasmeenIdr + monthIncomeYasmeenIdr;
      const netMonthYasmeenCny = totalInflowYasmeenCny - monthOutflowYasmeenCny;
      const netMonthYasmeenIdr = totalInflowYasmeenIdr - monthOutflowYasmeenIdr;
      const reserveYasmeenCny = yasmeen?.emergencyReserveCny || 0;
      const reserveYasmeenIdr = (yasmeen?.emergencyReserveIdr !== undefined && yasmeen?.emergencyReserveIdr !== null)
        ? parseFloat(yasmeen.emergencyReserveIdr)
        : (reserveYasmeenCny * rate);
      const safeYasmeenCny = Math.max(0, netMonthYasmeenCny - reserveYasmeenCny);
      const safeYasmeenIdr = Math.max(0, netMonthYasmeenIdr - reserveYasmeenIdr);

      // Categories spending for selected month with inherited budget (Baseline in IDR)
      const baseYasmeenCats = currentYasmeenCategories;

      const activeCategories = baseYasmeenCats.map(c => {
        const rawBudget = (c.budgetIdr !== undefined && c.budgetIdr !== null && c.budgetIdr > 0)
          ? c.budgetIdr
          : ((c.budgetCny || 0) * rate);
        const defaultBudgetIdr = normalizeToIdr(rawBudget);
        const resolvedBudget = normalizeToIdr(getCategoryBudget('yasmeen', c.id, defaultBudgetIdr));
        return {
          ...c,
          budgetIdr: resolvedBudget,
          budgetCny: Math.round((resolvedBudget / rate) * 100) / 100
        };
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
      const pricePerGram = data?.goldSavings?.pricePerGramIdr || 2467000;
      const buybackPerGram = data?.goldSavings?.buybackPerGramIdr || 2322000;
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
      const totalDailyBudgetYasmeenIdr = dailyCatsYasmeen.reduce((sum, c) => sum + (c.budgetIdr || 0), 0);
      const totalDailySpentYasmeenIdr = dailyCatsYasmeen.reduce((sum, c) => sum + (yasmeenSpending[c.id]?.totalIdr || 0), 0);
      const remainingDailyBudgetYasmeenIdr = Math.max(0, totalDailyBudgetYasmeenIdr - totalDailySpentYasmeenIdr);

      const hasDailyBudgetYasmeen = totalDailyBudgetYasmeenIdr > 0;
      const dailySafeYasmeenIdr = hasDailyBudgetYasmeen
        ? Math.round(remainingDailyBudgetYasmeenIdr / remainingDays)
        : 0;
      const dailySafeYasmeenCny = Math.round((dailySafeYasmeenIdr / rate) * 10) / 10;

      // --- Ringkasan Alokasi Anggaran Semua Pos & Simpanan Bersih Yasmeen ---
      const totalAllBudgetYasmeenIdr = activeCategories.reduce((sum, c) => sum + (c.budgetIdr || 0), 0);
      const remainingAllBudgetYasmeenIdr = Math.max(0, totalAllBudgetYasmeenIdr - monthOutflowYasmeenIdr);
      const plannedSavingsYasmeenIdr = Math.max(0, totalInflowYasmeenIdr - totalAllBudgetYasmeenIdr);
      const isOverAllocatedYasmeen = totalAllBudgetYasmeenIdr > totalInflowYasmeenIdr && totalInflowYasmeenIdr > 0;
      const overAllocatedAmountYasmeenIdr = isOverAllocatedYasmeen ? (totalAllBudgetYasmeenIdr - totalInflowYasmeenIdr) : 0;

      // --- 4. Actual Live Balances per Hari Ini (Strictly for Landing Page & Global Wealth) ---
      const actualMonthStr = getLocalDateString().slice(0, 7);
      const resolvedActualMonth = actualMonthStr >= '2026-10' ? actualMonthStr : '2026-10';

      const actualPastMonths = resolvedActualMonth > startBaselineMonth
        ? getMonthsListBetween(startBaselineMonth, resolvedActualMonth)
        : [];
      const actualRelevantMonths = [...actualPastMonths, resolvedActualMonth];

      let actualYasmeenNetCny = 0;
      let actualYasmeenNetIdr = 0;
      (data?.yasmeenTransactions || []).forEach(tx => {
        const txMonth = (tx?.date || '').slice(0, 7);
        if (actualRelevantMonths.includes(txMonth)) {
          if (tx.type === 'Masuk') {
            actualYasmeenNetCny += (tx.amountCny || 0);
            actualYasmeenNetIdr += (tx.amountIdr || 0);
          } else {
            actualYasmeenNetCny -= (tx.amountCny || 0);
            actualYasmeenNetIdr -= (tx.amountIdr || 0);
          }
        }
      });

      let actualAdziimaNetIdr = 0;
      (data?.adziimaTransactions || []).forEach(tx => {
        const txMonth = (tx?.date || '').slice(0, 7);
        if (actualRelevantMonths.includes(txMonth)) {
          if (tx.type === 'Masuk') actualAdziimaNetIdr += (tx.amountIdr || 0);
          else actualAdziimaNetIdr -= (tx.amountIdr || 0);
        }
      });

      const actualYasmeenBalanceCny = baseInitialYasmeenCny + actualYasmeenNetCny;
      const actualYasmeenBalanceIdr = actualYasmeenBalanceCny * rate;
      const actualAdziimaBalanceIdr = baseInitialAdziimaIdr + actualAdziimaNetIdr;

      const actualGoldAssetValueIdr = currentAssetValueIdr || 0;
      const actualTotalJointWealthIdr = actualYasmeenBalanceIdr + actualAdziimaBalanceIdr + actualGoldAssetValueIdr;

      const actualSafeTotal = actualTotalJointWealthIdr > 0 ? actualTotalJointWealthIdr : 1;
      const actualYasmeenPercent = actualTotalJointWealthIdr > 0 ? Math.round((actualYasmeenBalanceIdr / actualSafeTotal) * 100) : 33;
      const actualAdziimaPercent = actualTotalJointWealthIdr > 0 ? Math.round((actualAdziimaBalanceIdr / actualSafeTotal) * 100) : 33;
      const actualGoldPercent = actualTotalJointWealthIdr > 0 ? Math.max(0, 100 - actualYasmeenPercent - actualAdziimaPercent) : 34;

      const actualBalances = {
        actualMonth: resolvedActualMonth,
        yasmeenBalanceCny: actualYasmeenBalanceCny,
        yasmeenBalanceIdr: actualYasmeenBalanceIdr,
        adziimaBalanceIdr: actualAdziimaBalanceIdr,
        goldAssetValueIdr: actualGoldAssetValueIdr,
        totalJointWealthIdr: actualTotalJointWealthIdr,
        yasmeenPercent: actualYasmeenPercent,
        adziimaPercent: actualAdziimaPercent,
        goldPercent: actualGoldPercent
      };

      return {
        rate,
        isYasmeenInChina,
        currentMonth,
        actualBalances,
        yasmeen: {
          monthTx: monthYasmeenTx,
          isChina: isYasmeenInChina,
          initialCny: startBalanceYasmeenCny,
          initialIdr: startBalanceYasmeenIdr,
          startBalanceCny: startBalanceYasmeenCny,
          startBalanceIdr: startBalanceYasmeenIdr,
          stipendCny: 0,
          stipendIdr: 0,
          isStipendCair: false,
          monthIncomeCny: monthIncomeYasmeenCny,
          monthIncomeIdr: monthIncomeYasmeenIdr,
          totalInflowCny: totalInflowYasmeenCny,
          totalInflowIdr: totalInflowYasmeenIdr,
          totalOutflowCny: monthOutflowYasmeenCny,
          totalOutflowIdr: monthOutflowYasmeenIdr,
          totalBalanceCny: netMonthYasmeenCny,
          totalBalanceIdr: netMonthYasmeenIdr,
          reserveCny: reserveYasmeenCny,
          reserveIdr: reserveYasmeenIdr,
          safeToSpendCny: safeYasmeenCny,
          safeToSpendIdr: safeYasmeenIdr,
          remainingDays,
          hasDailyBudgetSet: hasDailyBudgetYasmeen,
          remainingDailyBudgetCny: Math.round((remainingDailyBudgetYasmeenIdr / rate) * 100) / 100,
          remainingDailyBudgetIdr: remainingDailyBudgetYasmeenIdr,
          totalDailyBudgetCny: Math.round((totalDailyBudgetYasmeenIdr / rate) * 100) / 100,
          totalDailyBudgetIdr: totalDailyBudgetYasmeenIdr,
          dailySafeCny: dailySafeYasmeenCny,
          dailySafeIdr: dailySafeYasmeenIdr,
          totalAllBudgetCny: Math.round((totalAllBudgetYasmeenIdr / rate) * 100) / 100,
          totalAllBudgetIdr: totalAllBudgetYasmeenIdr,
          remainingAllBudgetCny: Math.round((remainingAllBudgetYasmeenIdr / rate) * 100) / 100,
          remainingAllBudgetIdr: remainingAllBudgetYasmeenIdr,
          plannedSavingsCny: Math.round((plannedSavingsYasmeenIdr / rate) * 100) / 100,
          plannedSavingsIdr: plannedSavingsYasmeenIdr,
          isOverAllocated: isOverAllocatedYasmeen,
          overAllocatedAmountCny: Math.round((overAllocatedAmountYasmeenIdr / rate) * 100) / 100,
          overAllocatedAmountIdr: overAllocatedAmountYasmeenIdr,
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
          pegadaianHistory: data?.goldSavings?.pegadaianHistory || DEFAULT_GOLD_SAVINGS.pegadaianHistory,
          pegadaianPrice001g: data?.goldSavings?.pegadaianLastPrice001g || 24670,
          pegadaianBuyback001g: data?.goldSavings?.pegadaianLastBuyback001g || 23220,
          pegadaianDateLabel: data?.goldSavings?.pegadaianLastDateLabel || `${new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} (Galeri 24 Resmi)`,
          brand: 'Emas Batangan Galeri 24',
          sourceUrl: 'https://galeri24.co.id/harga-emas',
          activeValuationPrice,
          valuationMode,
          lastUpdated: data?.goldSavings?.lastUpdated || DEFAULT_GOLD_SAVINGS.lastUpdated,
          lastUpdatedLabel: data?.goldSavings?.lastUpdatedLabel || 'Acuan Resmi Galeri 24',
          priceTable: data?.goldSavings?.priceTable || GALERI24_DEFAULT_PRICE_TABLE,
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
        actualBalances: {
          actualMonth: '2026-11',
          yasmeenBalanceCny: 3636.36,
          yasmeenBalanceIdr: 10000000,
          adziimaBalanceIdr: 0,
          goldAssetValueIdr: 0,
          totalJointWealthIdr: 10000000,
          yasmeenPercent: 100,
          adziimaPercent: 0,
          goldPercent: 0
        },
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

  // Multi-Project Business Calculations Memo
  const businessCalculations = useMemo(() => {
    const biz = data?.business || DEFAULT_BUSINESS_DATA;
    const projectsList = Array.isArray(biz?.projects) && biz.projects.length > 0
      ? biz.projects
      : DEFAULT_BUSINESS_DATA.projects;
    const activeId = biz?.activeProjectId || projectsList[0]?.id || 'biz-1';

    const calculatedProjects = projectsList.map(p => {
      const totalUnits = parseInt(p.totalUnits, 10) || 50;
      const itemCostTotal = parseFloat(p.itemCostTotal) || 0;
      const weightKg = parseFloat(p.weightKg) || 0;
      const shippingCostPerKg = parseFloat(p.shippingCostPerKg) || 0;
      const totalShippingCost = weightKg * shippingCostPerKg;
      const otherCostTotal = parseFloat(p.otherCostTotal) || 0;
      const targetPricePerUnit = parseFloat(p.targetPricePerUnit) || 100000;

      const totalCapitalCost = itemCostTotal + totalShippingCost + otherCostTotal;
      const hppPerUnit = totalUnits > 0 ? Math.round(totalCapitalCost / totalUnits) : 0;
      const profitPerUnit = targetPricePerUnit - hppPerUnit;
      const marginPercent = targetPricePerUnit > 0 ? Math.round(((targetPricePerUnit - hppPerUnit) / targetPricePerUnit) * 1000) / 10 : 0;
      const totalEstimatedRevenue = targetPricePerUnit * totalUnits;
      const totalEstimatedNetProfit = Math.max(0, totalEstimatedRevenue - totalCapitalCost);
      const bepUnits = targetPricePerUnit > 0 ? Math.ceil(totalCapitalCost / targetPricePerUnit) : 0;

      const sales = p.sales || [];
      let totalPcsSold = 0;
      let totalActualRevenue = 0;
      sales.forEach(s => {
        const qty = parseInt(s.pcs, 10) || 0;
        const amt = parseFloat(s.totalAmountIdr) || (qty * (parseFloat(s.pricePerPcs) || targetPricePerUnit));
        totalPcsSold += qty;
        totalActualRevenue += amt;
      });

      const bepPercent = totalCapitalCost > 0 ? Math.min(100, Math.round((totalActualRevenue / totalCapitalCost) * 100)) : 0;
      const isCapitalRecovered = totalActualRevenue >= totalCapitalCost;
      const remainingUnits = Math.max(0, totalUnits - totalPcsSold);
      const actualGrossProfit = totalActualRevenue - (totalPcsSold * hppPerUnit);

      return {
        ...p,
        totalUnits,
        itemCostTotal,
        weightKg,
        shippingCostPerKg,
        totalShippingCost,
        otherCostTotal,
        targetPricePerUnit,
        totalCapitalCost,
        hppPerUnit,
        profitPerUnit,
        marginPercent,
        totalEstimatedRevenue,
        totalEstimatedNetProfit,
        bepUnits,
        totalPcsSold,
        totalActualRevenue,
        bepPercent,
        isCapitalRecovered,
        remainingUnits,
        actualGrossProfit
      };
    });

    const activeProject = calculatedProjects.find(cp => cp.id === activeId) || calculatedProjects[0] || {};

    const totalAllEstimatedRevenue = calculatedProjects.reduce((sum, cp) => sum + cp.totalEstimatedRevenue, 0);
    const totalAllActualRevenue = calculatedProjects.reduce((sum, cp) => sum + cp.totalActualRevenue, 0);
    const totalAllCapitalCost = calculatedProjects.reduce((sum, cp) => sum + cp.totalCapitalCost, 0);

    return {
      projects: calculatedProjects,
      activeProject,
      activeProjectId: activeId,
      settings: {
        businessName: activeProject.name || 'Bisnis & Usaha',
        businessType: activeProject.category || 'fashion',
        selectedSalesMethods: activeProject.selectedSalesMethods || ['ready_stock', 'pre_order', 'online_shop']
      },
      totalUnits: activeProject.totalUnits || 0,
      totalCapitalCost: activeProject.totalCapitalCost || 0,
      hppPerUnit: activeProject.hppPerUnit || 0,
      profitPerUnit: activeProject.profitPerUnit || 0,
      marginPercent: activeProject.marginPercent || 0,
      totalEstimatedRevenue: activeProject.totalEstimatedRevenue || 0,
      totalEstimatedNetProfit: activeProject.totalEstimatedNetProfit || 0,
      bepUnits: activeProject.bepUnits || 0,
      bepPcs: activeProject.bepUnits || 0,
      totalPcsSold: activeProject.totalPcsSold || 0,
      totalRevenue: activeProject.totalActualRevenue || 0,
      bepPercent: activeProject.bepPercent || 0,
      isCapitalRecovered: activeProject.isCapitalRecovered || false,
      remainingUnits: activeProject.remainingUnits || 0,
      totalAllEstimatedRevenue,
      totalAllActualRevenue,
      totalAllCapitalCost
    };
  }, [data?.business]);

  return (
    <PocketContext.Provider
      value={{
        ...data,
        business: data?.business || DEFAULT_BUSINESS_DATA,
        businessCalculations,
        addBusinessProject,
        updateBusinessProject,
        deleteBusinessProject,
        setActiveBusinessProject,
        recordBusinessSale,
        deleteBusinessSale,
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
        resetCategoriesForMonth,
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
        syncToCloud,
        isAppUnlocked,
        unlockApp,
        lockApp,
        securityPin: (typeof window !== 'undefined' ? localStorage.getItem('pocket_duo_security_pin') : null) || data?.securityPin || '123456',
        updateSecurityPin,
        googleDriveUrl: resolveDriveUrl(data?.googleDriveUrl || (typeof window !== 'undefined' ? localStorage.getItem('pocket_gdrive_url') : null)),
        updateGoogleDriveUrl
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
