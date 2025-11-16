import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable } from "react-native";
import { clearFavorites } from "../store/weatherStore";
import { clearLastSelection } from "../store/weatherStore";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.sectionTitle}>Manage Data</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Clear Favorites</Text>

        <Pressable
          style={styles.rowBtn}
          onPress={async () => {
            await clearFavorites();
            alert("All favorites cleared.");
          }}
        >
          <Text style={styles.rowBtnText}>Yes</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Clear Last Selection</Text>

        <Pressable
          style={styles.rowBtn}
          onPress={async () => {
            await clearLastSelection();
            alert("Last selection cleared.");
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          }}
        >
          <Text style={styles.rowBtnText}>Yes</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
    backgroundColor: "#f0f4f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  rowLabel: {
    fontSize: 16,
    color: "#374151",
  },

  rowBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  rowBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
