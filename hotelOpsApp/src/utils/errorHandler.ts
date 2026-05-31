export function getErrorMessage(error: any, fallback = "Une erreur est survenue.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}