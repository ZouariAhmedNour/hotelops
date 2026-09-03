// src/features/services/components/OrderCard.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import { shadows } from "../../../theme/shadows";
import type { ServiceOrder } from "../types/service.types";
import { formatDateTimeFr } from "../utils/datetime";
import { orderStatusLabel, orderStatusTone } from "../utils/labels";
import { formatPrice } from "../utils/money";
import StatusBadge from "./StatusBadge";

type Props = {
  order: ServiceOrder;
  onPress: () => void;
};

export default function OrderCard({ order, onPress }: Props) {
  const lineCount = order.lines?.length ?? 0;
  const itemCount = (order.lines ?? []).reduce(
    (sum, line) => sum + line.quantity,
    0,
  );
  const preview = (order.lines ?? [])
    .slice(0, 2)
    .map((line) => `${line.quantity}× ${line.item?.name ?? "Article"}`)
    .join(", ");

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            <Ionicons name="restaurant-outline" size={17} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>Room service</Text>
            <Text style={styles.reference}>{order.orderNumber}</Text>
          </View>
        </View>

        <StatusBadge
          label={orderStatusLabel(order.status)}
          tone={orderStatusTone(order.status)}
          compact
        />
      </View>

      {preview ? (
        <Text style={styles.preview} numberOfLines={1}>
          {preview}
          {lineCount > 2 ? ` +${lineCount - 2}` : ""}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={13} color={colors.muted} />
          <Text style={styles.metaLabel}>{formatDateTimeFr(order.createdAt)}</Text>
        </View>

        {order.roomNumber ? (
          <View style={styles.meta}>
            <Ionicons name="bed-outline" size={13} color={colors.muted} />
            <Text style={styles.metaLabel}>Ch. {order.roomNumber}</Text>
          </View>
        ) : null}

        <View style={styles.meta}>
          <Ionicons name="cube-outline" size={13} color={colors.muted} />
          <Text style={styles.metaLabel}>
            {itemCount} article{itemCount > 1 ? "s" : ""}
          </Text>
        </View>

        <Text style={styles.total}>{formatPrice(order.totalAmount)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    ...shadows.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: "#EEF1F7",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  reference: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  preview: {
    fontSize: 13,
    color: colors.text,
    marginTop: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  total: {
    marginLeft: "auto",
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
});