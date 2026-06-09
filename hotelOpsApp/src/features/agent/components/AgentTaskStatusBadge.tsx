import React from "react";
import { Text, StyleSheet, View } from "react-native";

type Props = {
  label?: string;
  color?: string | null;
};

export default function AgentTaskStatusBadge({ label, color }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color || "#e2e8f0" }]}>
      <Text style={styles.text}>{label || "Statut"}</Text>
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
    color: "#0f172a",
  },
});