import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  label?: string;
  code?: string | null;
  color?: string | null;
};

const normalizeStatusCode = (value?: string | null) => {
  return (value ?? "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
};

export default function AgentTaskStatusBadge({
  label,
  code,
  color,
}: Props) {
  const statusCode = normalizeStatusCode(code);

  const isPartiallyResolved =
    statusCode === "PARTIALLY_RESOLVED" ||
    statusCode === "PARTIAL_RESOLVED";

  const backgroundColor = isPartiallyResolved
    ? "#fef3c7"
    : color || "#e2e8f0";

  const textColor = isPartiallyResolved
    ? "#b45309"
    : "#0f172a";

  const displayLabel = isPartiallyResolved
    ? "Partiellement résolu"
    : label || code || "Statut";

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  text: {
    fontSize: 12,
    fontWeight: "800",
  },
});