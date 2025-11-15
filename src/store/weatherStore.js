import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_LAST = "@weather:lastSelection";

export async function saveLastSelection(payload) {
  try {
    const toSave = { ...payload, timestamp: Date.now() };
    await AsyncStorage.setItem(KEY_LAST, JSON.stringify(toSave));
  } catch (err) {
    console.log("AsyncStorage save error:", err);
  }
}

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

export async function clearLastSelection() {
  try {
    await AsyncStorage.removeItem(KEY_LAST);
  } catch (err) {
    console.log("AsyncStorage clear error:", err);
  }
}

const FAVORITEES_KEY = "@weather_favorites";

export async function loadFavorites() {
  try {
    const raw = await AsyncStorage.getItem(FAVORITEES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.log("loadFavorites error:", err);
    return [];
  }
}

export async function saveFavorites(favs) {
  try {
    await AsyncStorage.setItem(FAVORITEES_KEY, JSON.stringify(favs));
  } catch (err) {
    console.log("saveFavorites error:", err);
  }
}

export async function addFavorite(newFav) {
  try {
    const list = await loadFavorites();

    const exists = list.some(
      (item) => item.name === newFav.name && item.country === newFav.country
    );

    if (exists) return list;

    const updated = [...list, newFav];
    await saveFavorites(updated);
    return updated;
  } catch (err) {
    console.log("addFavorite error:", err);
    return [];
  }
}

export async function removeFavorite(name, country) {
  try {
    const list = await loadFavorites();

    const updated = list.filter(
      (item) => !(item.name === name && item.country === country)
    );

    await saveFavorites(updated);
    return updated;
  } catch (err) {
    console.log("removeFavorite error:", err);
    return [];
  }
}
