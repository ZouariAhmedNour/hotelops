import { StyleSheet } from "react-native";
import { colors } from "../../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
  },

  ticketNumber: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "900",
    fontSize: 12,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primary,
    marginBottom: 10,
  },

  description: {
    color: "#475569",
    lineHeight: 22,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  infoValue: {
    marginTop: 8,
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 16,
  },

  progress: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.primary,
  },

  actions: {
    gap: 10,
    marginBottom: 14,
  },

  actionButton: {
    height: 52,
  },

  photoRow: {
    flexDirection: "row",
    gap: 10,
  },

  photoButton: {
    flex: 1,
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },

  photoButtonText: {
    color: "#2563eb",
    fontWeight: "900",
  },

  textArea: {
    minHeight: 110,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    textAlignVertical: "top",
    color: "#0f172a",
    marginBottom: 12,
  },

  input: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    color: "#0f172a",
    marginBottom: 14,
  },

  locationHistoryCard: {
  borderWidth: 1,
  borderColor: "#bfdbfe",
  backgroundColor: "#f8fbff",
},

locationHistoryCardDisabled: {
  opacity: 0.7,
},

locationHistoryHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
},

locationHistoryHint: {
  marginTop: 9,
  color: "#2563eb",
  fontSize: 11,
  fontWeight: "800",
},
});