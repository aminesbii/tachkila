import AsyncStorage from "@react-native-async-storage/async-storage";

import { createRoomRepository } from "@/storage/room-repository";
import type { KeyValueStore } from "@/storage/types";

export const asyncStorage: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
  getAllKeys: () => AsyncStorage.getAllKeys(),
  multiRemove: (keys) => AsyncStorage.multiRemove([...keys]),
};

export const roomRepository = createRoomRepository(asyncStorage);
