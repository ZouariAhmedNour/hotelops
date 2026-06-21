import type { MaintenanceTicket } from "../../maintenance/types/maintenance.types";
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
    agents?: number;
    certificationLinks?: number;
    safetyRuleRequirements?: number;
  };
}

export interface MaintenanceCertificationSkill {
  id: number;
  certificationId: number;
  skillId: number;
  skill: MaintenanceSkill;
}

export interface MaintenanceCertification {
  id: number;
  name: string;
  code: string;
  description?: string | null;

  requiresExpiry: boolean;
  validityMonths?: number | null;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  skillLinks: MaintenanceCertificationSkill[];

  _count?: {
    agentCertifications?: number;
    safetyRuleRequirements?: number;
  };
}

export type AgentCertificationStatus =
  | "VALID"
  | "EXPIRED"
  | "PENDING"
  | "REVOKED";

export interface MaintenanceAgentSkill {
  id: number;
  agentProfileId: number;
  skillId: number;
  level: number;
  skill: MaintenanceSkill;
}

export interface MaintenanceAgentCertification {
  id: number;
  agentProfileId: number;
  certificationId: number;

  issuedAt?: string | null;
  expiresAt?: string | null;

  provider?: string | null;
  certificateNumber?: string | null;

  status: AgentCertificationStatus | string;

  createdAt: string;
  updatedAt: string;

  certification: MaintenanceCertification;
}

export type MaintenanceAgentLevel =
  | "JUNIOR"
  | "CONFIRMED"
  | "SENIOR"
  | "EXPERT";

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
  certifications: MaintenanceAgentCertification[];

  assignedTickets?: MaintenanceTicket[];
  activeTicketsCount?: number;
  resolvedTicketsCount?: number;
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

export interface CreateCertificationPayload {
  name: string;
  code: string;
  description?: string;

  requiresExpiry?: boolean;
  validityMonths?: number | null;

  skillIds?: number[];
}

export interface UpdateCertificationPayload {
  name?: string;
  code?: string;
  description?: string;

  requiresExpiry?: boolean;
  validityMonths?: number | null;

  skillIds?: number[];
  isActive?: boolean;
}

export interface AgentSkillPayload {
  skillId: number;
  level: number;
}

export interface AgentCertificationPayload {
  certificationId: number;

  issuedAt?: string;
  expiresAt?: string;

  provider?: string;
  certificateNumber?: string;

  status?: AgentCertificationStatus;
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

  skills?: AgentSkillPayload[];

  // Compatibilité ancienne version backend
  skillIds?: number[];

  certifications?: AgentCertificationPayload[];
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

  skills?: AgentSkillPayload[];

  // Compatibilité ancienne version backend
  skillIds?: number[];

  certifications?: AgentCertificationPayload[];
}

export type TicketRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SafetySkillRequirement {
  code: string;
  name: string;
  minimumLevel: number;
}

export interface SafetyCertificationRequirement {
  code: string;
  name: string;
}

export interface SafetyAssessment {
  riskLevel: TicketRiskLevel;
  riskScore: number;
  requiresCertifiedAgent: boolean;

  requiredSkillCodes: string[];
  requiredCertificationCodes: string[];

  requiredSkillRequirements: SafetySkillRequirement[];
  requiredCertificationRequirements: SafetyCertificationRequirement[];

  safetyReasons: string[];
  appliedRuleCodes: string[];
}

export interface MissingSkill {
  code: string;
  name: string;
  requiredLevel: number;
  agentLevel?: number;
}

export interface MissingCertification {
  code: string;
  name: string;
}

export interface ExpiredCertification {
  code: string;
  name: string;
  expiresAt?: string | null;
}

export interface RecommendationAgentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface RecommendationAgent {
  id: number;
  userId: number;
  teamId?: number | null;
  employeeCode?: string | null;

  level: MaintenanceAgentLevel | string;
  shift: MaintenanceAgentShift | string;
  availabilityStatus: string;

  mainSpecialty?: string | null;
  canHandleCritical: boolean;
  maxActiveTickets: number;
  isOnCall: boolean;

  createdAt: string;
  updatedAt: string;

  user: RecommendationAgentUser;
  team?: MaintenanceTeam | null;

  skills: MaintenanceAgentSkill[];
  certifications: MaintenanceAgentCertification[];
}

export interface AgentRecommendation {
  agent: RecommendationAgent;

  score: number;
  reasons: string[];

  safetyEligible: boolean;

  missingSkills: MissingSkill[];
  missingCertifications: MissingCertification[];
  expiredCertifications: ExpiredCertification[];

  criticalAuthorizationMissing: boolean;
  safetyReasons: string[];

  activeTicketsCount: number;
  loadPct: number;
}

export interface AgentRecommendationsResponse {
  safetyAssessment: SafetyAssessment;

  // Maintenu pour compatibilité
  recommendations: AgentRecommendation[];

  eligibleAgents: AgentRecommendation[];
  blockedAgents: AgentRecommendation[];
}

export interface AgentRecommendationParams {
  ticketId?: number;
  categoryId?: number;
  priorityId?: number;
}