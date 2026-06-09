import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,

  ActivityIndicator,
  TextInput,
} from "react-native";

import AppButton from "../../../components/ui/AppButton";
import { colors } from "../../../theme/colors";

import AgentTaskStatusBadge from "../components/AgentTaskStatusBadge";
import { useAgentTaskDetail } from "../hooks/useAgentTaskDetail";
import { styles } from "../styles/agentTaskDetail.styles";
import AgentTaskActions from "../components/AgentTaskActions";
import AgentTaskPhotoSections from "../components/AgentTaskPhotoSections";

export default function AgentTaskDetailScreen({ route }: any) {
  const { taskId } = route.params;

  const {
    task,
    loading,
    actionLoading,

    resolutionNote,
    setResolutionNote,

    elapsedLabel,

    afterPhotos,
    removeAfterPhoto,

    acceptTask,
    startTask,
    pauseTask,
    resolveTask,
    uploadPhoto,
  } = useAgentTaskDetail(taskId);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text>Intervention introuvable.</Text>
      </View>
    );
  }

  const statusCode = task.status?.code?.trim().toUpperCase();

const isFinal =
  task.status?.isFinal ||
  statusCode === "RESOLVED" ||
  statusCode === "CLOSED" ||
  statusCode === "CANCELLED" ||
  !!task.resolvedAt ||
  !!task.closedAt;

const isAccepted = !!task.acceptedAt || statusCode === "ASSIGNED";
const isStarted = !!task.startedAt || statusCode === "IN_PROGRESS";

const showAccept = !isFinal && !task.acceptedAt;
const showStart = !isFinal && isAccepted && !isStarted;
const showPause = !isFinal && isStarted;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.ticketNumber}>{task.ticketNumber}</Text>

        <Text style={styles.title}>{task.title}</Text>

        <AgentTaskStatusBadge
          label={task.status?.name}
          color={task.status?.color}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{task.description}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Localisation</Text>
          <Text style={styles.infoValue}>{task.location?.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Priorité</Text>
          <Text style={styles.infoValue}>{task.priority?.name}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Progression</Text>
        <Text style={styles.progress}>{task.progress || 0}%</Text>
      </View>

    <AgentTaskActions
  loading={actionLoading}
  showAccept={showAccept}
  showStart={showStart}
  showPause={showPause}
  onAccept={acceptTask}
  onStart={startTask}
  onPause={pauseTask}
/>

      <View style={styles.card}>
  <Text style={styles.sectionTitle}>Photos</Text>

<AgentTaskPhotoSections
  attachments={task.attachments || []}
  afterPhotos={afterPhotos}
  onAddFromCamera={() => uploadPhoto(true)}
  onAddFromGallery={() => uploadPhoto(false)}
  onRemoveAfterPhoto={removeAfterPhoto}
/>
</View>

     {isFinal ? (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Résolution</Text>

    <Text style={styles.description}>
      {task.resolutionNote || "Ce ticket est déjà résolu."}
    </Text>

    {task.timeSpentMinutes !== undefined && task.timeSpentMinutes !== null && (
      <Text style={[styles.description, { marginTop: 10 }]}>
        Temps passé : {task.timeSpentMinutes} min
      </Text>
    )}
  </View>
) : (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Résolution</Text>

    <TextInput
      value={resolutionNote}
      onChangeText={setResolutionNote}
      placeholder="Décrivez ce qui a été réparé..."
      placeholderTextColor="#94a3b8"
      multiline
      style={styles.textArea}
    />

    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Temps d’intervention</Text>

      <Text style={styles.progress}>
        {task.startedAt ? elapsedLabel : "Non démarrée"}
      </Text>
    </View>

    <AppButton
      title="Marquer comme résolu"
      onPress={resolveTask}
      loading={actionLoading}
    />
  </View>
)}
    </ScrollView>
  );
}