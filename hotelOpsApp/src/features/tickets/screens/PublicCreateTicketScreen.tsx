import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import AppButton from "../../../components/ui/AppButton";
import CategorySelector from "../components/CategorySelector";
import PrioritySelector from "../components/PrioritySelector";
import PhotoUploader from "../components/PhotoUploader";

import { colors } from "../../../theme/colors";
import { publicQrService, type PublicQrInfo } from "../api/publicQrService";
import type { CategoryItem, PriorityItem } from "../types";
import { styles } from "../styles/publicCreateTicket.styles";
import { usePublicCreateTicket } from "../hooks/usePublicCreateTicket";

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

  const {
    photos,
    pickFromCamera,
    pickFromGallery,
    removePhoto,
    submitting,
    submitPublicTicket,
  } = usePublicCreateTicket();

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

    const ticket = await submitPublicTicket({
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

    if (!ticket) return;

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

      <Text style={styles.sectionLabel}>PREUVE VISUELLE</Text>

      <PhotoUploader
        photos={photos}
        onAddFromCamera={pickFromCamera}
        onAddFromGallery={pickFromGallery}
        onRemove={removePhoto}
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