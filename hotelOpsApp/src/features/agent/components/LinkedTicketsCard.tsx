import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinkedTicket } from "../../../types/ticket";


type Props = {
  parentTicket?: LinkedTicket | null;
  followUpTickets?: LinkedTicket[];
};

const normalizeStatusCode = (value?: string | null) => {
  return (value ?? "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
};

const getStatusLabel = (ticket: LinkedTicket) => {
  const statusCode = normalizeStatusCode(ticket.status?.code);

  if (
    statusCode === "PARTIALLY_RESOLVED" ||
    statusCode === "PARTIAL_RESOLVED"
  ) {
    return "Partiellement résolu";
  }

  return ticket.status?.name || ticket.status?.code || "Statut";
};

function TicketMiniCard({
  ticket,
  label,
}: {
  ticket: LinkedTicket;
  label: string;
}) {
  return (
    <View style={styles.ticketCard}>
      <View style={styles.ticketTop}>
        <Text style={styles.ticketLabel}>{label}</Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {getStatusLabel(ticket)}
          </Text>
        </View>
      </View>

      <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>

      <Text style={styles.ticketTitle} numberOfLines={2}>
        {ticket.title}
      </Text>

      <Text style={styles.ticketMeta}>
        {ticket.location?.name || "Localisation"}
        {" · "}
        {ticket.priority?.name || "Priorité"}
      </Text>
    </View>
  );
}

export default function LinkedTicketsCard({
  parentTicket,
  followUpTickets = [],
}: Props) {
  if (!parentTicket && followUpTickets.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Feather name="git-branch" size={19} color="#1c2d5a" />

        <Text style={styles.title}>Tickets liés</Text>
      </View>

      {parentTicket && (
        <TicketMiniCard
          ticket={parentTicket}
          label="Ticket parent"
        />
      )}

      {followUpTickets.map((ticket) => (
        <TicketMiniCard
          key={ticket.id}
          ticket={ticket}
          label="Ticket de suivi"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#ffffff",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  title: {
    color: "#1c2d5a",
    fontSize: 18,
    fontWeight: "900",
  },

  ticketCard: {
    marginTop: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 16,
    backgroundColor: "#f8fbff",
  },

  ticketTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  ticketLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#e0f2fe",
  },

  statusText: {
    color: "#0369a1",
    fontSize: 10,
    fontWeight: "800",
  },

  ticketNumber: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
  },

  ticketTitle: {
    marginTop: 4,
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "900",
  },

  ticketMeta: {
    marginTop: 7,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
});