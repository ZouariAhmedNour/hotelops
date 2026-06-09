import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles/agentHome.styles";


type Props = {
  stats?: {
    assignedToday: number;
    inProgress: number;
    urgent: number;
    completedToday: number;
  };
};

export default function AgentStatsCards({ stats }: Props) {
  if (!stats) return null;

  return (
    <View style={styles.kpiGrid}>
      <View style={styles.kpiCard}>
        <Text style={[styles.kpiValue, { color: "#3b82f6" }]}>
          {stats.assignedToday}
        </Text>
        <Text style={styles.kpiLabel}>Assignées aujourd’hui</Text>
      </View>

      <View style={styles.kpiCard}>
        <Text style={[styles.kpiValue, { color: "#f59e0b" }]}>
          {stats.inProgress}
        </Text>
        <Text style={styles.kpiLabel}>En cours</Text>
      </View>

      <View style={styles.kpiCard}>
        <Text style={[styles.kpiValue, { color: "#ef4444" }]}>
          {stats.urgent}
        </Text>
        <Text style={styles.kpiLabel}>Urgentes</Text>
      </View>

      <View style={styles.kpiCard}>
        <Text style={[styles.kpiValue, { color: "#10b981" }]}>
          {stats.completedToday}
        </Text>
        <Text style={styles.kpiLabel}>Terminées</Text>
      </View>
    </View>
  );
}