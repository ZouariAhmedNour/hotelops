// src/features/services/screens/SpaBookingScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
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
import ScreenState from "../components/ScreenState";
import SectionTitle from "../components/SectionTitle";
import TimeGrid from "../components/TimeGrid";
import * as spaApi from "../api/spaApi";
import { useAsync, useMutation } from "../hooks/useAsync";
import { useSlots } from "../hooks/useCatalog";
import {
  DEFAULT_BOOKING_DURATION_MINUTES,
  GENDER_PREFERENCES,
} from "../types/service.types";
import type {
  GenderPreference,
  SpaTherapist,
  SpaTreatment,
} from "../types/service.types";
import { buildTimeOptions, toApiDate } from "../utils/datetime";
import { GENDER_PREFERENCE_LABELS, therapistName } from "../utils/labels";
import { formatPrice } from "../utils/money";
import AppCard from "../../../components/ui/AppCard";
import RoleChip from "../../../components/ui/RoleChip";
import AppInput from "../../../components/ui/AppInput";
import AppButton from "../../../components/ui/AppButton";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "SpaBooking">;

export default function SpaBookingScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();

  const [treatmentItemId, setTreatmentItemId] = useState<number | undefined>(
    params?.itemId,
  );
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState<string | null>(null);
  const [therapistId, setTherapistId] = useState<number | undefined>();
  const [genderPreference, setGenderPreference] =
    useState<GenderPreference>("NO_PREFERENCE");
  const [roomNumber, setRoomNumber] = useState("");
  const [notes, setNotes] = useState("");

  const treatmentsState = useAsync<SpaTreatment[]>(
    () => spaApi.listTreatments(),
    { deps: [] },
  );
  const treatments = treatmentsState.data ?? [];

  const selected = useMemo(
    () => treatments.find((t) => t.item?.id === treatmentItemId),
    [treatmentItemId, treatments],
  );

  // Pre-selection du premier soin quand on arrive sans itemId.
  useEffect(() => {
    if (!treatmentItemId && treatments.length > 0) {
      setTreatmentItemId(treatments[0].item?.id);
    }
  }, [treatmentItemId, treatments]);

  const duration =
    selected?.item?.durationMinutes ?? DEFAULT_BOOKING_DURATION_MINUTES;

  const slotsState = useSlots({
    itemId: treatmentItemId,
    categoryId: selected?.item?.categoryId,
    date,
    enabled: treatmentItemId !== undefined,
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

  const allowChoice = selected?.allowTherapistChoice ?? false;

  const therapistsState = useAsync<SpaTherapist[]>(
    () =>
      selected
        ? spaApi.listTherapists({
            treatmentId: selected.id,
            gender:
              genderPreference === "NO_PREFERENCE" ? undefined : genderPreference,
          })
        : Promise.resolve([]),
    { immediate: Boolean(selected), deps: [selected?.id, genderPreference] },
  );
  const therapists = therapistsState.data ?? [];

  // Un therapeute filtre par le genre doit etre deselectionne.
  useEffect(() => {
    if (therapistId && !therapists.some((t) => t.id === therapistId)) {
      setTherapistId(undefined);
    }
  }, [therapistId, therapists]);

  const { mutate, loading: submitting, error } = useMutation(
    spaApi.createBooking,
    {
      onSuccess: (booking) => {
        navigation.replace("BookingDetail", {
          bookingId: booking.id,
          domain: "SPA",
        });
      },
    },
  );

  const submit = () => {
    if (!treatmentItemId) {
      Alert.alert("Soin manquant", "Choisissez un soin a reserver.");
      return;
    }
    if (!time) {
      Alert.alert("Horaire manquant", "Choisissez un horaire pour votre soin.");
      return;
    }

    void mutate({
      itemId: treatmentItemId,
      bookingDate: toApiDate(date),
      startTime: time,
      therapistId,
      genderPreference,
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
      <ScreenState
        loading={treatmentsState.loading}
        error={treatmentsState.error}
        empty={!treatmentsState.loading && treatments.length === 0}
        emptyTitle="Aucun soin disponible"
        emptyMessage="Le spa n'a pas encore de soin configure."
        emptyIcon="flower-outline"
        onRetry={treatmentsState.refetch}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AppCard style={styles.card}>
            <SectionTitle title="Soin" />
            {treatments.map((treatment) => {
              const isSelected = treatment.item?.id === treatmentItemId;
              return (
                <TouchableOpacity
                  key={treatment.id}
                  style={[styles.treatment, isSelected && styles.treatmentSelected]}
                  onPress={() => {
                    setTreatmentItemId(treatment.item?.id);
                    setTherapistId(undefined);
                    setTime(null);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.treatmentBody}>
                    <Text
                      style={[
                        styles.treatmentName,
                        isSelected && styles.treatmentNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {treatment.item?.name}
                    </Text>
                    <Text
                      style={[
                        styles.treatmentMeta,
                        isSelected && styles.treatmentMetaSelected,
                      ]}
                    >
                      {formatPrice(treatment.item?.price)}
                      {treatment.item?.durationMinutes
                        ? ` · ${treatment.item.durationMinutes} min`
                        : ""}
                    </Text>
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </AppCard>

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
              loading={slotsState.loading}
              emptyMessage="Le spa est ferme a cette date."
            />
          </AppCard>

          <AppCard style={styles.card}>
            <SectionTitle title="Preference de genre" />
            <View style={styles.chips}>
              {GENDER_PREFERENCES.map((preference) => (
                <RoleChip
                  key={preference}
                  label={GENDER_PREFERENCE_LABELS[preference]}
                  active={genderPreference === preference}
                  onPress={() => setGenderPreference(preference)}
                />
              ))}
            </View>
          </AppCard>

          {allowChoice ? (
            <AppCard style={styles.card}>
              <SectionTitle
                title="Therapeute"
                subtitle="Laissez vide pour une attribution automatique."
              />
              {therapists.length === 0 ? (
                <Text style={styles.hint}>
                  Aucun therapeute ne correspond a ce filtre.
                </Text>
              ) : (
                <View style={styles.chips}>
                  {therapists.map((therapist) => (
                    <RoleChip
                      key={therapist.id}
                      label={therapistName(therapist)}
                      active={therapistId === therapist.id}
                      onPress={() =>
                        setTherapistId(
                          therapistId === therapist.id ? undefined : therapist.id,
                        )
                      }
                    />
                  ))}
                </View>
              )}
            </AppCard>
          ) : null}

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
              placeholder="Zones a eviter, pression souhaitee…"
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
            disabled={!time || !treatmentItemId}
          />
        </View>
      </ScreenState>
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
  treatment: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#EEF1F7",
    marginBottom: 10,
  },
  treatmentSelected: {
    backgroundColor: colors.primary,
  },
  treatmentBody: {
    flex: 1,
    paddingRight: 10,
  },
  treatmentName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  treatmentNameSelected: {
    color: colors.white,
  },
  treatmentMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  treatmentMetaSelected: {
    color: "rgba(255,255,255,0.85)",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hint: {
    fontSize: 13,
    color: colors.muted,
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