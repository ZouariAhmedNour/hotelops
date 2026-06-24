import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

import AgentTaskStatusBadge from "../components/AgentTaskStatusBadge";
import { useAgentLocationHistory } from "../hooks/useAgentLocationHistory";
import { styles } from "../styles/agentLocationHistory.styles";
import type {
  AgentLocationHistoryBreakdown,
  AgentLocationHistorySummary,
} from "../types/locationHistory.types";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMinutes = (minutes: number) => {
  if (!minutes || minutes <= 0) {
    return "—";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours} h ${remainingMinutes} min`;
};

const formatHours = (hours: number) => {
  if (!hours || hours <= 0) {
    return "—";
  }

  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }

  return `${hours.toFixed(1)} h`;
};


function MetricCard({
  label,
  value,
  helper,
  icon,
  backgroundColor,
  iconColor,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: keyof typeof Feather.glyphMap;
  backgroundColor: string;
  iconColor: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiTop}>
        <View style={styles.kpiContent}>
          <Text style={styles.kpiLabel} numberOfLines={2}>
            {label}
          </Text>

          <Text style={styles.kpiValue}>{value}</Text>
        </View>

        <View
          style={[
            styles.kpiIcon,
            {
              backgroundColor,
            },
          ]}
        >
          <Feather name={icon} size={18} color={iconColor} />
        </View>
      </View>

      <Text style={styles.kpiHelper}>{helper}</Text>
    </View>
  );
}


function BreakdownList({
  title,
  items,
}: {
  title: string;
  items: AgentLocationHistoryBreakdown[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Aucune donnée disponible.</Text>
        </View>
      ) : (
        items.slice(0, 5).map((item) => (
          <View key={item.id} style={styles.breakdownRow}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownName}>{item.name}</Text>

              <Text style={styles.breakdownValue}>
                {item.count} · {item.percentage}%
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.max(item.percentage, 3)}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

export default function AgentLocationHistoryScreen({ route }: any) {
  const { locationId } = route.params;

  const {
    history,
    loading,
    refreshing,
    error,
    refresh,
    retry,
  } = useAgentLocationHistory(Number(locationId));

  const recurringAssets = useMemo(() => {
    return history?.assetHistory.filter((asset) => asset.isRepeated) ?? [];
  }, [history]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={{ marginTop: 14, color: "#64748b", fontWeight: "700" }}>
          Chargement de l’historique...
        </Text>
      </View>
    );
  }

  if (error || !history) {
    return (
      <View style={styles.center}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Historique indisponible</Text>

          <Text style={styles.errorText}>
            {error || "Impossible de récupérer les informations."}
          </Text>

          <Text
            style={styles.retryButton}
            onPress={retry}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </Text>
        </View>
      </View>
    );
  }

  const { location, summary } = history;

  const summaryCards: {
    label: string;
    value: string | number;
    helper: string;
    icon: keyof typeof Feather.glyphMap;
    backgroundColor: string;
    iconColor: string;
  }[] = [
    {
      label: "Interventions",
      value: summary.totalInterventions,
      helper: `${summary.rootIncidents} incident(s) distinct(s)`,
      icon: "tool",
      backgroundColor: "#dbeafe",
      iconColor: "#2563eb",
    },
    {
      label: "En cours",
      value: summary.activeInterventions,
      helper: `${summary.inProgress} démarrée(s)`,
      icon: "clock",
      backgroundColor: "#ede9fe",
      iconColor: "#7c3aed",
    },
    {
      label: "Partiellement résolus",
      value: summary.partiallyResolved,
      helper: `${summary.followUpTickets} ticket(s) de suivi`,
      icon: "alert-triangle",
      backgroundColor: "#fef3c7",
      iconColor: "#b45309",
    },
    {
      label: "Équipements récurrents",
      value: summary.repeatAssetCount,
      helper: `${summary.assetsMentionedCount} équipement(s) signalé(s)`,
      icon: "repeat",
      backgroundColor: "#fee2e2",
      iconColor: "#dc2626",
    },
    {
      label: "Résolution moyenne",
      value: formatHours(summary.averageResolutionHours),
      helper: `${summary.resolved} ticket(s) résolu(s)`,
      icon: "check-circle",
      backgroundColor: "#d1fae5",
      iconColor: "#059669",
    },
    {
      label: "Temps déclaré",
      value: formatMinutes(summary.totalTimeSpentMinutes),
      helper: `Moyenne : ${formatMinutes(
        summary.averageTimeSpentMinutes
      )}`,
      icon: "bar-chart-2",
      backgroundColor: "#e2e8f0",
      iconColor: "#475569",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Feather name="map-pin" size={24} color="#ffffff" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>Historique maintenance</Text>

            <Text style={styles.heroTitle}>{location.name}</Text>

            <Text style={styles.heroMeta}>
              {location.code}
              {location.floor ? ` · Étage ${location.floor}` : ""}
              {location.zone ? ` · ${location.zone}` : ""}
            </Text>
          </View>
        </View>

        <Text style={styles.heroText}>
          Consulte les pannes précédentes, les équipements récurrents et les
          interventions déjà réalisées dans cet endroit.
        </Text>
      </View>

      <View style={styles.kpiGrid}>
        {summaryCards.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </View>

      <BreakdownList
        title="Catégories les plus signalées"
        items={history.categoryBreakdown}
      />

      <View style={{ height: 14 }} />

      <BreakdownList
        title="Répartition par statut"
        items={history.statusBreakdown}
      />

      <View style={{ height: 14 }} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Équipements récurrents</Text>

        <Text style={styles.sectionSubtitle}>
          Un équipement est récurrent lorsqu’il apparaît dans au moins deux
          incidents distincts.
        </Text>

        {recurringAssets.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Aucun équipement récurrent dans cet endroit pour le moment.
            </Text>
          </View>
        ) : (
          recurringAssets.map((asset) => (
            <View key={asset.assetId} style={styles.assetCard}>
              <View style={styles.assetTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assetName}>{asset.name}</Text>

                  <Text style={styles.assetCode}>
                    {asset.code}
                    {asset.category ? ` · ${asset.category}` : ""}
                  </Text>
                </View>

                <View style={styles.recurrenceBadge}>
                  <Text style={styles.recurrenceText}>
                    {asset.incidentCount} incident(s)
                  </Text>
                </View>
              </View>

              <Text style={styles.assetMeta}>
                Tickets liés : {asset.ticketCount}
                {"\n"}
                Catégorie fréquente : {asset.topCategory || "Non définie"}
                {"\n"}
                Dernier signalement : {formatDateTime(asset.lastReportedAt)}
                {"\n"}
                Tickets actifs : {asset.openTicketCount}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 14 }} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique des interventions</Text>

        <Text style={styles.sectionSubtitle}>
          {history.interventions.length} ticket(s) lié(s) à cet endroit.
        </Text>

        {history.interventions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Aucune intervention n’a encore été créée pour cet endroit.
            </Text>
          </View>
        ) : (
          history.interventions.map((intervention) => (
            <View key={intervention.id} style={styles.interventionCard}>
              <View style={styles.interventionTop}>
                <Text style={styles.ticketNumber}>
                  {intervention.ticketNumber}
                </Text>

                <AgentTaskStatusBadge
                  label={intervention.status.name}
                  code={intervention.status.code}
                  color={intervention.status.color}
                />
              </View>

              <Text style={styles.interventionTitle}>
                {intervention.title}
              </Text>

              <Text style={styles.interventionDescription} numberOfLines={3}>
                {intervention.description}
              </Text>

              {intervention.isFollowUp && (
                <View style={styles.followUpBadge}>
                  <Text style={styles.followUpText}>Ticket de suivi</Text>
                </View>
              )}

              {intervention.ticketAssets.length > 0 && (
                <View style={styles.chipRow}>
                  {intervention.ticketAssets.map((ticketAsset) => (
                    <View key={ticketAsset.id} style={styles.chip}>
                      <Text style={styles.chipText}>
                        {ticketAsset.asset.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.interventionMeta}>
                Catégorie : {intervention.category.name}
                {"\n"}
                Priorité : {intervention.priority.name}
                {"\n"}
                Créé le : {formatDateTime(intervention.createdAt)}
                {"\n"}
                {intervention.assignedTo
                  ? `Agent : ${intervention.assignedTo.firstName} ${intervention.assignedTo.lastName}`
                  : "Agent : Non assigné"}
                {"\n"}
                Temps passé : {formatMinutes(intervention.timeSpentMinutes ?? 0)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}