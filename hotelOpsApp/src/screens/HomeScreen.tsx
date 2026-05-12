import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppCard from '../components/ui/AppCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const quickActionsByRole: Record<string, { title: string; icon: any; desc: string }[]> = {
  ADMIN: [
    { title: 'Utilisateurs', icon: 'account-group-outline', desc: 'Gérer les comptes' },
    { title: 'Tickets', icon: 'wrench-outline', desc: 'Suivre les demandes' },
    { title: 'Statistiques', icon: 'chart-box-outline', desc: 'Analyser l’activité' },
  ],
  RECEPTION: [
    { title: 'Tickets', icon: 'ticket-outline', desc: 'Demande client' },
    { title: 'Chambres', icon: 'bed-outline', desc: 'Affectations' },
    { title: 'Appels', icon: 'phone-outline', desc: 'Réception 24/7' },
  ],
  MAINTENANCE: [
    { title: 'Interventions', icon: 'tools', desc: 'Travaux en cours' },
    { title: 'Créer ticket', icon: 'plus-circle-outline', desc: 'Nouvelle panne' },
    { title: 'Priorités', icon: 'alert-circle-outline', desc: 'Urgences' },
  ],
  CHEF_MAINT: [
    { title: 'Équipe', icon: 'account-hard-hat-outline', desc: 'Affectations' },
    { title: 'Tickets', icon: 'clipboard-list-outline', desc: 'Planification' },
    { title: 'SLA', icon: 'timer-outline', desc: 'Délais' },
  ],
  USER: [
    { title: 'Mes demandes', icon: 'clipboard-text-outline', desc: 'Historique' },
    { title: 'Créer ticket', icon: 'plus-box-outline', desc: 'Signaler un problème' },
    { title: 'Messages', icon: 'message-text-outline', desc: 'Suivi' },
  ],
};

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then((value) => {
      if (value) setUser(JSON.parse(value));
    });
  }, []);

  const roleCode = user?.role?.code || 'USER';
  const actions = quickActionsByRole[roleCode] || quickActionsByRole.USER;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.smallTitle}>BIENVENUE AU GRAND PALACE</Text>
      <Text style={styles.bigTitle}>
        Bonjour {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Utilisateur'},
      </Text>

      <View style={styles.roleBadge}>
        <MaterialCommunityIcons name="account-circle-outline" size={18} color="#fff" />
        <Text style={styles.roleBadgeText}>{roleCode}</Text>
      </View>

      <Text style={styles.sectionTitle}>Mes demandes en cours</Text>
      <AppCard style={styles.ticketCard}>
        <Text style={styles.ticketCategory}>MAINTENANCE</Text>
        <Text style={styles.ticketTitle}>Climatisation bruyante</Text>
        <Text style={styles.ticketStatus}>● Réparateur en route</Text>
      </AppCard>

      <AppCard style={styles.primaryCard}>
        <View style={styles.primaryCardRow}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="alert-outline" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.primaryCardLabel}>ASSISTANCE TECHNIQUE</Text>
            <Text style={styles.primaryCardTitle}>Signaler un problème</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={30} color="#fff" />
        </View>
      </AppCard>

      <Text style={styles.sectionTitle}>Services rapides</Text>
      <View style={styles.grid}>
        {actions.map((item, index) => (
          <AppCard key={index} style={styles.gridCard}>
            <View style={styles.gridIcon}>
              <MaterialCommunityIcons name={item.icon} size={28} color="#1C2D5A" />
            </View>
            <Text style={styles.gridTitle}>{item.title}</Text>
            <Text style={styles.gridDesc}>{item.desc}</Text>
          </AppCard>
        ))}
      </View>

      <AppCard style={styles.banner}>
        <Text style={styles.bannerLabel}>INCONTOURNABLE</Text>
        <Text style={styles.bannerTitle}>Le Rooftop Infinity</Text>
        <Text style={styles.bannerDesc}>Ouvert jusqu'à 23h00 ce soir</Text>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  content: { padding: 24, paddingTop: 64, paddingBottom: 40 },
  smallTitle: { color: '#8A93A8', fontWeight: '800', fontSize: 16 },
  bigTitle: { color: '#1C2D5A', fontWeight: '900', fontSize: 38, marginTop: 6 },
  roleBadge: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#1C2D5A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadgeText: { color: '#fff', fontWeight: '700' },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#1C2D5A', marginTop: 28, marginBottom: 14 },
  ticketCard: { borderLeftWidth: 6, borderLeftColor: '#F5A623' },
  ticketCategory: { color: '#F5A623', fontWeight: '900', letterSpacing: 1 },
  ticketTitle: { fontSize: 22, fontWeight: '800', color: '#1E2B4D', marginTop: 8 },
  ticketStatus: { marginTop: 10, color: '#5D667A', fontSize: 16, fontWeight: '600' },
  primaryCard: {
    backgroundColor: '#1C2D5A',
    marginTop: 18,
  },
  primaryCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCardLabel: { color: '#A9B4D0', fontWeight: '800', letterSpacing: 0.8, fontSize: 13 },
  primaryCardTitle: { color: '#fff', fontWeight: '900', fontSize: 23, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: { width: '48%', marginBottom: 14, minHeight: 150 },
  gridIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  gridTitle: { color: '#1C2D5A', fontSize: 22, fontWeight: '900' },
  gridDesc: { color: '#67738A', marginTop: 4, fontSize: 15, fontWeight: '500' },
  banner: {
    marginTop: 18,
    minHeight: 190,
    justifyContent: 'flex-end',
    backgroundColor: '#DCEAF9',
  },
  bannerLabel: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 1 },
  bannerTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 6 },
  bannerDesc: { color: '#fff', fontSize: 16, marginTop: 8 },
});