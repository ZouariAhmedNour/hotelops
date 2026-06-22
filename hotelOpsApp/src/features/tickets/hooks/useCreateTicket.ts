import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import {
  ticketService,
  type CreateTicketPayload,
} from "../api/ticketService";

export function useCreateTicket() {
  const [details, setDetails] = useState("");
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);

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
      setPhotos((previousPhotos) => [
        ...previousPhotos,
        ...result.assets,
      ]);
    }
  };

  const pickFromGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

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
      setPhotos((previousPhotos) => [
        ...previousPhotos,
        ...result.assets,
      ]);
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((previousPhotos) =>
      previousPhotos.filter((item) => item.uri !== uri)
    );
  };

  const submitTicket = async (
    payload: Omit<CreateTicketPayload, "description" | "files">
  ) => {
    if (!details.trim()) {
      Alert.alert("Erreur", "Ajoute une description.");
      return false;
    }

    try {
      setLoading(true);

      await ticketService.createTicket({
        ...payload,
        description: details.trim(),
        assetIds: [...new Set(payload.assetIds ?? [])],
        files: photos,
      });

      setDetails("");
      setPhotos([]);

      Alert.alert("Succès", "Ticket créé avec succès.");

      return true;
    } catch (error: any) {
      console.log(
        "CREATE TICKET ERROR =",
        error?.response?.data || error?.message || error
      );

      const backendMessage =
        error?.response?.data?.message ||
        "Impossible de créer le ticket.";

      Alert.alert("Erreur", backendMessage);

      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    details,
    setDetails,

    photos,
    pickFromCamera,
    pickFromGallery,
    removePhoto,

    loading,
    submitTicket,
  };
}