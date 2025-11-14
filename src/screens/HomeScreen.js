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
} from "react-native";
import { getCurrentCoords } from "../services/location";
import {
  getWeatherByCoords,
  getWeatherByCity,
  getForecastByCoords,
} from "../api/weather";
import { formatTemp } from "../utils/units";
import {
  saveLastSelection,
  loadLastSelection,
  clearLastSelection,
} from "../store/weatherStore";

export default function HomeScreen() {
  const [status, setStatus] = useState("idle");
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [unit, setUnit] = useState("metric");
  const [query, setQuery] = useState("");
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadWeather() {
      try {
        setStatus("loading");
        const { lat, lon } = await getCurrentCoords();

        const data = await getWeatherByCoords({ lat, lon, units: unit });
        const forecastData = await getForecastByCoords({
          lat,
          lon,
          units: unit,
        });

        if (!mounted) return;

        setWeather(data);
        setForecast(forecastData);
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
            const data = await getWeatherByCoords({
              lat: last.lat,
              lon: last.lon,
              units: last.units,
            });

            const forecastData = await getForecastByCoords({
              lat: last.lat,
              lon: last.lon,
              units: last.units,
            });

            if (!mounted) return;
            setWeather(data);
            setForecast(forecastData);
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

  const toggleUnit = async () => {
    const next = unit === "metric" ? "imperial" : "metric";
    setUnit(next);

    if (weather?.coord) {
      try {
        setStatus("loading");
        const { lat, lon } = weather.coord;
        const data = await getWeatherByCoords({ lat, lon, units: next });
        setWeather(data);
        setStatus("ready");
        await saveLastSelection({
          source: "gps", // using coords works for both city/GPS origins
          lat,
          lon,
          units: next,
        });
      } catch (err) {
        setErrorMsg(err?.message || "Failed to switch units");
        setStatus("error");
      }
    } else {
      // no weather loaded yet; just remember preference
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
      setWeather(data);
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
      <View style={styles.container}>
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

  const temp = weather.main.temp;
  const displayTemp = formatTemp(temp, unit);
  const city = weather.name;
  const country = weather.sys?.country || "";
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

  async function useMyLocation() {
    try {
      setStatus("loading");
      setErrorMsg("");
      const { lat, lon } = await getCurrentCoords();
      const data = await getWeatherByCoords({ lat, lon, units: unit });
      setWeather(data);
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

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.title}>
        {city}
        {country ? `, ${country}` : ""}
      </Text>
      {iconUrl ? <Image source={{ uri: iconUrl }} style={styles.icon} /> : null}
      <Text style={styles.temp}>
        {displayTemp}
        {unitLabel}
      </Text>
      <Text style={styles.text}>{cap(desc)}</Text>

      {forecast.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.forecastRow}
        >
          {forecast.slice(0, 8).map((item, index) => {
            const time = new Date(item.dt * 1000).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            });

            const icon = item.weather?.[0]?.icon;
            const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
            const temp = formatTemp(item.main.temp, unit);

            return (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastTime}>{time}</Text>
                <Image source={{ uri: iconUrl }} style={styles.forecastIcon} />
                <Text style={styles.forecastTemp}>{temp}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

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
        <Pressable onPress={useMyLocation} style={styles.locBtn}>
          <Text style={styles.locBtnText}>Use My Location </Text>
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
  locBtn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#16a34a", // green
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
  forecastRow: {
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  forecastItem: {
    width: 70,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginRight: 10,
  },
  forecastTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  forecastIcon: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
    textAlign: "center",
  },
});
