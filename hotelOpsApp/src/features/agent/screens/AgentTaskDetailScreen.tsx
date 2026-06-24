import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import AppButton from "../../../components/ui/AppButton";
import { colors } from "../../../theme/colors";

import AgentTaskActions from "../components/AgentTaskActions";
import AgentTaskPhotoSections from "../components/AgentTaskPhotoSections";
import AgentTaskStatusBadge from "../components/AgentTaskStatusBadge";
import LinkedTicketsCard from "../components/LinkedTicketsCard";
import PartialResolveForm from "../components/PartialResolveForm";

import { useAgentTaskDetail } from "../hooks/useAgentTaskDetail";
import { styles } from "../styles/agentTaskDetail.styles";

const normalizeStatusCode = (value?: string | null) => {
  return (value ?? "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
};

export default function AgentTaskDetailScreen({ route }: any) {
  const { taskId } = route.params;

  const {
    task,
    loading,
    actionLoading,

    resolutionNote,
    setResolutionNote,

    temporaryFixNote,
    setTemporaryFixNote,

    expertReason,
    setExpertReason,

    followUpTitle,
    setFollowUpTitle,

    followUpDescription,
    setFollowUpDescription,

    recommendedSpecialty,
    setRecommendedSpecialty,

    requiresExpertIntervention,
    setRequiresExpertIntervention,

    elapsedLabel,

    afterPhotos,
    removeAfterPhoto,

    acceptTask,
    startTask,
    pauseTask,
    resolveTask,
    partialResolveTask,
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

  const statusCode = normalizeStatusCode(task.status?.code);

  const isPartiallyResolved =
    statusCode === "PARTIALLY_RESOLVED" ||
    statusCode === "PARTIAL_RESOLVED";

  const isFinal =
    task.status?.isFinal ||
    statusCode === "RESOLVED" ||
    statusCode === "CLOSED" ||
    statusCode === "CANCELLED" ||
    statusCode === "CANCELED" ||
    Boolean(task.resolvedAt) ||
    Boolean(task.closedAt);

  const workflowLocked = isFinal || isPartiallyResolved;

  const isAccepted = Boolean(task.acceptedAt);
  const isStarted = Boolean(task.startedAt);

  const showAccept = !workflowLocked && !isAccepted;
  const showStart = !workflowLocked && isAccepted && !isStarted;
  const showPause =
    !workflowLocked &&
    isStarted &&
    statusCode !== "PENDING";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerCard}>
        <Text style={styles.ticketNumber}>{task.ticketNumber}</Text>

        <Text style={styles.title}>{task.title}</Text>

        <AgentTaskStatusBadge
          label={task.status?.name}
          code={task.status?.code}
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

          <Text style={styles.infoValue}>
            {task.location?.name || "Non définie"}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Priorité</Text>

          <Text style={styles.infoValue}>
            {task.priority?.name || "Non définie"}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Progression</Text>

        <Text style={styles.progress}>{task.progress || 0}%</Text>
      </View>

      <LinkedTicketsCard
        parentTicket={task.parentTicket}
        followUpTickets={task.followUpTickets}
      />

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

      {isPartiallyResolved && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Solution temporaire appliquée
          </Text>

          <Text style={styles.description}>
            {task.temporaryFixNote ||
              task.resolutionNote ||
              "Solution temporaire enregistrée."}
          </Text>

          {!!task.followUpReason && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    marginTop: 18,
                    fontSize: 15,
                  },
                ]}
              >
                Intervention lourde nécessaire
              </Text>

              <Text style={styles.description}>
                {task.followUpReason}
              </Text>
            </>
          )}

          {!!task.recommendedSpecialty && (
            <Text
              style={[
                styles.description,
                {
                  marginTop: 12,
                },
              ]}
            >
              Spécialité recommandée :{" "}
              {task.recommendedSpecialty}
            </Text>
          )}
        </View>
      )}

      {isFinal && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Résolution définitive</Text>

          <Text style={styles.description}>
            {task.resolutionNote || "Ce ticket est déjà résolu."}
          </Text>

          {task.timeSpentMinutes !== undefined &&
            task.timeSpentMinutes !== null && (
              <Text
                style={[
                  styles.description,
                  {
                    marginTop: 10,
                  },
                ]}
              >
                Temps passé : {task.timeSpentMinutes} min
              </Text>
            )}
        </View>
      )}

      {!workflowLocked && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Réparation définitive
            </Text>

            <TextInput
              value={resolutionNote}
              onChangeText={setResolutionNote}
              placeholder="Décrivez ce qui a été réparé..."
              placeholderTextColor="#94a3b8"
              multiline
              style={styles.textArea}
            />

            <View
              style={[
                styles.card,
                {
                  marginBottom: 12,
                  backgroundColor: "#f8fafc",
                },
              ]}
            >
              <Text style={styles.sectionTitle}>
                Temps d’intervention
              </Text>

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

          <PartialResolveForm
            loading={actionLoading}
            temporaryFixNote={temporaryFixNote}
            expertReason={expertReason}
            followUpTitle={followUpTitle}
            followUpDescription={followUpDescription}
            recommendedSpecialty={recommendedSpecialty}
            requiresExpertIntervention={
              requiresExpertIntervention
            }
            onChangeTemporaryFixNote={setTemporaryFixNote}
            onChangeExpertReason={setExpertReason}
            onChangeFollowUpTitle={setFollowUpTitle}
            onChangeFollowUpDescription={
              setFollowUpDescription
            }
            onChangeRecommendedSpecialty={
              setRecommendedSpecialty
            }
            onChangeRequiresExpertIntervention={
              setRequiresExpertIntervention
            }
            onSubmit={partialResolveTask}
          />
        </>
      )}
    </ScrollView>
  );
}