import { StyleSheet } from "react-native";
import { colors } from "../../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },

  team: {
    marginTop: 4,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },

  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  availabilityText: {
    fontSize: 12,
    fontWeight: "800",
  },

  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  availabilityPanel: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
  },

  availabilityOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },

  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },

  kpiCard: {
    flex: 1,
    minWidth: "42%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    alignItems: "center",
  },

  kpiValue: {
    fontSize: 34,
    fontWeight: "900",
  },

  kpiLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "700",
  },

  section: {
    padding: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primary,
  },

  seeAll: {
    color: "#3b82f6",
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },

  emptyText: {
    color: "#64748b",
    fontWeight: "700",
  },

  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },

  taskNumber: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "800",
    marginBottom: 4,
  },

  taskTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1e293b",
  },

  taskLocation: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },

  taskFooter: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  taskCategory: {
    fontSize: 12,
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "800",
  },

  taskStatus: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "800",
  },
});