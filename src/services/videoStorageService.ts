// IndexedDB Storage for local video files / blobs to persist videos across page reloads

const DB_NAME = 'CaptionsAiVideoDB';
const DB_VERSION = 1;
const STORE_NAME = 'project_videos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'projectId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a video Blob or File to IndexedDB for a given project ID
 */
export async function saveVideoToIndexedDB(projectId: string, fileOrBlob: Blob | File): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        projectId,
        blob: fileOrBlob,
        name: (fileOrBlob as File).name || 'video.mp4',
        type: fileOrBlob.type || 'video/mp4',
        updatedAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save video to IndexedDB:', err);
  }
}

/**
 * Retrieve a video Blob from IndexedDB for a given project ID
 */
export async function getVideoFromIndexedDB(projectId: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(projectId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not retrieve video from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete a video from IndexedDB when a project is deleted
 */
export async function deleteVideoFromIndexedDB(projectId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(projectId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete video from IndexedDB:', err);
  }
}

/**
 * Restores a valid ObjectURL for a VideoMetadata object, pulling from IndexedDB if the existing URL is a stale blob:
 */
export async function restoreVideoUrl(projectId: string, currentUrl: string): Promise<string> {
  // If it's a remote https:// or relative public url, keep it
  if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://') || currentUrl.startsWith('/')) {
    if (!currentUrl.startsWith('blob:')) {
      return currentUrl;
    }
  }

  // Try retrieving the stored blob from IndexedDB
  const blob = await getVideoFromIndexedDB(projectId);
  if (blob) {
    return URL.createObjectURL(blob);
  }

  return currentUrl;
}
