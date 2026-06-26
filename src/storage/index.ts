export type { StorageAdapter } from './StorageAdapter';
export { LocalStorageAdapter } from './LocalStorageAdapter';
export { NeonStorageAdapter } from './NeonStorageAdapter';

import { LocalStorageAdapter } from './LocalStorageAdapter';
import type { StorageAdapter } from './StorageAdapter';

let storageInstance: StorageAdapter = new LocalStorageAdapter();

export function getStorage(): StorageAdapter {
  return storageInstance;
}

export function setStorage(adapter: StorageAdapter): void {
  storageInstance = adapter;
}
