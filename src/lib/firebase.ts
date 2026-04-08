
import { mockFirestore, mockAuth, mockStorage, User } from '../services/mockFirestore';
export type { User };

// Mock configuration to avoid errors if the file is missing or invalid
const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-auth-domain",
  projectId: "mock-project-id",
  storageBucket: "mock-storage-bucket",
  messagingSenderId: "mock-sender-id",
  appId: "mock-app-id",
  measurementId: "mock-measurement-id",
  firestoreDatabaseId: "(default)"
};

export const db = mockFirestore;
export const auth = mockAuth;
export const storage = mockStorage;

// Re-exporting mock firestore functions
export const collection = mockFirestore.collection;
export const query = mockFirestore.query;
export const where = mockFirestore.where;
export const onSnapshot = mockFirestore.onSnapshot;
export const addDoc = mockFirestore.addDoc;
export const updateDoc = mockFirestore.updateDoc;
export const doc = mockFirestore.doc;
export const increment = mockFirestore.increment;
export const arrayUnion = mockFirestore.arrayUnion;
export const arrayRemove = mockFirestore.arrayRemove;
export const orderBy = mockFirestore.orderBy;
export const Timestamp = mockFirestore.Timestamp;
export const getDocFromServer = mockFirestore.getDocFromServer;
export const deleteDoc = mockFirestore.deleteDoc;
export const getDocs = mockFirestore.getDocs;
export const limit = (n: number) => ({ type: 'limit', value: n });

// Re-exporting mock auth functions
export const onAuthStateChanged = mockAuth.onAuthStateChanged;
export const signInWithPopup = mockAuth.signInWithPopup;
export const signOut = mockAuth.signOut;

// Re-exporting mock storage functions
export const ref = mockStorage.ref;
export const uploadBytes = mockStorage.uploadBytes;
export const getDownloadURL = mockStorage.getDownloadURL;

import { DATABASE_MOCK } from '../services/mockData';

console.log('Mock Firebase initialized with Project ID:', firebaseConfig.projectId);

export const googleProvider = { id: 'google.com' };

// Test connection
async function testConnection() {
  try {
    await mockFirestore.getDocFromServer(mockFirestore.doc(db, 'test', 'connection'));
    console.log('Mock connection test successful');
  } catch (error) {
    console.error("Mock connection test failed", error);
  }
}
testConnection();

export const loginWithGoogle = async () => {
  try {
    console.log('Iniciando login MOCK com Google...');
    const result = await mockAuth.signInWithPopup();
    console.log('Login MOCK bem-sucedido:', result.user.displayName);
    return result;
  } catch (error: any) {
    console.error('Erro no login MOCK:', error);
    throw error;
  }
};

export const logout = () => mockAuth.signOut();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Mock Firestore Error [${operationType}] at ${path}:`, error);
  throw error;
}
