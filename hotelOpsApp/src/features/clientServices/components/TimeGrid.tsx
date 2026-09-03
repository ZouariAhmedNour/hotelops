// src/features/services/components/TimeGrid.tsx
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../../../theme/colors";

type Props = {
  options: string[];
  value: string | null;
  onChange: (time: string) => void;
  loading?: boolean;
  emptyMessage?: string;
};

/**
 * Grille d'horaires construite depuis les creneaux du backend.
 * Une liste vide signifie que le service est ferme ce jour-la.
 */
export default function TimeGrid({
  options,
  value,
  onChange,
  loading,
  emptyMessage = "Aucun horaire disponible ce jour-la.",
}: Props) {
  if (loading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (options.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.emptyLabel}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {options.map((time) => {
        const selected = time === value;
        return (
          <TouchableOpacity
            key={time}
            style={[styles.slot, selected && styles.slotSelected]}
            onPress={() => onChange(time)}
            activeOpacity={0.85}
          >
            <Text style={[styles.slotLabel, selected && styles.slotLabelSelected]}>
              {time}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#EEF1F7",
    minWidth: 74,
    alignItems: "center",
  },
  slotSelected: {
    backgroundColor: colors.primary,
  },
  slotLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  slotLabelSelected: {
    color: colors.white,
  },
  placeholder: {
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyLabel: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
});