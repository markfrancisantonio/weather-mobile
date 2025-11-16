import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default function UnitToggleButton({ unit, onToggle }) {
  return (
    <Pressable onPress={onToggle} style={styles.container}>
      <Text style={[styles.option, unit === "metric" && styles.active]}>
        °C
      </Text>
      <Text style={styles.separator}>|</Text>
      <Text style={[styles.option, unit === "imperial" && styles.active]}>
        °F
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  option: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  active: {
    color: "#111827",
    fontWeight: "800",
  },
  separator: {
    marginHorizontal: 6,
    color: "#6b7280",
    fontWeight: "600",
  },
});
