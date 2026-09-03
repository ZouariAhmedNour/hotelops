// src/features/services/screens/RoomServiceCartScreen.tsx
import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";


import { colors } from "../../../theme/colors";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import QuantityStepper from "../components/QuantityStepper";
import ScreenState from "../components/ScreenState";
import SectionTitle from "../components/SectionTitle";
import * as roomServiceApi from "../api/roomServiceApi";
import { useCart } from "../context/CartContext";
import { useMutation } from "../hooks/useAsync";
import { PAYMENT_METHODS } from "../types/service.types";
import type { PaymentMethod } from "../types/service.types";
import { PAYMENT_LABELS } from "../utils/labels";
import {
  computeLineTotal,
  computeUnitPrice,
  findOptionsByIds,
  findSupplementsByIds,
  formatAmount,
} from "../utils/money";
import AppCard from "../../../components/ui/AppCard";
import AppInput from "../../../components/ui/AppInput";
import RoleChip from "../../../components/ui/RoleChip";
import AppButton from "../../../components/ui/AppButton";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RoomServiceCartScreen() {
  const navigation = useNavigation<Nav>();
  const cart = useCart();
  const [roomError, setRoomError] = useState<string | null>(null);

  const { mutate, loading, error } = useMutation(roomServiceApi.createOrder, {
    onSuccess: (order) => {
      cart.clear();
      navigation.replace("OrderDetail", { orderId: order.id });
    },
  });

  const submit = async () => {
    if (!cart.roomNumber.trim()) {
      setRoomError("Indiquez votre numero de chambre");
      return;
    }
    setRoomError(null);

    const payload = cart.buildOrderPayload();
    if (!payload) return;

    Alert.alert(
      "Confirmer la commande",
      `Total estime : ${formatAmount(cart.total)}\nChambre ${payload.roomNumber}`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Commander", onPress: () => void mutate(payload) },
      ],
    );
  };

  if (cart.lines.length === 0) {
    return (
      <View style={styles.screen}>
        <ScreenState
          empty
          emptyTitle="Votre panier est vide"
          emptyMessage="Parcourez le room service et ajoutez vos articles."
          emptyIcon="bag-handle-outline"
        />
      </View>
    );
  }

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
          <SectionTitle
            title="Votre commande"
            subtitle={`${cart.count} article${cart.count > 1 ? "s" : ""}`}
          />

          {cart.lines.map((line) => {
            const options = findOptionsByIds(line.item.options ?? [], line.optionIds);
            const supplements = findSupplementsByIds(
              line.item.supplements ?? [],
              line.supplementIds,
            );
            const extras = [...options, ...supplements].map((x) => x.name);

            return (
              <View key={line.key} style={styles.line}>
                <View style={styles.lineHeader}>
                  <Text style={styles.lineName} numberOfLines={2}>
                    {line.item.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => cart.removeLine(line.key)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={`Retirer ${line.item.name}`}
                  >
                    <Ionicons name="trash-outline" size={18} color="#E5484D" />
                  </TouchableOpacity>
                </View>

                {extras.length > 0 ? (
                  <Text style={styles.lineExtras}>{extras.join(" · ")}</Text>
                ) : null}

                {line.comment ? (
                  <Text style={styles.lineComment}>« {line.comment} »</Text>
                ) : null}

                <View style={styles.lineFooter}>
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(value) => cart.setLineQuantity(line.key, value)}
                    min={1}
                    compact
                  />
                  <View style={styles.linePrices}>
                    <Text style={styles.lineUnit}>
                      {formatAmount(
                        computeUnitPrice(line.item, line.optionIds, line.supplementIds),
                      )}{" "}
                      / unite
                    </Text>
                    <Text style={styles.lineTotal}>
                      {formatAmount(computeLineTotal(line))}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle title="Livraison" />

          <AppInput
            label="Numero de chambre"
            placeholder="Ex. 402"
            value={cart.roomNumber}
            onChangeText={(value) => {
              cart.setRoomNumber(value);
              if (roomError) setRoomError(null);
            }}
            error={roomError ?? undefined}
            maxLength={20}
            autoCapitalize="characters"
          />

          <AppInput
            label="Instructions (facultatif)"
            placeholder="Laisser devant la porte, appeler avant…"
            value={cart.comment}
            onChangeText={cart.setComment}
            multiline
          />
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle title="Paiement" />
          <View style={styles.paymentChips}>
            {PAYMENT_METHODS.map((method: PaymentMethod) => (
              <RoleChip
                key={method}
                label={PAYMENT_LABELS[method]}
                active={cart.paymentMethod === method}
                onPress={() => cart.setPaymentMethod(method)}
              />
            ))}
          </View>
        </AppCard>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#E5484D" />
            <Text style={styles.errorLabel}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total estime</Text>
          <Text style={styles.totalValue}>{formatAmount(cart.total)}</Text>
        </View>
        <Text style={styles.disclaimer}>
          Le montant final est recalcule par l'hotel a la validation.
        </Text>
        <AppButton title="Commander" onPress={submit} loading={loading} />
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
  line: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F7",
  },
  lineHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  lineName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  lineExtras: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  lineComment: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: "italic",
    marginTop: 4,
  },
  lineFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  linePrices: {
    alignItems: "flex-end",
  },
  lineUnit: {
    fontSize: 11,
    color: colors.muted,
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },
  paymentChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEC",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
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
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.muted,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 12,
  },
});