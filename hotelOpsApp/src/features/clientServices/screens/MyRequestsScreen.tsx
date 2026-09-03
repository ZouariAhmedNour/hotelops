// src/features/services/screens/MyRequestsScreen.tsx
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors } from "../../../theme/colors";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import BookingCard from "../components/BookingCard";
import OrderCard from "../components/OrderCard";
import ScreenState from "../components/ScreenState";
import { useMyBookings, useMyOrders } from "../hooks/useRequests";
import type { ServiceBooking, ServiceOrder } from "../types/service.types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "MyRequests">;
type Tab = "orders" | "bookings";

export default function MyRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();

  const [tab, setTab] = useState<Tab>(params?.tab ?? "orders");

  const orders = useMyOrders();
  const bookings = useMyBookings();

  // Au retour depuis un ecran de detail, on rafraichit l'onglet visible :
  // le statut a pu changer cote hotel entre-temps.
  const refreshOrders = orders.refresh;
  const refreshBookings = bookings.refresh;
  useFocusEffect(
    useCallback(() => {
      if (tab === "orders") void refreshOrders();
      else void refreshBookings();
    }, [refreshBookings, refreshOrders, tab]),
  );

  const renderTabs = () => (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, tab === "orders" && styles.tabActive]}
        onPress={() => setTab("orders")}
        activeOpacity={0.85}
      >
        <Text style={[styles.tabLabel, tab === "orders" && styles.tabLabelActive]}>
          Commandes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, tab === "bookings" && styles.tabActive]}
        onPress={() => setTab("bookings")}
        activeOpacity={0.85}
      >
        <Text style={[styles.tabLabel, tab === "bookings" && styles.tabLabelActive]}>
          Reservations
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (tab === "orders") {
    return (
      <View style={styles.screen}>
        <FlatList<ServiceOrder>
          data={orders.items}
          keyExtractor={(order) => String(order.id)}
          contentContainerStyle={styles.content}
          ListHeaderComponent={renderTabs}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() =>
                navigation.navigate("OrderDetail", { orderId: item.id })
              }
            />
          )}
          ListEmptyComponent={
            <ScreenState
              loading={orders.loading}
              error={orders.error}
              empty={!orders.loading && !orders.error}
              emptyTitle="Aucune commande"
              emptyMessage="Vos commandes room service apparaitront ici."
              emptyIcon="receipt-outline"
              onRetry={orders.reload}
            />
          }
          ListFooterComponent={
            orders.loadingMore ? (
              <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : null
          }
          onEndReachedThreshold={0.4}
          onEndReached={orders.loadMore}
          refreshControl={
            <RefreshControl
              refreshing={orders.refreshing}
              onRefresh={orders.refresh}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList<ServiceBooking>
        data={bookings.bookings}
        keyExtractor={(booking) => `${booking.domain}-${booking.id}`}
        contentContainerStyle={styles.content}
        ListHeaderComponent={renderTabs}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() =>
              navigation.navigate("BookingDetail", {
                bookingId: item.id,
                domain: item.domain,
              })
            }
          />
        )}
        ListEmptyComponent={
          <ScreenState
            loading={bookings.loading}
            error={bookings.error}
            empty={!bookings.loading && !bookings.error}
            emptyTitle="Aucune reservation"
            emptyMessage="Table, soin ou creneau : vos reservations s'affichent ici."
            emptyIcon="calendar-outline"
            onRetry={bookings.refetch}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={bookings.refreshing}
            onRefresh={bookings.refresh}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  tabs: {
    flexDirection: "row",
    backgroundColor: "#EEF1F7",
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.white,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.text,
    fontWeight: "700",
  },
  loader: {
    marginVertical: 18,
  },
});