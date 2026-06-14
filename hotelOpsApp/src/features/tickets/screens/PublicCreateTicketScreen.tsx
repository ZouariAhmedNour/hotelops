import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import AppButton from "../../../components/ui/AppButton";
import CategorySelector from "../components/CategorySelector";
import PrioritySelector from "../components/PrioritySelector";

import { colors } from "../../../theme/colors";
import { publicQrService, type PublicQrInfo } from "../../../services/publicQrService";
import type { CategoryItem, PriorityItem } from "../types";

type PublicForm = {
  reporterType: "CLIENT" | "STAFF" | "VISITOR" | "OTHER" | "ANONYMOUS";
  fullName: string;
  phone: string;
  email: string;
  roomNumber: string;
  reservationCode: string;
  description: string;
};

export default function PublicCreateTicketScreen({ route, navigation }: any) {
  const { token, qrInfo } = route.params as {
    token: string;
    qrInfo: PublicQrInfo;
  };

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priorityId, setPriorityId] = useState<number | null>(null);
  const [urgencyLevel, setUrgencyLevel] = useState<number>(3);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<PublicForm>({
    reporterType: "CLIENT",
    fullName: "",
    phone: "",
    email: "",
    roomNumber: qrInfo.location.roomNumber ?? "",
    reservationCode: "",
    description: "",
  });

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === categoryId) || null,
    [categories, categoryId]
  );

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);

      const [categoriesData, prioritiesData] = await Promise.all([
        publicQrService.getCategories(),
        publicQrService.getPriorities(),
      ]);

      setCategories(categoriesData);
      setPriorities(prioritiesData);

      if (categoriesData.length > 0) {
        setCategoryId(categoriesData[0].id);
      }

      if (prioritiesData.length > 0) {
        setPriorityId(prioritiesData[0].id);
        setUrgencyLevel(prioritiesData[0].sortOrder ?? 3);
      }
    } catch (error: any) {
      console.log("PUBLIC FORM DATA ERROR =", error?.response?.data || error.message);

      Alert.alert(
        "Erreur",
        "Impossible de charger les catégories et priorités."
      );
    } finally {
      setLoadingData(false);
    }
  };

  const updateForm = <K extends keyof PublicForm>(
    key: K,
    value: PublicForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const selectPriority = (priority: PriorityItem) => {
    setPriorityId(priority.id);
    setUrgencyLevel(priority.sortOrder ?? 3);
  };

  const handleSubmit = async () => {
    if (!categoryId || !priorityId) {
      Alert.alert("Erreur", "Choisis une catégorie et une priorité.");
      return;
    }

    if (!form.description.trim()) {
      Alert.alert("Erreur", "Ajoute une description.");
      return;
    }

    try {
      setSubmitting(true);

      const ticket = await publicQrService.createTicket({
        token,
        reporterType: form.reporterType,
        fullName: form.fullName || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        roomNumber: form.roomNumber || undefined,
        reservationCode: form.reservationCode || undefined,
        categoryId,
        priorityId,
        description: form.description.trim(),
      });

      Alert.alert(
        "Succès",
        `Ticket créé avec succès.\nRéférence : ${ticket.ticketNumber}`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error: any) {
      console.log("PUBLIC CREATE ERROR =", error?.response?.data || error.message);

      Alert.alert("Erreur", "Impossible de créer le ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du formulaire...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>QR CODE DÉTECTÉ</Text>

      <Text style={styles.title}>Créer un ticket</Text>

      <View style={styles.locationCard}>
        <View style={styles.locationIcon}>
          <Feather name="map-pin" size={24} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.locationLabel}>Localisation détectée</Text>

          <Text style={styles.locationName}>{qrInfo.location.name}</Text>

          <Text style={styles.locationMeta}>
            {qrInfo.location.code}
            {qrInfo.location.floor ? ` · Étage ${qrInfo.location.floor}` : ""}
            {qrInfo.location.zone ? ` · ${qrInfo.location.zone}` : ""}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>VOS INFORMATIONS</Text>

      <View style={styles.selectBox}>
        <Text style={styles.inputLabel}>Je suis</Text>

        <View style={styles.reporterGrid}>
          {[
            { label: "Client", value: "CLIENT" },
            { label: "Personnel", value: "STAFF" },
            { label: "Visiteur", value: "VISITOR" },
            { label: "Autre", value: "OTHER" },
            { label: "Anonyme", value: "ANONYMOUS" },
          ].map((item) => {
            const active = form.reporterType === item.value;

            return (
              <Text
                key={item.value}
                onPress={() =>
                  updateForm("reporterType", item.value as PublicForm["reporterType"])
                }
                style={[styles.reporterPill, active && styles.reporterPillActive]}
              >
                {item.label}
              </Text>
            );
          })}
        </View>
      </View>

      {form.reporterType !== "ANONYMOUS" && (
        <>
          <TextInput
            value={form.fullName}
            onChangeText={(value) => updateForm("fullName", value)}
            placeholder="Nom et prénom"
            placeholderTextColor="#A9B1C7"
            style={styles.input}
          />

          <TextInput
            value={form.phone}
            onChangeText={(value) => updateForm("phone", value)}
            placeholder="Téléphone"
            placeholderTextColor="#A9B1C7"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            value={form.email}
            onChangeText={(value) => updateForm("email", value)}
            placeholder="Email"
            placeholderTextColor="#A9B1C7"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </>
      )}

      {form.reporterType === "CLIENT" && (
        <>
          <TextInput
            value={form.roomNumber}
            onChangeText={(value) => updateForm("roomNumber", value)}
            placeholder="Numéro de chambre"
            placeholderTextColor="#A9B1C7"
            style={styles.input}
          />

          <TextInput
            value={form.reservationCode}
            onChangeText={(value) => updateForm("reservationCode", value)}
            placeholder="Code réservation"
            placeholderTextColor="#A9B1C7"
            style={styles.input}
          />
        </>
      )}

      <Text style={styles.sectionLabel}>TYPE D'INCIDENT</Text>

      <CategorySelector
        categories={categories}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />

      <Text style={styles.sectionLabel}>DEGRÉ D'URGENCE</Text>

      <PrioritySelector
        priorities={priorities}
        selectedId={priorityId}
        onSelect={selectPriority}
      />

      <Text style={styles.sectionLabel}>DÉTAILS DE L'INCIDENT</Text>

      <TextInput
        value={form.description}
        onChangeText={(value) => updateForm("description", value)}
        placeholder="Décrivez précisément le problème..."
        placeholderTextColor="#A9B1C7"
        multiline
        style={styles.textArea}
      />

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Ce ticket sera créé sans compte utilisateur, mais il restera lié au QR
          code et à la localisation pour garder une traçabilité.
        </Text>
      </View>

      <View style={styles.buttonWrapper}>
        <AppButton
          title={submitting ? "Envoi..." : "Envoyer le signalement"}
          onPress={handleSubmit}
          loading={submitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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