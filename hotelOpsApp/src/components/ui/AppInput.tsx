import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

import { colors } from "../../theme/colors";

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export default function AppInput({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        {...props}
        placeholderTextColor="#B7BBC7"
        style={[styles.input, style]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },

  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
  },

  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E7EAF3",
    color: colors.text,
  },

  error: {
    marginTop: 6,
    color: "#E5484D",
    fontSize: 12,
  },
});