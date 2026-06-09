import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

import { agentMobileService } from "../api/agentMobile.service";
import type { MaintenanceTicket } from "../../../types/ticket";

export function useAgentTasks() {
  const [tasks, setTasks] = useState<MaintenanceTicket[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const result = await agentMobileService.getTasks({
        limit: 50,
      });

      setTasks(result.tasks || []);
    } catch (error: any) {
      console.log("TASKS ERROR =", error?.response?.data || error.message);
      Alert.alert("Erreur", "Impossible de charger les tâches.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadTasks]);

  const refresh = () => {
    setRefreshing(true);
    void loadTasks();
  };

  return {
    tasks,
    refreshing,
    refresh,
  };
}