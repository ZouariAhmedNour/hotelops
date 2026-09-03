// src/features/services/screens/RestaurantBookingScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import DateStrip from "../components/DateStrip";
import QuantityStepper from "../components/QuantityStepper";
import SectionTitle from "../components/SectionTitle";
import TimeGrid from "../components/TimeGrid";
import * as restaurantApi from "../api/restaurantApi";
import { useAsync, useMutation } from "../hooks/useAsync";
import { useCategories, useSlots } from "../hooks/useCatalog";
import type { RestaurantTable } from "../types/service.types";
import { DEFAULT_BOOKING_DURATION_MINUTES } from "../types/service.types";
import { buildTimeOptions, toApiDate } from "../utils/datetime";
import AppCard from "../../../components/ui/AppCard";
import AppInput from "../../../components/ui/AppInput";
import AppButton from "../../../components/ui/AppButton";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "RestaurantBooking">;

export default function RestaurantBookingScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [tableId, setTableId] = useState<number | undefined>(params?.tableId);
  const [roomNumber, setRoomNumber] = useState("");
  const [occasion, setOccasion] = useState("");
  const [preferences, setPreferences] = useState("");
  const [notes, setNotes] = useState("");

  // Les horaires d'ouverture sont portes par la (ou les) categorie(s)
  // du domaine RESTAURANT : on prend la premiere configuree.
  const categoriesState = useCategories("RESTAURANT");
  const categoryId = categoriesState.data?.[0]?.id;

  const slotsState = useSlots({
    categoryId,
    date,
    enabled: categoryId !== undefined,
  });

  const timeOptions = useMemo(
    () =>
      buildTimeOptions({
        slots: slotsState.slots,
        durationMinutes: DEFAULT_BOOKING_DURATION_MINUTES,
        forDate: date,
      }),
    [date, slotsState.slots],
  );

  // Le creneau selectionne doit rester valide quand la date change.
  useEffect(() => {
    if (time && !timeOptions.includes(time)) setTime(null);
  }, [time, timeOptions]);

  const canSearchTables = Boolean(time);

  const tablesState = useAsync<RestaurantTable[]>(
    () =>
      time
        ? restaurantApi.findAvailableTables({
            bookingDate: toApiDate(date),
            startTime: time,
            partySize,
            durationMinutes: DEFAULT_BOOKING_DURATION_MINUTES,
          })
        : Promise.resolve([]),
    { immediate: canSearchTables, deps: [date, time, partySize] },
  );

  const tables = tablesState.data ?? [];

  // Une table choisie puis devenue indisponible doit etre deselectionnee.
  useEffect(() => {
    if (tableId && tables.length > 0 && !tables.some((t) => t.id === tableId)) {
      setTableId(undefined);
    }
  }, [tableId, tables]);

  const { mutate, loading: submitting, error } = useMutation(
    restaurantApi.createBooking,
    {
      onSuccess: (booking) => {
        navigation.replace("BookingDetail", {
          bookingId: booking.id,
          domain: "RESTAURANT",
        });
      },
    },
  );

  const submit = () => {
    if (!time) {
      Alert.alert("Horaire manquant", "Choisissez un horaire pour votre table.");
      return;
    }

    void mutate({
      bookingDate: toApiDate(date),
      startTime: time,
      partySize,
      tableId,
      durationMinutes: DEFAULT_BOOKING_DURATION_MINUTES,
      roomNumber: roomNumber || undefined,
      occasion: occasion || undefined,
      preferences: preferences || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppCard style={styles.card}>
          <SectionTitle title="Date" />
          <DateStrip value={date} onChange={setDate} />
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle
            title="Horaire"
            subtitle={
              slotsState.slots.length === 0 && !slotsState.loading
                ? "Aucun service configure ce jour-la."
                : undefined
            }
          />
          <TimeGrid
            options={timeOptions}
            value={time}
            onChange={setTime}
            loading={slotsState.loading || categoriesState.loading}
            emptyMessage="Le restaurant est ferme a cette date."
          />
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle title="Nombre de couverts" />
          <View style={styles.row}>
            <QuantityStepper
              value={partySize}
              onChange={setPartySize}
              min={1}
              max={50}
            />
            <Text style={styles.rowValue}>
              {partySize} personne{partySize > 1 ? "s" : ""}
            </Text>
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle
            title="Table"
            subtitle="Laissez vide pour une attribution automatique."
          />

          {!canSearchTables ? (
            <Text style={styles.hint}>
              Choisissez d'abord un horaire pour voir les tables libres.
            </Text>
          ) : tablesState.loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : tablesState.error ? (
            <Text style={styles.errorHint}>{tablesState.error}</Text>
          ) : tables.length === 0 ? (
            <Text style={styles.hint}>
              Aucune table libre pour ce creneau. Essayez un autre horaire.
            </Text>
          ) : (
            <View style={styles.tables}>
              {tables.map((table) => {
                const selected = tableId === table.id;
                return (
                  <TouchableOpacity
                    key={table.id}
                    style={[styles.table, selected && styles.tableSelected]}
                    onPress={() => setTableId(selected ? undefined : table.id)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="grid-outline"
                      size={15}
                      color={selected ? colors.white : colors.primary}
                    />
                    <Text
                      style={[styles.tableLabel, selected && styles.tableLabelSelected]}
                    >
                      {table.name} · {table.seats} pl.
                    </Text>
                    <Text
                      style={[styles.tableRoom, selected && styles.tableLabelSelected]}
                    >
                      {table.room?.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle title="Details" />

          <AppInput
            label="Numero de chambre (facultatif)"
            placeholder="Ex. 402"
            value={roomNumber}
            onChangeText={setRoomNumber}
            maxLength={20}
            autoCapitalize="characters"
          />
          <AppInput
            label="Occasion (facultatif)"
            placeholder="Anniversaire, diner d'affaires…"
            value={occasion}
            onChangeText={setOccasion}
          />
          <AppInput
            label="Preferences (facultatif)"
            placeholder="Pres de la fenetre, table calme…"
            value={preferences}
            onChangeText={setPreferences}
          />
          <AppInput
            label="Note (facultatif)"
            placeholder="Allergies, chaise haute…"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </AppCard>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#E5484D" />
            <Text style={styles.errorLabel}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title="Confirmer la reservation"
          onPress={submit}
          loading={submitting}
          disabled={!time}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  hint: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
  },
  errorHint: {
    fontSize: 13,
    color: "#E5484D",
    lineHeight: 19,
  },
  loader: {
    marginVertical: 10,
  },
  tables: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  table: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#EEF1F7",
  },
  tableSelected: {
    backgroundColor: colors.primary,
  },
  tableLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  tableRoom: {
    fontSize: 12,
    color: colors.muted,
  },
  tableLabelSelected: {
    color: colors.white,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEC",
    borderRadius: 14,
    padding: 12,
  },
  errorLabel: {
    flex: 1,
    color: "#E5484D",
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    padding: 18,
    paddingTop: 14,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: "#EDEFF5",
  },
});