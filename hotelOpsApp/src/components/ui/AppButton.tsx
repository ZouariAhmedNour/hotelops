import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
};

export default function AppButton({
  title,
  onPress,
  loading,
  style,
  variant = 'primary',
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, variant === 'secondary' && styles.textSecondary]}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#1C2D5A',
    shadowColor: '#1C2D5A',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  secondary: {
    backgroundColor: '#EEF1F7',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  textSecondary: {
    color: '#1C2D5A',
  },
});