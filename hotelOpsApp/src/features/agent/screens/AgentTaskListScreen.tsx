import React from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";

import AgentTaskCard from "../components/AgentTaskCard";
import { useAgentTasks } from "../hooks/useAgentTasks";
import { styles } from "../styles/agentTaskList.styles";

export default function AgentTaskListScreen({ navigation }: any) {
  const { tasks, refreshing, refresh } = useAgentTasks();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
    >
      {tasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aucune tâche</Text>

          <Text style={styles.emptyText}>
            Aucun ticket ne vous est assigné pour le moment.
          </Text>
        </View>
      ) : (
        tasks.map((task) => (
          <AgentTaskCard
            key={task.id}
            task={task}
            onPress={() =>
              navigation.navigate("AgentTaskDetail", {
                taskId: task.id,
              })
            }
          />
        ))
      )}
    </ScrollView>
  );
}