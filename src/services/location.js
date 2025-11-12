import * as Location from "expo-location";

export async function getCurrentCoords() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission not granted");
  }
  const { coords } = await Location.getCurrentPositionAsync({});
  return { lat: coords.latitude, lon: coords.longitude };
}
