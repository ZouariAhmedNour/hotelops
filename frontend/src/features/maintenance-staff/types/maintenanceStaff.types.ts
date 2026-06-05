import type { User } from "../../../shared/types/auth.types";

export interface MaintenanceTeam {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  color?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    agents: number;
  };
}

export interface MaintenanceSkill {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  _count?: {
    agents: number;
  };
}

export interface MaintenanceAgentSkill {
  id: number;
  agentProfileId: number;
  skillId: number;
  level: number;
  skill: MaintenanceSkill;
}

export type MaintenanceAgentLevel = "JUNIOR" | "CONFIRMED" | "SENIOR" | "EXPERT";

export type MaintenanceAgentShift =
  | "DAY"
  | "NIGHT"
  | "MORNING"
  | "AFTERNOON"
  | "ON_CALL";

export type MaintenanceAgentAvailability =
  | "AVAILABLE"
  | "BUSY"
  | "OFFLINE"
  | "ON_LEAVE"
  | "ON_CALL";

export interface MaintenanceAgentProfile {
  id: number;
  userId: number;
  teamId?: number | null;
  employeeCode?: string | null;

  level: MaintenanceAgentLevel;
  shift: MaintenanceAgentShift;
  availabilityStatus: MaintenanceAgentAvailability | string;

  mainSpecialty?: string | null;
  canHandleCritical: boolean;
  maxActiveTickets: number;
  isOnCall: boolean;

  createdAt: string;
  updatedAt: string;

  user: User;
  team?: MaintenanceTeam | null;
  skills: MaintenanceAgentSkill[];
}

export interface CreateTeamPayload {
  name: string;
  code: string;
  description?: string;
  color?: string;
}

export interface UpdateTeamPayload {
  name?: string;
  code?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface CreateSkillPayload {
  name: string;
  code: string;
}

export interface UpdateSkillPayload {
  name?: string;
  code?: string;
  isActive?: boolean;
}

export interface CreateAgentPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;

  teamId?: number;
  employeeCode?: string;

  level: MaintenanceAgentLevel;
  shift: MaintenanceAgentShift;
  availabilityStatus?: MaintenanceAgentAvailability | string;

  mainSpecialty?: string;
  canHandleCritical?: boolean;
  maxActiveTickets?: number;
  skillIds?: number[];
}

export interface UpdateAgentPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;

  teamId?: number | null;
  employeeCode?: string;

  level?: MaintenanceAgentLevel;
  shift?: MaintenanceAgentShift;
  availabilityStatus?: MaintenanceAgentAvailability | string;

  mainSpecialty?: string;
  canHandleCritical?: boolean;
  maxActiveTickets?: number;
  skillIds?: number[];
}

export interface AgentRecommendation {
  agent: MaintenanceAgentProfile;
  score: number;
  reasons: string[];
  activeTicketsCount: number;
  loadPct: number;
}

export interface AgentRecommendationParams {
  ticketId?: number;
  categoryId?: number;
  priorityId?: number;
}