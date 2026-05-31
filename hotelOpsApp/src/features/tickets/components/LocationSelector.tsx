import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

import type { LocationItem } from "../types";
type Props = {
  locations: LocationItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export default function LocationSelector({
  locations,
  selectedId,
  onSelect,
}: Props) {
  return (
    <View style={styles.grid}>
      {locations.map((item) => {
        const active = item.id === selectedId;

        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[styles.card, active && styles.cardActive]}
          >
            <View style={styles.row}>
              <Feather
                name="map-pin"
                size={19}
                color={active ? colors.primary : colors.mutedLight}
              />

              <Text style={styles.text} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 62,
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
  },
});