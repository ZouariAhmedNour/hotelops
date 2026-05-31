import React from "react";
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native";

import { colors } from "../../../theme/colors";
import type { PriorityItem } from "../types";

type Props = {
  priorities: PriorityItem[];
  selectedId: number | null;
  onSelect: (priority: PriorityItem) => void;
};

type PriorityStyle = {
  container: ViewStyle;
  text: TextStyle;
};

export default function PrioritySelector({
  priorities,
  selectedId,
  onSelect,
}: Props) {
  return (
    <View style={styles.row}>
      {priorities.map((item) => {
        const active = item.id === selectedId;
        const priorityStyle = stylesByPriority[item.code] || stylesByPriority.medium;

        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item)}
            style={[
              styles.pill,
              active && priorityStyle.container,
            ]}
          >
            <Text
              style={[
                styles.text,
                active && priorityStyle.text,
              ]}
            >
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  pill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#E8EBF3",
    borderWidth: 1,
    borderColor: "transparent",
  },

  text: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4B4F5A",
  },
});

const stylesByPriority: Record<string, PriorityStyle> = {
  critical: {
    container: {
      backgroundColor: colors.dangerBg,
      borderColor: colors.danger,
    },
    text: {
      color: colors.danger,
    },
  },

  high: {
    container: {
      backgroundColor: colors.warningBg,
      borderColor: colors.warning,
    },
    text: {
      color: colors.warning,
    },
  },

  medium: {
    container: {
      backgroundColor: colors.infoBg,
      borderColor: colors.info,
    },
    text: {
      color: colors.info,
    },
  },

  low: {
    container: {
      backgroundColor: colors.successBg,
      borderColor: colors.success,
    },
    text: {
      color: colors.success,
    },
  },
};