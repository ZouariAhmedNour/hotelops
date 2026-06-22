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

import AssetSelector from "../components/AssetSelector";
import CategorySelector from "../components/CategorySelector";
import PhotoUploader from "../components/PhotoUploader";
import PrioritySelector from "../components/PrioritySelector";

import { colors } from "../../../theme/colors";
import {
  publicQrService,
  type CreatePublicTicketPayload,
  type PublicQrInfo,
} from "../api/publicQrService";
import { usePublicCreateTicket } from "../hooks/usePublicCreateTicket";
import { styles } from "../styles/publicCreateTicket.styles";
import type { CategoryItem, PriorityItem } from "../types";

type ReporterType = CreatePublicTicketPayload["reporterType"];

type PublicForm = {
  reporterType: ReporterType;
  fullName: string;
  phone: string;
  email: string;
  roomNumber: string;
  reservationCode: string;
  description: string;
};

const reporterOptions: Array<{
  label: string;
  value: ReporterType;
}> = [
  { label: "Client", value: "CLIENT" },
  { label: "Personnel", value: "STAFF" },
  { label: "Visiteur", value: "VISITOR" },
  { label: "Autre", value: "OTHER" },
  { label: "Anonyme", value: "ANONYMOUS" },
];

export default function PublicCreateTicketScreen({ route, navigation }: any) {
  const { token, qrInfo } = route.params as {
    token: string;
    qrInfo: PublicQrInfo;
  };

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priorityId, setPriorityId] = useState<number | null>(null);

  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
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

  const locationAssets = useMemo(() => {
    return (qrInfo.location.assets ?? []).filter(
      (asset) => asset.isActive !== false
    );
  }, [qrInfo.location.assets]);

  useEffect(() => {
    void loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);

      const [categoriesData, prioritiesData] = await Promise.all([
        publicQrService.getCategories(),
        publicQrService.getPriorities(),
      ]);

      const activeCategories = categoriesData.filter(
        (item) => item.isActive !== false
      );

      setCategories(activeCategories);
      setPriorities(prioritiesData);

      if (activeCategories.length > 0) {
        setCategoryId(activeCategories[0].id);
      }

      if (prioritiesData.length > 0) {
        const defaultPriority =
          prioritiesData.find(
            (item) => String(item.code).toUpperCase() === "MEDIUM"
          ) || prioritiesData[0];

        setPriorityId(defaultPriority.id);
      }
    } catch (error: any) {
      console.log(
        "PUBLIC FORM DATA ERROR =",
        error?.response?.data || error?.message || error
      );

      Alert.alert(
        "Erreur",
        "Impossible de charger les catégories et les priorités."
      );
    } finally {
      setLoadingData(false);
    }
  };

  const updateForm = <K extends keyof PublicForm>(
    key: K,
    value: PublicForm[K]
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  };

  const selectPriority = (priority: PriorityItem) => {
    setPriorityId(priority.id);
  };

  const toggleAsset = (assetId: number) => {
    setSelectedAssetIds((currentIds) => {
      if (currentIds.includes(assetId)) {
        return currentIds.filter((id) => id !== assetId);
      }

      return [...currentIds, assetId];
    });
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
      assetIds: selectedAssetIds,
    });

    if (!ticket) {
      return;
    }

    Alert.alert(
      "Succès",
      `Ticket créé avec succès.\nRéférence : ${ticket.ticketNumber}`,
      [
        {
          text: "OK",
          onPress: () => navigation.popToTop(),
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
            {qrInfo.location.floor
              ? ` · Étage ${qrInfo.location.floor}`
              : ""}
            {qrInfo.location.zone ? ` · ${qrInfo.location.zone}` : ""}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>VOS INFORMATIONS</Text>

      <View style={styles.selectBox}>
        <Text style={styles.inputLabel}>Je suis</Text>

        <View style={styles.reporterGrid}>
          {reporterOptions.map((item) => {
            const active = form.reporterType === item.value;

            return (
              <Text
                key={item.value}
                onPress={() => updateForm("reporterType", item.value)}
                style={[
                  styles.reporterPill,
                  active && styles.reporterPillActive,
                ]}
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

      <Text style={styles.sectionLabel}>ÉQUIPEMENT(S) CONCERNÉ(S)</Text>

      <AssetSelector
        assets={locationAssets}
        selectedIds={selectedAssetIds}
        onToggle={toggleAsset}
      />

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
          Ce ticket restera lié au QR code, à la localisation et aux
          équipements sélectionnés.
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