
import { DATABASE_MOCK as INITIAL_MOCK } from './mockData';

const getMockData = () => {
  const stored = localStorage.getItem('DATABASE_MOCK');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.users && data.users[0] && data.users[0].photoURL === "https://lh3.googleusercontent.com/a/ACg8ocL-X") {
        data.users[0].photoURL = "https://ui-avatars.com/api/?name=Rodolfo+Stebner&background=random";
        localStorage.setItem('DATABASE_MOCK', JSON.stringify(data));
      }
      return data;
    } catch (e) {
      return INITIAL_MOCK;
    }
  }
  return INITIAL_MOCK;
};

const saveMockData = (data: any) => {
  try {
    localStorage.setItem('DATABASE_MOCK', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
  broadcastMockData(data);
};

// Cross-window synchronization for iframes/popups
const openedWindows = new Set<Window>();

const originalOpen = window.open;
window.open = function(...args) {
  const newWin = originalOpen.apply(this, args);
  if (newWin) {
    openedWindows.add(newWin);
  }
  return newWin;
};

const broadcastMockData = (data: any) => {
  const message = { type: 'SYNC_MOCK_DATA', data };
  
  // Send to opener if we are a popup
  if (window.opener && window.opener !== window) {
    try {
      window.opener.postMessage(message, '*');
    } catch (e) {}
  }
  
  // Send to all opened popups
  openedWindows.forEach(win => {
    if (!win.closed) {
      try {
        win.postMessage(message, '*');
      } catch (e) {}
    } else {
      openedWindows.delete(win);
    }
  });
};

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SYNC_MOCK_DATA') {
    try {
      currentMockData = e.data.data;
      // Don't call saveMockData here to avoid infinite loops
      try {
        localStorage.setItem('DATABASE_MOCK', JSON.stringify(currentMockData));
      } catch (err) {}
      
      Object.keys(listeners).forEach(collectionName => {
        notify(collectionName);
      });
    } catch (err) {
      console.error(err);
    }
  }
});

let currentMockData = getMockData();

window.addEventListener('storage', (e) => {
  if (e.key === 'DATABASE_MOCK' && e.newValue) {
    try {
      currentMockData = JSON.parse(e.newValue);
      Object.keys(listeners).forEach(collectionName => {
        notify(collectionName);
      });
    } catch (err) {
      console.error(err);
    }
  }
});

type Callback = (snapshot: any) => void;
interface Listener {
  ref: any;
  cb: Callback;
}
const listeners: Record<string, Set<Listener>> = {};

const applyConstraints = (data: any[], ref: any) => {
  let filteredData = [...data];
  if (ref.constraints) {
    ref.constraints.forEach((c: any) => {
      if (c.type === 'where') {
        filteredData = filteredData.filter(item => {
          const val = item[c.field];
          if (c.op === '==') return val === c.value;
          if (c.op === 'array-contains') return Array.isArray(val) && val.includes(c.value);
          return true;
        });
      } else if (c.type === 'orderBy') {
        filteredData.sort((a, b) => {
          const valA = a[c.field];
          const valB = b[c.field];
          if (valA < valB) return c.direction === 'asc' ? -1 : 1;
          if (valA > valB) return c.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    });
  }
  return filteredData;
};

const notify = (collectionName: string) => {
  if (listeners[collectionName]) {
    const data = currentMockData[collectionName as keyof typeof currentMockData] || [];
    listeners[collectionName].forEach(({ ref, cb }) => {
      const filteredData = applyConstraints(data, ref);

      cb({
        docs: filteredData.map(item => ({
          id: item.id,
          data: () => item,
          exists: () => true
        })),
        empty: filteredData.length === 0,
        size: filteredData.length,
        forEach: (callback: any) => filteredData.forEach(item => callback({ id: item.id, data: () => item })),
        docChanges: () => filteredData.map(item => ({
          type: 'added',
          doc: {
            id: item.id,
            data: () => item
          }
        }))
      });
    });
  }
};

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  tenantId: string | null;
  providerData: any[];
}

export const mockFirestore = {
  collection: (db: any, path: string) => ({ path, type: 'collection' }),
  doc: (db: any, path: string, id?: string) => ({ path: id ? `${path}/${id}` : path, type: 'doc', collection: path, id }),
  query: (ref: any, ...constraints: any[]) => ({ ...ref, constraints }),
  where: (field: string, op: string, value: any) => ({ type: 'where', field, op, value }),
  orderBy: (field: string, direction: string = 'asc') => ({ type: 'orderBy', field, direction }),
  
  onSnapshot: (ref: any, onNext: Callback, onError?: any) => {
    const collectionName = ref.path.split('/')[0];
    if (!listeners[collectionName]) listeners[collectionName] = new Set();
    const listener = { ref, cb: onNext };
    listeners[collectionName].add(listener);
    
    // Initial call
    const data = currentMockData[collectionName as keyof typeof currentMockData] || [];
    const filteredData = applyConstraints(data, ref);

    setTimeout(() => {
      onNext({
        docs: filteredData.map(item => ({
          id: item.id,
          data: () => item,
          exists: () => true
        })),
        empty: filteredData.length === 0,
        size: filteredData.length,
        forEach: (cb: any) => filteredData.forEach(item => cb({ id: item.id, data: () => item })),
        docChanges: () => filteredData.map(item => ({
          type: 'added',
          doc: {
            id: item.id,
            data: () => item
          }
        }))
      });
    }, 0);

    return () => { listeners[collectionName].delete(listener); };
  },

  addDoc: async (ref: any, data: any) => {
    const collectionName = ref.path;
    const id = Math.random().toString(36).substring(7);
    const newItem = { ...data, id };
    (currentMockData[collectionName as keyof typeof currentMockData] as any[]).push(newItem);
    saveMockData(currentMockData);
    notify(collectionName);
    return { id };
  },

  updateDoc: async (ref: any, data: any) => {
    const parts = ref.path.split('/');
    const collectionName = parts[0];
    const id = parts[1] || ref.id;
    const collection = currentMockData[collectionName as keyof typeof currentMockData] as any[];
    const index = collection.findIndex(item => item.id === id);
    if (index !== -1) {
      // Handle increment and array operations
      Object.keys(data).forEach(key => {
        const val = data[key];
        if (val && typeof val === 'object' && val.__type === 'increment') {
          collection[index][key] = (collection[index][key] || 0) + val.value;
        } else if (val && typeof val === 'object' && val.__type === 'arrayUnion') {
          collection[index][key] = Array.from(new Set([...(collection[index][key] || []), ...val.values]));
        } else if (val && typeof val === 'object' && val.__type === 'arrayRemove') {
          collection[index][key] = (collection[index][key] || []).filter((v: any) => !val.values.includes(v));
        } else {
          collection[index][key] = val;
        }
      });
      saveMockData(currentMockData);
      notify(collectionName);
    }
  },

  increment: (n: number) => ({ __type: 'increment', value: n }),
  arrayUnion: (...values: any[]) => ({ __type: 'arrayUnion', values }),
  arrayRemove: (...values: any[]) => ({ __type: 'arrayRemove', values }),
  Timestamp: {
    now: () => new Date().toISOString(),
    fromDate: (d: Date) => d.toISOString()
  },
  getDocFromServer: async (ref: any) => ({ exists: () => true, data: () => ({}) }),
  
  deleteDoc: async (ref: any) => {
    const parts = ref.path.split('/');
    const collectionName = parts[0];
    const id = parts[1] || ref.id;
    const collection = currentMockData[collectionName as keyof typeof currentMockData] as any[];
    const index = collection.findIndex(item => item.id === id);
    if (index !== -1) {
      collection.splice(index, 1);
      saveMockData(currentMockData);
      notify(collectionName);
    }
  },

  getDocs: async (ref: any) => {
    const collectionName = ref.path;
    const data = currentMockData[collectionName as keyof typeof currentMockData] || [];
    const filteredData = applyConstraints(data, ref);
    return {
      docs: filteredData.map((item: any) => ({
        id: item.id,
        data: () => item,
        exists: () => true
      })),
      empty: filteredData.length === 0,
      size: filteredData.length,
      forEach: (cb: any) => filteredData.forEach((item: any) => cb({ id: item.id, data: () => item }))
    };
  }
};

const authListeners = new Set<(user: any) => void>();

export const mockAuth = {
  currentUser: currentMockData.users[0] as any,
  onAuthStateChanged: (auth: any, cb: (user: any) => void) => {
    authListeners.add(cb);
    cb(mockAuth.currentUser);
    return () => { authListeners.delete(cb); };
  },
  signInWithPopup: async () => {
    mockAuth.currentUser = currentMockData.users[0];
    authListeners.forEach(cb => cb(mockAuth.currentUser));
    return { user: mockAuth.currentUser };
  },
  signOut: async () => {
    mockAuth.currentUser = null;
    authListeners.forEach(cb => cb(null));
  }
};

export const mockStorage = {
  ref: (storage: any, path: string) => ({ path }),
  uploadBytes: async (ref: any, blob: any) => ({ ref }),
  getDownloadURL: async (ref: any) => `https://picsum.photos/seed/${Math.random()}/800/600`
};
