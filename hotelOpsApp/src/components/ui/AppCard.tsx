import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";

import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";

export default function AppCard({ style, children, ...props }: ViewProps) {
  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    ...shadows.card,
  },
});