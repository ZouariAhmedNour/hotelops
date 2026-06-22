export const ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",

  DASHBOARD: "/dashboard",

  TICKETS: "/tickets",
  TICKET_CREATE: "/tickets/new",
  TICKET_DETAIL: "/tickets/:id",

  USERS: "/users",
  HOUSEKEEPING: "/housekeeping",
  STOCKS: "/stocks",
  FINANCE: "/finance",
  REPORTS: "/reports",

  MAINTENANCE_STAFF: "/maintenance/staff",
  MAINTENANCE_STAFF_STATS: "/maintenance/staff/stats",
  MAINTENANCE_STAFF_TEAMS: "/maintenance/staff/teams",
  MAINTENANCE_STAFF_SKILLS: "/maintenance/staff/skills",
  MAINTENANCE_STAFF_CERTIFICATIONS: "/maintenance/staff/certifications",
  MAINTENANCE_STAFF_AGENT_CREATE: "/maintenance/staff/agents/new",
  MAINTENANCE_STAFF_AGENTS: "/maintenance/staff/agents",
  MAINTENANCE_STAFF_AGENT_DETAIL: "/maintenance/staff/agents/:id",

  LOCATIONS: "/locations",
  ASSETS: "/assets",
  QR_CODES: "/qr-codes",


} as const;