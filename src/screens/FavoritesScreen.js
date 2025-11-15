import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { loadFavorites, removeFavorite } from "../store/weatherStore";

export default function FavoritesScreen() {
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    async function fetchFavs() {
      const list = await loadFavorites();
      setFavs(list);
    }
    fetchFavs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>

      {favs.length === 0 ? (
        <Text style={styles.text}>No favorites saved yet.</Text>
      ) : (
        favs.map((city, index) => (
          <View key={index} style={styles.cityRow}>
            <Text style={styles.cityText}>
              {city.name}, {city.country}
            </Text>

            <Pressable
              style={styles.removeBtn}
              onPress={async () => {
                const updated = await removeFavorite(city.name, city.country);
                setFavs(updated);
              }}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f4f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#4b5563",
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  removeBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeText: {
    color: "white",
    fontWeight: "700",
  },
});
