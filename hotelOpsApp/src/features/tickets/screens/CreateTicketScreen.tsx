import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import AppButton from "../../../components/ui/AppButton";

import AssetSelector from "../components/AssetSelector";
import CategorySelector from "../components/CategorySelector";
import LocationSelector from "../components/LocationSelector";
import PhotoUploader from "../components/PhotoUploader";
import PrioritySelector from "../components/PrioritySelector";

import { useCreateTicket } from "../hooks/useCreateTicket";
import { useTicketFormData } from "../hooks/useTicketFromData";
import { styles } from "../styles/createTicket.styles";

export default function CreateTicketScreen({ navigation }: any) {
  const {
    locations,
    priorities,
    categories,

    locationId,
    categoryId,
    priorityId,
    urgencyLevel,

    selectedLocation,
    selectedCategory,
    selectedLocationAssets,

    setLocationId,
    setCategoryId,
    selectPriority,

    loadingData,
  } = useTicketFormData();

  const {
    details,
    setDetails,

    photos,
    pickFromCamera,
    pickFromGallery,
    removePhoto,

    loading,
    submitTicket,
  } = useCreateTicket();

  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);

  useEffect(() => {
    setSelectedAssetIds([]);
  }, [locationId]);

  const toggleAsset = (assetId: number) => {
    setSelectedAssetIds((currentIds) => {
      if (currentIds.includes(assetId)) {
        return currentIds.filter((id) => id !== assetId);
      }

      return [...currentIds, assetId];
    });
  };

  const handleSubmit = async () => {
    if (!locationId || !categoryId || !priorityId) {
      Alert.alert("Erreur", "Les données ne sont pas encore chargées.");
      return;
    }

    const created = await submitTicket({
      title: `${selectedCategory?.name || "Incident"} - ${
        selectedLocation?.name || "Localisation"
      }`,
      locationId,
      categoryId,
      priorityId,
      reportedFrom: "mobile",
      urgencyLevel,
      assetIds: selectedAssetIds,
    });

    if (created) {
      navigation.goBack();
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color="#1C2D5A" />

        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>SERVICE MAINTENANCE</Text>

      <Text style={styles.title}>Signaler un incident</Text>

      <Text style={styles.sectionLabel}>LOCALISATION</Text>

      <LocationSelector
        locations={locations}
        selectedId={locationId}
        onSelect={setLocationId}
      />

      <Text style={styles.sectionLabel}>ÉQUIPEMENT(S) CONCERNÉ(S)</Text>

      <AssetSelector
        assets={selectedLocationAssets}
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
        value={details}
        onChangeText={setDetails}
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

      <View style={styles.buttonWrapper}>
        <AppButton
          title={loading ? "Envoi..." : "Envoyer le signalement"}
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}