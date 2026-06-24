import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { agentMobileService } from "../api/agentMobile.service";
import type { MaintenanceTicket } from "../../../types/ticket";

type LocalPhoto = {
  uri: string;
  name: string;
  type: string;
};

export function useAgentTaskDetail(taskId: number) {
  const [task, setTask] = useState<MaintenanceTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [resolutionNote, setResolutionNote] = useState("");

  const [temporaryFixNote, setTemporaryFixNote] = useState("");
  const [expertReason, setExpertReason] = useState("");
  const [followUpTitle, setFollowUpTitle] = useState("");
  const [followUpDescription, setFollowUpDescription] = useState("");
  const [recommendedSpecialty, setRecommendedSpecialty] = useState("");
  const [
    requiresExpertIntervention,
    setRequiresExpertIntervention,
  ] = useState(true);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [afterPhotos, setAfterPhotos] = useState<LocalPhoto[]>([]);

  const loadTask = useCallback(async () => {
    try {
      setLoading(true);

      const data = await agentMobileService.getTaskById(taskId);

      setTask(data);
      setResolutionNote(data.resolutionNote || "");
      setTemporaryFixNote(data.temporaryFixNote || "");
      setExpertReason(data.followUpReason || "");
      setRecommendedSpecialty(data.recommendedSpecialty || "");
      setRequiresExpertIntervention(
        data.requiresExpertIntervention ?? true
      );
    } catch (error: any) {
      console.log(
        "TASK DETAIL ERROR =",
        error?.response?.data || error?.message || error
      );

      Alert.alert("Erreur", "Impossible de charger l’intervention.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void loadTask();
  }, [loadTask]);

  const runAction = async (
    action: () => Promise<MaintenanceTicket>,
    successMessage: string
  ) => {
    try {
      setActionLoading(true);

      const updatedTask = await action();

      setTask(updatedTask);

      Alert.alert("Succès", successMessage);
    } catch (error: any) {
      console.log(
        "AGENT ACTION ERROR =",
        error?.response?.data || error?.message || error
      );

      Alert.alert(
        "Erreur",
        error?.response?.data?.message || "Action impossible."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const uploadSelectedPhotos = async (
    photoType: "AFTER" | "DURING"
  ) => {
    for (const photo of afterPhotos) {
      await agentMobileService.uploadPhoto(taskId, photo, photoType);
    }
  };

  const acceptTask = () => {
    void runAction(
      () => agentMobileService.acceptTask(taskId),
      "Intervention acceptée."
    );
  };

  const startTask = () => {
    void runAction(
      () => agentMobileService.startTask(taskId),
      "Intervention démarrée."
    );
  };

  const pauseTask = () => {
    void runAction(
      () =>
        agentMobileService.pauseTask(
          taskId,
          "Pause depuis l’application mobile"
        ),
      "Intervention mise en pause."
    );
  };

  const resolveTask = async () => {
    if (!resolutionNote.trim()) {
      Alert.alert("Erreur", "Ajoute une note de résolution.");
      return;
    }

    await runAction(async () => {
      await uploadSelectedPhotos("AFTER");

      const updatedTask = await agentMobileService.resolveTask(taskId, {
        resolutionNote: resolutionNote.trim(),
      });

      setAfterPhotos([]);

      return updatedTask;
    }, "Ticket résolu définitivement.");
  };

  const partialResolveTask = async () => {
    if (!temporaryFixNote.trim()) {
      Alert.alert(
        "Erreur",
        "Décris la solution temporaire appliquée."
      );
      return;
    }

    if (!expertReason.trim()) {
      Alert.alert(
        "Erreur",
        "Explique pourquoi une intervention lourde est nécessaire."
      );
      return;
    }

    if (!followUpDescription.trim()) {
      Alert.alert(
        "Erreur",
        "Ajoute la description du ticket de suivi."
      );
      return;
    }

    try {
      setActionLoading(true);

      await uploadSelectedPhotos("DURING");

      const result = await agentMobileService.partialResolveTask(
        taskId,
        {
          temporaryFixNote: temporaryFixNote.trim(),
          expertReason: expertReason.trim(),
          followUpTitle: followUpTitle.trim() || undefined,
          followUpDescription: followUpDescription.trim(),
          recommendedSpecialty:
            recommendedSpecialty.trim() || undefined,
          requiresExpertIntervention,
        }
      );

      setTask(result.originalTicket);

      setTemporaryFixNote("");
      setExpertReason("");
      setFollowUpTitle("");
      setFollowUpDescription("");
      setRecommendedSpecialty("");
      setAfterPhotos([]);

      Alert.alert(
        "Ticket de suivi créé",
        `Le ticket original est partiellement résolu.\nNouveau ticket : ${result.followUpTicket.ticketNumber}`
      );
    } catch (error: any) {
      console.log(
        "PARTIAL RESOLVE ERROR =",
        error?.response?.data || error?.message || error
      );

      Alert.alert(
        "Erreur",
        error?.response?.data?.message ||
          "Impossible de créer le ticket de suivi."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const uploadPhoto = async (fromCamera: boolean) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission refusée",
          "Accès caméra ou galerie requis."
        );
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            quality: 0.75,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.75,
            allowsEditing: true,
          });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      setAfterPhotos((currentPhotos) => [
        ...currentPhotos,
        {
          uri: asset.uri,
          name:
            asset.fileName ||
            `photo-intervention-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        },
      ]);
    } catch (error: any) {
      console.log(
        "PHOTO PICK ERROR =",
        error?.response?.data || error?.message || error
      );

      Alert.alert("Erreur", "Impossible de sélectionner la photo.");
    }
  };

  const removeAfterPhoto = (index: number) => {
    setAfterPhotos((currentPhotos) =>
      currentPhotos.filter(
        (_, currentIndex) => currentIndex !== index
      )
    );
  };

  useEffect(() => {
    if (!task?.startedAt || task.resolvedAt) {
      setElapsedSeconds(0);
      return;
    }

    const updateElapsed = () => {
      const start = new Date(task.startedAt as string).getTime();
      const now = Date.now();

      setElapsedSeconds(
        Math.max(0, Math.floor((now - start) / 1000))
      );
    };

    updateElapsed();

    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [task?.startedAt, task?.resolvedAt]);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  return {
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

    elapsedSeconds,
    elapsedLabel: formatElapsedTime(elapsedSeconds),

    acceptTask,
    startTask,
    pauseTask,
    resolveTask,
    partialResolveTask,

    uploadPhoto,
    afterPhotos,
    removeAfterPhoto,

    reload: loadTask,
  };
}