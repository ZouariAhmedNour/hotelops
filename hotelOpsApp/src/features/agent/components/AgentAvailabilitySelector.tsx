import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/agentHome.styles";


export const AVAILABILITY_OPTIONS = [
  {
    code: "AVAILABLE",
    label: "Disponible",
    color: "#10b981",
    bg: "#d1fae5",
  },
  {
    code: "BUSY",
    label: "Occupé",
    color: "#f59e0b",
    bg: "#fef3c7",
  },
  {
    code: "BREAK",
    label: "Pause",
    color: "#64748b",
    bg: "#f1f5f9",
  },
  {
    code: "OFF_DUTY",
    label: "Hors service",
    color: "#ef4444",
    bg: "#fee2e2",
  },
];

type Props = {
  visible: boolean;
  currentStatus?: string;
  onToggle: () => void;
  onChange: (status: string) => void;
};

export default function AgentAvailabilitySelector({
  visible,
  currentStatus = "AVAILABLE",
  onToggle,
  onChange,
}: Props) {
  const selected =
    AVAILABILITY_OPTIONS.find((item) => item.code === currentStatus) ||
    AVAILABILITY_OPTIONS[0];

  return (
    <>
      <TouchableOpacity
        style={[styles.availabilityBadge, { backgroundColor: selected.bg }]}
        onPress={onToggle}
      >
        <View style={[styles.dot, { backgroundColor: selected.color }]} />

        <Text style={[styles.availabilityText, { color: selected.color }]}>
          {selected.label}
        </Text>
      </TouchableOpacity>

      {visible && (
        <View style={styles.availabilityPanel}>
          {AVAILABILITY_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[styles.availabilityOption, { backgroundColor: item.bg }]}
              onPress={() => onChange(item.code)}
            >
              <View style={[styles.dot, { backgroundColor: item.color }]} />

              <Text style={{ color: item.color, fontWeight: "700" }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}