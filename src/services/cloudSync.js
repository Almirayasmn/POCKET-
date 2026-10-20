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
