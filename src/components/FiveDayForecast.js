import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { getIconUrl } from "../helpers/weatherHelpers";

export default function FiveDayForecast({ data, unit }) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {data.slice(0, 5).map((day, index) => (
        <View key={index} style={styles.dayRow}>
          <Text style={styles.dayText}>{day.date}</Text>

          <View style={styles.iconTempWrapper}>
            {day.icon && (
              <Image
                source={{ uri: getIconUrl(day.icon, "4x") }}
                style={styles.icon}
              />
            )}
            <Text style={styles.tempText}>{day.temp}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dayText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    width: 60,
    textAlign: "left",
  },

  tempText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  iconTempWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    flex: 1,
  },

  icon: {
    width: 36,
    height: 36,
  },
});
