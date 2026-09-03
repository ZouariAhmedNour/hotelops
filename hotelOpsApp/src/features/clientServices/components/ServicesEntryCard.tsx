// src/features/services/components/ServicesEntryCard.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors } from "../../../theme/colors";
import { shadows } from "../../../theme/shadows";
import type { RootStackParamList } from "../../../navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * A poser dans ton HomeScreen existant pour ouvrir le module services.
 *   import ServicesEntryCard from "../features/services/components/ServicesEntryCard";
 *   <ServicesEntryCard />
 */
export default function ServicesEntryCard() {
  const navigation = useNavigation<Nav>();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ServicesHome")}
      activeOpacity={0.9}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name="sparkles-outline" size={22} color={colors.white} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Services de l'hotel</Text>
        <Text style={styles.subtitle}>
          Room service, restaurant, spa, activites…
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 18,
    ...shadows.card,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  body: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 23,
    fontWeight: "900",
    color: colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 3,
  },
});