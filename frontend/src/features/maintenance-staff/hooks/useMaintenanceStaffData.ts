import { useCallback, useEffect, useRef, useState } from "react";

import { maintenanceStaffService } from "../api/maintenanceStaff.service";

import type {
  MaintenanceAgentProfile,
  MaintenanceCertification,
  MaintenanceSkill,
  MaintenanceTeam,
} from "../types/maintenanceStaff.types";

type MaintenanceStaffData = {
  teams: MaintenanceTeam[];
  skills: MaintenanceSkill[];
  certifications: MaintenanceCertification[];
  agents: MaintenanceAgentProfile[];
};

const loadMaintenanceStaffData = async (): Promise<MaintenanceStaffData> => {
  const [teams, skills, certifications, agents] = await Promise.all([
    maintenanceStaffService.listTeams(),
    maintenanceStaffService.listSkills(),
    maintenanceStaffService.listCertifications(),
    maintenanceStaffService.listAgents(),
  ]);

  return {
    teams,
    skills,
    certifications,
    agents,
  };
};

export const useMaintenanceStaffData = () => {
  const [teams, setTeams] = useState<MaintenanceTeam[]>([]);
  const [skills, setSkills] = useState<MaintenanceSkill[]>([]);
  const [certifications, setCertifications] = useState<
    MaintenanceCertification[]
  >([]);
  const [agents, setAgents] = useState<MaintenanceAgentProfile[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateData = useCallback((data: MaintenanceStaffData) => {
    setTeams(data.teams);
    setSkills(data.skills);
    setCertifications(data.certifications);
    setAgents(data.agents);
  }, []);

  // À utiliser après ajout, modification ou suppression.
  const fetchData = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const data = await loadMaintenanceStaffData();

        if (!isMountedRef.current) {
          return;
        }

        updateData(data);
      } catch (err) {
        console.error(err);

        if (!isMountedRef.current) {
          return;
        }

        setError(
          "Impossible de charger les équipes, compétences, certifications et agents."
        );
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [updateData]
  );

  // Chargement initial : aucun setState synchrone avant la réponse API.
  useEffect(() => {
    let cancelled = false;

    void loadMaintenanceStaffData()
      .then((data) => {
        if (cancelled) {
          return;
        }

        updateData(data);
      })
      .catch((err) => {
        console.error(err);

        if (cancelled) {
          return;
        }

        setError(
          "Impossible de charger les équipes, compétences, certifications et agents."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [updateData]);

  return {
    teams,
    skills,
    certifications,
    agents,

    loading,
    error,

    refetch: fetchData,
  };
};