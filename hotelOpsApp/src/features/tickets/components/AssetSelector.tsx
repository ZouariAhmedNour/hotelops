import React from "react";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import type { SelectableAssetItem } from "../types";

type FeatherIconName = keyof typeof Feather.glyphMap;

type Props = {
  assets: SelectableAssetItem[];
  selectedIds: number[];
  onToggle: (assetId: number) => void;
  emptyMessage?: string;
};

const hasFeatherIcon = (value?: string | null): value is FeatherIconName => {
  return Boolean(value && value in Feather.glyphMap);
};

const getAssetIcon = (asset: SelectableAssetItem): FeatherIconName => {
  if (hasFeatherIcon(asset.icon)) {
    return asset.icon;
  }

  const searchText =
    `${asset.name} ${asset.code} ${asset.category ?? ""}`.toUpperCase();

  if (searchText.includes("TV") || searchText.includes("TÉLÉVISION")) {
    return "tv";
  }

  if (
    searchText.includes("CLIM") ||
    searchText.includes("AIR") ||
    searchText.includes("VENTIL")
  ) {
    return "wind";
  }

  if (searchText.includes("WIFI") || searchText.includes("WI-FI")) {
    return "wifi";
  }

  if (searchText.includes("TÉLÉPHONE") || searchText.includes("PHONE")) {
    return "phone";
  }

  if (
    searchText.includes("PRISE") ||
    searchText.includes("ÉLECTRIQUE") ||
    searchText.includes("ALIMENTATION")
  ) {
    return "zap";
  }

  if (
    searchText.includes("DOUCHE") ||
    searchText.includes("LAVABO") ||
    searchText.includes("ROBINET") ||
    searchText.includes("WC")
  ) {
    return "droplet";
  }

  if (
    searchText.includes("SERRURE") ||
    searchText.includes("CARTE") ||
    searchText.includes("COFFRE")
  ) {
    return "lock";
  }

  if (searchText.includes("CAMÉRA") || searchText.includes("SECUR")) {
    return "shield";
  }

  if (searchText.includes("FRIGO") || searchText.includes("MINI-BAR")) {
    return "coffee";
  }

  return "tool";
};

export default function AssetSelector({
  assets,
  selectedIds,
  onToggle,
  emptyMessage = "Aucun équipement spécifique pour cet endroit.",
}: Props) {
  if (assets.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Feather name="info" size={18} color={colors.mutedLight} />

        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {assets.map((asset) => {
        const selected = selectedIds.includes(asset.id);
        const displayName = asset.label?.trim() || asset.name;

        return (
          <Pressable
            key={asset.id}
            onPress={() => onToggle(asset.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            style={[styles.card, selected && styles.cardSelected]}
          >
            <View
              style={[
                styles.iconBox,
                selected && styles.iconBoxSelected,
              ]}
            >
              <Feather
                name={getAssetIcon(asset)}
                size={19}
                color={selected ? colors.white : colors.primary}
              />
            </View>

            <View style={styles.content}>
              <Text
                numberOfLines={2}
                style={[styles.name, selected && styles.nameSelected]}
              >
                {displayName}
              </Text>

              <Text
                numberOfLines={1}
                style={[styles.meta, selected && styles.metaSelected]}
              >
                {asset.code}
                {asset.quantity && asset.quantity > 1
                  ? ` · Qté ${asset.quantity}`
                  : ""}
              </Text>
            </View>

            <View
              style={[
                styles.checkbox,
                selected && styles.checkboxSelected,
              ]}
            >
              {selected && (
                <Feather name="check" size={14} color={colors.white} />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 10,
  },

  card: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },

  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  iconBox: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
  },

  iconBoxSelected: {
    backgroundColor: colors.primary,
  },

  content: {
    flex: 1,
  },

  name: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: "800",
  },

  nameSelected: {
    color: colors.primary,
  },

  meta: {
    marginTop: 3,
    color: colors.mutedLight,
    fontSize: 12,
    fontWeight: "600",
  },

  metaSelected: {
    color: colors.primary,
  },

  checkbox: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 7,
    backgroundColor: colors.white,
  },

  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  emptyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.white,
  },

  emptyText: {
    flex: 1,
    color: colors.mutedLight,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
});