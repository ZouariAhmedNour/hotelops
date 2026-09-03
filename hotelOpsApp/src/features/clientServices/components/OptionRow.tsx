// src/features/services/components/OptionRow.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import type { Money } from "../types/service.types";
import { formatDelta, formatPrice } from "../utils/money";

type Props = {
  label: string;
  /** priceDelta pour une option, price pour un supplement. */
  price?: Money;
  /** true → affiche +2,00 DT (delta) ; false → affiche 2,00 DT. */
  isDelta?: boolean;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export default function OptionRow({
  label,
  price,
  isDelta,
  selected,
  onToggle,
  disabled,
}: Props) {
  const priceText = isDelta ? formatDelta(price) : formatPrice(price, "");

  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.rowDisabled]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
        {selected ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
      </View>

      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>

      {priceText ? <Text style={styles.price}>{priceText}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F7",
  },
  rowDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#D7DCE8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    marginLeft: 10,
  },
});