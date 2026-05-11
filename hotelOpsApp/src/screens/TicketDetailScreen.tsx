import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

import { ticketService } from "../services/ticketService";

import type { MaintenanceTicket } from "../types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "TicketDetail"
>;

const TicketDetailScreen: React.FC<Props> = ({
  route,
}) => {
  const { ticketId } = route.params;

  const [ticket, setTicket] =
    useState<MaintenanceTicket | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [uploadingPhoto, setUploadingPhoto] =
    useState<boolean>(false);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async (): Promise<void> => {
    try {
      setLoading(true);

      const data = await ticketService.getById(
        ticketId
      );

      setTicket(data);
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Erreur",
        "Impossible de charger le ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (
    fromCamera: boolean
  ): Promise<void> => {
    try {
      // Permissions
      const permissionResult = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Accès caméra ou galerie requis"
        );

        return;
      }

      // Ouverture caméra ou galerie
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsEditing: true,
          });

      // Vérification annulation
      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        return;
      }

      await uploadPhoto(asset.uri);
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Erreur",
        "Impossible de sélectionner une image"
      );
    }
  };

  const uploadPhoto = async (
    uri: string
  ): Promise<void> => {
    try {
      setUploadingPhoto(true);

      const filename =
        uri.split("/").pop() || "photo.jpg";

      const file = {
        uri,
        name: filename,
        type: "image/jpeg",
      };

      await ticketService.uploadAttachment(
        ticketId,
        file
      );

      Alert.alert(
        "Succès",
        "Photo uploadée avec succès"
      );

      // Recharge le ticket
      await fetchTicket();
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Erreur",
        "Impossible d'uploader la photo"
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  /* ======================================================
     Loading
  ====================================================== */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />
      </View>
    );
  }

  /* ======================================================
     Ticket introuvable
  ====================================================== */

  if (!ticket) {
    return (
      <View style={styles.center}>
        <Text>Ticket introuvable</Text>
      </View>
    );
  }

  /* ======================================================
     Render
  ====================================================== */

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.ticketNumber}>
          {ticket.ticketNumber}
        </Text>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                ticket.status?.color || "#e5e7eb",
            },
          ]}
        >
          <Text style={styles.statusText}>
            {ticket.status?.name}
          </Text>
        </View>
      </View>

      {/* Titre */}
      <Text style={styles.title}>
        {ticket.title}
      </Text>

      {/* Description */}
      <Text style={styles.description}>
        {ticket.description}
      </Text>

      {/* Localisation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Localisation
        </Text>

        <Text>
          {ticket.location?.name || "Non définie"}
        </Text>
      </View>

      {/* Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Photos
        </Text>

        <View style={styles.photoButtons}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => pickImage(true)}
          >
            <Text style={styles.photoButtonText}>
              📷 Prendre une photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => pickImage(false)}
          >
            <Text style={styles.photoButtonText}>
              🖼️ Galerie
            </Text>
          </TouchableOpacity>
        </View>

        {uploadingPhoto && (
          <ActivityIndicator
            style={{ marginTop: 12 }}
          />
        )}
      </View>

      {/* Images existantes */}
      {ticket.attachments &&
        ticket.attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Images du ticket
            </Text>

            <View style={styles.imagesContainer}>
              {ticket.attachments.map(
                (attachment: any) => (
                  <Image
                    key={attachment.id}
                    source={{
                      uri: attachment.url,
                    }}
                    style={styles.image}
                  />
                )
              )}
            </View>
          </View>
        )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  ticketNumber: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 16,
    marginBottom: 8,
    color: "#111827",
  },

  description: {
    fontSize: 15,
    color: "#4b5563",
    paddingHorizontal: 16,
    marginBottom: 16,
    lineHeight: 22,
  },

  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },

  photoButtons: {
    flexDirection: "row",
    gap: 10,
  },

  photoButton: {
    flex: 1,
    backgroundColor: "#eff6ff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  photoButtonText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },

  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default TicketDetailScreen;