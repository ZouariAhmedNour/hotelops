export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("fr-FR");
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString("fr-FR");
};