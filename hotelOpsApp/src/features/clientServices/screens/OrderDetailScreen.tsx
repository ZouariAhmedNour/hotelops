// src/features/services/screens/OrderDetailScreen.tsx
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
import { useOrderDetail } from "../hooks/useRequests";
import { formatDateTimeFr } from "../utils/datetime";
import {
  ORDER_TIMELINE,
  orderStatusLabel,
  orderStatusTone,
  paymentLabel,
} from "../utils/labels";
import { formatPrice, toNumberOr } from "../utils/money";
import AppCard from "../../../components/ui/AppCard";

type Route = RouteProp<RootStackParamList, "OrderDetail">;

export default function OrderDetailScreen() {
  const { params } = useRoute<Route>();
  const { data: order, loading, error, refetch, refresh, refreshing } =
    useOrderDetail(params.orderId);

  const currentStep = order ? ORDER_TIMELINE.indexOf(order.status) : -1;
  const isCancelled = order?.status === "CANCELLED";

  return (
    <View style={styles.screen}>
      <ScreenState loading={loading} error={error} onRetry={refetch}>
        {order ? (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            }
          >
            <AppCard style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.headerText}>
                  <Text style={styles.reference}>{order.orderNumber}</Text>
                  <Text style={styles.date}>
                    Passee le {formatDateTimeFr(order.createdAt)}
                  </Text>
                </View>
                <StatusBadge
                  label={orderStatusLabel(order.status)}
                  tone={orderStatusTone(order.status)}
                />
              </View>

              {isCancelled ? (
                <View style={styles.cancelBox}>
                  <Ionicons name="close-circle-outline" size={16} color="#E5484D" />
                  <Text style={styles.cancelLabel}>
                    {order.cancelReason
                      ? `Annulee : ${order.cancelReason}`
                      : "Cette commande a ete annulee."}
                  </Text>
                </View>
              ) : (
                <View style={styles.steps}>
                  {ORDER_TIMELINE.map((status, index) => {
                    const done = currentStep >= index;
                    return (
                      <View key={status} style={styles.step}>
                        <View style={[styles.stepDot, done && styles.stepDotDone]}>
                          {done ? (
                            <Ionicons name="checkmark" size={11} color={colors.white} />
                          ) : null}
                        </View>
                        <Text
                          style={[styles.stepLabel, done && styles.stepLabelDone]}
                          numberOfLines={2}
                        >
                          {orderStatusLabel(status)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </AppCard>

            <AppCard style={styles.card}>
              <SectionTitle title="Articles" />
              {(order.lines ?? []).map((line) => (
                <View key={line.id} style={styles.line}>
                  <Text style={styles.lineQuantity}>{line.quantity}×</Text>
                  <View style={styles.lineBody}>
                    <Text style={styles.lineName}>
                      {line.item?.name ?? `Article #${line.itemId}`}
                    </Text>
                    <Text style={styles.lineUnit}>
                      {formatPrice(line.unitPrice)} / unite
                    </Text>
                    {line.comment ? (
                      <Text style={styles.lineComment}>« {line.comment} »</Text>
                    ) : null}
                  </View>
                  <Text style={styles.lineTotal}>
                    {formatPrice(toNumberOr(line.unitPrice) * line.quantity)}
                  </Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(order.totalAmount)}</Text>
              </View>
            </AppCard>

            <AppCard style={styles.card}>
              <SectionTitle title="Informations" />

              <Row
                icon="bed-outline"
                label="Chambre"
                value={order.roomNumber ?? "Non precisee"}
              />
              <Row
                icon="card-outline"
                label="Paiement"
                value={paymentLabel(order.paymentMethod)}
              />
              <Row
                icon={order.isPaid ? "checkmark-circle-outline" : "time-outline"}
                label="Reglement"
                value={order.isPaid ? "Regle" : "En attente"}
              />
              {order.deliveredAt ? (
                <Row
                  icon="checkmark-done-outline"
                  label="Livree le"
                  value={formatDateTimeFr(order.deliveredAt)}
                />
              ) : null}
              {order.comment ? (
                <Row
                  icon="chatbubble-ellipses-outline"
                  label="Votre note"
                  value={order.comment}
                />
              ) : null}
            </AppCard>

            <AppCard style={styles.card}>
              <SectionTitle title="Historique" />
              <TimelineList events={order.events} statusLabel={orderStatusLabel} />
            </AppCard>

            <Text style={styles.footNote}>
              Besoin de modifier ou d'annuler ? Contactez la reception : seul
              l'hotel peut changer le statut d'une commande.
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
  headerText: {
    flex: 1,
  },
  reference: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  date: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 3,
  },
  steps: {
    flexDirection: "row",
    marginTop: 18,
    gap: 4,
  },
  step: {
    flex: 1,
    alignItems: "center",
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E7EAF3",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: 10,
    color: colors.muted,
    textAlign: "center",
    marginTop: 5,
  },
  stepLabelDone: {
    color: colors.text,
    fontWeight: "700",
  },
  cancelBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
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
  line: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F7",
  },
  lineQuantity: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    minWidth: 26,
  },
  lineBody: {
    flex: 1,
  },
  lineName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  lineUnit: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  lineComment: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: "italic",
    marginTop: 3,
  },
  lineTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.muted,
  },
  totalValue: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.primary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.muted,
    width: 88,
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