import { useState } from "react";
import { Alert } from "react-native";

import { authService } from "../../../services/authService";
import { useAuth } from "../../../contexts/AuthContext";

export function useLogin() {
  const { login } = useAuth();

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

      await login(result.token, result.user);
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