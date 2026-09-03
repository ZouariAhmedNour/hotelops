// src/features/services/components/QuantityStepper.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  /** 50 par defaut : c'est le plafond impose par le backend. */
  max?: number;
  compact?: boolean;
};

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 50,
  compact,
}: Props) {
  const canDecrease = value > min;
  const canIncrease = value < max;

  const size = compact ? 30 : 36;
  const buttonStyle = [styles.button, { width: size, height: size, borderRadius: size / 2 }];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[buttonStyle, !canDecrease && styles.buttonDisabled]}
        onPress={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        activeOpacity={0.8}
        accessibilityLabel="Diminuer la quantite"
      >
        <Ionicons
          name="remove"
          size={compact ? 15 : 18}
          color={canDecrease ? colors.text : colors.muted}
        />
      </TouchableOpacity>

      <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>

      <TouchableOpacity
        style={[buttonStyle, styles.buttonPrimary, !canIncrease && styles.buttonDisabled]}
        onPress={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        activeOpacity={0.8}
        accessibilityLabel="Augmenter la quantite"
      >
        <Ionicons
          name="add"
          size={compact ? 15 : 18}
          color={canIncrease ? colors.white : colors.muted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F7",
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: "#F1F3F8",
  },
  value: {
    minWidth: 34,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  valueCompact: {
    minWidth: 28,
    fontSize: 14,
  },
});