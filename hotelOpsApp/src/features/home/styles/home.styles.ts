import { StyleSheet } from "react-native";

import { colors } from "../../../theme/colors";
import { shadows } from "../../../theme/shadows";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallTitle: {
    color: "#8A93A8",
    fontWeight: "800",
    fontSize: 16,
  },

  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.soft,
  },

  bigTitle: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 38,
    marginTop: 6,
  },

  roleBadge: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  roleBadgeText: {
    color: colors.white,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 28,
    marginBottom: 14,
  },

  ticketCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#F5A623",
  },

  ticketCategory: {
    color: "#F5A623",
    fontWeight: "900",
    letterSpacing: 1,
  },

  ticketTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginTop: 8,
  },

  ticketStatus: {
    marginTop: 10,
    color: "#5D667A",
    fontSize: 16,
    fontWeight: "600",
  },

  primaryCard: {
    backgroundColor: colors.primary,
    marginTop: 18,
    marginBottom: 14,
  },

  primaryCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  primaryCardLabel: {
    color: "#A9B4D0",
    fontWeight: "800",
    letterSpacing: 0.8,
    fontSize: 13,
  },

  primaryCardTitle: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 23,
    marginTop: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridCard: {
    width: "48%",
    marginBottom: 14,
    minHeight: 150,
  },

  gridIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#F5F7FB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  gridTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },

  gridDesc: {
    color: "#67738A",
    marginTop: 4,
    fontSize: 15,
    fontWeight: "500",
  },

  banner: {
    marginTop: 18,
    minHeight: 190,
    justifyContent: "flex-end",
    backgroundColor: "#DCEAF9",
  },

  bannerLabel: {
    color: colors.white,
    fontWeight: "800",
    letterSpacing: 1,
  },

  bannerTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
  },

  bannerDesc: {
    color: colors.white,
    fontSize: 16,
    marginTop: 8,
  },
});