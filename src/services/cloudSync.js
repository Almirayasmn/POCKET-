// Lightweight, Zero-Dependency Real-time Cloud Sync for Firebase Realtime Database
// Uses native REST API & EventSource (Server-Sent Events) for instant cross-device updates

const CONFIG_STORAGE_KEY = 'pocket_firebase_db_url_v1';

export function getSavedFirebaseUrl() {
  const envUrl = import.meta.env.VITE_FIREBASE_DB_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();
  try {
    return localStorage.getItem(CONFIG_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
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

// Fetch current cloud data once
export async function fetchCloudData(baseUrl) {
  const endpoint = getEndpointUrl(baseUrl);
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Cloud fetch failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// Push local data to the cloud
export async function pushCloudData(baseUrl, data) {
  const endpoint = getEndpointUrl(baseUrl);
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
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
          onRemoteData(payload.data);
        } else if (payload && payload.data && typeof payload.data === 'object') {
          // If a nested path was updated, refetch whole state
          fetchCloudData(baseUrl).then(onRemoteData).catch(onError);
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
