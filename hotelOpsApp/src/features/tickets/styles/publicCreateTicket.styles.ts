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
    paddingTop: 38,
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
    marginBottom: 22,
  },

  locationCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  locationIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  locationInfo: {
    flex: 1,
  },

  locationLabel: {
    color: colors.mutedLight,
    fontSize: 13,
    fontWeight: "700",
  },

  locationName: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900",
  },

  locationMeta: {
    marginTop: 4,
    color: "#7B8294",
    fontSize: 13,
  },

  sectionLabel: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#4A4F5E",
    letterSpacing: 0.5,
  },

  selectBox: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 12,
  },

  reporterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  reporterPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#E8EBF3",
    color: "#4B4F5A",
    fontWeight: "800",
    overflow: "hidden",
  },

  reporterPillActive: {
    backgroundColor: colors.primary,
    color: colors.white,
  },

  input: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textDark,
    marginBottom: 12,
  },

  textArea: {
    backgroundColor: colors.white,
    borderRadius: 22,
    minHeight: 150,
    padding: 18,
    fontSize: 16,
    color: colors.textDark,
    textAlignVertical: "top",
  },

  noteBox: {
    marginTop: 18,
    backgroundColor: "#EEF1F7",
    borderRadius: 18,
    padding: 14,
  },

  noteText: {
    color: "#596174",
    fontSize: 13,
    lineHeight: 20,
  },

  buttonWrapper: {
    marginTop: 28,
    marginBottom: 24,
  },
});