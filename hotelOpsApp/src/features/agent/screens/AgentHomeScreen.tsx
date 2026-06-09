import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../../../contexts/AuthContext";
import { colors } from "../../../theme/colors";

import AgentStatsCards from "../components/AgentStatsCards";
import AgentAvailabilitySelector from "../components/AgentAvailabilitySelector";
import { useAgentHome } from "../hooks/useAgentHome";
import { styles } from "../styles/agentHome.styles";

export default function AgentHomeScreen({ navigation }: any) {
  const { logout } = useAuth();

  const {
    profile,
    tasks,
    refreshing,
    showAvailability,
    setShowAvailability,
    refresh,
    changeAvailability,
  } = useAgentHome();

  const status = profile?.agentProfile?.availabilityStatus || "AVAILABLE";

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            Bonjour, {profile?.user?.firstName || "Agent"}
          </Text>

          <Text style={styles.team}>
            {profile?.agentProfile?.team?.name || "Sans équipe"}
          </Text>
        </View>

        <AgentAvailabilitySelector
          visible={showAvailability}
          currentStatus={status}
          onToggle={() => setShowAvailability(!showAvailability)}
          onChange={changeAvailability}
        />

        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <AgentStatsCards stats={profile?.todayStats} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tâches prioritaires</Text>

          <TouchableOpacity onPress={() => navigation.navigate("AgentTasks")}>
            <Text style={styles.seeAll}>Tout voir</Text>
          </TouchableOpacity>
        </View>

        {tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucune tâche assignée.</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() =>
                navigation.navigate("AgentTaskDetail", {
                  taskId: task.id,
                })
              }
            >
              <Text style={styles.taskNumber}>{task.ticketNumber}</Text>

              <Text style={styles.taskTitle} numberOfLines={2}>
                {task.title}
              </Text>

              <Text style={styles.taskLocation}>
                {task.location?.name || "Localisation non définie"}
              </Text>

              <View style={styles.taskFooter}>
                <Text style={styles.taskCategory}>
                  {task.category?.name || "Catégorie"}
                </Text>

                <Text style={styles.taskStatus}>
                  {task.status?.name || "Statut"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}