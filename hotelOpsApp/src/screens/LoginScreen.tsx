import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import { authService } from '../services/authService';

type Props = {
  navigation: any;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const result = await authService.login({ email, password });

      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(result.user));

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

          <View style={styles.bottomText}>
            <Text style={styles.bottomMuted}>Pas encore membre ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.bottomLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: {
    padding: 24,
    paddingTop: 70,
    paddingBottom: 40,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1C2D5A',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '800',
    color: '#1C2D5A',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 18,
    color: '#6B778D',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  h1: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E2B4D',
    marginBottom: 8,
  },
  description: {
    color: '#67738A',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#6B778D',
    fontWeight: '600',
  },
  bottomText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  bottomMuted: { color: '#6B778D' },
  bottomLink: { color: '#1C2D5A', fontWeight: '800' },
});