
import { QuizSession } from '../types';

const DB_NAME = 'QuizMasterDB';
const STORE_NAME = 'sessions';
const DB_VERSION = 1;
const OLD_LOCAL_STORAGE_KEY = 'quiz_master_history_v2';

// Open Database Connection
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// Migrate data from LocalStorage to IndexedDB
export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    const rawData = localStorage.getItem(OLD_LOCAL_STORAGE_KEY);
    if (rawData) {
      const history = JSON.parse(rawData) as QuizSession[];
      if (Array.isArray(history) && history.length > 0) {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        for (const session of history) {
          store.put(session);
        }
        
        // Wait for transaction to complete
        await new Promise<void>((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });

        // Clear old storage to avoid confusion, or keep it as backup? 
        // Let's clear it to ensure we rely on DB from now on.
        localStorage.removeItem(OLD_LOCAL_STORAGE_KEY);
        console.log("Migration successful");
      }
    }
  } catch (e) {
    console.error("Migration failed", e);
  }
};

// CRUD Operations
export const saveSessionToDB = async (session: QuizSession): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(session);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllSessionsFromDB = async (): Promise<QuizSession[]> => {
  await migrateFromLocalStorage(); // Attempt migration on load
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
        const results = request.result as QuizSession[];
        // Sort by timestamp desc
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteSessionFromDB = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Backup & Restore
export const exportBackup = async (): Promise<void> => {
  const sessions = await getAllSessionsFromDB();
  const dataStr = JSON.stringify(sessions, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `quiz_master_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importBackup = async (file: File): Promise<QuizSession[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const sessions = JSON.parse(content) as QuizSession[];
        
        if (!Array.isArray(sessions)) throw new Error("Invalid backup file format");

        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        for (const session of sessions) {
          // Validate basic structure before inserting
          if (session.id && session.quizData) {
            store.put(session);
          }
        }
        
        transaction.oncomplete = async () => {
          const updated = await getAllSessionsFromDB();
          resolve(updated);
        };
        transaction.onerror = () => reject(transaction.error);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};
