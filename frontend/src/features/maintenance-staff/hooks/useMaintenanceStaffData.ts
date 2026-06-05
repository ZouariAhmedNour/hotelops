import { useCallback, useEffect, useState } from "react";
import { maintenanceStaffService } from "../api/maintenanceStaff.service";
import type {
  MaintenanceAgentProfile,
  MaintenanceSkill,
  MaintenanceTeam,
} from "../types/maintenanceStaff.types";

export const useMaintenanceStaffData = () => {
  const [teams, setTeams] = useState<MaintenanceTeam[]>([]);
  const [skills, setSkills] = useState<MaintenanceSkill[]>([]);
  const [agents, setAgents] = useState<MaintenanceAgentProfile[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const [teamsData, skillsData, agentsData] = await Promise.all([
        maintenanceStaffService.listTeams(),
        maintenanceStaffService.listSkills(),
        maintenanceStaffService.listAgents(),
      ]);

      setTeams(teamsData);
      setSkills(skillsData);
      setAgents(agentsData);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données équipes, compétences et agents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        const [teamsData, skillsData, agentsData] = await Promise.all([
          maintenanceStaffService.listTeams(),
          maintenanceStaffService.listSkills(),
          maintenanceStaffService.listAgents(),
        ]);

        if (!ignore) {
          setTeams(teamsData);
          setSkills(skillsData);
          setAgents(agentsData);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error(err);

        if (!ignore) {
          setError("Impossible de charger les données équipes, compétences et agents.");
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      ignore = true;
    };
  }, []);

  return {
    teams,
    skills,
    agents,
    loading,
    error,
    refetch: fetchData,
  };
};