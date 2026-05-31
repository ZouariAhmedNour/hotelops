import { useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { authService } from "../../../services/authService";

export function useLogin(setIsAuthenticated: (value: boolean) => void) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);

      const result = await authService.login({
        email: email.trim(),
        password,
      });

      await AsyncStorage.setItem("token", result.token);
      await AsyncStorage.setItem("user", JSON.stringify(result.user));

      setIsAuthenticated(true);
    } catch (error: any) {
      console.log("LOGIN ERROR =", error?.response?.data || error.message);

      Alert.alert("Erreur", "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,

    password,
    setPassword,

    loading,
    handleLogin,
  };
}