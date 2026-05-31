import React from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type * as ImagePicker from "expo-image-picker";

import { colors } from "../../../theme/colors";

type Props = {
  photos: ImagePicker.ImagePickerAsset[];
  onAddFromCamera: () => void;
  onAddFromGallery: () => void;
  onRemove: (uri: string) => void;
};

export default function PhotoUploader({
  photos,
  onAddFromCamera,
  onAddFromGallery,
  onRemove,
}: Props) {
  return (
    <>
      <Pressable style={styles.uploadBox} onPress={onAddFromCamera}>
        <View style={styles.cameraBubble}>
          <Feather name="camera" size={28} color={colors.primary} />
        </View>

        <Text style={styles.uploadText}>Ajouter une photo</Text>

        <Text style={styles.uploadSubText}>
          Touchez pour ouvrir la caméra
        </Text>
      </Pressable>

      <View style={styles.photoActions}>
        <Pressable style={styles.smallAction} onPress={onAddFromCamera}>
          <Feather name="camera" size={18} color={colors.primary} />
          <Text style={styles.smallActionText}>Caméra</Text>
        </Pressable>

        <Pressable style={styles.smallAction} onPress={onAddFromGallery}>
          <Feather name="image" size={18} color={colors.primary} />
          <Text style={styles.smallActionText}>Galerie</Text>
        </Pressable>
      </View>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photosList}
        >
          {photos.map((photo) => (
            <Pressable
              key={photo.uri}
              onLongPress={() => onRemove(photo.uri)}
              style={styles.photoThumbWrap}
            >
              <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  uploadBox: {
    backgroundColor: colors.inputBackground,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D9DDE7",
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  cameraBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  uploadText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.mutedLight,
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
    color: colors.primary,
    fontWeight: "700",
  },

  photosList: {
    marginTop: 14,
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