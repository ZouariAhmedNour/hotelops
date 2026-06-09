import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { agentMobileService } from "../api/agentMobile.service";
import type { MaintenanceTicket } from "../../../types/ticket";

export function useAgentTaskDetail(taskId: number) {
  const [task, setTask] = useState<MaintenanceTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [resolutionNote, setResolutionNote] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [afterPhotos, setAfterPhotos] = useState<
  {
    uri: string;
    name: string;
    type: string;
  }[]
>([]);


  const loadTask = useCallback(async () => {
    try {
      setLoading(true);

      const data = await agentMobileService.getTaskById(taskId);
      console.log(
  "TASK ATTACHMENTS =",
  JSON.stringify(data.attachments, null, 2)
);
      setTask(data);
      setResolutionNote(data.resolutionNote || "");
    } catch (error: any) {
      console.log("TASK DETAIL ERROR =", error?.response?.data || error.message);
      Alert.alert("Erreur", "Impossible de charger l’intervention.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTask();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadTask]);

  const runAction = async (
    action: () => Promise<MaintenanceTicket>,
    successMessage: string
  ) => {
    try {
      setActionLoading(true);

      const updated = await action();
      setTask(updated);

      Alert.alert("Succès", successMessage);
    } catch (error: any) {
      console.log("ACTION ERROR =", error?.response?.data || error.message);
      Alert.alert("Erreur", "Action impossible.");
    } finally {
      setActionLoading(false);
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
      () => agentMobileService.pauseTask(taskId, "Pause depuis mobile"),
      "Intervention mise en pause."
    );
  };

  const resolveTask = async () => {
  if (!resolutionNote.trim()) {
    Alert.alert("Erreur", "Ajoutez une note de résolution.");
    return;
  }

  await runAction(async () => {
    for (const photo of afterPhotos) {
      await agentMobileService.uploadPhoto(taskId, photo, "AFTER");
    }

    const updated = await agentMobileService.resolveTask(taskId, {
      resolutionNote: resolutionNote.trim(),
    });

    setAfterPhotos([]);

    return updated;
  }, "Ticket résolu.");
};

  const uploadPhoto = async (fromCamera: boolean) => {
  try {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission refusée", "Accès caméra ou galerie requis.");
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

    if (result.canceled) return;

    const asset = result.assets[0];

    setAfterPhotos((prev) => [
      ...prev,
      {
        uri: asset.uri,
        name: asset.fileName || `photo-after-${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      },
    ]);
  } catch (error: any) {
    console.log("PHOTO PICK ERROR =", error?.response?.data || error.message);
    Alert.alert("Erreur", "Impossible de sélectionner la photo.");
  }
};

const removeAfterPhoto = (index: number) => {
  setAfterPhotos((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
};

  useEffect(() => {
  if (!task?.startedAt || task?.resolvedAt) {
    setElapsedSeconds(0);
    return;
  }

  const updateElapsed = () => {
    const start = new Date(task.startedAt as string).getTime();
    const now = Date.now();

    setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
  };

  updateElapsed();

  const interval = setInterval(updateElapsed, 1000);

  return () => clearInterval(interval);
}, [task?.startedAt, task?.resolvedAt]);

const formatElapsedTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(2, "0")}`;
};

  return {
    task,
    loading,
    actionLoading,

    resolutionNote,
    setResolutionNote,

    elapsedSeconds,
    elapsedLabel: formatElapsedTime(elapsedSeconds),

    acceptTask,
    startTask,
    pauseTask,
    resolveTask,
    uploadPhoto,
    afterPhotos,
    removeAfterPhoto,
    reload: loadTask,
  };
}