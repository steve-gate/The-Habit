/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A simple utility to store and retrieve large PDF files using IndexedDB.
 * This ensures that uploaded files persist across page refreshes.
 */

const DB_NAME = 'HabitMosaicDB';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_files';

/**
 * Initialize the database
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Store a PDF file (Blob or ArrayBuffer) in IndexedDB
 */
export const storePdfFile = async (bookId: string, data: Blob | ArrayBuffer): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, bookId);

    request.onsuccess = () => resolve();
    request.onerror = (event: any) => reject(event.target.error);
  });
};

/**
 * Retrieve a PDF file from IndexedDB
 */
export const getPdfFile = async (bookId: string): Promise<Blob | ArrayBuffer | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(bookId);

    request.onsuccess = (event: any) => resolve(event.target.result || null);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

/**
 * Delete a PDF file from IndexedDB
 */
export const deletePdfFile = async (bookId: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(bookId);

    request.onsuccess = () => resolve();
    request.onerror = (event: any) => reject(event.target.error);
  });
};

/**
 * Get all stored keys
 */
export const getAllStoredKeys = async (): Promise<string[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
};
