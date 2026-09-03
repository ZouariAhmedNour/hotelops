// src/features/services/screens/ServiceCatalogScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";


import { colors } from "../../../theme/colors";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import CartBar from "../components/CartBar";
import ScreenState from "../components/ScreenState";
import ServiceItemCard from "../components/ServiceItemCard";
import { useCart } from "../context/CartContext";
import { useCatalogFilters, useCatalogItems, useCategories } from "../hooks/useCatalog";
import type { GenericBookingDomain, ServiceItem } from "../types/service.types";
import { DOMAIN_DESCRIPTIONS, domainLabel } from "../utils/labels";
import RoleChip from "../../../components/ui/RoleChip";
import AppInput from "../../../components/ui/AppInput";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ServiceCatalog">;

export default function ServiceCatalogScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const domain = params.domain;

  const cart = useCart();
  const [search, setSearchInput] = useState("");
  const filters = useCatalogFilters(params.categoryId);

  /** Recherche differee : on n'interroge le backend qu'apres 400 ms de pause. */
  const applySearch = filters.setSearch;
  useEffect(() => {
    const handle = setTimeout(() => applySearch(search), 400);
    return () => clearTimeout(handle);
  }, [applySearch, search]);

  const categoriesState = useCategories(domain);
  const categories = categoriesState.data ?? [];

  const list = useCatalogItems({
    domain,
    categoryId: filters.categoryId,
    search: filters.search,
  });

  const isRoomService = domain === "ROOM_SERVICE";

  const headerAction = useMemo(() => {
    if (domain === "RESTAURANT") {
      return {
        icon: "wine-outline" as const,
        label: "Reserver une table",
        onPress: () => navigation.navigate("RestaurantBooking", {}),
      };
    }
    if (domain === "SPA") {
      return {
        icon: "flower-outline" as const,
        label: "Reserver un soin",
        onPress: () => navigation.navigate("SpaBooking", {}),
      };
    }
    if (!isRoomService) {
      return {
        icon: "calendar-outline" as const,
        label: "Reserver un creneau",
        onPress: () =>
          navigation.navigate("GenericBooking", {
            domain: domain as GenericBookingDomain,
          }),
      };
    }
    return null;
  }, [domain, isRoomService, navigation]);

  const openItem = (item: ServiceItem) =>
    navigation.navigate("ServiceItemDetail", { itemId: item.id });

  const quickAdd = (item: ServiceItem) => {
    // Un article a options se configure sur l'ecran de detail.
    if ((item.options?.length ?? 0) > 0 || (item.supplements?.length ?? 0) > 0) {
      openItem(item);
      return;
    }
    cart.addLine({ item, quantity: 1 });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.subtitle}>{DOMAIN_DESCRIPTIONS[domain]}</Text>

      {headerAction ? (
        <TouchableOpacity
          style={styles.cta}
          onPress={headerAction.onPress}
          activeOpacity={0.9}
        >
          <Ionicons name={headerAction.icon} size={17} color={colors.white} />
          <Text style={styles.ctaLabel}>{headerAction.label}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.white} />
        </TouchableOpacity>
      ) : null}

      <AppInput
        placeholder="Rechercher un article…"
        value={search}
        onChangeText={setSearchInput}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <RoleChip
            label="Tout"
            active={filters.categoryId === undefined}
            onPress={() => filters.setCategoryId(undefined)}
          />
          {categories.map((category) => (
            <RoleChip
              key={category.id}
              label={category.name}
              active={filters.categoryId === category.id}
              onPress={() => filters.toggleCategory(category.id)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={list.items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.content,
          isRoomService && cart.count > 0 && styles.contentWithCart,
        ]}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <ServiceItemCard
            item={item}
            onPress={() => openItem(item)}
            onQuickAdd={isRoomService ? () => quickAdd(item) : undefined}
            quantityInCart={cart.quantityForItem(item.id)}
          />
        )}
        ListEmptyComponent={
          <ScreenState
            loading={list.loading}
            error={list.error}
            empty={!list.loading && !list.error}
            emptyTitle="Aucun article"
            emptyMessage={`Aucun service n'est disponible pour ${domainLabel(domain)} pour le moment.`}
            emptyIcon="search-outline"
            onRetry={list.reload}
          />
        }
        ListFooterComponent={
          list.loadingMore ? (
            <ActivityIndicator style={styles.footerLoader} color={colors.primary} />
          ) : null
        }
        onEndReachedThreshold={0.4}
        onEndReached={list.loadMore}
        refreshControl={
          <RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {isRoomService ? (
        <CartBar onPress={() => navigation.navigate("RoomServiceCart")} />
      ) : null}
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
    paddingBottom: 30,
    flexGrow: 1,
  },
  contentWithCart: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 14,
    lineHeight: 20,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  ctaLabel: {
    flex: 1,
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  chips: {
    gap: 8,
    paddingBottom: 16,
    paddingTop: 2,
  },
  footerLoader: {
    marginVertical: 18,
  },
});