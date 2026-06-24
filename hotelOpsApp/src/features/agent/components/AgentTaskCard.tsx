import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import type { MaintenanceTicket } from "../../../types/ticket";
import AgentTaskStatusBadge from "./AgentTaskStatusBadge";
import { styles } from "../styles/agentTaskList.styles";

type Props = {
  task: MaintenanceTicket;
  onPress: () => void;
};

export default function AgentTaskCard({
  task,
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.ticketNumber}>{task.ticketNumber}</Text>

        <AgentTaskStatusBadge
          label={task.status?.name}
          code={task.status?.code}
          color={task.status?.color}
        />
      </View>

      <Text style={styles.title}>{task.title}</Text>

      <Text style={styles.meta}>
        {task.location?.name} • {task.category?.name}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.priority}>{task.priority?.name}</Text>

        <Text style={styles.progress}>{task.progress || 0}%</Text>
      </View>
    </TouchableOpacity>
  );
}