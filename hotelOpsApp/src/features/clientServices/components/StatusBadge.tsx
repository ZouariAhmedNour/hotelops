// src/features/services/components/StatusBadge.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { StatusTone } from "../utils/labels";
import { STATUS_COLORS } from "../utils/labels";

type Props = {
  label: string;
  tone?: StatusTone;
  compact?: boolean;
};

export default function StatusBadge({ label, tone = "neutral", compact }: Props) {
  const palette = STATUS_COLORS[tone] ?? STATUS_COLORS.neutral;

  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { backgroundColor: palette.bg },
      ]}
    >
      <Text
        style={[styles.label, compact && styles.labelCompact, { color: palette.fg }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeCompact: {
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
  labelCompact: {
    fontSize: 11,
  },
});