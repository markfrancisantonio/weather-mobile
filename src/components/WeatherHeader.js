import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { formatTemp } from "../utils/units";
import { capitalize, getIconUrl } from "../helpers/weatherHelpers";

export default function WeatherHeader({
  weather,
  unit,
  isFavorite,
  onToggleFavorite,
}) {
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
      <View style={styles.titleRow}>
        <Text style={styles.title}>
          {city}
          {country ? `, ${country}` : ""}
        </Text>

        {onToggleFavorite ? (
          <Pressable onPress={onToggleFavorite} style={styles.favoriteIcon}>
            <Text style={styles.favoriteIconText}>
              {isFavorite ? "⭐" : "☆"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {iconUrl ? <Image source={{ uri: iconUrl }} style={styles.icon} /> : null}
      <Text style={styles.temp}>
        {displayTemp}
        {unitLabel}
      </Text>
      <Text style={styles.description}>{capitalize(desc)}</Text>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
  },

  favoriteIcon: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  favoriteIconText: {
    fontSize: 28,
    lineHeight: 28,
    marginBottom: 4,
  },
});
