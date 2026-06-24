import { useCallback, useEffect, useState } from "react";

import { agentMobileService } from "../api/agentMobile.service";
import type { AgentLocationHistoryResponse } from "../types/locationHistory.types";

export function useAgentLocationHistory(locationId: number) {
  const [history, setHistory] =
    useState<AgentLocationHistoryResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(
    async (isRefresh = false) => {
      if (!Number.isInteger(locationId) || locationId <= 0) {
        setError("Identifiant de localisation invalide.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await agentMobileService.getLocationHistory(locationId);

        setHistory(data);
        setError("");
      } catch (err: any) {
        console.log(
          "LOCATION HISTORY ERROR =",
          err?.response?.data || err?.message || err
        );

        setHistory(null);

        setError(
          err?.response?.data?.message ||
            "Impossible de charger l’historique de cet endroit."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [locationId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadHistory();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadHistory]);

  const refresh = () => {
    void loadHistory(true);
  };

  return {
    history,
    loading,
    refreshing,
    error,
    refresh,
    retry: () => {
      void loadHistory();
    },
  };
}