// src/features/services/components/DateStrip.tsx
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

import { colors } from "../../../theme/colors";
import {
  dayShortLabel,
  isSameDay,
  nextDays,
  toApiDate,
} from "../utils/datetime";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  /** Nombre de jours proposes a partir d'aujourd'hui. */
  days?: number;
};

export default function DateStrip({ value, onChange, days = 14 }: Props) {
  const dates = useMemo(() => nextDays(days), [days]);
  const today = useMemo(() => new Date(), []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {dates.map((date) => {
        const selected = isSameDay(date, value);
        const isToday = isSameDay(date, today);

        return (
          <TouchableOpacity
            key={toApiDate(date)}
            style={[styles.cell, selected && styles.cellSelected]}
            onPress={() => onChange(date)}
            activeOpacity={0.85}
          >
            <Text style={[styles.weekday, selected && styles.textSelected]}>
              {isToday ? "Auj." : dayShortLabel(date)}
            </Text>
            <Text style={[styles.day, selected && styles.textSelected]}>
              {date.getDate()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 4,
    gap: 10,
  },
  cell: {
    width: 58,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: "#EEF1F7",
  },
  cellSelected: {
    backgroundColor: colors.primary,
  },
  weekday: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
  },
  day: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
  textSelected: {
    color: colors.white,
  },
});