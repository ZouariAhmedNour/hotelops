-- DropForeignKey
ALTER TABLE "MaintenanceAgentSkill" DROP CONSTRAINT "MaintenanceAgentSkill_agentProfileId_fkey";

-- CreateTable
CREATE TABLE "MaintenanceCertification" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "requiresExpiry" BOOLEAN NOT NULL DEFAULT false,
    "validityMonths" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceCertificationSkill" (
    "id" SERIAL NOT NULL,
    "certificationId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "MaintenanceCertificationSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceAgentCertification" (
    "id" SERIAL NOT NULL,
    "agentProfileId" INTEGER NOT NULL,
    "certificationId" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "provider" TEXT,
    "certificateNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceAgentCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSafetyRule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" INTEGER,
    "triggerKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "riskLevel" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "requiresCertifiedAgent" BOOLEAN NOT NULL DEFAULT false,
    "minPriorityCode" TEXT,
    "minUrgencyLevel" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceSafetyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSafetyRuleSkillRequirement" (
    "id" SERIAL NOT NULL,
    "safetyRuleId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "minimumLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MaintenanceSafetyRuleSkillRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSafetyRuleCertificationRequirement" (
    "id" SERIAL NOT NULL,
    "safetyRuleId" INTEGER NOT NULL,
    "certificationId" INTEGER NOT NULL,

    CONSTRAINT "MaintenanceSafetyRuleCertificationRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTicketRiskAssessment" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "requiresCertifiedAgent" BOOLEAN NOT NULL DEFAULT false,
    "requiredSkillCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredCertificationCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "safetyReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "appliedRuleCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceTicketRiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceCertification_name_key" ON "MaintenanceCertification"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceCertification_code_key" ON "MaintenanceCertification"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceCertificationSkill_certificationId_skillId_key" ON "MaintenanceCertificationSkill"("certificationId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceAgentCertification_agentProfileId_certificationI_key" ON "MaintenanceAgentCertification"("agentProfileId", "certificationId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceSafetyRule_code_key" ON "MaintenanceSafetyRule"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceSafetyRuleSkillRequirement_safetyRuleId_skillId_key" ON "MaintenanceSafetyRuleSkillRequirement"("safetyRuleId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceSafetyRuleCertificationRequirement_safetyRuleId__key" ON "MaintenanceSafetyRuleCertificationRequirement"("safetyRuleId", "certificationId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceTicketRiskAssessment_ticketId_key" ON "MaintenanceTicketRiskAssessment"("ticketId");

-- AddForeignKey
ALTER TABLE "MaintenanceAgentSkill" ADD CONSTRAINT "MaintenanceAgentSkill_agentProfileId_fkey" FOREIGN KEY ("agentProfileId") REFERENCES "MaintenanceAgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceCertificationSkill" ADD CONSTRAINT "MaintenanceCertificationSkill_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "MaintenanceCertification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceCertificationSkill" ADD CONSTRAINT "MaintenanceCertificationSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "MaintenanceSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAgentCertification" ADD CONSTRAINT "MaintenanceAgentCertification_agentProfileId_fkey" FOREIGN KEY ("agentProfileId") REFERENCES "MaintenanceAgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAgentCertification" ADD CONSTRAINT "MaintenanceAgentCertification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "MaintenanceCertification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSafetyRule" ADD CONSTRAINT "MaintenanceSafetyRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MaintenanceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSafetyRuleSkillRequirement" ADD CONSTRAINT "MaintenanceSafetyRuleSkillRequirement_safetyRuleId_fkey" FOREIGN KEY ("safetyRuleId") REFERENCES "MaintenanceSafetyRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSafetyRuleSkillRequirement" ADD CONSTRAINT "MaintenanceSafetyRuleSkillRequirement_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "MaintenanceSkill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSafetyRuleCertificationRequirement" ADD CONSTRAINT "MaintenanceSafetyRuleCertificationRequirement_safetyRuleId_fkey" FOREIGN KEY ("safetyRuleId") REFERENCES "MaintenanceSafetyRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSafetyRuleCertificationRequirement" ADD CONSTRAINT "MaintenanceSafetyRuleCertificationRequirement_certificatio_fkey" FOREIGN KEY ("certificationId") REFERENCES "MaintenanceCertification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicketRiskAssessment" ADD CONSTRAINT "MaintenanceTicketRiskAssessment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MaintenanceTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
