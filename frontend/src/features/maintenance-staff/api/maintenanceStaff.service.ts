import apiClient from "../../../shared/api/apiClient";
import type { ApiResponse } from "../../../shared/types/api.types";

import type {
  AgentRecommendationParams,
  AgentRecommendationsResponse,
  CreateAgentPayload,
  CreateCertificationPayload,
  CreateSkillPayload,
  CreateTeamPayload,
  MaintenanceAgentProfile,
  MaintenanceCertification,
  MaintenanceSkill,
  MaintenanceTeam,
  UpdateAgentPayload,
  UpdateCertificationPayload,
  UpdateSkillPayload,
  UpdateTeamPayload,
} from "../types/maintenanceStaff.types";

export const maintenanceStaffService = {
  // =========================
  // TEAMS
  // =========================

  listTeams: async (): Promise<MaintenanceTeam[]> => {
    const res = await apiClient.get<ApiResponse<MaintenanceTeam[]>>(
      "/maintenance-teams"
    );

    return res.data.data;
  },

  getTeamById: async (id: number): Promise<MaintenanceTeam> => {
    const res = await apiClient.get<ApiResponse<MaintenanceTeam>>(
      `/maintenance-teams/${id}`
    );

    return res.data.data;
  },

  createTeam: async (payload: CreateTeamPayload): Promise<MaintenanceTeam> => {
    const res = await apiClient.post<ApiResponse<MaintenanceTeam>>(
      "/maintenance-teams",
      payload
    );

    return res.data.data;
  },

  updateTeam: async (
    id: number,
    payload: UpdateTeamPayload
  ): Promise<MaintenanceTeam> => {
    const res = await apiClient.put<ApiResponse<MaintenanceTeam>>(
      `/maintenance-teams/${id}`,
      payload
    );

    return res.data.data;
  },

  deleteTeam: async (id: number): Promise<MaintenanceTeam> => {
    const res = await apiClient.delete<ApiResponse<MaintenanceTeam>>(
      `/maintenance-teams/${id}`
    );

    return res.data.data;
  },

  // =========================
  // SKILLS
  // =========================

  listSkills: async (): Promise<MaintenanceSkill[]> => {
    const res = await apiClient.get<ApiResponse<MaintenanceSkill[]>>(
      "/maintenance-skills"
    );

    return res.data.data;
  },

  createSkill: async (
    payload: CreateSkillPayload
  ): Promise<MaintenanceSkill> => {
    const res = await apiClient.post<ApiResponse<MaintenanceSkill>>(
      "/maintenance-skills",
      payload
    );

    return res.data.data;
  },

  updateSkill: async (
    id: number,
    payload: UpdateSkillPayload
  ): Promise<MaintenanceSkill> => {
    const res = await apiClient.put<ApiResponse<MaintenanceSkill>>(
      `/maintenance-skills/${id}`,
      payload
    );

    return res.data.data;
  },

  deleteSkill: async (id: number): Promise<MaintenanceSkill> => {
    const res = await apiClient.delete<ApiResponse<MaintenanceSkill>>(
      `/maintenance-skills/${id}`
    );

    return res.data.data;
  },

  // =========================
  // CERTIFICATIONS
  // =========================

  listCertifications: async (): Promise<MaintenanceCertification[]> => {
    const res = await apiClient.get<ApiResponse<MaintenanceCertification[]>>(
      "/certifications"
    );

    return res.data.data;
  },

  getCertificationById: async (
    id: number
  ): Promise<MaintenanceCertification> => {
    const res = await apiClient.get<ApiResponse<MaintenanceCertification>>(
      `/certifications/${id}`
    );

    return res.data.data;
  },

  createCertification: async (
    payload: CreateCertificationPayload
  ): Promise<MaintenanceCertification> => {
    const res = await apiClient.post<ApiResponse<MaintenanceCertification>>(
      "/certifications",
      payload
    );

    return res.data.data;
  },

  updateCertification: async (
    id: number,
    payload: UpdateCertificationPayload
  ): Promise<MaintenanceCertification> => {
    const res = await apiClient.put<ApiResponse<MaintenanceCertification>>(
      `/certifications/${id}`,
      payload
    );

    return res.data.data;
  },

  deleteCertification: async (
    id: number
  ): Promise<MaintenanceCertification> => {
    const res = await apiClient.delete<ApiResponse<MaintenanceCertification>>(
      `/certifications/${id}`
    );

    return res.data.data;
  },

  // =========================
  // AGENTS
  // =========================

  listAgents: async (): Promise<MaintenanceAgentProfile[]> => {
    const res = await apiClient.get<ApiResponse<MaintenanceAgentProfile[]>>(
      "/agents"
    );

    return res.data.data;
  },

  getAgentById: async (id: number): Promise<MaintenanceAgentProfile> => {
    const res = await apiClient.get<ApiResponse<MaintenanceAgentProfile>>(
      `/agents/${id}`
    );

    return res.data.data;
  },

  createAgent: async (
    payload: CreateAgentPayload
  ): Promise<MaintenanceAgentProfile> => {
    const res = await apiClient.post<ApiResponse<MaintenanceAgentProfile>>(
      "/agents",
      payload
    );

    return res.data.data;
  },

  updateAgent: async (
    id: number,
    payload: UpdateAgentPayload
  ): Promise<MaintenanceAgentProfile> => {
    const res = await apiClient.put<ApiResponse<MaintenanceAgentProfile>>(
      `/agents/${id}`,
      payload
    );

    return res.data.data;
  },

  deleteAgent: async (id: number): Promise<MaintenanceAgentProfile> => {
    const res = await apiClient.delete<ApiResponse<MaintenanceAgentProfile>>(
      `/agents/${id}`
    );

    return res.data.data;
  },

  // =========================
  // RECOMMANDATIONS SÉCURISÉES
  // =========================

  getRecommendations: async (
    params: AgentRecommendationParams
  ): Promise<AgentRecommendationsResponse> => {
    const res = await apiClient.get<ApiResponse<AgentRecommendationsResponse>>(
      "/agents/recommendations",
      {
        params,
      }
    );

    return res.data.data;
  },
};