import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";

import AppButton from "../../../components/ui/AppButton";

import LocationSelector from "../components/LocationSelector";
import CategorySelector from "../components/CategorySelector";
import PrioritySelector from "../components/PrioritySelector";
import PhotoUploader from "../components/PhotoUploader";

import { useCreateTicket } from "../hooks/useCreateTicket";

import { styles } from "../styles/createTicket.styles";
import { useTicketFormData } from "../hooks/useTicketFromData";

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

  const handleSubmit = async () => {
    if (!locationId || !categoryId || !priorityId) {
      Alert.alert("Erreur", "Les données ne sont pas encore chargées.");
      return;
    }

    const success = await submitTicket({
      title: `${selectedCategory?.name || "Incident"} - ${
        selectedLocation?.name || "Localisation"
      }`,
      locationId,
      categoryId,
      priorityId,
      reportedFrom: "mobile",
      urgencyLevel,
    });

    if (success) {
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