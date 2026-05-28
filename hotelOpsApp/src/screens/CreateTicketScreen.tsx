import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";

import { ticketService } from "../services/ticketService";
import AppButton from "../components/ui/AppButton";

type IncidentType = {
  id: number;
  label: string;
  icon: string;
  library: 'MaterialCommunityIcons' | 'Feather' | 'Ionicons';
};

const LOCATIONS = [
  { id: 1, label: "Chambre 304" },
  { id: 2, label: "Chambre 305" },
  { id: 3, label: "Salle 1" },
];

const INCIDENT_TYPES: IncidentType[] = [
  {
    id: 1,
    label: "Climatisation",
    icon: "snowflake",
    library: "MaterialCommunityIcons",
  },

  {
    id: 2,
    label: "Plomberie",
    icon: "tool",
    library: "Feather",
  },

  {
    id: 3,
    label: "Électricité",
    icon: "flash",
    library: "Ionicons",
  },

  {
    id: 4,
    label: "Mobilier",
    icon: "chair-rolling",
    library: "MaterialCommunityIcons",
  },
];

const PRIORITIES = [
  { id: 4, label: "CRITIQUE" },
  { id: 3, label: "HAUTE" },
  { id: 2, label: "MOYENNE" },
  { id: 1, label: "BASSE" },
];

export default function CreateTicketScreen({ navigation }: any) {
  const [locationId, setLocationId] = useState(1);
  const [categoryId, setCategoryId] = useState(1);
  const [priorityId, setPriorityId] = useState(3);
  const [urgencyLevel, setUrgencyLevel] = useState(3);
  const [details, setDetails] = useState("");
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedLocation = useMemo(
    () => LOCATIONS.find((l) => l.id === locationId) || LOCATIONS[0],
    [locationId],
  );

  const selectedCategory = useMemo(
    () => INCIDENT_TYPES.find((t) => t.id === categoryId) || INCIDENT_TYPES[0],
    [categoryId],
  );

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission refusée", "Accorde l’accès à la caméra.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets]);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission refusée", "Accorde l’accès à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: false,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets]);
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p.uri !== uri));
  };

  const submitTicket = async () => {
    if (!details.trim()) {
      Alert.alert("Erreur", "Ajoute une description.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: `${selectedCategory.label} - ${selectedLocation.label}`,
        description: details.trim(),
        locationId,
        categoryId,
        priorityId,
        reportedFrom: "mobile",
        urgencyLevel,
        files: photos,
      };

      await ticketService.createTicket(payload);

      Alert.alert("Succès", "Ticket créé avec succès");
      navigation.goBack();
    } catch (error: any) {
      console.log(error?.response?.data || error.message);
      Alert.alert("Erreur", "Impossible de créer le ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>SERVICE MAINTENANCE</Text>
      <Text style={styles.title}>Signaler un incident</Text>

      <Text style={styles.sectionLabel}>LOCALISATION</Text>
      <View style={styles.grid2}>
        {LOCATIONS.map((item) => {
          const active = item.id === locationId;

          return (
            <Pressable
              key={item.id}
              onPress={() => setLocationId(item.id)}
              style={[styles.optionCard, active && styles.optionCardActive]}
            >
              <Feather
                name="map-pin"
                size={22}
                color={active ? "#1C2D5A" : "#8A96B8"}
              />

              <Text style={styles.optionText}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>TYPE D'INCIDENT</Text>
      <View style={styles.grid2}>
        {INCIDENT_TYPES.map((item) => {
          const active = item.id === categoryId;

          return (
            <Pressable
              key={item.id}
              onPress={() => setCategoryId(item.id)}
              style={[styles.typeCard, active && styles.typeCardActive]}
            >
              {item.library === "MaterialCommunityIcons" && (
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={26}
                  color={active ? "#1C2D5A" : "#8A96B8"}
                />
              )}

              {item.library === "Feather" && (
                <Feather
                  name={item.icon as any}
                  size={26}
                  color={active ? "#1C2D5A" : "#8A96B8"}
                />
              )}

              {item.library === "Ionicons" && (
                <Ionicons
                  name={item.icon as any}
                  size={26}
                  color={active ? "#1C2D5A" : "#8A96B8"}
                />
              )}

              <Text style={styles.typeText}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>DEGRÉ D'URGENCE</Text>
      <View style={styles.urgencyRow}>
        {PRIORITIES.map((item) => {
          const active = item.id === priorityId;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setPriorityId(item.id);
                setUrgencyLevel(item.id);
              }}
              style={[
                styles.urgencyPill,
                active && item.id === 4 && styles.urgencyCritical,
                active && item.id === 3 && styles.urgencyHigh,
                active && item.id === 2 && styles.urgencyMedium,
                active && item.id === 1 && styles.urgencyLow,
              ]}
            >
              <Text
                style={[
                  styles.urgencyText,
                  active && item.id === 4 && styles.urgencyTextCritical,
                  active && item.id === 3 && styles.urgencyTextHigh,
                  active && item.id === 2 && styles.urgencyTextMedium,
                  active && item.id === 1 && styles.urgencyTextLow,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>DÉTAILS DE L'INCIDENT</Text>
      <TextInput
        value={details}
        onChangeText={setDetails}
        placeholder="Décrivez précisément le problème constaté..."
        placeholderTextColor="#A9B1C7"
        multiline
        style={styles.textArea}
      />

      <Text style={styles.sectionLabel}>PREUVE VISUELLE</Text>
      <Pressable style={styles.uploadBox} onPress={pickFromCamera}>
        <View style={styles.cameraBubble}>
          <Feather name="camera" size={28} color="#1C2D5A" />
        </View>
        <Text style={styles.uploadText}>Prendre ou ajouter une photo</Text>
        <Text style={styles.uploadSubText}>Touchez pour ouvrir la caméra</Text>
      </Pressable>

      <View style={styles.photoActions}>
        <Pressable style={styles.smallAction} onPress={pickFromCamera}>
          <Feather name="camera" size={18} color="#1C2D5A" />
          <Text style={styles.smallActionText}>Caméra</Text>
        </Pressable>

        <Pressable style={styles.smallAction} onPress={pickFromGallery}>
          <Feather name="image" size={18} color="#1C2D5A" />
          <Text style={styles.smallActionText}>Galerie</Text>
        </Pressable>
      </View>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 14 }}
        >
          {photos.map((photo) => (
            <Pressable
              key={photo.uri}
              onLongPress={() => removePhoto(photo.uri)}
              style={styles.photoThumbWrap}
            >
              <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={{ marginTop: 28, marginBottom: 24 }}>
        <AppButton
          title={loading ? "Envoi..." : "Envoyer le signalement"}
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
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

  shadowColor: "#000",
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 2,

  overflow: "hidden",
},

optionCardActive: {
  borderWidth: 2,
  borderColor: "#1C2D5A",
  backgroundColor: "#F8FAFF",
},
  optionText: {
    fontSize: 18,
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

  shadowColor: "#000",
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 2,

  overflow: "hidden",
},

typeCardActive: {
  borderWidth: 2,
  borderColor: "#1C2D5A",
  backgroundColor: "#F8FAFF",
},
  typeText: {
    fontSize: 16,
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
  color: "#1ebb5f",
},
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 22,
    minHeight: 180,
    padding: 18,
    fontSize: 16,
    color: "#1F2430",
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
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
