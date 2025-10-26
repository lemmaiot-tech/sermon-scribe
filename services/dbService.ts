import { BibleData } from './bibleService';

const DB_NAME = 'sermon-scribe-bibles';
const DB_VERSION = 1;
const STORE_NAME = 'versions';

let db: IDBDatabase;

function initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                dbInstance.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
            reject('Error opening IndexedDB.');
        };
    });
}

export async function saveBibleVersion(data: BibleData): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data);

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
            console.error('Error saving version:', (event.target as IDBRequest).error);
            reject('Failed to save Bible version.');
        };
    });
}

export async function getBibleVersion(key: string): Promise<BibleData | null> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
            resolve(request.result || null);
        };
        request.onerror = (event) => {
            console.error('Error getting version:', (event.target as IDBRequest).error);
            reject('Failed to retrieve Bible version.');
        };
    });
}

export async function deleteBibleVersion(key: string): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
            console.error('Error deleting version:', (event.target as IDBRequest).error);
            reject('Failed to delete Bible version.');
        };
    });
}

export async function getDownloadedVersions(): Promise<{ key: string, size: number }[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const versions = request.result.map((versionData: BibleData) => {
                // Calculate size by stringifying the data
                const size = new Blob([JSON.stringify(versionData)]).size;
                return { key: versionData.key, size };
            });
            resolve(versions);
        };

        request.onerror = (event) => {
            console.error('Error getting all versions:', (event.target as IDBRequest).error);
            reject('Failed to list downloaded versions.');
        };
    });
}