import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { formatTemp } from "../utils/units";
import { getIconUrl } from "../helpers/weatherHelpers";

export default function ForecastStrip({ forecast, unit }) {
  if (!forecast || forecast.length === 0) return null;

  return (
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
        const iconUrl = getIconUrl(icon, "2x");
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
  );
}

const styles = StyleSheet.create({
  forecastRow: {
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
