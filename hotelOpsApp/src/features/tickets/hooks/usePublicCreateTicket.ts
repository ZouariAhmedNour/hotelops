import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import {
  publicQrService,
  type CreatePublicTicketPayload,
} from  "../api/publicQrService";

export function usePublicCreateTicket() {
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
    setPhotos((prev) => prev.filter((item) => item.uri !== uri));
  };

  const submitPublicTicket = async (
    payload: Omit<CreatePublicTicketPayload, "files">
  ) => {
    try {
      setSubmitting(true);

      const ticket = await publicQrService.createTicket({
        ...payload,
        files: photos,
      });

      return ticket;
    } catch (error: any) {
      console.log(
        "PUBLIC CREATE ERROR =",
        error?.response?.data || error.message
      );

      Alert.alert("Erreur", "Impossible de créer le ticket.");

      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    photos,
    pickFromCamera,
    pickFromGallery,
    removePhoto,

    submitting,
    submitPublicTicket,
  };
}