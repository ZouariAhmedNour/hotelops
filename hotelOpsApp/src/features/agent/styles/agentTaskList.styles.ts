import { StyleSheet } from "react-native";
import { colors } from "../../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primary,
  },

  emptyText: {
    marginTop: 8,
    color: "#64748b",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ticketNumber: {
    color: "#94a3b8",
    fontWeight: "900",
    fontSize: 12,
  },

  title: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
  },

  meta: {
    marginTop: 8,
    color: "#64748b",
    fontWeight: "600",
  },

  footer: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  priority: {
    color: "#2563eb",
    fontWeight: "900",
  },

  progress: {
    color: colors.primary,
    fontWeight: "900",
  },
});