import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import AppInput from "../../../components/ui/AppInput";
import AppButton from "../../../components/ui/AppButton";
import RoleChip from "../../../components/ui/RoleChip";

import { useRegister } from "../hooks/useRegister";
import { styles } from "../styles/register.styles";

const roles = [
  { label: "Direction", value: 1 },
  { label: "Conciergerie", value: 2 },
  { label: "Étages", value: 3 },
  { label: "Maintenance", value: 4 },
];

type Props = {
  navigation: any;
};

export default function RegisterScreen({ navigation }: Props) {
  const {
    firstName,
    setFirstName,

    lastName,
    setLastName,

    email,
    setEmail,

    phone,
    setPhone,

    password,
    setPassword,

    roleId,
    setRoleId,

    loading,
    handleRegister,
  } = useRegister(navigation);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Le Concierge</Text>

      <Text style={styles.subtitle}>
        L'excellence opérationnelle pour votre établissement
      </Text>

      <View style={styles.card}>
        <Text style={styles.h1}>Créer mon compte</Text>

        <View style={styles.row}>
          <View style={styles.inputHalfLeft}>
            <AppInput
              label="Nom"
              placeholder="DUMONT"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.inputHalfRight}>
            <AppInput
              label="Prénom"
              placeholder="Marc"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
        </View>

        <AppInput
          label="Adresse email"
          placeholder="marc.dumont@hotel.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AppInput
          label="Téléphone"
          placeholder="+216 ..."
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <AppInput
          label="Mot de passe"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.sectionLabel}>Rôle opérationnel</Text>

        <View style={styles.roles}>
          {roles.map((role) => (
            <RoleChip
              key={role.value}
              label={role.label}
              active={roleId === role.value}
              onPress={() => setRoleId(role.value)}
            />
          ))}
        </View>

        <AppButton
          title="Créer mon compte"
          onPress={handleRegister}
          loading={loading}
        />

        <View style={styles.bottomText}>
          <Text style={styles.bottomMuted}>Déjà membre ? </Text>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.bottomLink}>Connectez-vous</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}