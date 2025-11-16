import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default function UnitToggleButton({ unit, onToggle }) {
  return (
    <Pressable onPress={onToggle} style={styles.toggle}>
      <Text style={styles.toggleText}>
        Switch to {unit === "metric" ? "°F" : "°C"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
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
