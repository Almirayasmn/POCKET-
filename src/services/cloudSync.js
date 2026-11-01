// Lightweight, Zero-Dependency Real-time Cloud Sync for Firebase Realtime Database
// Uses native REST API & EventSource (Server-Sent Events) for instant cross-device updates

const CONFIG_STORAGE_KEY = 'pocket_firebase_db_url_v1';
export const DEFAULT_FIREBASE_URL = 'https://pocket-our-default-rtdb.asia-southeast1.firebasedatabase.app';

export function getSavedFirebaseUrl() {
  const envUrl = import.meta.env.VITE_FIREBASE_DB_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    // ignore
  }
  return DEFAULT_FIREBASE_URL;
}

export function saveFirebaseUrl(url) {
  try {
    const clean = (url || '').trim().replace(/\/$/, '');
    localStorage.setItem(CONFIG_STORAGE_KEY, clean);
    return clean;
  } catch (e) {
    return '';
  }
}

// Clean the base URL to point to /pocket_data.json
function getEndpointUrl(baseUrl) {
  let clean = (baseUrl || '').trim().replace(/\/$/, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  if (!clean.includes('/pocket_data.json')) {
    clean = `${clean}/pocket_data.json`;
  }
  return clean;
}

// Fetch current cloud data once (stripping any legacy device-local UI states)
export async function fetchCloudData(baseUrl) {
  const endpoint = getEndpointUrl(baseUrl);
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Cloud fetch failed: ${response.status} ${response.statusText}`);
  }
  const result = await response.json();
  if (result && typeof result === 'object') {
    // Strip device-local properties so local screens are NEVER overwritten
    const { activeView, selectedMonth, yasmeenCurrencyView, ...clean } = result;
    return clean;
  }
  return result;
}

// Push local data to the cloud (strictly shared financial data)
export async function pushCloudData(baseUrl, data) {
  const endpoint = getEndpointUrl(baseUrl);
  // Sanitize: NEVER push activeView, selectedMonth, or yasmeenCurrencyView to cloud
  const {
    activeView,
    selectedMonth,
    yasmeenCurrencyView,
    ...cleanPayload
  } = data || {};

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(cleanPayload)
  });
  if (!response.ok) {
    throw new Error(`Cloud push failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// Push specific subpath (e.g. 'yasmeenTransactions', 'adziimaTransactions', 'users/adziima')
export async function pushCloudSubpath(baseUrl, subpath, data) {
  let endpoint = getEndpointUrl(baseUrl);
  endpoint = endpoint.replace('/pocket_data.json', `/pocket_data/${subpath}.json`);
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(`Cloud subpath push failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// Merge transactions safely by ID without losing local unpushed or remote new entries
export function mergeTransactions(local = [], remote = [], deletedIds = []) {
  const map = new Map();
  const deletedSet = new Set([...(deletedIds || []), 'tx-y1', 'tx-y2', 'tx-y3']);
  // Remote entries first
  (remote || []).forEach(tx => {
    if (tx && tx.id && !deletedSet.has(tx.id)) map.set(tx.id, tx);
  });
  // Local overlay: preserves local entries that haven't reached cloud yet
  (local || []).forEach(tx => {
    if (tx && tx.id && !deletedSet.has(tx.id)) {
      if (!map.has(tx.id)) {
        map.set(tx.id, tx);
      } else {
        map.set(tx.id, { ...map.get(tx.id), ...tx });
      }
    }
  });
  return Array.from(map.values()).sort((a, b) => {
    const dateCmp = (b.date || '').localeCompare(a.date || '');
    if (dateCmp !== 0) return dateCmp;
    return (b.id || '').localeCompare(a.id || '');
  });
}

// Merge monthly categories safely across devices
export function mergeMonthlyCategories(localUserCats = {}, remoteUserCats = {}) {
  const allMonths = new Set([
    ...Object.keys(remoteUserCats || {}),
    ...Object.keys(localUserCats || {})
  ]);
  const result = {};

  allMonths.forEach(m => {
    const localList = Array.isArray(localUserCats?.[m]) ? localUserCats[m] : null;
    const remoteList = Array.isArray(remoteUserCats?.[m]) ? remoteUserCats[m] : null;

    if (remoteList && remoteList.length > 0 && (!localList || localList.length === 0)) {
      result[m] = remoteList;
    } else if (localList && localList.length > 0 && (!remoteList || remoteList.length === 0)) {
      result[m] = localList;
    } else if (remoteList && localList) {
      const map = new Map();
      remoteList.forEach(c => { if (c && c.id) map.set(c.id, c); });
      localList.forEach(c => {
        if (c && c.id) {
          if (!map.has(c.id)) {
            map.set(c.id, c);
          } else {
            map.set(c.id, { ...map.get(c.id), ...c });
          }
        }
      });
      result[m] = Array.from(map.values());
    } else {
      result[m] = remoteList || localList || [];
    }
  });

  return result;
}

// Merge monthly budgets safely across devices
export function mergeMonthlyBudgets(localBudgets = {}, remoteBudgets = {}) {
  const allMonths = new Set([
    ...Object.keys(remoteBudgets || {}),
    ...Object.keys(localBudgets || {})
  ]);
  const result = {};
  allMonths.forEach(m => {
    result[m] = {
      ...(localBudgets?.[m] || {}),
      ...(remoteBudgets?.[m] || {})
    };
  });
  return result;
}

// Merge complete state safely preserving all unique transactions and settings
export function mergeFullState(local, remote) {
  if (!remote || typeof remote !== 'object') return local;
  if (!local || typeof local !== 'object') return remote;

  const deletedTransactionIds = Array.from(new Set([
    ...(local.deletedTransactionIds || []),
    ...(remote.deletedTransactionIds || [])
  ]));

  const yasmeenTransactions = mergeTransactions(local.yasmeenTransactions, remote.yasmeenTransactions, deletedTransactionIds);
  const adziimaTransactions = mergeTransactions(local.adziimaTransactions, remote.adziimaTransactions, deletedTransactionIds);

  const mergedUsers = {
    yasmeen: {
      ...(local.users?.yasmeen || {}),
      ...(remote.users?.yasmeen || {})
    },
    adziima: {
      ...(local.users?.adziima || {}),
      ...(remote.users?.adziima || {})
    }
  };

  const goldTx = mergeTransactions(
    local.goldSavings?.transactions || [],
    remote.goldSavings?.transactions || []
  );

  const goldSavings = {
    ...(local.goldSavings || {}),
    ...(remote.goldSavings || {}),
    transactions: goldTx
  };

  const monthlyBudgets = {
    yasmeen: mergeMonthlyBudgets(local.monthlyBudgets?.yasmeen, remote.monthlyBudgets?.yasmeen),
    adziima: mergeMonthlyBudgets(local.monthlyBudgets?.adziima, remote.monthlyBudgets?.adziima)
  };

  const monthlyCategories = {
    yasmeen: mergeMonthlyCategories(local.monthlyCategories?.yasmeen, remote.monthlyCategories?.yasmeen),
    adziima: mergeMonthlyCategories(local.monthlyCategories?.adziima, remote.monthlyCategories?.adziima)
  };

  const nongkrongChecklist = {
    ...(local.nongkrongChecklist || {}),
    ...(remote.nongkrongChecklist || {})
  };

  const securityPin = remote?.securityPin || local?.securityPin || (typeof window !== 'undefined' ? localStorage.getItem('pocket_duo_security_pin') : null) || '123456';
  const googleDriveUrl = remote?.googleDriveUrl || local?.googleDriveUrl || (typeof window !== 'undefined' ? localStorage.getItem('pocket_gdrive_url') : '') || 'https://drive.google.com/drive/my-drive';

  return {
    ...local,
    ...remote,
    yasmeenCategories: [],
    securityPin,
    googleDriveUrl,
    deletedTransactionIds,
    users: mergedUsers,
    yasmeenTransactions,
    adziimaTransactions,
    goldSavings,
    monthlyBudgets,
    monthlyCategories,
    nongkrongChecklist
  };
}

// Subscribe to real-time changes via EventSource (SSE)
export function subscribeToCloudChanges(baseUrl, onRemoteData, onError) {
  const endpoint = getEndpointUrl(baseUrl);
  try {
    const eventSource = new EventSource(endpoint);

    eventSource.addEventListener('put', (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.path === '/' && payload.data) {
          const { activeView, selectedMonth, yasmeenCurrencyView, ...cleanData } = payload.data;
          onRemoteData(cleanData);
        } else if (payload && payload.data && typeof payload.data === 'object') {
          // If a nested path was updated (e.g. /users or /yasmeenTransactions)
          // Ignore if it was just /activeView or /selectedMonth
          if (
            payload.path === '/activeView' ||
            payload.path === '/selectedMonth' ||
            payload.path === '/yasmeenCurrencyView'
          ) {
            return;
          }
          fetchCloudData(baseUrl).then(remote => {
            if (remote) {
              const { activeView, selectedMonth, yasmeenCurrencyView, ...cleanRemote } = remote;
              onRemoteData(cleanRemote);
            }
          }).catch(onError);
        }
      } catch (err) {
        if (onError) onError(err);
      }
    });

    eventSource.onerror = (err) => {
      if (onError) onError(err);
    };

    return () => {
      eventSource.close();
    };
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}

