let API_BASE = '/api/data';

const DB_NAME = 'prism_edge_db';
const DB_VERSION = 2;

function getIDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve(null);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      ['products', 'businesses', 'customers', 'orders', 'storefrontMedia', 'adminConfig'].forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => resolve(null);
  });
}

async function idbGetAll(storeName) {
  const db = await getIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve(null);
    } catch (_) {
      resolve(null);
    }
  });
}

async function idbSave(storeName, item) {
  const db = await getIDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).put(item);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

async function idbDelete(storeName, id) {
  const db = await getIDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

function initDatabase() {
  return getIDB();
}

async function seedDatabase() {
  try {
    const products = await getAllItems('products');
    if (!products || products.length === 0) {
      console.log('[Database] Seeding default products...');
      const defaultProducts = [
        {
          id: 'p1',
          name: 'Wireless Earbuds Pro X2',
          description: 'Bluetooth 5.3 earbuds with active noise cancellation and 30-hour battery life.',
          price: 34.90,
          stock: 20,
          sold: 5,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600'],
          visible: true,
          businessId: 'b1',
          createdAt: new Date().toISOString()
        },
        {
          id: 'p2',
          name: 'Vitamin C Brightening Serum',
          description: '10% vitamin C facial serum formulated for private-label skincare lines.',
          price: 6.40,
          stock: 100,
          sold: 45,
          category: 'Beauty & Cosmetics',
          images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600'],
          visible: true,
          businessId: 'b2',
          createdAt: new Date().toISOString()
        },
        {
          id: 'p3',
          name: 'Bulk Roasted Arabica Beans (25kg)',
          description: 'Medium-roast arabica coffee beans sourced for wholesale café supply.',
          price: 210.00,
          stock: 12,
          sold: 4,
          category: 'Food Services',
          images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600'],
          visible: true,
          businessId: 'b3',
          createdAt: new Date().toISOString()
        }
      ];
      for (const p of defaultProducts) {
        await saveItem('products', p);
      }
    }
  } catch (e) {
    console.error('[Database] Seeding products failed:', e);
  }

  try {
    const businesses = await getAllItems('businesses');
    if (!businesses || businesses.length === 0) {
      console.log('[Database] Seeding default businesses...');
      const defaultBusinesses = [
        {
          id: 'b1',
          name: 'Vance Electronics & Acoustics',
          description: 'Wholesale electronics and digital sound accessories.',
          contact: '+233 501 000 001',
          location: 'Airport City, Accra',
          categories: ['Electronics', 'Technical Tools'],
          coverImage: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=1200',
          logo: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=150',
          createdAt: new Date().toISOString()
        },
        {
          id: 'b2',
          name: 'L\'Avant-Garde Beauty Labs',
          description: 'Organic skincare treatments and cosmetics formulations.',
          contact: '+233 501 000 002',
          location: 'Cantonments, Accra',
          categories: ['Beauty & Cosmetics'],
          coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
          logo: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=150',
          createdAt: new Date().toISOString()
        },
        {
          id: 'b3',
          name: 'Clement & Sons Food Supply',
          description: 'Commercial kitchen equipment and bulk food supplies.',
          contact: '+233 501 000 003',
          location: 'Labone, Accra',
          categories: ['Food Services'],
          coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200',
          logo: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=150',
          createdAt: new Date().toISOString()
        }
      ];
      for (const b of defaultBusinesses) {
        await saveItem('businesses', b);
      }
    }
  } catch (e) {
    console.error('[Database] Seeding businesses failed:', e);
  }
}

async function getAllItems(storeName) {
  let serverData = null;
  // 1. Try server API to sync down new data
  try {
    const ts = Date.now();
    let res = await fetch(`${API_BASE}/${storeName}?_t=${ts}`).catch(() => null);
    if (!res || !res.ok) {
      API_BASE = 'http://localhost:8000/api/data';
      res = await fetch(`${API_BASE}/${storeName}?_t=${ts}`).catch(() => null);
    }
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        serverData = data;
        // Cache to IDB & localStorage
        for (const item of data) {
          if (item && item.id) await idbSave(storeName, item);
        }
        if (storeName !== 'products' && storeName !== 'storefrontMedia') {
          try { localStorage.setItem(storeName, JSON.stringify(data)); } catch(_) {}
        }
      }
    }
  } catch (_) {}

  if (serverData && serverData.length > 0) {
    return serverData;
  }

  // 2. Read from IndexedDB as Primary Truth (Unlimited Storage)
  const idbItems = await idbGetAll(storeName);
  if (idbItems && idbItems.length > 0) {
    return idbItems;
  }

  // 3. Fallback to localStorage (safe for small data)
  if (storeName !== 'products' && storeName !== 'storefrontMedia') {
    try {
      const stored = localStorage.getItem(storeName);
      return stored ? JSON.parse(stored) : [];
    } catch (_) {}
  }
  return [];
}

async function saveItem(storeName, item) {
  if (!item || !item.id) {
    item.id = `${storeName}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  // 1. Save to IndexedDB (Guaranteed success without 5MB quota limits)
  await idbSave(storeName, item);

  // 2. Save to localStorage (SKIP for large media stores to avoid QuotaExceededError)
  if (storeName !== 'products' && storeName !== 'storefrontMedia') {
    try {
      let items = [];
      const stored = localStorage.getItem(storeName);
      if (stored) items = JSON.parse(stored);
      const idx = items.findIndex(it => String(it.id) === String(item.id));
      if (idx !== -1) items[idx] = item; else items.push(item);
      localStorage.setItem(storeName, JSON.stringify(items));
    } catch (_) {}
  }

  // 3. Try POST to server API
  try {
    let res = await fetch(`${API_BASE}/${storeName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).catch(() => null);

    if (!res || !res.ok) {
      res = await fetch(`http://localhost:8000/api/data/${storeName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).catch(() => null);
    }
  } catch (_) {}

  return item;
}

async function deleteItem(storeName, id) {
  // 1. Delete from IndexedDB
  await idbDelete(storeName, id);

  // 2. Delete from localStorage
  if (storeName !== 'products' && storeName !== 'storefrontMedia') {
    try {
      const stored = localStorage.getItem(storeName);
      if (stored) {
        const items = JSON.parse(stored).filter(it => String(it.id) !== String(id));
        localStorage.setItem(storeName, JSON.stringify(items));
      }
    } catch (_) {}
  }

  // 3. Delete from Server API
  try {
    let res = await fetch(`${API_BASE}/${storeName}/${id}`, { method: 'DELETE' }).catch(() => null);
    if (!res || !res.ok) {
      await fetch(`http://localhost:8000/api/data/${storeName}/${id}`, { method: 'DELETE' }).catch(() => null);
    }
  } catch (_) {}

  return true;
}

window.initDatabase = initDatabase;
window.seedDatabase = seedDatabase;
window.getAllItems = getAllItems;
window.saveItem = saveItem;
window.deleteItem = deleteItem;
