import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  TextInput,
  Keyboard,
  ScrollView,
  Alert,
} from "react-native";
import { getCurrentCoords } from "../services/location";
import {
  getWeatherByCoords,
  getWeatherByCity,
  getForecastByCoords,
} from "../api/weather";
import {
  saveLastSelection,
  loadLastSelection,
  addFavorite,
  loadFavorites,
} from "../store/weatherStore";
import { getBackgroundColor } from "../helpers/weatherHelpers";
import ForecastStrip from "../components/ForecastStrip";
import WeatherHeader from "../components/WeatherHeader";
import UnitToggleButton from "../components/UnitToggleButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({ navigation }) {
  const [status, setStatus] = useState("idle");
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [unit, setUnit] = useState("metric");
  const [query, setQuery] = useState("");
  const [forecast, setForecast] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  async function fetchAndSetWeatherByCoords(lat, lon, units) {
    const data = await getWeatherByCoords({ lat, lon, units });
    const forecastData = await getForecastByCoords({ lat, lon, units });

    setWeather(data);
    setForecast(forecastData);
  }

  useEffect(() => {
    let mounted = true;

    async function loadWeather() {
      try {
        setStatus("loading");
        const { lat, lon } = await getCurrentCoords();

        await fetchAndSetWeatherByCoords(lat, lon, unit);
        if (!mounted) return;
        setStatus("ready");
      } catch (err) {
        if (!mounted) return;
        setErrorMsg(err?.message || "Something went wrong.");
        setStatus("error");
      }
    }

    async function init() {
      const last = await loadLastSelection();
      if (last && mounted) {
        try {
          setStatus("loading");
          setUnit(last.units || "metric");

          if (last.source === "city" && last.q) {
            const data = await getWeatherByCity({
              q: last.q,
              units: last.units,
            });

            const forecastData = await getForecastByCoords({
              lat: data.coord.lat,
              lon: data.coord.lon,
              units: last.units,
            });

            if (!mounted) return;

            setWeather(data);
            setForecast(forecastData);
          } else if (last.source === "gps" && last.lat && last.lon) {
            await fetchAndSetWeatherByCoords(last.lat, last.lon, last.units);
            if (!mounted) return;
          } else {
            await loadWeather();
          }

          if (mounted) setStatus("ready");
        } catch (err) {
          console.log("Load last selection error:", err);
          if (mounted) setStatus("idle");
        }
      } else {
        await loadWeather();
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    async function checkFavorite() {
      if (!weather) {
        setIsFavorite(false);
        return;
      }

      try {
        const favs = await loadFavorites();
        const match = favs.find(
          (c) =>
            c.name === weather.name &&
            c.country === (weather.sys?.country || "")
        );
        setIsFavorite(!!match);
      } catch (err) {
        console.log("checkFavorite error:", err);
      }
    }

    checkFavorite();
    const unsubscribe = navigation.addListener("focus", checkFavorite);
    return unsubscribe;
  }, [weather, navigation]);

  const toggleUnit = async () => {
    const next = unit === "metric" ? "imperial" : "metric";
    setUnit(next);

    if (weather?.coord) {
      try {
        const { lat, lon } = weather.coord;

        await fetchAndSetWeatherByCoords(lat, lon, next);

        await saveLastSelection({
          source: "gps",
          lat,
          lon,
          units: next,
        });
      } catch (err) {
        setErrorMsg(err?.message || "Failed to switch units");
        setStatus("error");
      }
    } else {
      await saveLastSelection({ source: "city", q: "", units: next });
    }
  };

  async function searchByCity() {
    try {
      const q = query.trim();
      if (!q) {
        setErrorMsg("Please enter a city name");
        setStatus("error");
        return;
      }
      setStatus("loading");
      setErrorMsg("");

      const data = await getWeatherByCity({ q, units: unit });
      const { lat, lon } = data.coord;
      const forecastData = await getForecastByCoords({
        lat,
        lon,
        units: unit,
      });

      setWeather(data);
      setForecast(forecastData);
      setStatus("ready");

      await saveLastSelection({
        source: "city",
        q,
        units: unit,
      });
      setQuery("");
      Keyboard.dismiss?.();
    } catch (err) {
      setErrorMsg(err?.message || "City search failed");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Fetching your weather…</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={[styles.text, { color: "red" }]}>⚠️ {errorMsg}</Text>
        <Pressable
          onPress={() => {
            setErrorMsg("");
            useMyLocation();
          }}
          style={styles.retryBtn}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (status === "idle") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Ready to load weather…</Text>
      </View>
    );
  }

  const desc = weather.weather?.[0]?.description ?? "";
  const bgColor = getBackgroundColor(desc);

  async function useMyLocation() {
    try {
      setStatus("loading");
      setErrorMsg("");
      const { lat, lon } = await getCurrentCoords();
      await fetchAndSetWeatherByCoords(lat, lon, unit);
      setStatus("ready");
      await saveLastSelection({
        source: "gps",
        lat,
        lon,
        units: unit,
      });
      setQuery("");
      Keyboard.dismiss?.();
    } catch (err) {
      setErrorMsg(err?.message || "Could not get current location weather");
      setStatus("error");
    }
  }

  async function handleAddFavorite() {
    if (!weather) return;

    const city = weather.name;
    const country = weather.sys?.country || "";
    const lat = weather.coord?.lat;
    const lon = weather.coord?.lon;

    if (!city || !lat || !lon) {
      setErrorMsg("Missing data to save this city as favorite.");
      setStatus("error");
      return;
    }

    const fav = { name: city, country, lat, lon };

    try {
      await addFavorite(fav);
      setIsFavorite(true);
      Alert.alert(
        "Added to Favorites",
        `${city}${country ? `, ${country}` : ""} has been saved.`
      );
    } catch (err) {
      console.log("handleAddFavorite error:", err);
      Alert.alert(
        "Favorite not saved",
        err?.message ||
          "Could not save this city as a favorite. Please try again."
      );
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="Search city (e.g., Tokyo)"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={searchByCity}
            />
            <Pressable onPress={searchByCity} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Search</Text>
            </Pressable>
          </View>
          <UnitToggleButton unit={unit} onToggle={toggleUnit} />
        </View>
        <View style={styles.useMyLocation}>
          <Pressable onPress={useMyLocation} style={styles.locBtn}>
            <Text style={styles.locBtnText}>Use My Location </Text>
          </Pressable>
        </View>
        <WeatherHeader weather={weather} unit={unit} />
        <Pressable
          onPress={handleAddFavorite}
          style={styles.addToFavoritesButton}
        >
          <Text style={styles.addToFavoritesButtonText}>
            {isFavorite ? "⭐" : "☆"}
          </Text>
        </Pressable>
        <ForecastStrip forecast={forecast} unit={unit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: "#f0f4f8",
    padding: 16,
    paddingTop: 24,
  },
  text: { fontSize: 18, fontWeight: "600", color: "#333" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchBtn: {
    height: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#0ea5e9",
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  locBtn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#16a34a",
  },
  locBtnText: {
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#0ea5e9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  addToFavoritesButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    alignSelf: "center",
  },

  addToFavoritesButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  useMyLocation: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f4f8",
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
