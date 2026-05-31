import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

import { colors } from "../../theme/colors";

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export default function RoleChip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#EEF1F7",
  },

  chipActive: {
    backgroundColor: colors.primary,
  },

  text: {
    color: colors.muted,
    fontWeight: "700",
  },

  textActive: {
    color: colors.white,
  },
});