import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

import { agentMobileService } from "../api/agentMobile.service";

export function useAgentHome() {
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [meData, tasksData] = await Promise.all([
        agentMobileService.getMe(),
        agentMobileService.getTasks({
          limit: 5,
        }),
      ]);

      setProfile(meData);
      setTasks(tasksData.tasks || []);
    } catch (error: any) {
      console.log("AGENT HOME ERROR =", error?.response?.data || error.message);
      Alert.alert("Erreur", "Impossible de charger l’espace agent.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  const refresh = () => {
    setRefreshing(true);
    void loadData();
  };

  const changeAvailability = async (code: string) => {
    try {
      await agentMobileService.updateAvailability(code);
      setShowAvailability(false);
      await loadData();
    } catch (error: any) {
      console.log(
        "AVAILABILITY ERROR =",
        error?.response?.data || error.message
      );
      Alert.alert("Erreur", "Impossible de mettre à jour la disponibilité.");
    }
  };

  return {
    profile,
    tasks,
    refreshing,
    showAvailability,
    setShowAvailability,
    refresh,
    changeAvailability,
  };
}