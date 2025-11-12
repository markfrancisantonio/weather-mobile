import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { getCurrentCoords } from "../services/location";
import { getWeatherByCoords } from "../api/weather";

export default function HomeScreen() {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
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
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // loading state
  if (status === "loading") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Fetching your weather…</Text>
      </View>
    );
  }

  // error state
  if (status === "error") {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: "red" }]}>⚠️ {errorMsg}</Text>
      </View>
    );
  }

  // idle state
  if (status === "idle") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Ready to load weather…</Text>
      </View>
    );
  }

  // success state
  const temp = Math.round(weather.main.temp);
  const city = weather.name;
  const desc = weather.weather?.[0]?.description ?? "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{city}</Text>
      <Text style={styles.temp}>{temp}°C</Text>
      <Text style={styles.text}>{desc}</Text>
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
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  temp: {
    fontSize: 64,
    fontWeight: "800",
    color: "#333",
  },
});
