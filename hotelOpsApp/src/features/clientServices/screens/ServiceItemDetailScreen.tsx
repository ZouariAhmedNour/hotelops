// src/features/services/screens/ServiceItemDetailScreen.tsx
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";


import { colors } from "../../../theme/colors";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import OptionRow from "../components/OptionRow";
import QuantityStepper from "../components/QuantityStepper";
import ScreenState from "../components/ScreenState";
import SectionTitle from "../components/SectionTitle";
import { useCart } from "../context/CartContext";
import { useServiceItem } from "../hooks/useCatalog";
import type { GenericBookingDomain } from "../types/service.types";
import { domainLabel } from "../utils/labels";
import { computeUnitPrice, formatAmount, priceLabel } from "../utils/money";
import AppCard from "../../../components/ui/AppCard";
import AppInput from "../../../components/ui/AppInput";
import AppButton from "../../../components/ui/AppButton";
import { resolvePhotoUrl } from "../utils/media";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ServiceItemDetail">;

export default function ServiceItemDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();

  const { data: item, loading, error, refetch } = useServiceItem(params.itemId);
  const cart = useCart();

  const [quantity, setQuantity] = useState(1);
  const [optionIds, setOptionIds] = useState<number[]>([]);
  const [supplementIds, setSupplementIds] = useState<number[]>([]);
  const [comment, setComment] = useState("");

  const unitPrice = useMemo(
    () => (item ? computeUnitPrice(item, optionIds, supplementIds) : 0),
    [item, optionIds, supplementIds],
  );

  const toggle = (
    id: number,
    list: number[],
    setter: (value: number[]) => void,
  ) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleAddToCart = () => {
    if (!item) return;
    cart.addLine({ item, quantity, optionIds, supplementIds, comment });
    navigation.navigate("RoomServiceCart");
  };

  const handleBook = () => {
    if (!item) return;

    if (item.domain === "SPA") {
      navigation.navigate("SpaBooking", { itemId: item.id });
      return;
    }
    if (item.domain === "RESTAURANT") {
      navigation.navigate("RestaurantBooking", {
        tableId: item.restaurantTable?.id,
      });
      return;
    }
    navigation.navigate("GenericBooking", {
      domain: item.domain as GenericBookingDomain,
      itemId: item.id,
    });
  };

  return (
    <View style={styles.screen}>
      <ScreenState loading={loading} error={error} onRetry={refetch}>
        {item ? (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {item.photos?.[0] ? (
                <Image
                  source={{ uri: resolvePhotoUrl(item.photos[0]) }}
                  style={styles.cover}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cover, styles.coverPlaceholder]}>
                  <Ionicons name="image-outline" size={34} color={colors.muted} />
                </View>
              )}

              <View style={styles.headerBlock}>
                <Text style={styles.category}>
                  {item.category?.name ?? domainLabel(item.domain)}
                </Text>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.price}>{priceLabel(item)}</Text>

                {item.description ? (
                  <Text style={styles.description}>{item.description}</Text>
                ) : null}

                <View style={styles.metaRow}>
                  {item.durationMinutes ? (
                    <View style={styles.meta}>
                      <Ionicons name="time-outline" size={14} color={colors.muted} />
                      <Text style={styles.metaLabel}>{item.durationMinutes} min</Text>
                    </View>
                  ) : null}
                  {item.prepTimeMinutes ? (
                    <View style={styles.meta}>
                      <Ionicons name="flame-outline" size={14} color={colors.muted} />
                      <Text style={styles.metaLabel}>
                        Preparation ~{item.prepTimeMinutes} min
                      </Text>
                    </View>
                  ) : null}
                  {!item.isAvailable ? (
                    <View style={styles.meta}>
                      <Ionicons name="close-circle-outline" size={14} color="#E5484D" />
                      <Text style={[styles.metaLabel, styles.metaDanger]}>
                        Indisponible
                      </Text>
                    </View>
                  ) : null}
                </View>

                {item.allergens?.length > 0 ? (
                  <View style={styles.allergens}>
                    <Ionicons name="warning-outline" size={14} color="#B45309" />
                    <Text style={styles.allergensLabel}>
                      Allergenes : {item.allergens.join(", ")}
                    </Text>
                  </View>
                ) : null}
              </View>

              {item.domain === "ROOM_SERVICE" ? (
                <>
                  {item.options?.length > 0 ? (
                    <AppCard style={styles.card}>
                      <SectionTitle
                        title="Options"
                        subtitle="Personnalisez votre article"
                      />
                      {item.options.map((option) => (
                        <OptionRow
                          key={option.id}
                          label={option.name}
                          price={option.priceDelta}
                          isDelta
                          selected={optionIds.includes(option.id)}
                          onToggle={() => toggle(option.id, optionIds, setOptionIds)}
                        />
                      ))}
                    </AppCard>
                  ) : null}

                  {item.supplements?.length > 0 ? (
                    <AppCard style={styles.card}>
                      <SectionTitle title="Supplements" />
                      {item.supplements.map((supplement) => (
                        <OptionRow
                          key={supplement.id}
                          label={supplement.name}
                          price={supplement.price}
                          selected={supplementIds.includes(supplement.id)}
                          onToggle={() =>
                            toggle(supplement.id, supplementIds, setSupplementIds)
                          }
                        />
                      ))}
                    </AppCard>
                  ) : null}

                  <AppCard style={styles.card}>
                    <SectionTitle title="Quantite" />
                    <View style={styles.quantityRow}>
                      <QuantityStepper value={quantity} onChange={setQuantity} />
                      <Text style={styles.lineTotal}>
                        {formatAmount(unitPrice * quantity)}
                      </Text>
                    </View>

                    <View style={styles.commentBlock}>
                      <AppInput
                        label="Note pour la cuisine (facultatif)"
                        placeholder="Sans oignons, cuisson a point…"
                        value={comment}
                        onChangeText={setComment}
                        multiline
                      />
                    </View>
                  </AppCard>
                </>
              ) : (
                <AppCard style={styles.card}>
                  <SectionTitle
                    title="Reservation"
                    subtitle="Choisissez une date et un horaire a l'etape suivante."
                  />
                  {item.spaTreatment ? (
                    <Text style={styles.hint}>
                      {item.spaTreatment.allowTherapistChoice
                        ? "Vous pourrez choisir votre therapeute."
                        : "Un therapeute vous sera assigne automatiquement."}
                    </Text>
                  ) : null}
                  {item.restaurantTable ? (
                    <Text style={styles.hint}>
                      Table {item.restaurantTable.name} ·{" "}
                      {item.restaurantTable.room?.name} ·{" "}
                      {item.restaurantTable.seats} couverts
                    </Text>
                  ) : null}
                </AppCard>
              )}
            </ScrollView>

            <View style={styles.footer}>
              {item.domain === "ROOM_SERVICE" ? (
                <AppButton
                  title={
                    item.isAvailable
                      ? `Ajouter · ${formatAmount(unitPrice * quantity)}`
                      : "Article indisponible"
                  }
                  onPress={handleAddToCart}
                  disabled={!item.isAvailable}
                />
              ) : (
                <AppButton
                  title={item.isAvailable ? "Reserver" : "Service indisponible"}
                  onPress={handleBook}
                  disabled={!item.isAvailable}
                />
              )}
            </View>
          </>
        ) : null}
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
    paddingBottom: 24,
  },
  cover: {
    width: "100%",
    height: 210,
    backgroundColor: "#EEF1F7",
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerBlock: {
    padding: 18,
  },
  category: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginTop: 6,
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 21,
    marginTop: 10,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 14,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  metaDanger: {
    color: "#E5484D",
    fontWeight: "600",
  },
  allergens: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 14,
    backgroundColor: "#FFF7E6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  allergensLabel: {
    flex: 1,
    fontSize: 12,
    color: "#B45309",
    fontWeight: "600",
  },
  card: {
    marginHorizontal: 18,
    marginBottom: 14,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lineTotal: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  commentBlock: {
    marginTop: 14,
  },
  hint: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
  },
  footer: {
    padding: 18,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: "#EDEFF5",
  },
});