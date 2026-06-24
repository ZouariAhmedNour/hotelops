import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  loading: boolean;

  temporaryFixNote: string;
  expertReason: string;
  followUpTitle: string;
  followUpDescription: string;
  recommendedSpecialty: string;
  requiresExpertIntervention: boolean;

  onChangeTemporaryFixNote: (value: string) => void;
  onChangeExpertReason: (value: string) => void;
  onChangeFollowUpTitle: (value: string) => void;
  onChangeFollowUpDescription: (value: string) => void;
  onChangeRecommendedSpecialty: (value: string) => void;
  onChangeRequiresExpertIntervention: (value: boolean) => void;

  onSubmit: () => void;
};

export default function PartialResolveForm({
  loading,

  temporaryFixNote,
  expertReason,
  followUpTitle,
  followUpDescription,
  recommendedSpecialty,
  requiresExpertIntervention,

  onChangeTemporaryFixNote,
  onChangeExpertReason,
  onChangeFollowUpTitle,
  onChangeFollowUpDescription,
  onChangeRecommendedSpecialty,
  onChangeRequiresExpertIntervention,

  onSubmit,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((current) => !current)}
        activeOpacity={0.85}
      >
        <View style={styles.headerIcon}>
          <Feather name="alert-triangle" size={20} color="#b45309" />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Solution temporaire / intervention lourde
          </Text>

          <Text style={styles.subtitle}>
            Créer un ticket de suivi et stabiliser temporairement la chambre.
          </Text>
        </View>

        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color="#b45309"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <Text style={styles.label}>
            Solution temporaire appliquée *
          </Text>

          <TextInput
            value={temporaryFixNote}
            onChangeText={onChangeTemporaryFixNote}
            placeholder="Exemple : filtre nettoyé, climatisation redémarrée temporairement..."
            placeholderTextColor="#94a3b8"
            multiline
            style={styles.textArea}
          />

          <Text style={styles.label}>
            Pourquoi une intervention lourde est nécessaire ? *
          </Text>

          <TextInput
            value={expertReason}
            onChangeText={onChangeExpertReason}
            placeholder="Exemple : compresseur faible, diagnostic CVC spécialisé nécessaire..."
            placeholderTextColor="#94a3b8"
            multiline
            style={styles.textArea}
          />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>
                Nécessite un expert ou supérieur
              </Text>

              <Text style={styles.switchSubtitle}>
                Active cette option si la suite doit être traitée par un expert.
              </Text>
            </View>

            <Switch
              value={requiresExpertIntervention}
              onValueChange={onChangeRequiresExpertIntervention}
              trackColor={{
                false: "#cbd5e1",
                true: "#f59e0b",
              }}
              thumbColor="#ffffff"
            />
          </View>

          <Text style={styles.label}>
            Spécialité recommandée
          </Text>

          <TextInput
            value={recommendedSpecialty}
            onChangeText={onChangeRecommendedSpecialty}
            placeholder="Exemple : CVC, électricité, plomberie..."
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <Text style={styles.label}>
            Titre du ticket de suivi
          </Text>

          <TextInput
            value={followUpTitle}
            onChangeText={onChangeFollowUpTitle}
            placeholder="Exemple : Diagnostic compresseur climatisation"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          <Text style={styles.label}>
            Description du ticket de suivi *
          </Text>

          <TextInput
            value={followUpDescription}
            onChangeText={onChangeFollowUpDescription}
            placeholder="Décrire précisément le travail lourd à réaliser..."
            placeholderTextColor="#94a3b8"
            multiline
            style={styles.textArea}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Feather name="git-branch" size={18} color="#ffffff" />

                <Text style={styles.submitText}>
                  Créer le ticket de suivi
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fed7aa",
    backgroundColor: "#fff7ed",
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },

  headerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#ffedd5",
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#9a3412",
    fontSize: 15,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 4,
    color: "#b45309",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },

  body: {
    padding: 16,
    paddingTop: 2,
  },

  label: {
    marginBottom: 7,
    color: "#9a3412",
    fontSize: 13,
    fontWeight: "800",
  },

  input: {
    height: 50,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 14,
    paddingHorizontal: 13,
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },

  textArea: {
    minHeight: 100,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 14,
    padding: 13,
    backgroundColor: "#ffffff",
    color: "#0f172a",
    textAlignVertical: "top",
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },

  switchTitle: {
    color: "#7c2d12",
    fontSize: 13,
    fontWeight: "800",
  },

  switchSubtitle: {
    marginTop: 3,
    color: "#b45309",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
  },

  submitButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 16,
    backgroundColor: "#d97706",
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
});