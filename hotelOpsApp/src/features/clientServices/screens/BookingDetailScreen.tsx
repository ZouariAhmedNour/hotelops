// src/features/services/screens/BookingDetailScreen.tsx
import React from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { colors } from "../../../theme/colors";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import ScreenState from "../components/ScreenState";
import SectionTitle from "../components/SectionTitle";
import StatusBadge from "../components/StatusBadge";
import TimelineList from "../components/TimelineList";
import { useBookingDetail } from "../hooks/useRequests";
import { formatDateFr, formatDateTimeFr, formatTimeRange } from "../utils/datetime";
import {
  GENDER_PREFERENCE_LABELS,
  bookingStatusLabel,
  bookingStatusTone,
  domainIcon,
  domainLabel,
  therapistName,
} from "../utils/labels";
import type { GenderPreference } from "../types/service.types";
import AppCard from "../../../components/ui/AppCard";

type Route = RouteProp<RootStackParamList, "BookingDetail">;

export default function BookingDetailScreen() {
  const { params } = useRoute<Route>();
  const { data: booking, loading, error, refetch, refresh, refreshing } =
    useBookingDetail(params.bookingId, params.domain);

  const isCancelled =
    booking?.status === "CANCELLED" || booking?.status === "NO_SHOW";

  return (
    <View style={styles.screen}>
      <ScreenState loading={loading} error={error} onRetry={refetch}>
        {booking ? (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            }
          >
            <AppCard style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconWrapper}>
                    <Ionicons
                      name={domainIcon(booking.domain) as keyof typeof Ionicons.glyphMap}
                      size={19}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.title}>{domainLabel(booking.domain)}</Text>
                    <Text style={styles.reference}>{booking.bookingNumber}</Text>
                  </View>
                </View>
                <StatusBadge
                  label={bookingStatusLabel(booking.status)}
                  tone={bookingStatusTone(booking.status)}
                />
              </View>

              <View style={styles.whenBox}>
                <View style={styles.when}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={styles.whenLabel}>
                    {formatDateFr(booking.bookingDate)}
                  </Text>
                </View>
                <View style={styles.when}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={styles.whenLabel}>
                    {formatTimeRange(booking.startTime, booking.durationMinutes)}
                  </Text>
                </View>
              </View>

              {isCancelled && booking.cancelReason ? (
                <View style={styles.cancelBox}>
                  <Ionicons name="close-circle-outline" size={16} color="#E5484D" />
                  <Text style={styles.cancelLabel}>{booking.cancelReason}</Text>
                </View>
              ) : null}
            </AppCard>

            <AppCard style={styles.card}>
              <SectionTitle title="Details" />

              {booking.item ? (
                <Row
                  icon="pricetag-outline"
                  label="Prestation"
                  value={booking.item.name}
                />
              ) : null}
              {booking.table ? (
                <Row
                  icon="grid-outline"
                  label="Table"
                  value={`${booking.table.name} · ${booking.table.room?.name} · ${booking.table.seats} couverts`}
                />
              ) : null}
              {booking.therapist ? (
                <Row
                  icon="person-outline"
                  label="Therapeute"
                  value={therapistName(booking.therapist)}
                />
              ) : null}
              {booking.partySize ? (
                <Row
                  icon="people-outline"
                  label="Participants"
                  value={`${booking.partySize} personne${booking.partySize > 1 ? "s" : ""}`}
                />
              ) : null}
              {booking.genderPreference &&
              booking.genderPreference !== "NO_PREFERENCE" ? (
                <Row
                  icon="body-outline"
                  label="Preference"
                  value={
                    GENDER_PREFERENCE_LABELS[
                      booking.genderPreference as GenderPreference
                    ] ?? booking.genderPreference
                  }
                />
              ) : null}
              <Row
                icon="bed-outline"
                label="Chambre"
                value={booking.roomNumber ?? "Non precisee"}
              />
              {booking.occasion ? (
                <Row icon="gift-outline" label="Occasion" value={booking.occasion} />
              ) : null}
              {booking.preferences ? (
                <Row
                  icon="options-outline"
                  label="Preferences"
                  value={booking.preferences}
                />
              ) : null}
              {booking.notes ? (
                <Row
                  icon="chatbubble-ellipses-outline"
                  label="Note"
                  value={booking.notes}
                />
              ) : null}
              <Row
                icon="create-outline"
                label="Demandee le"
                value={formatDateTimeFr(booking.createdAt)}
              />
              {booking.confirmedAt ? (
                <Row
                  icon="checkmark-circle-outline"
                  label="Confirmee le"
                  value={formatDateTimeFr(booking.confirmedAt)}
                />
              ) : null}
            </AppCard>

            <AppCard style={styles.card}>
              <SectionTitle title="Historique" />
              <TimelineList events={booking.events} statusLabel={bookingStatusLabel} />
            </AppCard>

            <Text style={styles.footNote}>
              Pour deplacer ou annuler cette reservation, contactez la reception :
              seul l'hotel peut en modifier le statut.
            </Text>
          </ScrollView>
        ) : null}
      </ScreenState>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#EEF1F7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  reference: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  whenBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 16,
    backgroundColor: "#EEF1F7",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  when: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  whenLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  cancelBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    backgroundColor: "#FDECEC",
    borderRadius: 14,
    padding: 12,
  },
  cancelLabel: {
    flex: 1,
    fontSize: 13,
    color: "#E5484D",
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.muted,
    width: 92,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    textAlign: "right",
  },
  footNote: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
});