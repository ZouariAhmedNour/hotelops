// src/features/services/screens/GenericBookingScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
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
import * as bookingApi from "../api/bookingApi";
import { useMutation } from "../hooks/useAsync";
import { useCatalogItems, useCategories, useSlots } from "../hooks/useCatalog";
import { DEFAULT_BOOKING_DURATION_MINUTES } from "../types/service.types";
import { buildTimeOptions, toApiDate } from "../utils/datetime";
import { DOMAIN_DESCRIPTIONS, domainIcon, domainLabel } from "../utils/labels";
import { priceLabel } from "../utils/money";
import AppCard from "../../../components/ui/AppCard";
import AppInput from "../../../components/ui/AppInput";
import AppButton from "../../../components/ui/AppButton";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "GenericBooking">;

export default function GenericBookingScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const domain = params.domain;

  const [itemId, setItemId] = useState<number | undefined>(params.itemId);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState<string | null>(null);
  const [withParty, setWithParty] = useState(false);
  const [partySize, setPartySize] = useState(2);
  const [roomNumber, setRoomNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Les prestations du domaine : facultatives, certains domaines
  // (CONCIERGERIE par exemple) n'ont pas d'article a selectionner.
  const list = useCatalogItems({ domain, limit: 50 });
  const items = list.items;

  const categoriesState = useCategories(domain);
  const categoryId = categoriesState.data?.[0]?.id;

  const selected = useMemo(
    () => items.find((item) => item.id === itemId),
    [itemId, items],
  );

  const duration = selected?.durationMinutes ?? DEFAULT_BOOKING_DURATION_MINUTES;

  const slotsState = useSlots({
    itemId,
    categoryId,
    date,
    enabled: itemId !== undefined || categoryId !== undefined,
  });

  const timeOptions = useMemo(
    () =>
      buildTimeOptions({
        slots: slotsState.slots,
        durationMinutes: duration,
        forDate: date,
      }),
    [date, duration, slotsState.slots],
  );

  useEffect(() => {
    if (time && !timeOptions.includes(time)) setTime(null);
  }, [time, timeOptions]);

  const { mutate, loading: submitting, error } = useMutation(
    bookingApi.createBooking,
    {
      onSuccess: (booking) => {
        navigation.replace("BookingDetail", {
          bookingId: booking.id,
          domain,
        });
      },
    },
  );

  const submit = () => {
    if (!time) {
      Alert.alert("Horaire manquant", "Choisissez un horaire pour votre creneau.");
      return;
    }

    void mutate({
      domain,
      itemId,
      bookingDate: toApiDate(date),
      startTime: time,
      partySize: withParty ? partySize : undefined,
      durationMinutes: duration,
      roomNumber: roomNumber || undefined,
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
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name={domainIcon(domain) as keyof typeof Ionicons.glyphMap}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{domainLabel(domain)}</Text>
            <Text style={styles.heroSubtitle}>{DOMAIN_DESCRIPTIONS[domain]}</Text>
          </View>
        </View>

        {items.length > 0 ? (
          <AppCard style={styles.card}>
            <SectionTitle
              title="Prestation"
              subtitle="Facultatif : laissez vide pour une demande generale."
            />

            <TouchableOpacity
              style={[styles.option, itemId === undefined && styles.optionSelected]}
              onPress={() => {
                setItemId(undefined);
                setTime(null);
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionName,
                  itemId === undefined && styles.optionNameSelected,
                ]}
              >
                Aucune prestation precise
              </Text>
              {itemId === undefined ? (
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              ) : null}
            </TouchableOpacity>

            {items.map((item) => {
              const isSelected = item.id === itemId;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    setItemId(item.id);
                    setTime(null);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.optionBody}>
                    <Text
                      style={[styles.optionName, isSelected && styles.optionNameSelected]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.optionMeta, isSelected && styles.optionMetaSelected]}
                    >
                      {priceLabel(item)}
                      {item.durationMinutes ? ` · ${item.durationMinutes} min` : ""}
                    </Text>
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </AppCard>
        ) : null}

        <AppCard style={styles.card}>
          <SectionTitle title="Date" />
          <DateStrip value={date} onChange={setDate} />
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle title="Horaire" subtitle={`Duree : ${duration} min`} />
          <TimeGrid
            options={timeOptions}
            value={time}
            onChange={setTime}
            loading={slotsState.loading || categoriesState.loading}
            emptyMessage="Aucun creneau ouvert a cette date."
          />
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle
            title="Participants"
            right={
              <Switch
                value={withParty}
                onValueChange={setWithParty}
                trackColor={{ true: colors.primary, false: "#D5D9E3" }}
                thumbColor={colors.white}
              />
            }
          />
          {withParty ? (
            <View style={styles.row}>
              <QuantityStepper
                value={partySize}
                onChange={setPartySize}
                min={1}
                max={200}
              />
              <Text style={styles.rowValue}>
                {partySize} personne{partySize > 1 ? "s" : ""}
              </Text>
            </View>
          ) : (
            <Text style={styles.hint}>
              Activez pour indiquer un nombre de participants.
            </Text>
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
            label="Note (facultatif)"
            placeholder="Precisez votre demande…"
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
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#EEF1F7",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  card: {
    marginBottom: 14,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#EEF1F7",
    marginBottom: 10,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionBody: {
    flex: 1,
    paddingRight: 10,
  },
  optionName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  optionNameSelected: {
    color: colors.white,
  },
  optionMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  optionMetaSelected: {
    color: "rgba(255,255,255,0.85)",
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