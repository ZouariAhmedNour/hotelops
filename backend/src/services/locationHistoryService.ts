import { prisma } from "../config/prisma";

const normalizeCode = (value?: string | null) => {
  return (value ?? "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
};

const isFinalStatus = (status: {
  code?: string | null;
  isFinal?: boolean | null;
}) => {
  const code = normalizeCode(status.code);

  return (
    status.isFinal === true ||
    code === "RESOLVED" ||
    code === "CLOSED" ||
    code === "CANCELLED" ||
    code === "CANCELED"
  );
};

const isPartiallyResolvedStatus = (status: {
  code?: string | null;
}) => {
  const code = normalizeCode(status.code);

  return (
    code === "PARTIALLY_RESOLVED" ||
    code === "PARTIAL_RESOLVED"
  );
};

const isFollowUpTicket = (ticket: {
  parentTicketId?: number | null;
  reportedFrom?: string | null;
}) => {
  return Boolean(ticket.parentTicketId) || ticket.reportedFrom === "agent_follow_up";
};

const percentage = (value: number, total: number) => {
  if (total <= 0) return 0;

  return Math.round((value / total) * 100);
};

const roundOneDecimal = (value: number) => {
  return Math.round(value * 10) / 10;
};

const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const buildMonthlyTrend = (
  tickets: Array<{
    createdAt: Date;
    resolvedAt: Date | null;
  }>
) => {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  });

  const now = new Date();
  const trend = [];

  for (let index = 5; index >= 0; index--) {
    const currentMonth = new Date(
      now.getFullYear(),
      now.getMonth() - index,
      1
    );

    trend.push({
      key: getMonthKey(currentMonth),
      label: formatter.format(currentMonth).replace(".", ""),
      count: 0,
      resolvedCount: 0,
    });
  }

  const trendMap = new Map(trend.map((item) => [item.key, item]));

  for (const ticket of tickets) {
    const createdPoint = trendMap.get(getMonthKey(ticket.createdAt));

    if (createdPoint) {
      createdPoint.count += 1;
    }

    if (ticket.resolvedAt) {
      const resolvedPoint = trendMap.get(getMonthKey(ticket.resolvedAt));

      if (resolvedPoint) {
        resolvedPoint.resolvedCount += 1;
      }
    }
  }

  return trend;
};

export const getLocationHistory = async (locationId: number) => {
  const location = await prisma.location.findUnique({
    where: {
      id: locationId,
    },
    include: {
      locationAssets: {
        where: {
          isActive: true,
          asset: {
            isActive: true,
          },
        },
        include: {
          asset: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },

      tickets: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
          priority: true,
          status: true,

          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },

          parentTicket: {
            select: {
              id: true,
              ticketNumber: true,
              title: true,
            },
          },

          ticketAssets: {
            include: {
              asset: true,
            },
          },
        },
      },
    },
  });

  if (!location) {
    throw Object.assign(new Error("Endroit introuvable"), {
      statusCode: 404,
    });
  }

  const now = new Date();
  const tickets = location.tickets;

  const categoryMap = new Map<
    number,
    {
      id: number;
      name: string;
      icon: string | null;
      count: number;
    }
  >();

  const priorityMap = new Map<
    number,
    {
      id: number;
      name: string;
      code: string;
      count: number;
    }
  >();

  const statusMap = new Map<
    number,
    {
      id: number;
      name: string;
      code: string;
      color: string | null;
      isFinal: boolean;
      count: number;
    }
  >();

  const assetMap = new Map<
    number,
    {
      assetId: number;
      name: string;
      code: string;
      category: string | null;
      icon: string | null;

      ticketCount: number;
      incidentIds: Set<number>;
      openTicketCount: number;
      lastReportedAt: Date | null;
      categoryCounts: Map<string, number>;
    }
  >();

  const rootIncidentIds = new Set<number>();

  let activeInterventions = 0;
  let inProgress = 0;
  let pending = 0;
  let partiallyResolved = 0;
  let resolved = 0;
  let closed = 0;
  let critical = 0;
  let overdue = 0;
  let followUpTickets = 0;

  let totalTimeSpentMinutes = 0;
  let ticketsWithTimeSpent = 0;

  let totalResolutionHours = 0;
  let resolvedTicketsWithDuration = 0;

  for (const ticket of tickets) {
    const statusCode = normalizeCode(ticket.status.code);
    const priorityCode = normalizeCode(ticket.priority.code);

    const ticketIsFinal = isFinalStatus(ticket.status);
    const ticketIsPartial = isPartiallyResolvedStatus(ticket.status);
    const ticketIsFollowUp = isFollowUpTicket(ticket);

    const rootIncidentId = ticket.parentTicketId ?? ticket.id;

    rootIncidentIds.add(rootIncidentId);

    if (ticketIsFollowUp) {
      followUpTickets += 1;
    }

    if (!ticketIsFinal && !ticketIsPartial) {
      activeInterventions += 1;
    }

    if (statusCode === "IN_PROGRESS") {
      inProgress += 1;
    }

    if (statusCode === "PENDING") {
      pending += 1;
    }

    if (ticketIsPartial) {
      partiallyResolved += 1;
    }

    if (statusCode === "RESOLVED") {
      resolved += 1;
    }

    if (statusCode === "CLOSED") {
      closed += 1;
    }

    if (priorityCode === "CRITICAL") {
      critical += 1;
    }

    if (
      ticket.dueAt &&
      ticket.dueAt.getTime() < now.getTime() &&
      !ticketIsFinal &&
      !ticketIsPartial
    ) {
      overdue += 1;
    }

    if (
      ticket.timeSpentMinutes !== null &&
      ticket.timeSpentMinutes !== undefined
    ) {
      totalTimeSpentMinutes += ticket.timeSpentMinutes;
      ticketsWithTimeSpent += 1;
    }

    if (ticket.resolvedAt) {
      const durationHours =
        (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) /
        3600000;

      if (durationHours >= 0) {
        totalResolutionHours += durationHours;
        resolvedTicketsWithDuration += 1;
      }
    }

    const categoryEntry = categoryMap.get(ticket.category.id) ?? {
      id: ticket.category.id,
      name: ticket.category.name,
      icon: ticket.category.icon ?? null,
      count: 0,
    };

    categoryEntry.count += 1;
    categoryMap.set(ticket.category.id, categoryEntry);

    const priorityEntry = priorityMap.get(ticket.priority.id) ?? {
      id: ticket.priority.id,
      name: ticket.priority.name,
      code: ticket.priority.code,
      count: 0,
    };

    priorityEntry.count += 1;
    priorityMap.set(ticket.priority.id, priorityEntry);

    const statusEntry = statusMap.get(ticket.status.id) ?? {
      id: ticket.status.id,
      name: ticket.status.name,
      code: ticket.status.code,
      color: ticket.status.color ?? null,
      isFinal: ticket.status.isFinal,
      count: 0,
    };

    statusEntry.count += 1;
    statusMap.set(ticket.status.id, statusEntry);

    for (const ticketAsset of ticket.ticketAssets) {
      const asset = ticketAsset.asset;

      const assetEntry = assetMap.get(asset.id) ?? {
        assetId: asset.id,
        name: asset.name,
        code: asset.code,
        category: asset.category ?? null,
        icon: asset.icon ?? null,

        ticketCount: 0,
        incidentIds: new Set<number>(),
        openTicketCount: 0,
        lastReportedAt: null,
        categoryCounts: new Map<string, number>(),
      };

      assetEntry.ticketCount += 1;
      assetEntry.incidentIds.add(rootIncidentId);

      if (!ticketIsFinal && !ticketIsPartial) {
        assetEntry.openTicketCount += 1;
      }

      if (
        !assetEntry.lastReportedAt ||
        ticket.createdAt.getTime() > assetEntry.lastReportedAt.getTime()
      ) {
        assetEntry.lastReportedAt = ticket.createdAt;
      }

      const categoryCount =
        assetEntry.categoryCounts.get(ticket.category.name) ?? 0;

      assetEntry.categoryCounts.set(
        ticket.category.name,
        categoryCount + 1
      );

      assetMap.set(asset.id, assetEntry);
    }
  }

  const totalInterventions = tickets.length;

  const categoryBreakdown = [...categoryMap.values()]
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      ...item,
      percentage: percentage(item.count, totalInterventions),
    }));

  const priorityBreakdown = [...priorityMap.values()]
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      ...item,
      percentage: percentage(item.count, totalInterventions),
    }));

  const statusBreakdown = [...statusMap.values()]
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      ...item,
      percentage: percentage(item.count, totalInterventions),
    }));

  const assetHistory = [...assetMap.values()]
    .map((item) => {
      const topCategory = [...item.categoryCounts.entries()].sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] ?? null;

      return {
        assetId: item.assetId,
        name: item.name,
        code: item.code,
        category: item.category,
        icon: item.icon,

        ticketCount: item.ticketCount,
        incidentCount: item.incidentIds.size,
        isRepeated: item.incidentIds.size >= 2,

        openTicketCount: item.openTicketCount,
        lastReportedAt: item.lastReportedAt,
        topCategory,
      };
    })
    .sort((a, b) => {
      if (b.incidentCount !== a.incidentCount) {
        return b.incidentCount - a.incidentCount;
      }

      if (b.ticketCount !== a.ticketCount) {
        return b.ticketCount - a.ticketCount;
      }

      return (
        (b.lastReportedAt?.getTime() ?? 0) -
        (a.lastReportedAt?.getTime() ?? 0)
      );
    });

  const recurringAssets = assetHistory.filter((asset) => asset.isRepeated);

  const interventions = tickets.map((ticket) => {
    const ticketIsFinal = isFinalStatus(ticket.status);
    const ticketIsPartial = isPartiallyResolvedStatus(ticket.status);

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,

      parentTicketId: ticket.parentTicketId,
      parentTicket: ticket.parentTicket,

      reportedFrom: ticket.reportedFrom,
      urgencyLevel: ticket.urgencyLevel,
      progress: ticket.progress,

      dueAt: ticket.dueAt,
      acceptedAt: ticket.acceptedAt,
      startedAt: ticket.startedAt,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,

      resolutionNote: ticket.resolutionNote,
      temporaryFixNote: ticket.temporaryFixNote,
      followUpReason: ticket.followUpReason,
      recommendedSpecialty: ticket.recommendedSpecialty,
      requiresExpertIntervention: ticket.requiresExpertIntervention,

      timeSpentMinutes: ticket.timeSpentMinutes,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,

      isFollowUp: isFollowUpTicket(ticket),
      isOverdue:
        Boolean(ticket.dueAt) &&
        ticket.dueAt!.getTime() < now.getTime() &&
        !ticketIsFinal &&
        !ticketIsPartial,

      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      assignedTo: ticket.assignedTo,

      ticketAssets: ticket.ticketAssets.map((ticketAsset) => ({
        id: ticketAsset.id,
        assetId: ticketAsset.assetId,
        asset: ticketAsset.asset,
      })),
    };
  });

  const { tickets: _tickets, ...locationData } = location;

  return {
    location: locationData,

    summary: {
      totalInterventions,
      rootIncidents: rootIncidentIds.size,
      followUpTickets,

      activeInterventions,
      inProgress,
      pending,
      partiallyResolved,
      resolved,
      closed,

      critical,
      overdue,

      repeatAssetCount: recurringAssets.length,
      assetsMentionedCount: assetHistory.length,
      assetsNeverMentionedCount: Math.max(
        0,
        location.locationAssets.length - assetHistory.length
      ),

      totalTimeSpentMinutes,
      averageTimeSpentMinutes:
        ticketsWithTimeSpent > 0
          ? Math.round(totalTimeSpentMinutes / ticketsWithTimeSpent)
          : 0,

      averageResolutionHours:
        resolvedTicketsWithDuration > 0
          ? roundOneDecimal(
              totalResolutionHours / resolvedTicketsWithDuration
            )
          : 0,
    },

    categoryBreakdown,
    priorityBreakdown,
    statusBreakdown,

    assetHistory,
    monthlyTrend: buildMonthlyTrend(tickets),

    interventions,
  };
};