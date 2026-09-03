// src/features/services/components/CartBar.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import { shadows } from "../../../theme/shadows";
import { useCart } from "../context/CartContext";
import { formatAmount } from "../utils/money";

type Props = {
  onPress: () => void;
  label?: string;
};

/** Barre flottante affichee en bas du catalogue room service. */
export default function CartBar({ onPress, label = "Voir le panier" }: Props) {
  const { count, total } = useCart();

  if (count === 0) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <TouchableOpacity style={styles.bar} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{count}</Text>
        </View>

        <Text style={styles.label}>{label}</Text>

        <Text style={styles.total}>{formatAmount(total)}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 58,
    gap: 10,
    ...shadows.button,
  },
  badge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
  label: {
    flex: 1,
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
  total: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
});