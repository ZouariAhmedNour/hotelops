import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

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
  riskLevel: RiskLevel;
  riskScore: number;
  requiresCertifiedAgent: boolean;

  requiredSkillCodes: string[];
  requiredCertificationCodes: string[];

  requiredSkillRequirements: SafetySkillRequirement[];
  requiredCertificationRequirements: SafetyCertificationRequirement[];

  safetyReasons: string[];
  appliedRuleCodes: string[];
}

export interface SafetyTicketContext {
  title: string;
  description: string;
  urgencyLevel?: number | null;

  category?: {
    id: number;
    name: string;
  } | null;

  priority?: {
    code: string;
    name: string;
  } | null;

  location?: {
    id: number;
    name: string;
    code: string;
    type: string;
    zone?: string | null;
    floor?: string | null;
  } | null;
}

export interface AgentSafetyCandidate {
  canHandleCritical: boolean;

  skills: Array<{
    level: number;
    skill: {
      code: string;
      name: string;
    };
  }>;

  certifications: Array<{
    status: string;
    expiresAt: Date | null;
    certification: {
      code: string;
      name: string;
      isActive: boolean;
    };
  }>;
}

export interface AgentSafetyEligibility {
  safetyEligible: boolean;

  missingSkills: Array<{
    code: string;
    name: string;
    requiredLevel: number;
    agentLevel?: number;
  }>;

  missingCertifications: Array<{
    code: string;
    name: string;
  }>;

  expiredCertifications: Array<{
    code: string;
    name: string;
    expiresAt?: Date | null;
  }>;

  criticalAuthorizationMissing: boolean;
  safetyReasons: string[];
}

type DbClient = Prisma.TransactionClient | typeof prisma;

const normalizeText = (value?: string | null) => {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const riskRank: Record<RiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

const priorityRank = (code?: string | null) => {
  const normalized = (code ?? "").trim().toUpperCase();

  const ranks: Record<string, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  return ranks[normalized] ?? 0;
};

const priorityBaseScore = (code?: string | null) => {
  const normalized = (code ?? "").trim().toUpperCase();

  const scores: Record<string, number> = {
    LOW: 0,
    MEDIUM: 5,
    HIGH: 15,
    CRITICAL: 25,
  };

  return scores[normalized] ?? 0;
};

const levelFromScore = (score: number): RiskLevel => {
  if (score >= 75) return "CRITICAL";
  if (score >= 45) return "HIGH";
  if (score >= 20) return "MEDIUM";

  return "LOW";
};

const getHighestRiskLevel = (
  current: RiskLevel,
  candidate: RiskLevel
): RiskLevel => {
  return riskRank[candidate] > riskRank[current] ? candidate : current;
};

const getUrgencyScore = (urgencyLevel?: number | null) => {
  if (!urgencyLevel) return 0;
  if (urgencyLevel >= 5) return 15;
  if (urgencyLevel >= 4) return 8;
  if (urgencyLevel >= 3) return 3;

  return 0;
};

export const assessTicketSafety = async (
  input: SafetyTicketContext
): Promise<SafetyAssessment> => {
  const rules = await prisma.maintenanceSafetyRule.findMany({
    where: {
      isActive: true,
    },
    include: {
      skillRequirements: {
        include: {
          skill: true,
        },
      },
      certificationRequirements: {
        include: {
          certification: true,
        },
      },
    },
    orderBy: [
      {
        riskScore: "desc",
      },
      {
        id: "asc",
      },
    ],
  });

  const normalizedCorpus = normalizeText(
    [
      input.title,
      input.description,
      input.category?.name,
      input.priority?.name,
      input.priority?.code,
      input.location?.name,
      input.location?.code,
      input.location?.type,
      input.location?.zone,
      input.location?.floor,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const appliedRules: Array<{
    code: string;
    name: string;
    riskLevel: RiskLevel;
    riskScore: number;
    matchedKeywords: string[];
    skillRequirements: SafetySkillRequirement[];
    certificationRequirements: SafetyCertificationRequirement[];
    requiresCertifiedAgent: boolean;
  }> = [];

  for (const rule of rules) {
    const matchingKeywords = rule.triggerKeywords.filter((keyword) => {
      const normalizedKeyword = normalizeText(keyword);

      return (
        normalizedKeyword.length > 0 &&
        normalizedCorpus.includes(normalizedKeyword)
      );
    });

    const categoryMatches =
      Boolean(rule.categoryId) && rule.categoryId === input.category?.id;

    const hasTrigger = matchingKeywords.length > 0 || categoryMatches;

    if (!hasTrigger) {
      continue;
    }

    const priorityMatches =
      !rule.minPriorityCode ||
      priorityRank(input.priority?.code) >= priorityRank(rule.minPriorityCode);

    const urgencyMatches =
      !rule.minUrgencyLevel ||
      Number(input.urgencyLevel ?? 0) >= rule.minUrgencyLevel;

    if (!priorityMatches || !urgencyMatches) {
      continue;
    }

    appliedRules.push({
      code: rule.code,
      name: rule.name,
      riskLevel: rule.riskLevel as RiskLevel,
      riskScore: rule.riskScore,
      matchedKeywords: matchingKeywords,
      requiresCertifiedAgent: rule.requiresCertifiedAgent,

      skillRequirements: rule.skillRequirements.map((item) => ({
        code: item.skill.code,
        name: item.skill.name,
        minimumLevel: item.minimumLevel,
      })),

      certificationRequirements: rule.certificationRequirements.map(
        (item) => ({
          code: item.certification.code,
          name: item.certification.name,
        })
      ),
    });
  }

  const skillRequirementsMap = new Map<string, SafetySkillRequirement>();
  const certificationRequirementsMap = new Map<
    string,
    SafetyCertificationRequirement
  >();

  let riskLevel: RiskLevel = "LOW";
  let score =
    priorityBaseScore(input.priority?.code) + getUrgencyScore(input.urgencyLevel);

  const safetyReasons: string[] = [];

  const priorityCode = input.priority?.code?.toUpperCase();

  if (priorityCode === "CRITICAL") {
    riskLevel = getHighestRiskLevel(riskLevel, "HIGH");
    safetyReasons.push("Priorité critique déclarée sur le ticket.");
  }

  if (priorityCode === "HIGH") {
    riskLevel = getHighestRiskLevel(riskLevel, "MEDIUM");
    safetyReasons.push("Priorité haute déclarée sur le ticket.");
  }

  if (Number(input.urgencyLevel ?? 0) >= 4) {
    safetyReasons.push(
      `Niveau d’urgence élevé : ${Number(input.urgencyLevel)} / 5.`
    );
  }

  for (const rule of appliedRules) {
    score += rule.riskScore;
    riskLevel = getHighestRiskLevel(riskLevel, rule.riskLevel);

    for (const requirement of rule.skillRequirements) {
      const existing = skillRequirementsMap.get(requirement.code);

      if (!existing || requirement.minimumLevel > existing.minimumLevel) {
        skillRequirementsMap.set(requirement.code, requirement);
      }
    }

    for (const requirement of rule.certificationRequirements) {
      certificationRequirementsMap.set(requirement.code, requirement);
    }

    if (rule.matchedKeywords.length > 0) {
      safetyReasons.push(
        `Règle "${rule.name}" déclenchée par : ${rule.matchedKeywords.join(", ")}.`
      );
    } else {
      safetyReasons.push(
        `Règle "${rule.name}" déclenchée par la catégorie du ticket.`
      );
    }
  }

  score = Math.min(100, score);

  riskLevel = getHighestRiskLevel(riskLevel, levelFromScore(score));

  if (appliedRules.length === 0) {
    safetyReasons.push(
      "Aucune règle de sécurité spécifique n’a été déclenchée."
    );
  }

  const requiredSkillRequirements = Array.from(
    skillRequirementsMap.values()
  );

  const requiredCertificationRequirements = Array.from(
    certificationRequirementsMap.values()
  );

  return {
    riskLevel,
    riskScore: score,

    requiresCertifiedAgent: appliedRules.some(
      (rule) => rule.requiresCertifiedAgent
    ),

    requiredSkillCodes: requiredSkillRequirements.map((item) => item.code),
    requiredCertificationCodes: requiredCertificationRequirements.map(
      (item) => item.code
    ),

    requiredSkillRequirements,
    requiredCertificationRequirements,

    safetyReasons,
    appliedRuleCodes: appliedRules.map((rule) => rule.code),
  };
};

export const persistTicketRiskAssessment = async (
  client: DbClient,
  ticketId: number,
  assessment: SafetyAssessment
) => {
  return client.maintenanceTicketRiskAssessment.upsert({
    where: {
      ticketId,
    },
    create: {
      ticketId,
      riskLevel: assessment.riskLevel,
      riskScore: assessment.riskScore,
      requiresCertifiedAgent: assessment.requiresCertifiedAgent,
      requiredSkillCodes: assessment.requiredSkillCodes,
      requiredCertificationCodes: assessment.requiredCertificationCodes,
      safetyReasons: assessment.safetyReasons,
      appliedRuleCodes: assessment.appliedRuleCodes,
      evaluatedAt: new Date(),
    },
    update: {
      riskLevel: assessment.riskLevel,
      riskScore: assessment.riskScore,
      requiresCertifiedAgent: assessment.requiresCertifiedAgent,
      requiredSkillCodes: assessment.requiredSkillCodes,
      requiredCertificationCodes: assessment.requiredCertificationCodes,
      safetyReasons: assessment.safetyReasons,
      appliedRuleCodes: assessment.appliedRuleCodes,
      evaluatedAt: new Date(),
    },
  });
};

export const evaluateAgentSafetyEligibility = (
  agent: AgentSafetyCandidate,
  assessment: SafetyAssessment
): AgentSafetyEligibility => {
  const now = new Date();

  const missingSkills: AgentSafetyEligibility["missingSkills"] = [];
  const missingCertifications: AgentSafetyEligibility["missingCertifications"] =
    [];
  const expiredCertifications: AgentSafetyEligibility["expiredCertifications"] =
    [];

  for (const requirement of assessment.requiredSkillRequirements) {
    const agentSkill = agent.skills.find(
      (item) => item.skill.code === requirement.code
    );

    if (!agentSkill) {
      missingSkills.push({
        code: requirement.code,
        name: requirement.name,
        requiredLevel: requirement.minimumLevel,
      });

      continue;
    }

    if (agentSkill.level < requirement.minimumLevel) {
      missingSkills.push({
        code: requirement.code,
        name: requirement.name,
        requiredLevel: requirement.minimumLevel,
        agentLevel: agentSkill.level,
      });
    }
  }

  for (const requirement of assessment.requiredCertificationRequirements) {
    const matchingCertifications = agent.certifications.filter(
      (item) => item.certification.code === requirement.code
    );

    const hasValidCertification = matchingCertifications.some((item) => {
      const validStatus = item.status.toUpperCase() === "VALID";

      const notExpired =
        !item.expiresAt || item.expiresAt.getTime() >= now.getTime();

      return item.certification.isActive && validStatus && notExpired;
    });

    if (hasValidCertification) {
      continue;
    }

    const expiredCertification = matchingCertifications.find((item) => {
      const statusExpired = item.status.toUpperCase() === "EXPIRED";

      const dateExpired =
        Boolean(item.expiresAt) &&
        item.expiresAt!.getTime() < now.getTime();

      return statusExpired || dateExpired;
    });

    if (expiredCertification) {
      expiredCertifications.push({
        code: requirement.code,
        name: requirement.name,
        expiresAt: expiredCertification.expiresAt,
      });

      continue;
    }

    missingCertifications.push({
      code: requirement.code,
      name: requirement.name,
    });
  }

  const criticalAuthorizationMissing =
    assessment.requiresCertifiedAgent &&
    assessment.riskLevel === "CRITICAL" &&
    !agent.canHandleCritical;

  const safetyEligible =
    missingSkills.length === 0 &&
    missingCertifications.length === 0 &&
    expiredCertifications.length === 0 &&
    !criticalAuthorizationMissing;

  const safetyReasons: string[] = [];

  if (missingSkills.length > 0) {
    safetyReasons.push(
      `Compétences insuffisantes : ${missingSkills
        .map((item) => item.code)
        .join(", ")}.`
    );
  }

  if (missingCertifications.length > 0) {
    safetyReasons.push(
      `Certifications manquantes : ${missingCertifications
        .map((item) => item.code)
        .join(", ")}.`
    );
  }

  if (expiredCertifications.length > 0) {
    safetyReasons.push(
      `Certifications expirées : ${expiredCertifications
        .map((item) => item.code)
        .join(", ")}.`
    );
  }

  if (criticalAuthorizationMissing) {
    safetyReasons.push(
      "L’agent n’est pas autorisé à gérer une intervention critique."
    );
  }

  if (safetyEligible && assessment.requiresCertifiedAgent) {
    safetyReasons.push(
      "Compétences et certifications de sécurité conformes."
    );
  }

  return {
    safetyEligible,
    missingSkills,
    missingCertifications,
    expiredCertifications,
    criticalAuthorizationMissing,
    safetyReasons,
  };
};