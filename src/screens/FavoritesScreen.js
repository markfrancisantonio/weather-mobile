import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  loadFavorites,
  removeFavorite,
  loadLastSelection,
  saveLastSelection,
} from "../store/weatherStore";
import { getWeatherByCoords } from "../api/weather";
import { formatTemp } from "../utils/units";
import { useNavigation } from "@react-navigation/native";

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    async function fetchFavs() {
      const list = await loadFavorites();

      const last = await loadLastSelection();
      const units = last?.units || "metric";

      const enriched = await Promise.all(
        list.map(async (city) => {
          try {
            const weather = await getWeatherByCoords({
              lat: city.lat,
              lon: city.lon,
              units,
            });

            const rawTemp = formatTemp(weather.main.temp, units);
            const unitLabel = units === "metric" ? "°C" : "°F";
            const temp = `${rawTemp}${unitLabel}`;

            return { ...city, temp };
          } catch (err) {
            console.log("Error loading weather for favorite:", err);
            return { ...city, temp: "N/A" };
          }
        })
      );
      setFavs(enriched);
    }
    fetchFavs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>

      {favs.length === 0 ? (
        <Text style={styles.text}>No favorites saved yet.</Text>
      ) : (
        favs.map((city, index) => (
          <View key={index} style={styles.cityRow}>
            <Pressable
              style={styles.cityInfo}
              onPress={async () => {
                const last = await loadLastSelection();
                const units = last?.units || "metric";

                await saveLastSelection({
                  source: "gps",
                  lat: city.lat,
                  lon: city.lon,
                  units,
                });

                navigation.reset({
                  index: 0,
                  routes: [{ name: "Home" }],
                });
              }}
            >
              <Text style={styles.cityText}>
                {city.name}, {city.country}
              </Text>
              <Text style={styles.cityTemp}>{city.temp}</Text>
            </Pressable>

            <Pressable
              style={styles.removeBtn}
              onPress={async () => {
                const updated = await removeFavorite(city.name, city.country);
                setFavs(updated);
              }}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f4f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#4b5563",
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  removeBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeText: {
    color: "white",
    fontWeight: "700",
  },
  cityInfo: {
    flexDirection: "column",
  },
  cityTemp: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginTop: 2,
  },
});
