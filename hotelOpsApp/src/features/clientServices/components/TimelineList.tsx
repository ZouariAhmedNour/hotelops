// src/features/services/components/TimelineList.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import type { ServiceEvent } from "../types/service.types";
import { formatDateTimeFr } from "../utils/datetime";
import { eventLabel } from "../utils/labels";

type Props = {
  events: ServiceEvent[];
  /** Traduit un code de statut en libelle lisible (commande ou reservation). */
  statusLabel: (status: string) => string;
};

/** Historique d'une commande ou d'une reservation (champ `events`). */
export default function TimelineList({ events, statusLabel }: Props) {
  if (!events || events.length === 0) {
    return <Text style={styles.empty}>Aucun evenement pour l'instant.</Text>;
  }

  return (
    <View>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const transition =
          event.toStatus && event.fromStatus
            ? `${statusLabel(event.fromStatus)} → ${statusLabel(event.toStatus)}`
            : event.toStatus
              ? statusLabel(event.toStatus)
              : null;

        return (
          <View key={event.id} style={styles.row}>
            <View style={styles.gutter}>
              <View style={styles.dot} />
              {!isLast ? <View style={styles.line} /> : null}
            </View>

            <View style={[styles.content, isLast && styles.contentLast]}>
              <Text style={styles.title}>{eventLabel(event.type)}</Text>
              {transition ? <Text style={styles.transition}>{transition}</Text> : null}
              {event.message ? (
                <Text style={styles.message}>{event.message}</Text>
              ) : null}
              <Text style={styles.date}>
                {formatDateTimeFr(event.createdAt)}
                {event.user ? ` · ${event.user.firstName} ${event.user.lastName}` : ""}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  gutter: {
    width: 22,
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 5,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: "#E7EAF3",
    marginTop: 3,
  },
  content: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 18,
  },
  contentLast: {
    paddingBottom: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  transition: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
    fontWeight: "600",
  },
  message: {
    fontSize: 13,
    color: colors.text,
    marginTop: 3,
    lineHeight: 18,
  },
  date: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  empty: {
    fontSize: 13,
    color: colors.muted,
  },
});