import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_LAST = "@weather:lastSelection"; // storage key

// Save last city/unit info
export async function saveLastSelection(payload) {
  try {
    const toSave = { ...payload, timestamp: Date.now() };
    await AsyncStorage.setItem(KEY_LAST, JSON.stringify(toSave));
  } catch (err) {
    console.log("AsyncStorage save error:", err);
  }
}

// Load last saved selection
export async function loadLastSelection() {
  try {
    const raw = await AsyncStorage.getItem(KEY_LAST);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.log("AsyncStorage load error:", err);
    return null;
  }
}

// Clear stored data
export async function clearLastSelection() {
  try {
    await AsyncStorage.removeItem(KEY_LAST);
  } catch (err) {
    console.log("AsyncStorage clear error:", err);
  }
}
