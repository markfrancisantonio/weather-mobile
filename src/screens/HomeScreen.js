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
} from "react-native";
import { getCurrentCoords } from "../services/location";
import { getWeatherByCoords, getWeatherByCity } from "../api/weather";
import { formatTemp } from "../utils/units";

export default function HomeScreen() {
  const [status, setStatus] = useState("idle");
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [unit, setUnit] = useState("metric");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadWeather() {
      try {
        setStatus("loading");
        const { lat, lon } = await getCurrentCoords();
        const data = await getWeatherByCoords({ lat, lon, units: "metric" });
        if (!mounted) return;
        setWeather(data);
        setStatus("ready");
      } catch (err) {
        if (!mounted) return;
        setErrorMsg(err?.message || "Something went wrong.");
        setStatus("error");
      }
    }
    loadWeather();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleUnit = () =>
    setUnit((u) => (u === "metric" ? "imperial" : "metric"));

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
      setWeather(data);
      setStatus("ready");
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
      <View style={styles.container}>
        <Text style={[styles.text, { color: "red" }]}>⚠️ {errorMsg}</Text>
      </View>
    );
  }

  if (status === "idle") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Ready to load weather…</Text>
      </View>
    );
  }

  const tempC = weather.main.temp;
  const displayTemp = formatTemp(tempC, unit);
  const city = weather.name;
  const desc = weather.weather?.[0]?.description ?? "";
  const unitLabel = unit === "metric" ? "°C" : "°F";
  const icon = weather.weather?.[0]?.icon;
  const iconUrl = icon
    ? `https://openweathermap.org/img/wn/${icon}@4x.png`
    : null;
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
  const descLc = (desc || "").toLowerCase();
  const bgColor = descLc.includes("cloud")
    ? "#dfe6ed"
    : descLc.includes("rain")
    ? "#a5c8ff"
    : descLc.includes("clear")
    ? "#fef5b8"
    : "#f0f4f8";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.title}>{city}</Text>
      {iconUrl ? <Image source={{ uri: iconUrl }} style={styles.icon} /> : null}
      <Text style={styles.temp}>
        {displayTemp}
        {unitLabel}
      </Text>
      <Text style={styles.text}>{cap(desc)}</Text>

      <Pressable onPress={toggleUnit} style={styles.toggle}>
        <Text style={styles.toggleText}>
          Switch to {unit === "metric" ? "°F" : "°C"}
        </Text>
      </Pressable>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    padding: 16,
  },
  text: { fontSize: 18, fontWeight: "600", color: "#333" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  temp: { fontSize: 64, fontWeight: "800", color: "#333" },
  toggle: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#e3e8ef",
  },
  toggleText: { fontSize: 16, fontWeight: "700", color: "#111" },
  icon: { width: 120, height: 120, marginVertical: 4, tintColor: "#333" },
  searchRow: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
    marginTop: 16,
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
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#0ea5e9",
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
