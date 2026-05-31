import { useState } from "react";
import { Alert } from "react-native";

import { authService } from "../../../services/authService";

export function useRegister(navigation: any) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [roleId, setRoleId] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires.");
      return;
    }

    try {
      setLoading(true);

      await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        
      });

      Alert.alert("Succès", "Compte créé avec succès.");

      navigation.navigate("Login");
    } catch (error: any) {
      console.log("REGISTER ERROR =", error?.response?.data || error.message);

      Alert.alert("Erreur", "Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}