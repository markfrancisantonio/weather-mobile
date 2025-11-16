import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { formatTemp } from "../utils/units";
import { capitalize, getIconUrl } from "../helpers/weatherHelpers";

export default function WeatherHeader({ weather, unit, onToggleUnit }) {
  if (!weather) return null;

  const temp = weather.main?.temp;
  const city = weather.name;
  const country = weather.sys?.country || "";
  const desc = weather.weather?.[0]?.description ?? "";
  const icon = weather.weather?.[0]?.icon;
  const iconUrl = getIconUrl(icon, "4x");
  const displayTemp = formatTemp(temp, unit);
  const unitLabel = unit === "metric" ? "°C" : "°F";

  return (
    <View style={styles.header}>
      <Text style={styles.title}>
        {city}
        {country ? ` ${country}` : ""}
      </Text>
      {iconUrl ? <Image source={{ uri: iconUrl }} style={styles.icon} /> : null}
      <Text style={styles.temp}>
        {displayTemp}
        {unitLabel}
      </Text>
      <Text style={styles.description}>{capitalize(desc)}</Text>
      <Pressable onPress={onToggleUnit} style={styles.toggle}>
        <Text style={styles.toggleText}>
          Switch to {unit === "metric" ? "°F" : "°C"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  temp: {
    fontSize: 64,
    fontWeight: "800",
    color: "#111827",
    marginVertical: 4,
  },
  description: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  icon: {
    width: 120,
    height: 120,
    marginVertical: 4,
    tintColor: "#333",
  },
  toggle: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#d1d5db",
    borderWidth: 1,
    borderColor: "#9ca3af",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
});
