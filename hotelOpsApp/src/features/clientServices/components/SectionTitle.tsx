// src/features/services/components/SectionTitle.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function SectionTitle({ title, subtitle, right }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  textBlock: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 3,
    lineHeight: 18,
  },
});