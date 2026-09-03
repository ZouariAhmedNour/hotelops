// src/features/services/screens/ServicesHomeScreen.tsx
import React, { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors } from "../../../theme/colors";
import { useAuth } from "../../../contexts/AuthContext";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import DomainCard from "../components/DomainCard";
import ScreenState from "../components/ScreenState";
import SectionTitle from "../components/SectionTitle";
import { useCart } from "../context/CartContext";
import { useCategories } from "../hooks/useCatalog";
import type { GenericBookingDomain, ServiceDomain } from "../types/service.types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIMARY_DOMAINS: ServiceDomain[] = ["ROOM_SERVICE", "RESTAURANT", "SPA"];
const OTHER_DOMAINS: GenericBookingDomain[] = [
  "PLAYROOM",
  "POOL",
  "FITNESS",
  "ACTIVITY",
  "CONCIERGERIE",
];

export default function ServicesHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { count } = useCart();

  // Une seule requete : sert a compter les categories par domaine
  // et a masquer les domaines que l'hotel n'a pas configures.
  const { data, loading, refreshing, error, refresh, refetch } = useCategories();

  const countsByDomain = useMemo(() => {
    const map = new Map<string, number>();
    for (const category of data ?? []) {
      map.set(category.domain, (map.get(category.domain) ?? 0) + 1);
    }
    return map;
  }, [data]);

  const hasDomain = (domain: string) =>
    (data?.length ?? 0) === 0 ? true : countsByDomain.has(domain);

  const openDomain = (domain: ServiceDomain) => {
    if (domain === "RESTAURANT") {
      navigation.navigate("ServiceCatalog", { domain });
      return;
    }
    navigation.navigate("ServiceCatalog", { domain });
  };

  return (
    <View style={styles.screen}>
      <ScreenState
        loading={loading}
        error={error}
        onRetry={refetch}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
        >
          <View style={styles.hero}>
            <Text style={styles.heroGreeting}>
              Bonjour{user?.firstName ? ` ${user.firstName}` : ""} 👋
            </Text>
            <Text style={styles.heroTitle}>Que puis-je faire pour vous ?</Text>

            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroAction}
                onPress={() => navigation.navigate("MyRequests", { tab: "orders" })}
                activeOpacity={0.85}
              >
                <Ionicons name="receipt-outline" size={16} color={colors.white} />
                <Text style={styles.heroActionLabel}>Mes demandes</Text>
              </TouchableOpacity>

              {count > 0 ? (
                <TouchableOpacity
                  style={styles.heroAction}
                  onPress={() => navigation.navigate("RoomServiceCart")}
                  activeOpacity={0.85}
                >
                  <Ionicons name="bag-handle-outline" size={16} color={colors.white} />
                  <Text style={styles.heroActionLabel}>Panier ({count})</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle
              title="Services principaux"
              subtitle="Commandez en chambre ou reservez votre place"
            />
            {PRIMARY_DOMAINS.filter((domain) => hasDomain(domain)).map((domain) => (
              <DomainCard
                key={domain}
                domain={domain}
                onPress={() => openDomain(domain)}
              />
            ))}
          </View>

          <View style={styles.section}>
            <SectionTitle
              title="Loisirs & conciergerie"
              subtitle="Reservez un creneau en quelques secondes"
            />
            {OTHER_DOMAINS.filter((domain) => hasDomain(domain)).map((domain) => (
              <DomainCard
                key={domain}
                domain={domain}
                onPress={() => navigation.navigate("ServiceCatalog", { domain })}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => navigation.navigate("MyRequests", { tab: "bookings" })}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={17} color={colors.primary} />
            <Text style={styles.footerLinkLabel}>Voir mes reservations</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </ScrollView>
      </ScreenState>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 26,
    padding: 20,
    marginBottom: 22,
  },
  heroGreeting: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600",
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
    lineHeight: 28,
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },
  heroAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  heroActionLabel: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  footerLinkLabel: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
});