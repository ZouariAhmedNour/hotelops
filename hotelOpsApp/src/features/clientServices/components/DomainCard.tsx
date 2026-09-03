// src/features/services/components/DomainCard.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import { shadows } from "../../../theme/shadows";
import type { ServiceDomain } from "../types/service.types";
import { DOMAIN_DESCRIPTIONS, DOMAIN_ICONS, DOMAIN_LABELS } from "../utils/labels";

type Props = {
  domain: ServiceDomain;
  onPress: () => void;
  /** Petit compteur optionnel (nombre d'articles du domaine). */
  badge?: string | number;
};

export default function DomainCard({ domain, onPress, badge }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={DOMAIN_LABELS[domain]}
    >
      <View style={styles.iconWrapper}>
        <Ionicons
          name={DOMAIN_ICONS[domain] as keyof typeof Ionicons.glyphMap}
          size={22}
          color={colors.primary}
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {DOMAIN_LABELS[domain]}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {DOMAIN_DESCRIPTIONS[domain]}
        </Text>
      </View>

      {badge !== undefined && badge !== null ? (
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{badge}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    ...shadows.card,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#EEF1F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  body: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 3,
    lineHeight: 18,
  },
  badge: {
    minWidth: 30,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
});