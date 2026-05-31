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
    paddingTop: 70,
    paddingBottom: 40,
  },

  title: {
    textAlign: "center",
    fontSize: 34,
    fontWeight: "800",
    color: colors.primary,
  },

  subtitle: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 18,
    color: colors.muted,
    marginBottom: 30,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 22,
    ...shadows.card,
  },

  h1: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
  },

  inputHalfLeft: {
    flex: 1,
    marginRight: 10,
  },

  inputHalfRight: {
    flex: 1,
  },

  sectionLabel: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
  },

  roles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },

  bottomText: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },

  bottomMuted: {
    color: colors.muted,
  },

  bottomLink: {
    color: colors.primary,
    fontWeight: "800",
  },
});