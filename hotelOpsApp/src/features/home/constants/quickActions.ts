export const quickActionsByRole: Record<
  string,
  { title: string; icon: any; desc: string }[]
> = {
  ADMIN: [
    {
      title: "Utilisateurs",
      icon: "account-group-outline",
      desc: "Gérer les comptes",
    },
    {
      title: "Tickets",
      icon: "wrench-outline",
      desc: "Suivre les demandes",
    },
    {
      title: "Statistiques",
      icon: "chart-box-outline",
      desc: "Analyser l’activité",
    },
  ],

  RECEPTION: [
    {
      title: "Tickets",
      icon: "ticket-outline",
      desc: "Demande client",
    },
    {
      title: "Chambres",
      icon: "bed-outline",
      desc: "Affectations",
    },
    {
      title: "Appels",
      icon: "phone-outline",
      desc: "Réception 24/7",
    },
  ],

  MAINTENANCE: [
    {
      title: "Interventions",
      icon: "tools",
      desc: "Travaux en cours",
    },
    {
      title: "Créer ticket",
      icon: "plus-circle-outline",
      desc: "Nouvelle panne",
    },
    {
      title: "Priorités",
      icon: "alert-circle-outline",
      desc: "Urgences",
    },
  ],

  CHEF_MAINT: [
    {
      title: "Équipe",
      icon: "account-hard-hat-outline",
      desc: "Affectations",
    },
    {
      title: "Tickets",
      icon: "clipboard-list-outline",
      desc: "Planification",
    },
    {
      title: "SLA",
      icon: "timer-outline",
      desc: "Délais",
    },
  ],

  USER: [
    {
      title: "Mes demandes",
      icon: "clipboard-text-outline",
      desc: "Historique",
    },
    {
      title: "Créer ticket",
      icon: "plus-box-outline",
      desc: "Signaler un problème",
    },
    {
      title: "Messages",
      icon: "message-text-outline",
      desc: "Suivi",
    },
  ],
};