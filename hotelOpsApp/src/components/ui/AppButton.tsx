import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";

import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "secondary";
};

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = "primary",
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.white : colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "secondary" && styles.textSecondary,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  primary: {
    backgroundColor: colors.primary,
    ...shadows.button,
  },

  secondary: {
    backgroundColor: "#EEF1F7",
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  disabled: {
    opacity: 0.6,
  },

  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  textSecondary: {
    color: colors.primary,
  },
});