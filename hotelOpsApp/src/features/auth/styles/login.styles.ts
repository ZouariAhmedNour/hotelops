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

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
    marginBottom: 8,
  },

  description: {
    color: "#67738A",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },

  forgot: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },

  forgotText: {
    color: colors.muted,
    fontWeight: "600",
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