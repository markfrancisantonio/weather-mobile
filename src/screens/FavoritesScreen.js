import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import {
  loadFavorites,
  removeFavorite,
  saveLastSelection,
} from "../store/weatherStore";
import { getWeatherByCoords } from "../api/weather";
import { formatTemp } from "../utils/units";
import { useNavigation } from "@react-navigation/native";
import UnitToggleButton from "../components/UnitToggleButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [favs, setFavs] = useState([]);
  const [unit, setUnit] = useState("metric");

  useEffect(() => {
    async function fetchFavs() {
      const list = await loadFavorites();

      const enriched = await Promise.all(
        list.map(async (city) => {
          try {
            const weather = await getWeatherByCoords({
              lat: city.lat,
              lon: city.lon,
              units: unit,
            });

            const rawTemp = formatTemp(weather.main.temp, unit);
            const unitLabel = unit === "metric" ? "°C" : "°F";
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
    const unsubscribe = navigation.addListener("focus", fetchFavs);
    return unsubscribe;
  }, [unit, navigation]);

  function toggleUnit() {
    const next = unit === "metric" ? "imperial" : "metric";
    setUnit(next);
  }

  return (
    <SafeAreaView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Favorites</Text>
        <UnitToggleButton unit={unit} onToggle={toggleUnit} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {favs.length === 0 ? (
          <Text style={styles.text}>No favorites saved yet.</Text>
        ) : (
          favs.map((city) => (
            <View
              key={`${city.name}-${city.country}-${city.lat}-${city.lon}`}
              style={styles.cityRow}
            >
              <Pressable
                style={styles.cityInfo}
                onPress={async () => {
                  await saveLastSelection({
                    source: "gps",
                    lat: city.lat,
                    lon: city.lon,
                    units: unit,
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: 16,
    paddingTop: 24,
    backgroundColor: "#d8e0e7",
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
    flexShrink: 1,
  },
  cityTemp: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginTop: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
    paddingHorizontal: 16,
  },
});
