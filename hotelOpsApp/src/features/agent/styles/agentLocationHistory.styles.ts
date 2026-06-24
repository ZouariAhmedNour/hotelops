import { StyleSheet } from "react-native";

import { colors } from "../../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 42,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  hero: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: colors.primary,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  heroLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  heroTitle: {
    marginTop: 3,
    color: "#ffffff",
    fontSize: 23,
    fontWeight: "900",
  },

  heroMeta: {
    marginTop: 5,
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "600",
  },

  heroText: {
    marginTop: 18,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 21,
    fontSize: 13,
    fontWeight: "600",
  },

  kpiGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  kpiCard: {
    width: "48%",
    minHeight: 174,
    marginBottom: 12,
    borderRadius: 20,
    padding: 15,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },

  kpiTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  kpiContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  kpiIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    marginLeft: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  kpiLabel: {
    flexShrink: 1,
    color: "#64748b",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
    textTransform: "uppercase",
  },

  kpiValue: {
    marginTop: 9,
    color: "#13234b",
    fontSize: 25,
    fontWeight: "900",
  },

  kpiHelper: {
    marginTop: 5,
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },

  section: {
    marginTop: 4,
    borderRadius: 22,
    padding: 16,
    backgroundColor: "#ffffff",
  },

  sectionTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 5,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  breakdownRow: {
    marginTop: 14,
  },

  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  breakdownName: {
    flex: 1,
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },

  breakdownValue: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  progressTrack: {
    height: 8,
    marginTop: 8,
    overflow: "hidden",
    borderRadius: 99,
    backgroundColor: "#e2e8f0",
  },

  progressBar: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: colors.primary,
  },

  assetCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#fff7ed",
  },

  assetTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  assetName: {
    color: "#7c2d12",
    fontSize: 15,
    fontWeight: "900",
  },

  assetCode: {
    marginTop: 3,
    color: "#b45309",
    fontSize: 11,
    fontWeight: "700",
  },

  recurrenceBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#fed7aa",
  },

  recurrenceText: {
    color: "#9a3412",
    fontSize: 11,
    fontWeight: "900",
  },

  assetMeta: {
    marginTop: 11,
    color: "#9a3412",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  emptyBox: {
    marginTop: 14,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#f8fafc",
  },

  emptyText: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  interventionCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 19,
    padding: 15,
    backgroundColor: "#f8fafc",
  },

  interventionTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  ticketNumber: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "900",
  },

  interventionTitle: {
    marginTop: 10,
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "900",
  },

  interventionDescription: {
    marginTop: 7,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  chipRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  chip: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "#ffffff",
  },

  chipText: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
  },

  interventionMeta: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  followUpBadge: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#dbeafe",
  },

  followUpText: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "900",
  },

  errorCard: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: "#ffffff",
  },

  errorTitle: {
    color: "#b91c1c",
    fontSize: 19,
    fontWeight: "900",
  },

  errorText: {
    marginTop: 9,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },

  retryButton: {
    marginTop: 16,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.primary,
  },

  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
});
