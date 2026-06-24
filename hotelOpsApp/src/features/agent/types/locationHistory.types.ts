export type AgentLocationHistoryLocation = {
  id: number;
  name: string;
  code: string;
  type: string;
  zone?: string | null;
  floor?: string | null;
  roomNumber?: string | null;
  description?: string | null;
  isActive?: boolean;
};

export type AgentLocationHistorySummary = {
  totalInterventions: number;
  rootIncidents: number;
  followUpTickets: number;

  activeInterventions: number;
  inProgress: number;
  pending: number;
  partiallyResolved: number;
  resolved: number;
  closed: number;

  critical: number;
  overdue: number;

  repeatAssetCount: number;
  assetsMentionedCount: number;
  assetsNeverMentionedCount: number;

  totalTimeSpentMinutes: number;
  averageTimeSpentMinutes: number;
  averageResolutionHours: number;
};

export type AgentLocationHistoryBreakdown = {
  id: number;
  name: string;
  count: number;
  percentage: number;

  code?: string;
  color?: string | null;
  icon?: string | null;
  isFinal?: boolean;
};

export type AgentLocationHistoryAsset = {
  assetId: number;
  name: string;
  code: string;
  category?: string | null;
  icon?: string | null;

  ticketCount: number;
  incidentCount: number;
  isRepeated: boolean;

  openTicketCount: number;
  lastReportedAt?: string | null;
  topCategory?: string | null;
};

export type AgentLocationHistoryIntervention = {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;

  parentTicketId?: number | null;
  reportedFrom?: string | null;
  urgencyLevel?: number | null;
  progress?: number | null;

  dueAt?: string | null;
  acceptedAt?: string | null;
  startedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;

  resolutionNote?: string | null;
  temporaryFixNote?: string | null;
  followUpReason?: string | null;
  recommendedSpecialty?: string | null;
  requiresExpertIntervention?: boolean;

  timeSpentMinutes?: number | null;

  createdAt: string;
  updatedAt: string;

  isFollowUp: boolean;
  isOverdue: boolean;

  category: {
    id: number;
    name: string;
    icon?: string | null;
  };

  priority: {
    id: number;
    name: string;
    code: string;
    sortOrder: number;
  };

  status: {
    id: number;
    name: string;
    code: string;
    color?: string | null;
    isFinal: boolean;
  };

  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;

  ticketAssets: {
    id: number;
    assetId: number;
    asset: {
      id: number;
      name: string;
      code: string;
      category?: string | null;
      icon?: string | null;
    };
  }[];
};

export type AgentLocationHistoryResponse = {
  location: AgentLocationHistoryLocation;

  summary: AgentLocationHistorySummary;

  categoryBreakdown: AgentLocationHistoryBreakdown[];
  priorityBreakdown: AgentLocationHistoryBreakdown[];
  statusBreakdown: AgentLocationHistoryBreakdown[];

  assetHistory: AgentLocationHistoryAsset[];

  monthlyTrend: {
    key: string;
    label: string;
    count: number;
    resolvedCount: number;
  }[];

  interventions: AgentLocationHistoryIntervention[];
};