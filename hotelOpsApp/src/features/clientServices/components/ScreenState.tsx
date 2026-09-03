// src/features/services/components/ScreenState.tsx
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

type Props = {
  loading?: boolean;
  error?: string | null;
  /** Affiche l'etat vide quand true et qu'il n'y a ni chargement ni erreur. */
  empty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  onRetry?: () => void;
  /** Rendu quand tout va bien. */
  children?: React.ReactNode;
};

/**
 * Gere les 3 etats non-nominaux d'un ecran (chargement / erreur / vide)
 * pour eviter de les reecrire dans chaque screen.
 */
export default function ScreenState({
  loading,
  error,
  empty,
  emptyTitle = "Rien a afficher",
  emptyMessage,
  emptyIcon = "file-tray-outline",
  onRetry,
  children,
}: Props) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>Chargement…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, styles.errorCircle]}>
          <Ionicons name="alert-circle-outline" size={30} color="#E5484D" />
        </View>
        <Text style={styles.title}>Oups</Text>
        <Text style={styles.message}>{error}</Text>
        {onRetry ? (
          <TouchableOpacity style={styles.retry} onPress={onRetry} activeOpacity={0.85}>
            <Ionicons name="refresh" size={16} color={colors.white} />
            <Text style={styles.retryLabel}>Reessayer</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name={emptyIcon} size={30} color={colors.muted} />
        </View>
        <Text style={styles.title}>{emptyTitle}</Text>
        {emptyMessage ? <Text style={styles.message}>{emptyMessage}</Text> : null}
        {onRetry ? (
          <TouchableOpacity style={styles.retry} onPress={onRetry} activeOpacity={0.85}>
            <Ionicons name="refresh" size={16} color={colors.white} />
            <Text style={styles.retryLabel}>Actualiser</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF1F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  errorCircle: {
    backgroundColor: "#FDECEC",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  retryLabel: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});