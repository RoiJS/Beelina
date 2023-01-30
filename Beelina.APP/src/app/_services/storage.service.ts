import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor() {}

  storeString(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  hasKey(key: string): boolean {
    return Boolean(localStorage.getItem(key));
  }

  getString(key: string) : string | null {
    return localStorage.getItem(key);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
