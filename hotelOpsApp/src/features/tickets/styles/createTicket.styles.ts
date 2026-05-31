import { StyleSheet } from "react-native";

import { colors } from "../../../theme/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
  },

  loadingText: {
    marginTop: 12,
    color: "#4A4F5E",
  },

  kicker: {
    fontSize: 14,
    letterSpacing: 2,
    color: colors.mutedLight,
    fontWeight: "700",
    marginBottom: 8,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 28,
  },

  sectionLabel: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#4A4F5E",
    letterSpacing: 0.5,
  },

  textArea: {
    backgroundColor: colors.white,
    borderRadius: 22,
    minHeight: 160,
    padding: 18,
    fontSize: 16,
    color: colors.textDark,
    textAlignVertical: "top",
  },

  buttonWrapper: {
    marginTop: 28,
    marginBottom: 24,
  },
});