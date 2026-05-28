import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";

import { ticketService } from "../services/ticketService";
import { locationService } from "../services/locationService";
import { priorityService } from "../services/priorityService";
import { categoryService } from "../services/categoryService";

import AppButton from "../components/ui/AppButton";

type LocationItem = {
  id: number;
  name: string;
  type: string;
};

type PriorityItem = {
  id: number;
  name: string;
  code: string;
  sortOrder: number;
  slaHours?: number | null;
};

type CategoryItem = {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean;
};

export default function CreateTicketScreen({ navigation }: any) {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const [locationId, setLocationId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priorityId, setPriorityId] = useState<number | null>(null);

  const [urgencyLevel, setUrgencyLevel] = useState<number>(3);

  const [details, setDetails] = useState("");

  const [photos, setPhotos] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const selectedLocation = useMemo(
    () =>
      locations.find((item) => item.id === locationId) || null,
    [locations, locationId]
  );

  const selectedCategory = useMemo(
    () =>
      categories.find((item) => item.id === categoryId) || null,
    [categories, categoryId]
  );

  const selectedPriority = useMemo(
    () =>
      priorities.find((item) => item.id === priorityId) || null,
    [priorities, priorityId]
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

      const [
        locationsRes,
        prioritiesRes,
        categoriesRes,
      ] = await Promise.all([
        locationService.getAll(),
        priorityService.getAll(),
        categoryService.getAll(),
      ]);

      console.log("LOCATIONS =", locationsRes.data);
      console.log("PRIORITIES =", prioritiesRes.data);
      console.log("CATEGORIES =", categoriesRes.data);

      const locationsData =
        locationsRes.data?.data ??
        locationsRes.data ??
        [];

      const prioritiesData =
        prioritiesRes.data?.data ??
        prioritiesRes.data ??
        [];

      const categoriesData =
        categoriesRes.data?.data ??
        categoriesRes.data ??
        [];

      setLocations(locationsData);
      setPriorities(prioritiesData);
      setCategories(categoriesData);

      // Sélection automatique du premier élément réel de la BD
      if (locationsData.length > 0) {
        setLocationId(locationsData[0].id);
      }

      if (categoriesData.length > 0) {
        setCategoryId(categoriesData[0].id);
      }

      if (prioritiesData.length > 0) {
        setPriorityId(prioritiesData[0].id);

        setUrgencyLevel(
          prioritiesData[0].sortOrder ?? 3
        );
      }
    } catch (error: any) {
      console.log(
        "LOAD ERROR =",
        error?.response?.data || error.message
      );

      Alert.alert(
        "Erreur",
        "Impossible de charger les données."
      );
    } finally {
      setLoadingData(false);
    }
  };

  const pickFromCamera = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission refusée",
        "Accorde l’accès à la caméra."
      );
      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
      });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets]);
    }
  };

  const pickFromGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission refusée",
        "Accorde l’accès à la galerie."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsEditing: false,
        allowsMultipleSelection: true,
      });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets]);
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) =>
      prev.filter((item) => item.uri !== uri)
    );
  };

  const submitTicket = async () => {
    if (!details.trim()) {
      Alert.alert(
        "Erreur",
        "Ajoute une description."
      );
      return;
    }

    if (
      !locationId ||
      !categoryId ||
      !priorityId
    ) {
      Alert.alert(
        "Erreur",
        "Les données ne sont pas encore chargées."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: `${
          selectedCategory?.name || "Incident"
        } - ${
          selectedLocation?.name || "Localisation"
        }`,

        description: details.trim(),

        locationId,
        categoryId,
        priorityId,

        reportedFrom: "mobile",

        urgencyLevel,

        files: photos,
      };

      console.log("PAYLOAD =", payload);

      await ticketService.createTicket(payload);

      Alert.alert(
        "Succès",
        "Ticket créé avec succès"
      );

      navigation.goBack();

    } catch (error: any) {
      console.log(
        "CREATE ERROR =",
        error?.response?.data || error.message
      );

      Alert.alert(
        "Erreur",
        "Impossible de créer le ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyle = (
    code: string
  ) => {
    switch (code) {
      case "critical":
        return styles.urgencyCritical;

      case "high":
        return styles.urgencyHigh;

      case "medium":
        return styles.urgencyMedium;

      case "low":
        return styles.urgencyLow;

      default:
        return {};
    }
  };

  const getPriorityTextStyle = (
    code: string
  ) => {
    switch (code) {
      case "critical":
        return styles.urgencyTextCritical;

      case "high":
        return styles.urgencyTextHigh;

      case "medium":
        return styles.urgencyTextMedium;

      case "low":
        return styles.urgencyTextLow;

      default:
        return {};
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator
          size="large"
          color="#1C2D5A"
        />

        <Text style={styles.loadingText}>
          Chargement des données...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.kicker}>
        SERVICE MAINTENANCE
      </Text>

      <Text style={styles.title}>
        Signaler un incident
      </Text>

      {/* LOCALISATION */}

      <Text style={styles.sectionLabel}>
        LOCALISATION
      </Text>

      <View style={styles.grid2}>
        {locations.map((item) => {
          const active =
            item.id === locationId;

          return (
            <Pressable
              key={item.id}
              onPress={() =>
                setLocationId(item.id)
              }
              style={[
                styles.optionCard,
                active &&
                  styles.optionCardActive,
              ]}
            >
              <Feather
                name="map-pin"
                size={22}
                color={
                  active
                    ? "#1C2D5A"
                    : "#8A96B8"
                }
              />

              <Text style={styles.optionText}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* TYPE INCIDENT */}

      <Text style={styles.sectionLabel}>
        TYPE D'INCIDENT
      </Text>

      <View style={styles.grid2}>
        {categories.map((item) => {
          const active =
            item.id === categoryId;

          return (
            <Pressable
              key={item.id}
              onPress={() =>
                setCategoryId(item.id)
              }
              style={[
                styles.typeCard,
                active &&
                  styles.typeCardActive,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  (item.icon ||
                    "alert-circle-outline") as any
                }
                size={26}
                color={
                  active
                    ? "#1C2D5A"
                    : "#8A96B8"
                }
              />

              <Text style={styles.typeText}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* PRIORITÉS */}

      <Text style={styles.sectionLabel}>
        DEGRÉ D'URGENCE
      </Text>

      <View style={styles.urgencyRow}>
        {priorities.map((item) => {
          const active =
            item.id === priorityId;

          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setPriorityId(item.id);

                setUrgencyLevel(
                  item.sortOrder ?? 3
                );
              }}
              style={[
                styles.urgencyPill,

                active &&
                  getPriorityStyle(
                    item.code
                  ),
              ]}
            >
              <Text
                style={[
                  styles.urgencyText,

                  active &&
                    getPriorityTextStyle(
                      item.code
                    ),
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* DESCRIPTION */}

      <Text style={styles.sectionLabel}>
        DÉTAILS DE L'INCIDENT
      </Text>

      <TextInput
        value={details}
        onChangeText={setDetails}
        placeholder="Décrivez précisément le problème..."
        placeholderTextColor="#A9B1C7"
        multiline
        style={styles.textArea}
      />

      {/* PHOTOS */}

      <Text style={styles.sectionLabel}>
        PREUVE VISUELLE
      </Text>

      <Pressable
        style={styles.uploadBox}
        onPress={pickFromCamera}
      >
        <View style={styles.cameraBubble}>
          <Feather
            name="camera"
            size={28}
            color="#1C2D5A"
          />
        </View>

        <Text style={styles.uploadText}>
          Ajouter une photo
        </Text>

        <Text style={styles.uploadSubText}>
          Touchez pour ouvrir la caméra
        </Text>
      </Pressable>

      <View style={styles.photoActions}>
        <Pressable
          style={styles.smallAction}
          onPress={pickFromCamera}
        >
          <Feather
            name="camera"
            size={18}
            color="#1C2D5A"
          />

          <Text style={styles.smallActionText}>
            Caméra
          </Text>
        </Pressable>

        <Pressable
          style={styles.smallAction}
          onPress={pickFromGallery}
        >
          <Feather
            name="image"
            size={18}
            color="#1C2D5A"
          />

          <Text style={styles.smallActionText}>
            Galerie
          </Text>
        </Pressable>
      </View>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={{ marginTop: 14 }}
        >
          {photos.map((photo) => (
            <Pressable
              key={photo.uri}
              onLongPress={() =>
                removePhoto(photo.uri)
              }
              style={styles.photoThumbWrap}
            >
              <Image
                source={{ uri: photo.uri }}
                style={styles.photoThumb}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View
        style={{
          marginTop: 28,
          marginBottom: 24,
        }}
      >
        <AppButton
          title={
            loading
              ? "Envoi..."
              : "Envoyer le signalement"
          }
          onPress={submitTicket}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6FA",
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
  },

  loadingText: {
    marginTop: 12,
    color: "#4A4F5E",
  },

  kicker: {
    fontSize: 14,
    letterSpacing: 2,
    color: "#8A96B8",
    fontWeight: "700",
    marginBottom: 8,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1C2D5A",
    marginBottom: 28,
  },

  sectionLabel: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#4A4F5E",
    letterSpacing: 0.5,
  },

  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  optionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 76,
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF1F7",
  },

  optionCardActive: {
    borderWidth: 2,
    borderColor: "#1C2D5A",
    backgroundColor: "#F8FAFF",
  },

  optionText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2430",
  },

  typeCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 88,
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF1F7",
  },

  typeCardActive: {
    borderWidth: 2,
    borderColor: "#1C2D5A",
    backgroundColor: "#F8FAFF",
  },

  typeText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#202531",
  },

  urgencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  urgencyPill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#E8EBF3",
  },

  urgencyCritical: {
    backgroundColor: "#FDE8E6",
  },

  urgencyHigh: {
    backgroundColor: "#FCE6D9",
  },

  urgencyMedium: {
    backgroundColor: "#E0ECFF",
  },

  urgencyLow: {
    backgroundColor: "#EEF2F7",
  },

  urgencyText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4B4F5A",
  },

  urgencyTextCritical: {
    color: "#B42318",
  },

  urgencyTextHigh: {
    color: "#C05621",
  },

  urgencyTextMedium: {
    color: "#1D4ED8",
  },

  urgencyTextLow: {
    color: "#16A34A",
  },

  textArea: {
    backgroundColor: "#fff",
    borderRadius: 22,
    minHeight: 180,
    padding: 18,
    fontSize: 16,
    color: "#1F2430",
    textAlignVertical: "top",
  },

  uploadBox: {
    backgroundColor: "#F7F8FC",
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D9DDE7",
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  cameraBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  uploadText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8A96B8",
    textAlign: "center",
  },

  uploadSubText: {
    marginTop: 6,
    fontSize: 13,
    color: "#A9B1C7",
  },

  photoActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },

  smallAction: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F7",
    borderRadius: 14,
    paddingVertical: 12,
  },

  smallActionText: {
    color: "#1C2D5A",
    fontWeight: "700",
  },

  photoThumbWrap: {
    marginRight: 10,
  },

  photoThumb: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: "#DDE3F0",
  },
});