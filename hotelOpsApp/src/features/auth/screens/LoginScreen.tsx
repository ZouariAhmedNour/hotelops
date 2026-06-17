import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppInput from "../../../components/ui/AppInput";
import AppButton from "../../../components/ui/AppButton";

import { useLogin } from "../hooks/useLogin";
import { styles } from "../styles/login.styles";

type Props = {
  navigation: any;
};

export default function LoginScreen({ navigation }: Props) {
  const { email, setEmail, password, setPassword, loading, handleLogin } =
    useLogin();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="bed-outline" size={34} color="#fff" />
        </View>

        <Text style={styles.title}>Le Concierge</Text>
        <Text style={styles.subtitle}>Portail du personnel</Text>

        <View style={styles.card}>
          <Text style={styles.h1}>Bon retour</Text>

          <Text style={styles.description}>
            Connectez-vous pour accéder à vos tâches et rapports d'incidents.
          </Text>

          <AppInput
            label="Email professionnel"
            placeholder="nom@etablissement.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppInput
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <AppButton title="Connexion" onPress={handleLogin} loading={loading} />

<TouchableOpacity
  onPress={() => navigation.navigate("QrScanner")}
  style={{
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#EEF1F7",
  }}
>
  <Text
    style={{
      color: "#13234b",
      fontWeight: "800",
      fontSize: 15,
    }}
  >
    Scanner un QR code sans connexionD
  </Text>
</TouchableOpacity>

<View style={styles.bottomText}>
            <Text style={styles.bottomMuted}>Pas encore membre ? </Text>

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.bottomLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}