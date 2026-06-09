import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import { getAttachmentUrl } from "../../../utils/attachmentUrl";
import { styles } from "../styles/agentTaskDetail.styles";

type Attachment = {
  id: number;
  filePath: string;
  fileName: string;
  mimeType?: string | null;
  photoType?: string | null;
  caption?: string | null;
  createdAt?: string;
};

type LocalPhoto = {
  uri: string;
  name: string;
  type: string;
};

type Props = {
  attachments: Attachment[];
  afterPhotos: LocalPhoto[];
  onAddFromCamera: () => void;
  onAddFromGallery: () => void;
  onRemoveAfterPhoto: (index: number) => void;
};

const normalizePhotoType = (photoType?: string | null) => {
  return photoType?.trim().toUpperCase() || "";
};

const isImageAttachment = (attachment: Attachment) => {
  const mimeType = attachment.mimeType?.toLowerCase() || "";
  const fileName = attachment.fileName?.toLowerCase() || "";
  const filePath = attachment.filePath?.toLowerCase() || "";

  return (
    mimeType.startsWith("image/") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".webp") ||
    filePath.endsWith(".jpg") ||
    filePath.endsWith(".jpeg") ||
    filePath.endsWith(".png") ||
    filePath.endsWith(".webp")
  );
};

const PhotoList = ({
  title,
  photos,
  emptyText,
}: {
  title: string;
  photos: Attachment[];
  emptyText: string;
}) => {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ fontWeight: "800", color: "#0f172a", marginBottom: 10 }}>
        {title}
      </Text>

      {photos.length === 0 ? (
        <Text style={{ color: "#64748b" }}>{emptyText}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {photos.map((photo) => (
            <View key={photo.id} style={{ marginRight: 12 }}>
              <Image
                source={{ uri: getAttachmentUrl(photo.filePath) }}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 16,
                  backgroundColor: "#e2e8f0",
                }}
                resizeMode="cover"
              />

              <Text
                numberOfLines={1}
                style={{
                  marginTop: 6,
                  width: 150,
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                {photo.fileName}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default function AgentTaskPhotoSections({
  attachments,
  afterPhotos,
  onAddFromCamera,
  onAddFromGallery,
  onRemoveAfterPhoto,
}: Props) {
  const imageAttachments = attachments.filter(isImageAttachment);

  const savedAfterPhotos = imageAttachments.filter((attachment) => {
    const type = normalizePhotoType(attachment.photoType);
    return type === "AFTER" || type === "DURING";
  });

  const beforePhotos = imageAttachments.filter((attachment) => {
    const type = normalizePhotoType(attachment.photoType);
    return type !== "AFTER" && type !== "DURING";
  });

  return (
    <View>
      <PhotoList
        title="Photos avant maintenance"
        photos={beforePhotos}
        emptyText="Aucune photo ajoutée lors de la création du ticket."
      />

      <View style={{ marginTop: 18 }}>
        <Text style={{ fontWeight: "800", color: "#0f172a", marginBottom: 10 }}>
          Photos après maintenance à envoyer
        </Text>

        <View style={styles.photoRow}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={onAddFromCamera}
          >
            <Text style={styles.photoButtonText}>📷 Caméra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.photoButton}
            onPress={onAddFromGallery}
          >
            <Text style={styles.photoButtonText}>🖼️ Galerie</Text>
          </TouchableOpacity>
        </View>

        {afterPhotos.length === 0 ? (
          <Text style={{ marginTop: 12, color: "#64748b" }}>
            Aucune photo après maintenance sélectionnée.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 14 }}
          >
            {afterPhotos.map((photo, index) => (
              <View key={`${photo.uri}-${index}`} style={{ marginRight: 12 }}>
                <Image
                  source={{ uri: photo.uri }}
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 16,
                    backgroundColor: "#e2e8f0",
                  }}
                  resizeMode="cover"
                />

                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: 6,
                    width: 150,
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  {photo.name}
                </Text>

                <TouchableOpacity
                  onPress={() => onRemoveAfterPhoto(index)}
                  style={{
                    marginTop: 8,
                    backgroundColor: "#fee2e2",
                    paddingVertical: 8,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#dc2626", fontWeight: "800" }}>
                    Supprimer
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <PhotoList
        title="Photos après maintenance enregistrées"
        photos={savedAfterPhotos}
        emptyText="Aucune photo après maintenance enregistrée."
      />
    </View>
  );
}