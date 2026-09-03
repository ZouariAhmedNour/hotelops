// src/features/services/components/BookingCard.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import { shadows } from "../../../theme/shadows";
import type { ServiceBooking } from "../types/service.types";
import { formatDateFr, formatTimeRange } from "../utils/datetime";
import {
  bookingStatusLabel,
  bookingStatusTone,
  domainIcon,
  domainLabel,
  therapistName,
} from "../utils/labels";
import StatusBadge from "./StatusBadge";

type Props = {
  booking: ServiceBooking;
  onPress: () => void;
};

export default function BookingCard({ booking, onPress }: Props) {
  const subtitle =
    booking.item?.name ??
    (booking.table ? `Table ${booking.table.name}` : domainLabel(booking.domain));

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            <Ionicons
              name={domainIcon(booking.domain) as keyof typeof Ionicons.glyphMap}
              size={17}
              color={colors.primary}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>
              {domainLabel(booking.domain)}
            </Text>
            <Text style={styles.reference}>{booking.bookingNumber}</Text>
          </View>
        </View>

        <StatusBadge
          label={bookingStatusLabel(booking.status)}
          tone={bookingStatusTone(booking.status)}
          compact
        />
      </View>

      <Text style={styles.subtitle} numberOfLines={1}>
        {subtitle}
      </Text>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={13} color={colors.muted} />
          <Text style={styles.metaLabel}>{formatDateFr(booking.bookingDate)}</Text>
        </View>

        <View style={styles.meta}>
          <Ionicons name="time-outline" size={13} color={colors.muted} />
          <Text style={styles.metaLabel}>
            {formatTimeRange(booking.startTime, booking.durationMinutes)}
          </Text>
        </View>

        {booking.partySize ? (
          <View style={styles.meta}>
            <Ionicons name="people-outline" size={13} color={colors.muted} />
            <Text style={styles.metaLabel}>{booking.partySize} pers.</Text>
          </View>
        ) : null}

        {booking.table ? (
          <View style={styles.meta}>
            <Ionicons name="grid-outline" size={13} color={colors.muted} />
            <Text style={styles.metaLabel}>
              {booking.table.name} · {booking.table.room?.name}
            </Text>
          </View>
        ) : null}

        {booking.therapist ? (
          <View style={styles.meta}>
            <Ionicons name="person-outline" size={13} color={colors.muted} />
            <Text style={styles.metaLabel}>{therapistName(booking.therapist)}</Text>
          </View>
        ) : null}
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
  headerText: {
    flex: 1,
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
  subtitle: {
    fontSize: 13,
    color: colors.text,
    marginTop: 12,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
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
});