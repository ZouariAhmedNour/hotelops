import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import { authService } from '../services/authService';


const roles = [
  { label: 'Direction', value: 1 },
  { label: 'Conciergerie', value: 2 },
  { label: 'Étages', value: 3 },
  { label: 'Maintenance', value: 4 },
];

type Props = {
  navigation: any;
};

export default function RegisterScreen({ navigation }: Props) {
    console.log('REGISTER SCREEN RENDER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(1);
  const [loading, setLoading] = useState(false);

const handleRegister = async () => {
  try {

    console.log('REGISTER CLICK');

    setLoading(true);

    const result = await authService.register({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    console.log('REGISTER SUCCESS');
    console.log(result);

  } catch (e: any) {

    console.log('REGISTER ERROR');

    console.log(e);

    console.log(e?.response?.data);

  } finally {

    setLoading(false);

  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Le Concierge</Text>
      <Text style={styles.subtitle}>L'excellence opérationnelle pour votre établissement</Text>

      <View style={styles.card}>
        <Text style={styles.h1}>Créer mon compte</Text>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <AppInput label="Nom" placeholder="DUMONT" value={lastName} onChangeText={setLastName} />
          </View>
          <View style={{ flex: 1 }}>
            <AppInput label="Prénom" placeholder="Marc" value={firstName} onChangeText={setFirstName} />
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
          {roles.map((r) => {
            const active = roleId === r.value;
            return (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRoleId(r.value)}
                style={[styles.roleChip, active && styles.roleChipActive]}
              >
                <Text style={[styles.roleText, active && styles.roleTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <AppButton title="Créer mon compte" onPress={handleRegister} loading={loading} />

        <View style={styles.bottomText}>
          <Text style={styles.bottomMuted}>Déjà membre ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.bottomLink}>Connectez-vous</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 24, paddingTop: 70, paddingBottom: 40 },
  title: { textAlign: 'center', fontSize: 34, fontWeight: '800', color: '#1C2D5A' },
  subtitle: { textAlign: 'center', marginTop: 10, fontSize: 18, color: '#6B778D', marginBottom: 30 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  h1: { fontSize: 28, fontWeight: '800', color: '#1E2B4D', marginBottom: 16 },
  row: { flexDirection: 'row' },
  sectionLabel: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E2B4D',
    letterSpacing: 0.5,
  },
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#EEF1F7',
  },
  roleChipActive: { backgroundColor: '#1C2D5A' },
  roleText: { color: '#6B778D', fontWeight: '700' },
  roleTextActive: { color: '#fff' },
  bottomText: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  bottomMuted: { color: '#6B778D' },
  bottomLink: { color: '#1C2D5A', fontWeight: '800' },
});