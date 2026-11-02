/** The tiny persistence surface the room repository needs. AsyncStorage matches it. */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys?(): Promise<readonly string[]>;
  multiRemove?(keys: readonly string[]): Promise<void>;
}
