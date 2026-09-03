// src/features/services/components/ServiceItemCard.tsx
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import { shadows } from "../../../theme/shadows";
import type { ServiceItem } from "../types/service.types";
import { priceLabel } from "../utils/money";
import { resolvePhotoUrl } from "../utils/media";

type Props = {
  item: ServiceItem;
  onPress: () => void;
  /** Bouton "+" rapide, uniquement pour le room service. */
  onQuickAdd?: () => void;
  /** Quantite deja au panier, affichee en pastille. */
  quantityInCart?: number;
};

export default function ServiceItemCard({
  item,
  onPress,
  onQuickAdd,
  quantityInCart = 0,
}: Props) {
  const photo = resolvePhotoUrl(item.photos?.[0]);
  const unavailable = !item.isAvailable;

  return (
    <TouchableOpacity
      style={[styles.card, unavailable && styles.cardDisabled]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {photo ? (
  <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
) : (
  <View style={[styles.photo, styles.photoPlaceholder]}>
    <Ionicons name="image-outline" size={22} color={colors.muted} />
  </View>
)}

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.price}>{priceLabel(item)}</Text>

          {item.durationMinutes ? (
            <View style={styles.meta}>
              <Ionicons name="time-outline" size={13} color={colors.muted} />
              <Text style={styles.metaLabel}>{item.durationMinutes} min</Text>
            </View>
          ) : null}

          {item.prepTimeMinutes ? (
            <View style={styles.meta}>
              <Ionicons name="flame-outline" size={13} color={colors.muted} />
              <Text style={styles.metaLabel}>~{item.prepTimeMinutes} min</Text>
            </View>
          ) : null}
        </View>

        {unavailable ? (
          <Text style={styles.unavailable}>Indisponible actuellement</Text>
        ) : null}
      </View>

      {onQuickAdd && !unavailable ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={onQuickAdd}
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Ajouter ${item.name}`}
        >
          {quantityInCart > 0 ? (
            <Text style={styles.addBadge}>{quantityInCart}</Text>
          ) : (
            <Ionicons name="add" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    ...shadows.card,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  photo: {
    width: 74,
    height: 74,
    borderRadius: 18,
    backgroundColor: "#EEF1F7",
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  description: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 3,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 12,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  unavailable: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#E5484D",
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBadge: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});